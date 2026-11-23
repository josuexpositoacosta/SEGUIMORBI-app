import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/core/auth/auth.service';
import { mensajeDeError } from 'src/app/core/http/errores';
import { NOMBRE_ROL } from 'src/app/core/models/usuario';
import { AreaSaludService } from 'src/app/core/services/area-salud.service';
import { UsuarioService } from 'src/app/core/services/usuario.service';

@Component({
  selector: 'app-datos-personales',
  imports: [ReactiveFormsModule, IonicModule],
  templateUrl: './datos-personales.component.html',
  styleUrls: ['./datos-personales.component.css']
})
export class DatosPersonalesComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly usuarios = inject(UsuarioService);
  private readonly areas = inject(AreaSaludService);
  private readonly toast = inject(ToastController);
  private readonly formBuilder = inject(FormBuilder);

  readonly usuario = this.auth.usuario;
  readonly rol = computed(() => {
    const u = this.usuario();
    return u ? NOMBRE_ROL[u.role] : '';
  });
  readonly iniciales = computed(() => {
    const u = this.usuario();
    return ((u?.firstname?.charAt(0) ?? '') + (u?.lastname?.charAt(0) ?? '')).toUpperCase() || '?';
  });
  readonly area = signal<string | null>(null);

  editMode = false;
  guardando = false;
  errorMessage = '';

  form = this.formBuilder.nonNullable.group({
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    country: [''],
  });

  get firstname() {
    return this.form.controls.firstname;
  }

  get lastname() {
    return this.form.controls.lastname;
  }

  ngOnInit(): void {
    const areaId = this.usuario()?.areaSaludId;
    if (areaId) {
      this.areas.obtener(areaId).subscribe({
        next: area => this.area.set(`${area.nombre} (${area.codigo})`),
        error: () => this.area.set(`Área ${areaId}`),
      });
    }
  }

  editar(): void {
    const u = this.usuario();
    if (!u) {
      return;
    }
    this.form.reset({ firstname: u.firstname ?? '', lastname: u.lastname ?? '', country: u.country ?? '' });
    this.errorMessage = '';
    this.editMode = true;
  }

  cancelar(): void {
    this.editMode = false;
    this.errorMessage = '';
  }

  guardar(): void {
    const u = this.usuario();
    if (!u || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const datos = {
      id: u.id,
      firstname: this.firstname.value.trim(),
      lastname: this.lastname.value.trim(),
      country: this.form.controls.country.value.trim(),
    };

    this.guardando = true;
    this.usuarios.actualizarDatosPersonales(datos).subscribe({
      next: async () => {
        this.auth.actualizarPerfilLocal(datos);
        this.guardando = false;
        this.editMode = false;
        const aviso = await this.toast.create({
          message: 'Datos guardados', duration: 2000, color: 'success', icon: 'checkmark-circle-outline',
        });
        await aviso.present();
      },
      error: (error: unknown) => {
        this.errorMessage = mensajeDeError(error);
        this.guardando = false;
      },
    });
  }
}
