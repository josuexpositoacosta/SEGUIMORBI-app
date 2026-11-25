import { NgTemplateOutlet } from '@angular/common';
import { Component, Input, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { hoyIso, sumarDias } from 'src/app/compartido/fechas';
import { mensajeDeError } from 'src/app/core/http/errores';
import { Desenlace } from 'src/app/core/models/admin';
import {
  Caso, EVOLUCIONES, EvolucionCaso, MODALIDADES, ModalidadAtencion, SIGNOS_ALARMA_DENGUE, SIGNOS_CLINICOS,
  SignoAlarmaDengue, SignoClinico,
} from 'src/app/core/models/caso';
import { CasoService } from 'src/app/core/services/caso.service';
import { DesenlaceService } from 'src/app/core/services/desenlace.service';
import { TraducirPipe } from 'src/app/core/i18n/traducir.pipe';
import { t } from 'src/app/core/i18n/idioma';

export type TipoRegistro = 'evaluacion' | 'dictamen' | 'plan' | 'seguimiento' | 'cierre' | 'reapertura';

const TITULOS: Record<TipoRegistro, string> = {
  evaluacion: t('Evaluación clínica'),
  dictamen: t('Dictamen médico'),
  plan: t('Plan de atención'),
  seguimiento: t('Seguimiento'),
  cierre: t('Cerrar caso'),
  reapertura: t('Reabrir caso'),
};

const MAX_TEXTO = 2000;

/** Rangos de plausibilidad del backend (detectan errores de tecleo, no son umbrales clínicos). */
const RANGOS = {
  temperatura: [30, 45],
  frecuenciaCardiaca: [20, 250],
  frecuenciaRespiratoria: [5, 80],
  tensionSistolica: [40, 300],
  tensionDiastolica: [20, 200],
  saturacionO2: [50, 100],
} as const;

function rango(campo: keyof typeof RANGOS) {
  const [min, max] = RANGOS[campo];
  return [Validators.min(min), Validators.max(max)];
}

/** Una evaluación necesita al menos un signo vital, un signo o una observación; sistólica > diastólica. */
function evaluacionValida(g: AbstractControl): ValidationErrors | null {
  const v = g.value;
  const errores: ValidationErrors = {};
  const vitales = ['temperatura', 'frecuenciaCardiaca', 'frecuenciaRespiratoria', 'tensionSistolica', 'tensionDiastolica', 'saturacionO2'];
  const hayDato = vitales.some(k => v[k] !== null && v[k] !== '' && v[k] !== undefined)
    || v.signosClinicos?.length || v.signosAlarmaDengue?.length || v.observaciones?.trim();
  if (!hayDato) {
    errores['vacia'] = true;
  }
  if (v.tensionSistolica && v.tensionDiastolica && Number(v.tensionSistolica) <= Number(v.tensionDiastolica)) {
    errores['tension'] = true;
  }
  return Object.keys(errores).length ? errores : null;
}

function noPasada(c: AbstractControl): ValidationErrors | null {
  return c.value && c.value < hoyIso() ? { pasada: true } : null;
}

/**
 * Registro clínico de un caso en ventana: evaluación, dictamen, plan, seguimiento, cierre o reapertura.
 * Devuelve el caso actualizado (con las alertas recalculadas por el backend) con role 'guardado'.
 */
@Component({
  selector: 'app-registro-clinico',
  imports: [TraducirPipe, NgTemplateOutlet, ReactiveFormsModule, IonicModule],
  templateUrl: './registro-clinico.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./registro-clinico.component.css'],
})
export class RegistroClinicoComponent implements OnInit {
  @Input({ required: true }) tipo!: TipoRegistro;
  @Input({ required: true }) caso!: Caso;

  private readonly modal = inject(ModalController);
  private readonly api = inject(CasoService);
  private readonly desenlacesApi = inject(DesenlaceService);
  private readonly fb = inject(FormBuilder);

