import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActionSheetButton, ActionSheetController, IonicModule } from '@ionic/angular';
import { Observable, forkJoin } from 'rxjs';
import { AvisosService } from 'src/app/compartido/avisos.service';
import { EstadoVacioComponent } from 'src/app/compartido/estado-vacio.component';
import { normalizar } from 'src/app/compartido/texto';
import { AuthService } from 'src/app/core/auth/auth.service';
import { mensajeDeError } from 'src/app/core/http/errores';
import { UsuarioAdmin } from 'src/app/core/models/admin';
import { AreaSalud } from 'src/app/core/models/area-salud';
import { NOMBRE_ROL, Rol } from 'src/app/core/models/usuario';
import { AdminUsuariosService } from 'src/app/core/services/admin-usuarios.service';
import { AreaSaludService } from 'src/app/core/services/area-salud.service';

type Modo = 'crear' | 'acceso' | 'email' | 'password';
type FiltroRol = 'TODOS' | Rol;

const PATRON_USERNAME = /^[A-Za-z0-9._-]{3,50}$/;
const MIN_PASSWORD = 8;

/** Las dos contraseñas del formulario deben coincidir. */
function contrasenasIguales(grupo: AbstractControl): ValidationErrors | null {
  const p = grupo.get('password')?.value;
  const c = grupo.get('confirmar')?.value;
  return p && c && p !== c ? { distintas: true } : null;
}

/** El médico necesita un área de salud (regla del backend). */
function areaSiEsMedico(grupo: AbstractControl): ValidationErrors | null {
  return grupo.get('role')?.value === 'MEDICO' && !grupo.get('areaSaludId')?.value ? { areaObligatoria: true } : null;
}

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, ReactiveFormsModule, IonicModule, EstadoVacioComponent],
  templateUrl: './usuarios.page.html',
})
export class UsuariosPage implements OnInit {
  private readonly api = inject(AdminUsuariosService);
  private readonly areasApi = inject(AreaSaludService);
  private readonly avisos = inject(AvisosService);
  private readonly acciones = inject(ActionSheetController);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly miId = computed(() => this.auth.usuario()?.id);

  readonly roles: Rol[] = ['ADMIN', 'MEDICO', 'EPIDEMIOLOGO'];
  readonly nombreRol = NOMBRE_ROL;
  readonly minPassword = MIN_PASSWORD;

  readonly usuarios = signal<UsuarioAdmin[]>([]);
  readonly areas = signal<AreaSalud[]>([]);
  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly busqueda = signal('');
  readonly filtroRol = signal<FiltroRol>('TODOS');

  readonly areasActivas = computed(() => this.areas().filter(a => a.activo));
  readonly filtrados = computed(() => {
    const q = normalizar(this.busqueda());
    const rol = this.filtroRol();
    return this.usuarios().filter(u =>
      (rol === 'TODOS' || u.role === rol) &&
      (!q || normalizar(`${u.firstname} ${u.lastname} ${u.username} ${u.email ?? ''}`).includes(q)));
  });

  readonly modo = signal<Modo | null>(null);
  readonly seleccionado = signal<UsuarioAdmin | null>(null);
  readonly guardando = signal(false);
  readonly errorFormulario = signal('');

