import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AvisosService } from 'src/app/compartido/avisos.service';
import { EstadoVacioComponent } from 'src/app/compartido/estado-vacio.component';
import { hoyIso, textoEdad } from 'src/app/compartido/fechas';
import { AuthService } from 'src/app/core/auth/auth.service';
import { mensajeDeError } from 'src/app/core/http/errores';
import {
  AGENTES, AgenteEtiologico, CLASIFICACIONES, Caso, Clasificacion, EVOLUCIONES, MANIFESTACIONES, MODALIDADES, RESULTADOS,
  ResultadoPrueba, SIGNOS_ALARMA_DENGUE, SIGNOS_CLINICOS, TIPOS_MUESTRA, TIPOS_PRUEBA, TipoMuestra, TipoPrueba,
  claseClasificacion, nombreDe,
} from 'src/app/core/models/caso';
import { Paciente } from 'src/app/core/models/paciente';
import { CasoService } from 'src/app/core/services/caso.service';
import { PacienteService } from 'src/app/core/services/paciente.service';
import { abrirFormularioCaso } from './caso-formulario.component';
import { TipoRegistro, abrirRegistroClinico } from './registro-clinico.component';

/** Entrada de la línea de tiempo de atención clínica. */
export interface EntradaClinica {
  fecha: string;
  titulo: string;
  icono: string;
  clase: string;
  etiqueta?: string;
  lineas: string[];
  usuario: string;
}

type Modo = 'resultado' | 'clasificacion';

/** Fechas del resultado: no futuras y el resultado no antes de la toma (reglas del backend). */
function fechasResultado(grupo: AbstractControl): ValidationErrors | null {
  const toma = grupo.get('fechaToma')?.value as string;
  const res = grupo.get('fechaResultado')?.value as string;
  const hoy = hoyIso();
  if ((toma && toma > hoy) || (res && res > hoy)) {
    return { futura: true };
  }
  return toma && res && res < toma ? { orden: true } : null;
}

@Component({
  selector: 'app-caso-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule, EstadoVacioComponent, DatePipe, RouterLink],
  templateUrl: './caso-detalle.page.html',
  styleUrls: ['./caso-detalle.page.css'],
})
export class CasoDetallePage implements OnInit {
  private readonly api = inject(CasoService);
  private readonly pacientesApi = inject(PacienteService);
  private readonly avisos = inject(AvisosService);
  private readonly modales = inject(ModalController);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  readonly caso = signal<Caso | null>(null);
  readonly paciente = signal<Paciente | null>(null);
  readonly cargando = signal(true);
  readonly error = signal('');

  readonly rol = computed(() => this.auth.usuario()?.role);
  readonly abierto = computed(() => this.caso()?.estado === 'ABIERTO');
  /** El médico edita datos y añade resultados; médico y epidemiólogo cambian la clasificación. */
  readonly puedeEditar = computed(() => this.abierto() && this.rol() === 'MEDICO');
  readonly puedeClasificar = computed(() => this.abierto() && (this.rol() === 'MEDICO' || this.rol() === 'EPIDEMIOLOGO'));
  readonly diasEvolucion = computed(() => {
    const c = this.caso();
    if (!c) {
      return null;
    }
    const ms = new Date(c.fechaNotificacion).getTime() - new Date(c.fechaInicioSintomas).getTime();
    return Math.round(ms / 86400000);
  });

