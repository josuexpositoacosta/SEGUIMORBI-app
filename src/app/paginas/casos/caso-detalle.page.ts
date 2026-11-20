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
  AGENTES, AgenteEtiologico, CLASIFICACIONES, Caso, Clasificacion, MANIFESTACIONES, RESULTADOS, ResultadoPrueba,
  TIPOS_MUESTRA, TIPOS_PRUEBA, TipoMuestra, TipoPrueba, claseClasificacion, nombreDe,
} from 'src/app/core/models/caso';
import { Paciente } from 'src/app/core/models/paciente';
import { CasoService } from 'src/app/core/services/caso.service';
import { PacienteService } from 'src/app/core/services/paciente.service';
import { abrirFormularioCaso } from './caso-formulario.component';

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