  readonly signosClinicos = SIGNOS_CLINICOS;
  readonly signosAlarma = SIGNOS_ALARMA_DENGUE;
  readonly modalidades = MODALIDADES;
  readonly evoluciones = EVOLUCIONES;
  readonly maxTexto = MAX_TEXTO;
  readonly hoy = hoyIso();
  readonly rangos = RANGOS;
  readonly desenlaces = signal<Desenlace[]>([]);
  readonly guardando = signal(false);
  readonly error = signal('');

  /** Atajos para el próximo control. */
  readonly atajosControl = [
    { texto: t('Mañana'), dias: 1 },
    { texto: t('En 3 días'), dias: 3 },
    { texto: t('En 7 días'), dias: 7 },
  ];

  readonly evaluacion = this.fb.group({
    temperatura: [null as number | null, rango('temperatura')],
    frecuenciaCardiaca: [null as number | null, rango('frecuenciaCardiaca')],
    frecuenciaRespiratoria: [null as number | null, rango('frecuenciaRespiratoria')],
    tensionSistolica: [null as number | null, rango('tensionSistolica')],
    tensionDiastolica: [null as number | null, rango('tensionDiastolica')],
    saturacionO2: [null as number | null, rango('saturacionO2')],
    signosClinicos: [[] as SignoClinico[]],
    signosAlarmaDengue: [[] as SignoAlarmaDengue[]],
    observaciones: ['', Validators.maxLength(MAX_TEXTO)],
  }, { validators: evaluacionValida });

  readonly dictamen = this.fb.nonNullable.group({
    diagnosticoPrincipal: ['', [Validators.required, Validators.maxLength(MAX_TEXTO)]],
    diagnosticosDiferenciales: ['', Validators.maxLength(MAX_TEXTO)],
    conclusion: ['', [Validators.required, Validators.maxLength(MAX_TEXTO)]],
  });

  readonly plan = this.fb.nonNullable.group({
    modalidad: ['AMBULATORIO' as ModalidadAtencion, Validators.required],
    indicaciones: ['', Validators.maxLength(MAX_TEXTO)],
    proximoControl: ['', noPasada],
  });

  readonly seguimiento = this.fb.nonNullable.group({
    evolucion: ['' as EvolucionCaso | '', Validators.required],
    observaciones: ['', Validators.maxLength(MAX_TEXTO)],
    proximoControl: ['', noPasada],
  });

  readonly cierre = this.fb.nonNullable.group({
    desenlace: ['', Validators.required],
    fechaCierre: [hoyIso(), Validators.required],
    observaciones: ['', Validators.maxLength(MAX_TEXTO)],
  });

  readonly reapertura = this.fb.nonNullable.group({
    motivo: ['', [Validators.required, Validators.maxLength(MAX_TEXTO)]],
  });

  get titulo(): string {
    return TITULOS[this.tipo];
  }

  /** Cierre: no futura ni anterior a la notificación. */
  get fechaCierreInvalida(): boolean {
    const f = this.cierre.controls.fechaCierre.value;
    return !!f && (f > this.hoy || f < this.caso.fechaNotificacion);
  }

  ngOnInit(): void {
    if (this.tipo === 'cierre') {
      this.desenlacesApi.listar(true).subscribe({
        next: lista => this.desenlaces.set(lista),
        error: e => this.error.set(mensajeDeError(e)),
      });
    }
  }

  marcado<T>(control: AbstractControl, valor: T): boolean {
    return (control.value as T[]).includes(valor);
  }

  alternar<T>(control: AbstractControl, valor: T, marcado: boolean): void {
    const actuales = (control.value as T[]).filter(x => x !== valor);
    control.setValue(marcado ? [...actuales, valor] : actuales);
  }

  programar(control: AbstractControl, dias: number): void {
    control.setValue(sumarDias(this.hoy, dias));
    control.markAsTouched();
  }

