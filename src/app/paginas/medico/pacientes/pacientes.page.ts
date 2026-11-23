import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { AvisosService } from 'src/app/compartido/avisos.service';
import { EstadoVacioComponent } from 'src/app/compartido/estado-vacio.component';
import { textoEdad } from 'src/app/compartido/fechas';
import { normalizar } from 'src/app/compartido/texto';
import { mensajeDeError } from 'src/app/core/http/errores';
import { Paciente, nombreSexo } from 'src/app/core/models/paciente';
import { PacienteService } from 'src/app/core/services/paciente.service';
import { abrirFormularioPaciente } from './paciente-formulario.component';

type Filtro = 'activos' | 'inactivos' | 'todos';

@Component({
  selector: 'app-pacientes',
  imports: [CommonModule, IonicModule, EstadoVacioComponent],
  templateUrl: './pacientes.page.html',
})
export class PacientesPage implements OnInit {
  private readonly api = inject(PacienteService);
  private readonly avisos = inject(AvisosService);
  private readonly modales = inject(ModalController);
  private readonly router = inject(Router);

  readonly pacientes = signal<Paciente[]>([]);
  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly busqueda = signal('');
  readonly filtro = signal<Filtro>('activos');

  readonly filtrados = computed(() => {
    const q = normalizar(this.busqueda());
    const f = this.filtro();
    return this.pacientes()
      .filter(p => f === 'todos' || (f === 'activos') === p.activo)
      .filter(p => !q || normalizar(`${p.nombres} ${p.apellidos} ${p.numeroDocumento}`).includes(q))
      .sort((a, b) => `${a.apellidos} ${a.nombres}`.localeCompare(`${b.apellidos} ${b.nombres}`, 'es'));
  });

  readonly textoEdad = textoEdad;
  readonly nombreSexo = nombreSexo;

  ngOnInit(): void {
    this.cargar();
  }

  /** Al volver de la ficha, refresca por si se editó o desactivó. */
  ionViewWillEnter(): void {
    if (!this.cargando()) {
      this.cargar();
    }
  }

  cargar(evento?: CustomEvent): void {
    this.errorCarga.set('');
    this.api.listar().subscribe({
      next: lista => {
        this.pacientes.set(lista);
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

  iniciales(p: Paciente): string {
    return ((p.nombres?.charAt(0) ?? '') + (p.apellidos?.charAt(0) ?? '')).toUpperCase();
  }

  abrirFicha(p: Paciente): void {
    this.router.navigate(['/pacientes', p.id]);
  }

  async nuevo(): Promise<void> {
    const creado = await abrirFormularioPaciente(this.modales);
    if (creado) {
      this.pacientes.update(lista => [...lista, creado]);
      this.avisos.exito(`Paciente ${creado.nombres} ${creado.apellidos} registrado`);
    }
  }
}
