import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { hoyIso } from 'src/app/compartido/fechas';
import { AuthService } from 'src/app/core/auth/auth.service';
import { mensajeDeError } from 'src/app/core/http/errores';
import { Paciente, SEXOS, TIPOS_DOCUMENTO } from 'src/app/core/models/paciente';
import { AreaSaludService } from 'src/app/core/services/area-salud.service';
import { PacienteService } from 'src/app/core/services/paciente.service';

/** La fecha de nacimiento no puede ser posterior a hoy. */
function noFutura(control: AbstractControl): ValidationErrors | null {
  return control.value && control.value > hoyIso() ? { futura: true } : null;
}

/**
 * Alta o edición de un paciente en ventana. Se abre con ModalController y devuelve el paciente
 * guardado con role 'guardado'. El área es siempre la del médico.
 */
@Component({
  selector: 'app-paciente-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  templateUrl: './paciente-formulario.component.html',
})
export class PacienteFormularioComponent implements OnInit {
  @Input() paciente?: Paciente;

  private readonly modal = inject(ModalController);
  private readonly api = inject(PacienteService);
  private readonly areas = inject(AreaSaludService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly tiposDocumento = TIPOS_DOCUMENTO;
  readonly sexos = SEXOS;
  readonly hoy = hoyIso();
  readonly area = signal('');
  readonly guardando = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    tipoDocumento: ['CI', Validators.required],
    numeroDocumento: ['', [Validators.required, Validators.maxLength(30)]],
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    fechaNacimiento: ['', [Validators.required, noFutura]],
    sexo: ['', Validators.required],
    telefono: [''],
    direccion: [''],
  });

  private get areaSaludId(): number | null {
    return this.paciente?.areaSaludId ?? this.auth.usuario()?.areaSaludId ?? null;
  }

  ngOnInit(): void {
    const p = this.paciente;
    if (p) {
      this.form.reset({
        tipoDocumento: p.tipoDocumento,
        numeroDocumento: p.numeroDocumento,
        nombres: p.nombres,
        apellidos: p.apellidos,
        fechaNacimiento: p.fechaNacimiento,
        sexo: p.sexo,
        telefono: p.telefono ?? '',
        direccion: p.direccion ?? '',
      });
    }
    const id = this.areaSaludId;
    if (id) {
      this.areas.obtener(id).subscribe({
        next: a => this.area.set(`${a.nombre} (${a.codigo})`),
        error: () => this.area.set(`Área ${id}`),
      });
    }
  }

  fechaFutura(): boolean {
    return this.form.controls.fechaNacimiento.hasError('futura');
  }

  cerrar(): void {
    this.modal.dismiss(null, 'cancel');
  }

  guardar(): void {
    const areaSaludId = this.areaSaludId;
    if (this.form.invalid || !areaSaludId) {
      this.form.markAllAsTouched();
      if (!areaSaludId) {
        this.error.set('Tu usuario no tiene un área de salud asignada. Pide al administrador que te la asigne.');
      }
      return;
    }
    const v = this.form.getRawValue();
    const datos = {
      tipoDocumento: v.tipoDocumento,
      numeroDocumento: v.numeroDocumento.trim().toUpperCase(),
      nombres: v.nombres.trim(),
      apellidos: v.apellidos.trim(),
      fechaNacimiento: v.fechaNacimiento,
      sexo: v.sexo,
      telefono: v.telefono.trim() || null,
      direccion: v.direccion.trim() || null,
      areaSaludId,
    };
    const peticion = this.paciente ? this.api.actualizar(this.paciente.id, datos) : this.api.registrar(datos);

    this.guardando.set(true);
    this.error.set('');
    peticion.subscribe({
      next: guardado => {
        this.guardando.set(false);
        this.modal.dismiss(guardado, 'guardado');
      },
      error: (e: unknown) => {
        this.guardando.set(false);
        this.error.set(mensajeDeError(e));
      },
    });
  }
}

/** Abre el formulario y devuelve el paciente guardado, o null si se cancela. */
export async function abrirFormularioPaciente(modales: ModalController, paciente?: Paciente): Promise<Paciente | null> {
  const modal = await modales.create({
    component: PacienteFormularioComponent,
    componentProps: { paciente },
    cssClass: 'modal-formulario',
  });
  await modal.present();
  const { data, role } = await modal.onDidDismiss<Paciente>();
  return role === 'guardado' && data ? data : null;
}