  /** Registros clínicos y eventos del caso, del más reciente al más antiguo. */
  readonly lineaTiempo = computed<EntradaClinica[]>(() => {
    const c = this.caso();
    if (!c) {
      return [];
    }
    const nombres = <T extends string>(lista: { valor: T; nombre: string }[], valores: T[] | undefined) =>
      (valores ?? []).map(v => nombreDe(lista, v)).join(', ');
    const control = (f?: string | null) => (f ? `Próximo control: ${f.split('-').reverse().join('/')}` : '');
    const entradas: EntradaClinica[] = [
      ...(c.evaluaciones ?? []).map(e => {
        const vitales = [
          e.temperatura != null ? `T ${e.temperatura} °C` : '',
          e.frecuenciaCardiaca != null ? `FC ${e.frecuenciaCardiaca}` : '',
          e.frecuenciaRespiratoria != null ? `FR ${e.frecuenciaRespiratoria}` : '',
          e.tensionSistolica != null && e.tensionDiastolica != null ? `TA ${e.tensionSistolica}/${e.tensionDiastolica}` : '',
          e.saturacionO2 != null ? `SatO₂ ${e.saturacionO2} %` : '',
        ].filter(Boolean).join(' · ');
        return {
          fecha: e.fecha, titulo: 'Evaluación clínica', icono: 'pulse-outline', clase: 'evaluacion', usuario: e.usuario,
          lineas: [
            vitales,
            e.signosClinicos?.length ? `Signos: ${nombres(SIGNOS_CLINICOS, e.signosClinicos)}` : '',
            e.signosAlarmaDengue?.length ? `Signos de alarma de dengue: ${nombres(SIGNOS_ALARMA_DENGUE, e.signosAlarmaDengue)}` : '',
            e.observaciones ?? '',
          ].filter(Boolean),
        };
      }),
      ...(c.dictamenes ?? []).map(d => ({
        fecha: d.fecha, titulo: 'Dictamen', icono: 'document-text-outline', clase: 'dictamen', usuario: d.usuario,
        etiqueta: d.diagnosticoPrincipal,
        lineas: [d.diagnosticosDiferenciales ? `Diferenciales: ${d.diagnosticosDiferenciales}` : '', d.conclusion].filter(Boolean),
      })),
      ...(c.planes ?? []).map(p => ({
        fecha: p.fecha, titulo: 'Plan de atención', icono: 'clipboard-outline', clase: 'plan', usuario: p.usuario,
        etiqueta: nombreDe(MODALIDADES, p.modalidad),
        lineas: [p.indicaciones ?? '', control(p.proximoControl)].filter(Boolean),
      })),
      ...(c.seguimientos ?? []).map(s => ({
        fecha: s.fecha, titulo: 'Seguimiento', icono: 'trending-up-outline', clase: 'seguimiento', usuario: s.usuario,
        etiqueta: nombreDe(EVOLUCIONES, s.evolucion),
        lineas: [s.observaciones ?? '', control(s.proximoControl)].filter(Boolean),
      })),
      ...(c.eventos ?? []).map(ev => ({
        fecha: ev.fecha,
        titulo: ({ CIERRE: 'Caso cerrado', REAPERTURA: 'Caso reabierto', VALIDACION_CLASIFICACION: 'Clasificación validada' } as Record<string, string>)[ev.tipo] ?? ev.tipo,
        icono: ev.tipo === 'CIERRE' ? 'lock-closed-outline' : ev.tipo === 'REAPERTURA' ? 'lock-open-outline' : 'shield-checkmark-outline',
        clase: 'evento', usuario: ev.usuario, lineas: [ev.detalle ?? ''].filter(Boolean),
      })),
    ];
    return entradas.sort((a, b) => b.fecha.localeCompare(a.fecha));
  });

  readonly evoluciones = EVOLUCIONES;
  readonly agentes = AGENTES;
  readonly tiposPrueba = TIPOS_PRUEBA;
  readonly tiposMuestra = TIPOS_MUESTRA;
  readonly resultados = RESULTADOS;
  readonly clasificaciones = CLASIFICACIONES;
  readonly claseClasificacion = claseClasificacion;
  readonly textoEdad = textoEdad;
  readonly hoy = hoyIso();

  readonly modo = signal<Modo | null>(null);
  readonly guardando = signal(false);
  readonly errorFormulario = signal('');

  readonly resultadoForm = this.fb.nonNullable.group({
    agente: ['OROPOUCHE' as AgenteEtiologico, Validators.required],
    tipoPrueba: ['RT_PCR' as TipoPrueba, Validators.required],
    tipoMuestra: ['SUERO' as TipoMuestra, Validators.required],
    resultado: ['' as ResultadoPrueba | '', Validators.required],
    fechaToma: ['', Validators.required],
    fechaResultado: [''],
  }, { validators: fechasResultado });

