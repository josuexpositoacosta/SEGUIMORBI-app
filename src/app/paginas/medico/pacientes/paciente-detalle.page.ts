import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { AvisosService } from 'src/app/compartido/avisos.service';
import { EstadoVacioComponent } from 'src/app/compartido/estado-vacio.component';
import { textoEdad } from 'src/app/compartido/fechas';
import { mensajeDeError } from 'src/app/core/http/errores';
import { CLASIFICACIONES, Caso, claseClasificacion, nombreDe } from 'src/app/core/models/caso';
import { Paciente, nombreDocumento, nombreSexo } from 'src/app/core/models/paciente';
import { CasoService } from 'src/app/core/services/caso.service';
import { abrirFormularioCaso } from 'src/app/paginas/casos/caso-formulario.component';
import { AreaSaludService } from 'src/app/core/services/area-salud.service';
import { PacienteService } from 'src/app/core/services/paciente.service';
import { abrirFormularioPaciente } from './paciente-formulario.component';
import { TraducirPipe } from 'src/app/core/i18n/traducir.pipe';
import { t } from 'src/app/core/i18n/idioma';

@Component({
  selector: 'app-paciente-detalle',
  imports: [TraducirPipe, CommonModule, IonicModule, EstadoVacioComponent, DatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './paciente-detalle.page.html',
})
export class PacienteDetallePage implements OnInit {
  private readonly api = inject(PacienteService);
  private readonly areas = inject(AreaSaludService);
  private readonly avisos = inject(AvisosService);
  private readonly modales = inject(ModalController);
  private readonly casosApi = inject(CasoService);
  private readonly router = inject(Router);
  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  readonly paciente = signal<Paciente | null>(null);
  readonly area = signal('');
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly casos = signal<Caso[]>([]);
  /** Un paciente no puede tener dos casos abiertos (regla del backend). */
  readonly tieneCasoAbierto = computed(() => this.casos().some(c => c.estado === 'ABIERTO'));
  readonly claseClasificacion = claseClasificacion;

  readonly textoEdad = textoEdad;
  readonly nombreSexo = nombreSexo;
  readonly nombreDocumento = nombreDocumento;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.api.obtener(this.id).subscribe({
      next: p => {
        this.paciente.set(p);
        this.cargando.set(false);
        this.cargarCasos();
        this.areas.obtener(p.areaSaludId).subscribe({
          next: a => this.area.set(`${a.nombre} (${a.codigo})`),
          error: () => this.area.set(`Área ${p.areaSaludId}`),
        });
      },
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e));
        this.cargando.set(false);
      },
    });
  }

  cargarCasos(): void {
    this.casosApi.dePaciente(this.id).subscribe({
      next: lista => this.casos.set([...lista].sort((a, b) => b.fechaNotificacion.localeCompare(a.fechaNotificacion))),
      error: () => this.casos.set([]),
    });
  }

  nombreClasificacion(c: string): string {
    return nombreDe(CLASIFICACIONES, c as never);
  }

  verCaso(c: Caso): void {
    this.router.navigate(['/casos', c.id]);
  }

  async abrirCaso(): Promise<void> {
    const p = this.paciente();
    if (!p) {
      return;
    }
    const creado = await abrirFormularioCaso(this.modales, p);
    if (creado) {
      this.avisos.exito(t('Caso nº {p0} registrado como {p1}', { p0: creado.id, p1: this.nombreClasificacion(creado.clasificacion) }));
      this.router.navigate(['/casos', creado.id]);
    }
  }

  iniciales(p: Paciente): string {
    return ((p.nombres?.charAt(0) ?? '') + (p.apellidos?.charAt(0) ?? '')).toUpperCase();
  }

  async editar(): Promise<void> {
    const p = this.paciente();
    if (!p) {
      return;
    }
    const guardado = await abrirFormularioPaciente(this.modales, p);
    if (guardado) {
      this.paciente.set(guardado);
      this.avisos.exito('Datos del paciente actualizados');
    }
  }

  activar(): void {
    const p = this.paciente();
    if (!p) {
      return;
    }
    this.api.activar(p.id).subscribe({
      next: actualizado => {
        this.paciente.set(actualizado);
        this.avisos.exito('Paciente activado');
      },
      error: e => this.avisos.error(e),
    });
  }

  async desactivar(): Promise<void> {
    const p = this.paciente();
    if (!p) {
      return;
    }
    const ok = await this.avisos.confirmar({
      titulo: t('Desactivar paciente'),
      mensaje: t('{p0} dejará de aparecer entre los pacientes activos. Sus datos y casos se conservan y podrás volver a activarlo.', { p0: `${p.nombres} ${p.apellidos}` }),
      confirmar: t('Desactivar'),
      peligro: true,
    });
    if (!ok) {
      return;
    }
    this.api.desactivar(p.id).subscribe({
      next: actualizado => {
        this.paciente.set(actualizado);
        this.avisos.exito('Paciente desactivado');
      },
      error: e => this.avisos.error(e),
    });
  }
}