  cerrar(): void {
    this.modal.dismiss(null, 'cancel');
  }

  guardar(): void {
    const peticion = this.peticion();
    if (!peticion) {
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    peticion.subscribe({
      next: actualizado => {
        this.guardando.set(false);
        this.modal.dismiss(actualizado, 'guardado');
      },
      error: (e: unknown) => {
        this.guardando.set(false);
        this.error.set(mensajeDeError(e));
      },
    });
  }

  /** Valida el formulario del tipo actual y devuelve la petición, o null si hay errores. */
  private peticion(): Observable<Caso> | null {
    const id = this.caso.id;
    const texto = (v: string | null | undefined) => v?.trim() || null;
    switch (this.tipo) {
      case 'evaluacion': {
        if (this.evaluacion.invalid) {
          this.evaluacion.markAllAsTouched();
          return null;
        }
        const v = this.evaluacion.getRawValue();
        const num = (x: number | string | null) => (x === null || x === '' ? null : Number(x));
        return this.api.registrarEvaluacion(id, {
          temperatura: num(v.temperatura),
          frecuenciaCardiaca: num(v.frecuenciaCardiaca),
          frecuenciaRespiratoria: num(v.frecuenciaRespiratoria),
          tensionSistolica: num(v.tensionSistolica),
          tensionDiastolica: num(v.tensionDiastolica),
          saturacionO2: num(v.saturacionO2),
          signosClinicos: v.signosClinicos ?? [],
          signosAlarmaDengue: v.signosAlarmaDengue ?? [],
          observaciones: texto(v.observaciones),
        });
      }
      case 'dictamen': {
        if (this.dictamen.invalid) {
          this.dictamen.markAllAsTouched();
          return null;
        }
        const v = this.dictamen.getRawValue();
        return this.api.registrarDictamen(id, {
          diagnosticoPrincipal: v.diagnosticoPrincipal.trim(),
          diagnosticosDiferenciales: texto(v.diagnosticosDiferenciales),
          conclusion: v.conclusion.trim(),
        });
      }
      case 'plan': {
        if (this.plan.invalid) {
          this.plan.markAllAsTouched();
          return null;
        }
        const v = this.plan.getRawValue();
        return this.api.registrarPlan(id, {
          modalidad: v.modalidad, indicaciones: texto(v.indicaciones), proximoControl: v.proximoControl || null,
        });
      }
      case 'seguimiento': {
        if (this.seguimiento.invalid) {
          this.seguimiento.markAllAsTouched();
          return null;
        }
        const v = this.seguimiento.getRawValue();
        return this.api.registrarSeguimiento(id, {
          evolucion: v.evolucion as EvolucionCaso, observaciones: texto(v.observaciones), proximoControl: v.proximoControl || null,
        });
      }
      case 'cierre': {
        if (this.cierre.invalid || this.fechaCierreInvalida) {
          this.cierre.markAllAsTouched();
          return null;
        }
        const v = this.cierre.getRawValue();
        return this.api.cerrar(id, v.desenlace, v.fechaCierre, texto(v.observaciones));
      }
      case 'reapertura': {
        if (this.reapertura.invalid) {
          this.reapertura.markAllAsTouched();
          return null;
        }
        return this.api.reabrir(id, this.reapertura.getRawValue().motivo.trim());
      }
    }
  }
}

/** Abre el formulario clínico y devuelve el caso actualizado, o null si se cancela. */
export async function abrirRegistroClinico(modales: ModalController, caso: Caso, tipo: TipoRegistro): Promise<Caso | null> {
  const modal = await modales.create({
    component: RegistroClinicoComponent,
    componentProps: { caso, tipo },
    cssClass: tipo === 'evaluacion' ? 'modal-formulario modal-ancho' : 'modal-formulario',
  });
  await modal.present();
  const { data, role } = await modal.onDidDismiss<Caso>();
  return role === 'guardado' && data ? data : null;
}