  readonly crearForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.pattern(PATRON_USERNAME)]],
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    email: ['', Validators.email],
    country: [''],
    role: ['MEDICO' as Rol, Validators.required],
    areaSaludId: [null as number | null],
    password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD)]],
    confirmar: ['', Validators.required],
  }, { validators: [contrasenasIguales, areaSiEsMedico] });

  readonly accesoForm = this.fb.nonNullable.group({
    role: ['MEDICO' as Rol, Validators.required],
    areaSaludId: [null as number | null],
    activo: [true],
  }, { validators: areaSiEsMedico });

  readonly emailForm = this.fb.nonNullable.group({ email: ['', Validators.email] });

  readonly passwordForm = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD)]],
    confirmar: ['', Validators.required],
  }, { validators: contrasenasIguales });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(evento?: CustomEvent): void {
    this.errorCarga.set('');
    forkJoin({ usuarios: this.api.listar(), areas: this.areasApi.listar() }).subscribe({
      next: ({ usuarios, areas }) => {
        this.usuarios.set(usuarios);
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

  nombreArea(id?: number | null): string {
    if (!id) {
      return '';
    }
    return this.areas().find(a => a.id === id)?.nombre ?? `Área ${id}`;
  }

  iniciales(u: UsuarioAdmin): string {
    return ((u.firstname?.charAt(0) ?? '') + (u.lastname?.charAt(0) ?? '')).toUpperCase() || '?';
  }

  claseRol(rol: Rol): string {
    return { ADMIN: 'terciaria', MEDICO: 'primaria', EPIDEMIOLOGO: 'secundaria' }[rol];
  }

  esYo(u: UsuarioAdmin): boolean {
    return u.id === this.miId();
  }

  // ---------- Acciones

  async abrirAcciones(u: UsuarioAdmin): Promise<void> {
    const botones: ActionSheetButton[] = [
      { text: 'Cambiar rol y área', icon: 'shield-half-outline', handler: () => this.abrir('acceso', u) },
      { text: u.email ? 'Cambiar correo' : 'Asignar correo', icon: 'mail-outline', handler: () => this.abrir('email', u) },
      { text: 'Restablecer contraseña', icon: 'key-outline', handler: () => this.abrir('password', u) },
    ];
    if (!this.esYo(u)) {
      botones.push(u.activo
        ? { text: 'Desactivar cuenta', icon: 'ban-outline', role: 'destructive', handler: () => { this.cambiarEstado(u, false); } }
        : { text: 'Activar cuenta', icon: 'checkmark-circle-outline', handler: () => { this.cambiarEstado(u, true); } });
    }
    botones.push({ text: 'Cancelar', role: 'cancel', icon: 'close' });

    const hoja = await this.acciones.create({ header: `${u.firstname} ${u.lastname}`, subHeader: u.username, buttons: botones });
    await hoja.present();
  }

  abrir(modo: Modo, u?: UsuarioAdmin): void {
    this.errorFormulario.set('');
    this.seleccionado.set(u ?? null);
    if (modo === 'crear') {
      this.crearForm.reset();
    } else if (modo === 'acceso' && u) {
      this.accesoForm.reset({ role: u.role, areaSaludId: u.areaSaludId ?? null, activo: u.activo });
    } else if (modo === 'email' && u) {
      this.emailForm.reset({ email: u.email ?? '' });
    } else if (modo === 'password') {
      this.passwordForm.reset();
    }
    this.modo.set(modo);
  }

  cerrar(): void {
    this.modo.set(null);
    this.seleccionado.set(null);
  }

  guardarNuevo(): void {
    if (this.crearForm.invalid) {
      this.crearForm.markAllAsTouched();
      return;
    }
    const v = this.crearForm.getRawValue();
    this.ejecutar(this.api.crear({
      username: v.username.trim(),
      email: v.email.trim() || null,
      password: v.password,
      firstname: v.firstname.trim(),
      lastname: v.lastname.trim(),
      country: v.country.trim() || null,
      role: v.role,
      areaSaludId: v.areaSaludId,
    }), creado => {
      this.usuarios.update(lista => [...lista, creado]);
      return `Usuario ${creado.username} creado`;
    });
  }

  guardarAcceso(): void {
    const u = this.seleccionado();
    if (!u || this.accesoForm.invalid) {
      this.accesoForm.markAllAsTouched();
      return;
    }
    const v = this.accesoForm.getRawValue();
    this.ejecutar(this.api.actualizarAcceso(u.id, v), actualizado => {
      this.reemplazar(actualizado);
      return 'Acceso actualizado';
    });
  }

  guardarEmail(): void {
    const u = this.seleccionado();
    if (!u || this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    const email = this.emailForm.getRawValue().email.trim() || null;
    this.ejecutar(this.api.cambiarEmail(u.id, email), actualizado => {
      this.reemplazar(actualizado);
      return email ? 'Correo guardado' : 'Correo eliminado';
    });
  }

  guardarPassword(): void {
    const u = this.seleccionado();
    if (!u || this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.ejecutar(this.api.restablecerPassword(u.id, this.passwordForm.getRawValue().password),
      () => `Contraseña de ${u.username} restablecida`);
  }

  private async cambiarEstado(u: UsuarioAdmin, activo: boolean): Promise<void> {
    if (!activo) {
      const ok = await this.avisos.confirmar({
        titulo: 'Desactivar cuenta',
        mensaje: `${u.firstname} ${u.lastname} no podrá iniciar sesión hasta que vuelvas a activar su cuenta.`,
        confirmar: 'Desactivar',
        peligro: true,
      });
      if (!ok) {
        return;
      }
    }
    this.api.actualizarAcceso(u.id, { role: u.role, areaSaludId: u.areaSaludId ?? null, activo }).subscribe({
      next: actualizado => {
        this.reemplazar(actualizado);
        this.avisos.exito(activo ? 'Cuenta activada' : 'Cuenta desactivada');
      },
      error: e => this.avisos.error(e),
    });
  }

  /** Ejecuta la petición del formulario abierto: cierra y avisa si va bien; si no, muestra el error en el modal. */
  private ejecutar<T>(peticion: Observable<T>, alTerminar: (r: T) => string): void {
    this.guardando.set(true);
    this.errorFormulario.set('');
    peticion.subscribe({
      next: r => {
        this.guardando.set(false);
        const mensaje = alTerminar(r);
        this.cerrar();
        this.avisos.exito(mensaje);
      },
      error: (e: unknown) => {
        this.guardando.set(false);
        this.errorFormulario.set(mensajeDeError(e));
      },
    });
  }

  private reemplazar(u: UsuarioAdmin): void {
    this.usuarios.update(lista => lista.map(x => (x.id === u.id ? u : x)));
  }
}