  readonly clasificacionForm = this.fb.nonNullable.group({
    clasificacion: ['' as Clasificacion | '', Validators.required],
    motivo: ['', [Validators.required, Validators.maxLength(500)]],
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.api.obtener(this.id).subscribe({
      next: c => {
        this.caso.set(c);
        this.cargando.set(false);
        this.pacientesApi.obtener(c.pacienteId).subscribe({ next: p => this.paciente.set(p), error: () => null });
      },
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e));
        this.cargando.set(false);
      },
    });
  }

  nombre<T extends string>(lista: { valor: T; nombre: string }[], valor: T | null | undefined): string {
    return nombreDe(lista, valor);
  }

  manifestacion(valor: string): string {
    return nombreDe(MANIFESTACIONES, valor as never);
  }

  claseResultado(r: ResultadoPrueba): string {
    return RESULTADOS.find(x => x.valor === r)?.clase ?? '';
  }

  readonly puedeValidar = computed(() => this.abierto() && this.rol() === 'EPIDEMIOLOGO' && !this.caso()?.clasificacionValidada);

  async validar(): Promise<void> {
    const c = this.caso();
    if (!c) {
      return;
    }
    const ok = await this.avisos.confirmar({
      titulo: 'Validar clasificación',
      mensaje: `Confirmas la clasificación ${nombreDe(CLASIFICACIONES, c.clasificacion)} propuesta para este caso.`,
      confirmar: 'Validar',
    });
    if (!ok) {
      return;
    }
    this.api.validarClasificacion(c.id, null).subscribe({
      next: actualizado => {
        this.caso.set(actualizado);
        this.avisos.exito('Clasificación validada');
      },
      error: e => this.avisos.error(e),
    });
  }

  /** CONFIRMADO solo se permite si la OPS lo sugiere (hay laboratorio confirmatorio). */
  confirmadoBloqueado(): boolean {
    return this.caso()?.sugerencia?.clasificacion !== 'CONFIRMADO';
  }

  async editarDatos(): Promise<void> {
    const c = this.caso();
    const p = this.paciente();
    if (!c || !p) {
      return;
    }
    const guardado = await abrirFormularioCaso(this.modales, p, c);
    if (guardado) {
      this.caso.set(guardado);
      this.avisos.exito('Datos del caso actualizados');
    }
  }

  /** Registro clínico, cierre o reapertura: el backend devuelve el caso con las alertas recalculadas. */
  async registrar(tipo: TipoRegistro): Promise<void> {
    const c = this.caso();
    if (!c) {
      return;
    }
    const antes = c.alertas?.length ?? 0;
    const actualizado = await abrirRegistroClinico(this.modales, c, tipo);
    if (!actualizado) {
      return;
    }
    this.caso.set(actualizado);
    const mensajes: Record<TipoRegistro, string> = {
      evaluacion: 'Evaluación registrada', dictamen: 'Dictamen registrado', plan: 'Plan de atención registrado',
      seguimiento: 'Seguimiento registrado', cierre: 'Caso cerrado', reapertura: 'Caso reabierto',
    };
    const nuevas = (actualizado.alertas?.length ?? 0) - antes;
    if (nuevas > 0) {
      this.avisos.advertencia(`${mensajes[tipo]}. Hay ${nuevas} alerta${nuevas > 1 ? 's' : ''} clínica${nuevas > 1 ? 's' : ''} nueva${nuevas > 1 ? 's' : ''}: revísalas arriba.`);
    } else {
      this.avisos.exito(mensajes[tipo]);
    }
  }

  abrir(modo: Modo): void {
    this.errorFormulario.set('');
    if (modo === 'resultado') {
      this.resultadoForm.reset({
        agente: 'OROPOUCHE', tipoPrueba: 'RT_PCR', tipoMuestra: 'SUERO', resultado: '', fechaToma: '', fechaResultado: '',
      });
    } else {
      this.clasificacionForm.reset({ clasificacion: '', motivo: '' });
    }
    this.modo.set(modo);
  }

  cerrar(): void {
    this.modo.set(null);
  }

  guardarResultado(): void {
    const c = this.caso();
    if (!c || this.resultadoForm.invalid) {
      this.resultadoForm.markAllAsTouched();
      return;
    }
    const v = this.resultadoForm.getRawValue();
    this.ejecutar(this.api.registrarResultado(c.id, {
      agente: v.agente,
      tipoPrueba: v.tipoPrueba,
      tipoMuestra: v.tipoMuestra,
      resultado: v.resultado as ResultadoPrueba,
      fechaToma: v.fechaToma,
      fechaResultado: v.fechaResultado || null,
    }), actualizado => {
      const antes = c.sugerencia?.clasificacion;
      const ahora = actualizado.sugerencia?.clasificacion;
      return antes !== ahora && ahora
        ? `Resultado añadido. La OPS ahora sugiere: ${nombreDe(CLASIFICACIONES, ahora)}`
        : 'Resultado añadido';
    });
  }

  guardarClasificacion(): void {
    const c = this.caso();
    if (!c || this.clasificacionForm.invalid) {
      this.clasificacionForm.markAllAsTouched();
      return;
    }
    const v = this.clasificacionForm.getRawValue();
    this.ejecutar(this.api.cambiarClasificacion(c.id, v.clasificacion as Clasificacion, v.motivo.trim()),
      actualizado => `Clasificación cambiada a ${nombreDe(CLASIFICACIONES, actualizado.clasificacion)}`);
  }

  private ejecutar(peticion: Observable<Caso>, mensaje: (c: Caso) => string): void {
    this.guardando.set(true);
    this.errorFormulario.set('');
    peticion.subscribe({
      next: actualizado => {
        this.guardando.set(false);
        this.caso.set(actualizado);
        this.cerrar();
        this.avisos.exito(mensaje(actualizado));
      },
      error: (e: unknown) => {
        this.guardando.set(false);
        this.errorFormulario.set(mensajeDeError(e));
      },
    });
  }
}
