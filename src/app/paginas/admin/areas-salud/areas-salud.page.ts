import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActionSheetController, IonicModule } from '@ionic/angular';
import { AvisosService } from 'src/app/compartido/avisos.service';
import { EstadoVacioComponent } from 'src/app/compartido/estado-vacio.component';
import { normalizar } from 'src/app/compartido/texto';
import { mensajeDeError } from 'src/app/core/http/errores';
import { AreaSalud } from 'src/app/core/models/area-salud';
import { AreaSaludService } from 'src/app/core/services/area-salud.service';

type Filtro = 'activas' | 'inactivas' | 'todas';

@Component({
  selector: 'app-areas-salud',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule, EstadoVacioComponent, DatePipe],
  templateUrl: './areas-salud.page.html',
})
export class AreasSaludPage implements OnInit {
  private readonly api = inject(AreaSaludService);
  private readonly avisos = inject(AvisosService);
  private readonly acciones = inject(ActionSheetController);
  private readonly fb = inject(FormBuilder);

  readonly areas = signal<AreaSalud[]>([]);
  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly busqueda = signal('');
  readonly filtro = signal<Filtro>('activas');

  readonly filtradas = computed(() => {
    const q = normalizar(this.busqueda());
    const f = this.filtro();
    return this.areas()
      .filter(a => f === 'todas' || (f === 'activas') === a.activo)
      .filter(a => !q || normalizar(`${a.codigo} ${a.nombre} ${a.provincia} ${a.municipio}`).includes(q))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  });

  readonly abierto = signal(false);
  readonly editando = signal<AreaSalud | null>(null);
  readonly guardando = signal(false);
  readonly errorFormulario = signal('');

  readonly form = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, Validators.maxLength(30)]],
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    provincia: ['', Validators.required],
    municipio: ['', Validators.required],
    direccion: [''],
    telefono: [''],
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(evento?: CustomEvent): void {
    this.errorCarga.set('');
    this.api.listar().subscribe({
      next: areas => {
        this.areas.set(areas);
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

  async abrirAcciones(a: AreaSalud): Promise<void> {
    const hoja = await this.acciones.create({
      header: a.nombre,
      subHeader: a.codigo,
      buttons: [
        { text: 'Editar datos', icon: 'create-outline', handler: () => this.abrir(a) },
        a.activo
          ? { text: 'Desactivar área', icon: 'ban-outline', role: 'destructive', handler: () => { this.cambiarEstado(a, false); } }
          : { text: 'Activar área', icon: 'checkmark-circle-outline', handler: () => { this.cambiarEstado(a, true); } },
        { text: 'Cancelar', role: 'cancel', icon: 'close' },
      ],
    });
    await hoja.present();
  }

  abrir(area?: AreaSalud): void {
    this.errorFormulario.set('');
    this.editando.set(area ?? null);
    this.form.reset({
      codigo: area?.codigo ?? '',
      nombre: area?.nombre ?? '',
      provincia: area?.provincia ?? '',
      municipio: area?.municipio ?? '',
      direccion: area?.direccion ?? '',
      telefono: area?.telefono ?? '',
    });
    this.abierto.set(true);
  }

  cerrar(): void {
    this.abierto.set(false);
    this.editando.set(null);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const datos = {
      codigo: v.codigo.trim(),
      nombre: v.nombre.trim(),
      provincia: v.provincia.trim(),
      municipio: v.municipio.trim(),
      direccion: v.direccion.trim() || null,
      telefono: v.telefono.trim() || null,
    };
    const actual = this.editando();
    const peticion = actual ? this.api.actualizar(actual.id, datos) : this.api.crear(datos);

    this.guardando.set(true);
    this.errorFormulario.set('');
    peticion.subscribe({
      next: area => {
        this.guardando.set(false);
        this.areas.update(lista => actual ? lista.map(x => (x.id === area.id ? area : x)) : [...lista, area]);
        this.cerrar();
        this.avisos.exito(actual ? 'Área actualizada' : `Área ${area.codigo} creada`);
      },
      error: (e: unknown) => {
        this.guardando.set(false);
        this.errorFormulario.set(mensajeDeError(e));
      },
    });
  }

  private async cambiarEstado(a: AreaSalud, activa: boolean): Promise<void> {
    if (!activa) {
      const ok = await this.avisos.confirmar({
        titulo: 'Desactivar área',
        mensaje: `No se podrán asignar pacientes ni médicos nuevos a ${a.nombre}. Sus registros se conservan y podrás volver a activarla.`,
        confirmar: 'Desactivar',
        peligro: true,
      });
      if (!ok) {
        return;
      }
    }
    (activa ? this.api.activar(a.id) : this.api.desactivar(a.id)).subscribe({
      next: area => {
        this.areas.update(lista => lista.map(x => (x.id === area.id ? area : x)));
        this.avisos.exito(activa ? 'Área activada' : 'Área desactivada');
      },
      error: e => this.avisos.error(e),
    });
  }
}
