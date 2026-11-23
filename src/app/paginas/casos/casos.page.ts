import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { EstadoVacioComponent } from 'src/app/compartido/estado-vacio.component';
import { normalizar } from 'src/app/compartido/texto';
import { AuthService } from 'src/app/core/auth/auth.service';
import { mensajeDeError } from 'src/app/core/http/errores';
import { CLASIFICACIONES, Caso, Clasificacion, EstadoCaso, claseClasificacion, nombreDe } from 'src/app/core/models/caso';
import { Paciente } from 'src/app/core/models/paciente';
import { CasoService } from 'src/app/core/services/caso.service';
import { PacienteService } from 'src/app/core/services/paciente.service';

type FiltroEstado = EstadoCaso | 'TODOS';

@Component({
  selector: 'app-casos',
  imports: [CommonModule, IonicModule, EstadoVacioComponent, DatePipe, RouterLink],
  templateUrl: './casos.page.html',
})
export class CasosPage implements OnInit {
  private readonly api = inject(CasoService);
  private readonly pacientesApi = inject(PacienteService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly esMedico = computed(() => this.auth.usuario()?.role === 'MEDICO');
  readonly clasificaciones = CLASIFICACIONES;
  readonly claseClasificacion = claseClasificacion;

  readonly casos = signal<Caso[]>([]);
  readonly pacientes = signal<Map<number, Paciente>>(new Map());
  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly busqueda = signal('');
  readonly estado = signal<FiltroEstado>('ABIERTO');
  readonly clasificacion = signal<Clasificacion | null>(null);

  readonly filtrados = computed(() => {
    const q = normalizar(this.busqueda());
    const c = this.clasificacion();
    const pac = this.pacientes();
    return this.casos()
      .filter(caso => !c || caso.clasificacion === c)
      .filter(caso => {
        if (!q) {
          return true;
        }
        const p = pac.get(caso.pacienteId);
        return normalizar(`${p?.nombres ?? ''} ${p?.apellidos ?? ''} ${p?.numeroDocumento ?? ''} ${caso.id}`).includes(q);
      })
      .sort((a, b) => b.fechaNotificacion.localeCompare(a.fechaNotificacion));
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
    const estado = this.estado();
    forkJoin({
      casos: this.api.listar(estado === 'TODOS' ? {} : { estado }),
      pacientes: this.pacientesApi.listar(),
    }).subscribe({
      next: ({ casos, pacientes }) => {
        this.casos.set(casos);
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

  cambiarEstado(valor: FiltroEstado): void {
    this.estado.set(valor);
    this.cargar();
  }

  alternarClasificacion(c: Clasificacion): void {
    this.clasificacion.set(this.clasificacion() === c ? null : c);
  }

  nombrePaciente(caso: Caso): string {
    const p = this.pacientes().get(caso.pacienteId);
    return p ? `${p.apellidos}, ${p.nombres}` : `Paciente ${caso.pacienteId}`;
  }

  nombreClasificacion(c: Clasificacion | null | undefined): string {
    return nombreDe(CLASIFICACIONES, c);
  }

  abrir(caso: Caso): void {
    this.router.navigate(['/casos', caso.id]);
  }
}
