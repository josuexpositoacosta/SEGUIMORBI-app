import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { EstadoVacioComponent } from 'src/app/compartido/estado-vacio.component';
import { hoyIso, sumarDias } from 'src/app/compartido/fechas';
import { mensajeDeError } from 'src/app/core/http/errores';
import { CLASIFICACIONES, ControlPendiente, claseClasificacion, nombreDe } from 'src/app/core/models/caso';
import { Paciente } from 'src/app/core/models/paciente';
import { CasoService } from 'src/app/core/services/caso.service';
import { PacienteService } from 'src/app/core/services/paciente.service';
import { TraducirPipe } from 'src/app/core/i18n/traducir.pipe';
import { t } from 'src/app/core/i18n/idioma';

type Horizonte = 0 | 7 | 30;

interface Grupo {
  titulo: string;
  clase: string;
  controles: ControlPendiente[];
}

/** Controles programados en los planes y seguimientos de los casos abiertos del área. */
@Component({
  selector: 'app-agenda',
  imports: [TraducirPipe, CommonModule, IonicModule, EstadoVacioComponent, DatePipe],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './agenda.page.html',
})
export class AgendaPage implements OnInit {
  private readonly api = inject(CasoService);
  private readonly pacientesApi = inject(PacienteService);
  private readonly router = inject(Router);

  readonly claseClasificacion = claseClasificacion;
  readonly controles = signal<ControlPendiente[]>([]);
  readonly pacientes = signal<Map<number, Paciente>>(new Map());
  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly horizonte = signal<Horizonte>(7);

  readonly grupos = computed<Grupo[]>(() => {
    const hoy = hoyIso();
    const lista = [...this.controles()].sort((a, b) => a.fecha.localeCompare(b.fecha));
    return [
      { titulo: t('Vencidos'), clase: 'peligro', controles: lista.filter(c => c.vencido) },
      { titulo: t('Hoy'), clase: 'primaria', controles: lista.filter(c => !c.vencido && c.fecha === hoy) },
      { titulo: t('Próximos'), clase: '', controles: lista.filter(c => !c.vencido && c.fecha > hoy) },
    ].filter(g => g.controles.length);
  });

  ngOnInit(): void {
    this.cargar();
  }

  ionViewWillEnter(): void {
    if (!this.cargando()) {
      this.cargar();
    }
  }

  cargar(evento?: CustomEvent): void {
    this.errorCarga.set('');
    forkJoin({
      controles: this.api.controlesPendientes(sumarDias(hoyIso(), this.horizonte())),
      pacientes: this.pacientesApi.listar(),
    }).subscribe({
      next: ({ controles, pacientes }) => {
        this.controles.set(controles);
        this.pacientes.set(new Map(pacientes.map(p => [p.id, p])));
        this.cargando.set(false);
        (evento?.target as HTMLIonRefresherElement | undefined)?.complete();
      },
      error: (e: unknown) => {
        this.errorCarga.set(mensajeDeError(e));
        this.cargando.set(false);
        (evento?.target as HTMLIonRefresherElement | undefined)?.complete();
      },
    });
  }

  cambiarHorizonte(valor: string | number): void {
    this.horizonte.set(Number(valor) as Horizonte);
    this.cargar();
  }

  nombrePaciente(c: ControlPendiente): string {
    const p = this.pacientes().get(c.pacienteId);
    return p ? `${p.apellidos}, ${p.nombres}` : t('Paciente {p0}', { p0: c.pacienteId });
  }

  telefono(c: ControlPendiente): string {
    return this.pacientes().get(c.pacienteId)?.telefono ?? '';
  }

  nombreClasificacion(c: ControlPendiente): string {
    return nombreDe(CLASIFICACIONES, c.clasificacion);
  }

  diasRetraso(c: ControlPendiente): number {
    return Math.round((new Date(hoyIso()).getTime() - new Date(c.fecha).getTime()) / 86400000);
  }

  abrir(c: ControlPendiente): void {
    this.router.navigate(['/casos', c.casoId]);
  }
}
