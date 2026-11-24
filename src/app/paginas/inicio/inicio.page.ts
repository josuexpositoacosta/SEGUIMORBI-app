import { DatePipe, NgClass } from '@angular/common';
import { Component, OnInit, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { diasDesde, hoyIso, sumarDias } from 'src/app/compartido/fechas';
import { AuthService } from 'src/app/core/auth/auth.service';
import { mensajeDeError } from 'src/app/core/http/errores';
import { CLASIFICACIONES, Caso, Clasificacion, ControlPendiente, claseClasificacion, nombreDe } from 'src/app/core/models/caso';
import { Paciente } from 'src/app/core/models/paciente';
import { NOMBRE_ROL } from 'src/app/core/models/usuario';
import { pantallasDe } from 'src/app/core/navegacion/navegacion';
import { CasoService } from 'src/app/core/services/caso.service';
import { PacienteService } from 'src/app/core/services/paciente.service';
import { abrirFormularioPaciente } from 'src/app/paginas/medico/pacientes/paciente-formulario.component';

/** Días hacia delante que abarca «Próximos controles». */
const DIAS_PROXIMOS = 7;

/** Datos del panel del médico; todos salen de la API (casos abiertos, controles y pacientes de su área). */
interface PanelMedico {
  abiertos: Caso[];
  controles: ControlPendiente[];
  pacientes: Map<number, Paciente>;
}

@Component({
  selector: 'app-inicio',
  imports: [IonicModule, RouterLink, DatePipe, NgClass],
  templateUrl: './inicio.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./inicio.page.css'],
})
export class InicioPage implements OnInit {
  private readonly usuario = inject(AuthService).usuario;
  private readonly casosApi = inject(CasoService);
  private readonly pacientesApi = inject(PacienteService);
  private readonly modales = inject(ModalController);
  private readonly router = inject(Router);

  readonly nombre = computed(() => this.usuario()?.firstname ?? '');
  readonly rol = computed(() => {
    const u = this.usuario();
    return u ? NOMBRE_ROL[u.role] : '';
  });
  readonly esMedico = computed(() => this.usuario()?.role === 'MEDICO');
  /** Accesos rápidos (resto de roles): las pantallas del rol, sin la propia de Inicio. */
  readonly accesos = computed(() => pantallasDe(this.usuario()?.role).filter(p => p.ruta !== 'inicio'));
  readonly saludo = saludoSegunHora();
  readonly hoy = new Date();
  readonly claseClasificacion = claseClasificacion;

  readonly panel = signal<PanelMedico | null>(null);
  readonly cargando = signal(false);
  readonly errorCarga = signal('');

  /** Controles vencidos y de los próximos días (los vencidos primero, luego por fecha). */
  readonly proximos = computed(() =>
    [...(this.panel()?.controles ?? [])]
      .sort((a, b) => Number(b.vencido) - Number(a.vencido) || a.fecha.localeCompare(b.fecha))
      .slice(0, 6),
  );
  readonly controlesHoy = computed(() => {
    const hoy = hoyIso();
    return (this.panel()?.controles ?? []).filter(c => c.vencido || c.fecha.slice(0, 10) === hoy);
  });
  readonly pendientesValidar = computed(() => (this.panel()?.abiertos ?? []).filter(c => !c.clasificacionValidada));
  readonly recientes = computed(() =>
    [...(this.panel()?.abiertos ?? [])].sort((a, b) => b.fechaNotificacion.localeCompare(a.fechaNotificacion)).slice(0, 4),
  );
  readonly indicadores = computed(() => {
    const p = this.panel();
    if (!p) {
      return [];
    }
    const vencidos = p.controles.filter(c => c.vencido).length;
    return [
      { titulo: 'Casos abiertos', valor: p.abiertos.length, nota: 'En seguimiento', icono: 'folder-open-outline', ruta: '/casos' },
      {
        titulo: 'Controles hoy',
        valor: this.controlesHoy().length,
        nota: vencidos ? `${vencidos} vencido${vencidos > 1 ? 's' : ''}` : 'Al día',
        icono: 'calendar-outline',
        ruta: '/agenda',
        aviso: vencidos > 0,
      },
      {
        titulo: 'Pendientes de validar',
        valor: this.pendientesValidar().length,
        nota: 'Por el epidemiólogo',
        icono: 'shield-checkmark-outline',
        ruta: '/casos',
      },
      {
        titulo: 'Pacientes',
        valor: [...p.pacientes.values()].filter(x => x.activo).length,
        nota: 'Activos en tu área',
        icono: 'people-outline',
        ruta: '/pacientes',
      },
    ];
  });

  ngOnInit(): void {
    if (this.esMedico()) {
      this.cargar();
    }
  }

  ionViewWillEnter(): void {
    if (this.esMedico() && this.panel()) {
      this.cargar();
    }
  }

  cargar(): void {
    this.cargando.set(!this.panel());
    this.errorCarga.set('');
    forkJoin({
      abiertos: this.casosApi.listar({ estado: 'ABIERTO' }),
      controles: this.casosApi.controlesPendientes(sumarDias(hoyIso(), DIAS_PROXIMOS)),
      pacientes: this.pacientesApi.listar(),
    }).subscribe({
      next: ({ abiertos, controles, pacientes }) => {
        this.panel.set({ abiertos, controles, pacientes: new Map(pacientes.map(p => [p.id, p])) });
        this.cargando.set(false);
      },
      error: (e: unknown) => {
        this.errorCarga.set(mensajeDeError(e));
        this.cargando.set(false);
      },
    });
  }

  nombrePaciente(pacienteId: number): string {
    const p = this.panel()?.pacientes.get(pacienteId);
    return p ? `${p.nombres} ${p.apellidos}` : `Paciente ${pacienteId}`;
  }

  nombreClasificacion(c: Clasificacion | null | undefined): string {
    return nombreDe(CLASIFICACIONES, c);
  }

  /** «Hoy», «Mañana» o la fecha del control. */
  esHoy(fecha: string): boolean {
    return fecha.slice(0, 10) === hoyIso();
  }

  esManana(fecha: string): boolean {
    return fecha.slice(0, 10) === sumarDias(hoyIso(), 1);
  }

  /** «Día 11» desde el inicio de síntomas. */
  diaEvolucion(caso: Caso): string {
    const d = diasDesde(caso.fechaInicioSintomas);
    return d <= 0 ? 'Inicio hoy' : `Día ${d} desde el inicio`;
  }

  async nuevoPaciente(): Promise<void> {
    const creado = await abrirFormularioPaciente(this.modales);
    if (creado) {
      this.router.navigate(['/pacientes', creado.id]);
    }
  }
}

function saludoSegunHora(): string {
  const hora = new Date().getHours();
  if (hora < 12) {
    return 'Buenos días';
  }
  return hora < 20 ? 'Buenas tardes' : 'Buenas noches';
}
