import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Input, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { catchError, debounceTime, of, switchMap } from 'rxjs';
import { hoyIso } from 'src/app/compartido/fechas';
import { mensajeDeError } from 'src/app/core/http/errores';
import {
  CLASIFICACIONES, Caso, DatosCaso, MANIFESTACIONES, Manifestacion, Sugerencia, claseClasificacion, nombreDe,
} from 'src/app/core/models/caso';
import { Paciente } from 'src/app/core/models/paciente';
import { CasoService } from 'src/app/core/services/caso.service';

/** Fechas no futuras y el inicio de síntomas no posterior a la notificación (reglas del backend). */
function fechasValidas(grupo: AbstractControl): ValidationErrors | null {
  const inicio = grupo.get('fechaInicioSintomas')?.value as string;
  const notif = grupo.get('fechaNotificacion')?.value as string;
  const hoy = hoyIso();
  const errores: ValidationErrors = {};
  if ((inicio && inicio > hoy) || (notif && notif > hoy)) {
    errores['futura'] = true;
  }
  if (inicio && notif && inicio > notif) {
    errores['orden'] = true;
  }
  return Object.keys(errores).length ? errores : null;
}

/**
 * Registro o edición de un caso, con la clasificación sugerida por la OPS en directo
 * (POST /casos/sugerencia). Se abre con ModalController y devuelve el caso con role 'guardado'.
 */
@Component({
  selector: 'app-caso-formulario',
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  templateUrl: './caso-formulario.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./caso-formulario.component.css'],
})
export class CasoFormularioComponent implements OnInit {
  /** Paciente del caso (obligatorio). */
  @Input({ required: true }) paciente!: Paciente;
  /** Si se pasa, se editan sus datos; si no, se registra un caso nuevo. */
  @Input() caso?: Caso;

  private readonly modal = inject(ModalController);
  private readonly api = inject(CasoService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly manifestaciones = MANIFESTACIONES;
  readonly hoy = hoyIso();
  readonly sugerencia = signal<Sugerencia | null>(null);
  readonly calculando = signal(false);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly claseClasificacion = claseClasificacion;

  readonly form = this.fb.nonNullable.group({
    fechaInicioSintomas: ['', Validators.required],
    fechaNotificacion: [hoyIso(), Validators.required],
    fiebre: [false],
    cefaleaIntensa: [false],
    manifestaciones: [[] as Manifestacion[]],
    recaida: [false],
    embarazada: [false],
    semanasGestacion: [null as number | null, [Validators.min(1), Validators.max(45)]],
    areaTransmisionOViaje: [false],
    detalleAreaTransmision: [''],
    nexoCasoConfirmado: [false],
    motivo: [''],
  }, { validators: fechasValidas });

  get esNuevo(): boolean {
    return !this.caso;
  }

  get puedeEstarEmbarazada(): boolean {
    return this.paciente?.sexo === 'F';
  }

  /** Al registrar, si la OPS no sugiere clasificación hace falta un motivo. */
  get necesitaMotivo(): boolean {
    return this.esNuevo && !!this.sugerencia() && !this.sugerencia()!.clasificacion;
  }

  nombreClasificacion(c: string | null | undefined): string {
    return nombreDe(CLASIFICACIONES, c as never);
  }

  ngOnInit(): void {
    const c = this.caso;
    if (c) {
      this.form.reset({
        fechaInicioSintomas: c.fechaInicioSintomas,
        fechaNotificacion: c.fechaNotificacion,
        fiebre: c.fiebre,
        cefaleaIntensa: c.cefaleaIntensa,
        manifestaciones: [...(c.manifestaciones ?? [])],
        recaida: c.recaida,
        embarazada: c.embarazada,
        semanasGestacion: c.semanasGestacion ?? null,
        areaTransmisionOViaje: c.areaTransmisionOViaje,
        detalleAreaTransmision: c.detalleAreaTransmision ?? '',
        nexoCasoConfirmado: c.nexoCasoConfirmado,
        motivo: '',
      });
    }

    // Sugerencia en directo: se recalcula al cambiar cualquier dato clínico.
    this.form.valueChanges.pipe(
      debounceTime(350),
      switchMap(() => {
        if (!this.form.controls.fechaInicioSintomas.value || !this.form.controls.fechaNotificacion.value) {
          this.sugerencia.set(null);
          return of(null);
        }
        this.calculando.set(true);
        return this.api.sugerir(this.datos()).pipe(catchError(() => of(null)));
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(s => {
      this.calculando.set(false);
      if (s) {
        this.sugerencia.set(s);
      }
    });
    if (c) {
      this.form.updateValueAndValidity();
    }
  }

  tieneManifestacion(m: Manifestacion): boolean {
    return this.form.controls.manifestaciones.value.includes(m);
  }

  alternarManifestacion(m: Manifestacion, marcada: boolean): void {
    const actuales = this.form.controls.manifestaciones.value.filter(x => x !== m);
    this.form.controls.manifestaciones.setValue(marcada ? [...actuales, m] : actuales);
  }

  cerrar(): void {
    this.modal.dismiss(null, 'cancel');
  }

  guardar(): void {
    const motivo = this.form.controls.motivo.value.trim();
    if (this.form.invalid || (this.necesitaMotivo && !motivo)) {
      this.form.markAllAsTouched();
      if (this.necesitaMotivo && !motivo) {
        this.error.set('Indica el motivo para registrar un caso que no cumple la definición de sospechoso.');
      }
      return;
    }
    const datos = { ...this.datos(), motivo: this.esNuevo ? (motivo || null) : null };
    const peticion = this.caso ? this.api.actualizar(this.caso.id, datos) : this.api.registrar(datos);

    this.guardando.set(true);
    this.error.set('');
    peticion.subscribe({
      next: guardado => {
        this.guardando.set(false);
        this.modal.dismiss(guardado, 'guardado');
      },
      error: (e: unknown) => {
        this.guardando.set(false);
        this.error.set(mensajeDeError(e));
      },
    });
  }

  private datos(): DatosCaso {
    const v = this.form.getRawValue();
    const embarazada = this.puedeEstarEmbarazada && v.embarazada;
    return {
      pacienteId: this.paciente.id,
      fechaInicioSintomas: v.fechaInicioSintomas,
      fechaNotificacion: v.fechaNotificacion,
      fiebre: v.fiebre,
      cefaleaIntensa: v.cefaleaIntensa,
      manifestaciones: v.manifestaciones,
      recaida: v.recaida,
      embarazada,
      semanasGestacion: embarazada ? v.semanasGestacion : null,
      areaTransmisionOViaje: v.areaTransmisionOViaje,
      detalleAreaTransmision: v.areaTransmisionOViaje ? (v.detalleAreaTransmision.trim() || null) : null,
      nexoCasoConfirmado: v.nexoCasoConfirmado,
    };
  }
}

/** Abre el formulario del caso y devuelve el caso guardado, o null si se cancela. */
export async function abrirFormularioCaso(modales: ModalController, paciente: Paciente, caso?: Caso): Promise<Caso | null> {
  const modal = await modales.create({
    component: CasoFormularioComponent,
    componentProps: { paciente, caso },
    cssClass: 'modal-formulario modal-ancho',
  });
  await modal.present();
  const { data, role } = await modal.onDidDismiss<Caso>();
  return role === 'guardado' && data ? data : null;
}
