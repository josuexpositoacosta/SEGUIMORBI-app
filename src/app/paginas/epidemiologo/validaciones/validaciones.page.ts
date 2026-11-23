import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { AvisosService } from 'src/app/compartido/avisos.service';
import { EstadoVacioComponent } from 'src/app/compartido/estado-vacio.component';
import { mensajeDeError } from 'src/app/core/http/errores';
import { AreaSalud } from 'src/app/core/models/area-salud';
import { CLASIFICACIONES, Caso, Clasificacion, claseClasificacion, nombreDe } from 'src/app/core/models/caso';
import { Paciente } from 'src/app/core/models/paciente';
import { AreaSaludService } from 'src/app/core/services/area-salud.service';
import { CasoService } from 'src/app/core/services/caso.service';
import { PacienteService } from 'src/app/core/services/paciente.service';

/** Bandeja del epidemiólogo: clasificaciones propuestas por los médicos pendientes de validar. */
@Component({
  selector: 'app-validaciones',
  imports: [CommonModule, IonicModule, EstadoVacioComponent, DatePipe],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './validaciones.page.html',
})
export class ValidacionesPage implements OnInit {
  private readonly api = inject(CasoService);
  private readonly pacientesApi = inject(PacienteService);
  private readonly areasApi = inject(AreaSaludService);
  private readonly avisos = inject(AvisosService);
  private readonly alertas = inject(AlertController);
  private readonly router = inject(Router);

  readonly claseClasificacion = claseClasificacion;
  readonly casos = signal<Caso[]>([]);
  readonly pacientes = signal<Map<number, Paciente>>(new Map());
  readonly areas = signal<Map<number, AreaSalud>>(new Map());
  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly soloDistintas = signal(false);

  /** Primero los que difieren de la sugerencia de la OPS, después los más antiguos. */
  readonly pendientes = computed(() => this.casos()
    .filter(c => !this.soloDistintas() || !c.sugerencia?.coincideConActual)
    .sort((a, b) => Number(a.sugerencia?.coincideConActual) - Number(b.sugerencia?.coincideConActual)
      || a.fechaNotificacion.localeCompare(b.fechaNotificacion)));

  readonly distintas = computed(() => this.casos().filter(c => !c.sugerencia?.coincideConActual).length);

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
      casos: this.api.listar({ estado: 'ABIERTO' }),
      pacientes: this.pacientesApi.listar(),
      areas: this.areasApi.listar(),
    }).subscribe({
      next: ({ casos, pacientes, areas }) => {
        this.casos.set(casos.filter(c => !c.clasificacionValidada));
        this.pacientes.set(new Map(pacientes.map(p => [p.id, p])));
        this.areas.set(new Map(areas.map(a => [a.id, a])));
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

  nombrePaciente(c: Caso): string {
    const p = this.pacientes().get(c.pacienteId);
    return p ? `${p.apellidos}, ${p.nombres}` : `Paciente ${c.pacienteId}`;
  }

  nombreArea(c: Caso): string {
    return this.areas().get(c.areaSaludId)?.nombre ?? `Área ${c.areaSaludId}`;
  }

  nombreClasificacion(c: Clasificacion | null | undefined): string {
    return c ? nombreDe(CLASIFICACIONES, c) : 'ninguna';
  }

  ultimoCambio(c: Caso) {
    return c.historial?.length ? c.historial[c.historial.length - 1] : null;
  }

  abrir(c: Caso): void {
    this.router.navigate(['/casos', c.id]);
  }

  async validar(c: Caso, evento: Event): Promise<void> {
    evento.stopPropagation();
    const alerta = await this.alertas.create({
      header: 'Validar clasificación',
      subHeader: `${this.nombrePaciente(c)} · ${this.nombreClasificacion(c.clasificacion)}`,
      inputs: [{ name: 'observaciones', type: 'textarea', placeholder: 'Observaciones (opcional)' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Validar', role: 'confirm' },
      ],
    });
    await alerta.present();
    const { role, data } = await alerta.onDidDismiss<{ values: { observaciones?: string } }>();
    if (role !== 'confirm') {
      return;
    }
    const observaciones = data?.values?.observaciones?.trim() || null;
    this.api.validarClasificacion(c.id, observaciones).subscribe({
      next: () => {
        this.casos.update(lista => lista.filter(x => x.id !== c.id));
        this.avisos.exito(`Clasificación de ${this.nombrePaciente(c)} validada`);
      },
      error: e => this.avisos.error(e),
    });
  }
}
