import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActionSheetController, IonicModule } from '@ionic/angular';
import { AvisosService } from 'src/app/compartido/avisos.service';
import { EstadoVacioComponent } from 'src/app/compartido/estado-vacio.component';
import { normalizar } from 'src/app/compartido/texto';
import { mensajeDeError } from 'src/app/core/http/errores';
import { Desenlace } from 'src/app/core/models/admin';
import { DesenlaceService } from 'src/app/core/services/desenlace.service';

type Filtro = 'activos' | 'inactivos' | 'todos';

/** Igual que el backend: mayúsculas, espacios como guion bajo. */
export function normalizarCodigo(codigo: string): string {
  return codigo.trim().toUpperCase().replace(/ /g, '_');
}

function codigoValido(control: AbstractControl): ValidationErrors | null {
  const v = normalizarCodigo(control.value ?? '');
  return !v || /^[A-Z][A-Z0-9_]{1,39}$/.test(v) ? null : { codigo: true };
}

@Component({
  selector: 'app-desenlaces',
  imports: [CommonModule, ReactiveFormsModule, IonicModule, EstadoVacioComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './desenlaces.page.html',
})
export class DesenlacesPage implements OnInit {
  private readonly api = inject(DesenlaceService);
  private readonly avisos = inject(AvisosService);
  private readonly acciones = inject(ActionSheetController);
  private readonly fb = inject(FormBuilder);

  readonly desenlaces = signal<Desenlace[]>([]);
  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly busqueda = signal('');
  readonly filtro = signal<Filtro>('activos');

  readonly filtrados = computed(() => {
    const q = normalizar(this.busqueda());
    const f = this.filtro();
    return this.desenlaces()
      .filter(d => f === 'todos' || (f === 'activos') === d.activo)
      .filter(d => !q || normalizar(`${d.codigo} ${d.nombre}`).includes(q));
  });

  readonly abierto = signal(false);
  readonly editando = signal<Desenlace | null>(null);
  readonly guardando = signal(false);
  readonly errorFormulario = signal('');

  readonly form = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, codigoValido]],
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
  });

  readonly codigoFinal = computed(() => normalizarCodigo(this.codigoEscrito()));
  private readonly codigoEscrito = signal('');

  ngOnInit(): void {
    this.form.controls.codigo.valueChanges.subscribe(v => this.codigoEscrito.set(v ?? ''));
    this.cargar();
  }

  cargar(evento?: CustomEvent): void {
    this.errorCarga.set('');
    this.api.listar().subscribe({
      next: lista => {
        this.desenlaces.set(lista);
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

  async abrirAcciones(d: Desenlace): Promise<void> {
    const hoja = await this.acciones.create({
      header: d.nombre,
      subHeader: d.codigo,
      buttons: [
        { text: 'Cambiar nombre', icon: 'create-outline', handler: () => this.abrir(d) },
        d.activo
          ? { text: 'Desactivar', icon: 'ban-outline', role: 'destructive', handler: () => { this.cambiarEstado(d, false); } }
          : { text: 'Activar', icon: 'checkmark-circle-outline', handler: () => { this.cambiarEstado(d, true); } },
        { text: 'Cancelar', role: 'cancel', icon: 'close' },
      ],
    });
    await hoja.present();
  }

  abrir(d?: Desenlace): void {
    this.errorFormulario.set('');
    this.editando.set(d ?? null);
    this.form.reset({ codigo: d?.codigo ?? '', nombre: d?.nombre ?? '' });
    if (d) {
      this.form.controls.codigo.disable();
    } else {
      this.form.controls.codigo.enable();
    }
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
    const nombre = this.form.controls.nombre.value.trim();
    const actual = this.editando();
    const peticion = actual
      ? this.api.renombrar(actual.id, nombre)
      : this.api.crear(normalizarCodigo(this.form.controls.codigo.value), nombre);

    this.guardando.set(true);
    this.errorFormulario.set('');
    peticion.subscribe({
      next: d => {
        this.guardando.set(false);
        this.desenlaces.update(lista => actual ? lista.map(x => (x.id === d.id ? d : x)) : [...lista, d]);
        this.cerrar();
        this.avisos.exito(actual ? 'Nombre actualizado' : `Desenlace ${d.codigo} creado`);
      },
      error: (e: unknown) => {
        this.guardando.set(false);
        this.errorFormulario.set(mensajeDeError(e));
      },
    });
  }

  private async cambiarEstado(d: Desenlace, activo: boolean): Promise<void> {
    if (!activo) {
      const ok = await this.avisos.confirmar({
        titulo: 'Desactivar desenlace',
        mensaje: `«${d.nombre}» dejará de ofrecerse al cerrar casos. Los casos ya cerrados con él no cambian.`,
        confirmar: 'Desactivar',
        peligro: true,
      });
      if (!ok) {
        return;
      }
    }
    this.api.cambiarEstado(d.id, activo).subscribe({
      next: actualizado => {
        this.desenlaces.update(lista => lista.map(x => (x.id === actualizado.id ? actualizado : x)));
        this.avisos.exito(activo ? 'Desenlace activado' : 'Desenlace desactivado');
      },
      error: e => this.avisos.error(e),
    });
  }
}
