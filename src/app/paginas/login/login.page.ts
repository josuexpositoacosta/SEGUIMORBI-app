import { Component, OnDestroy, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { mensajeDeError } from 'src/app/core/http/errores';
import paquete from '../../../../package.json';

/** Si el login tarda más que esto, se avisa de que el servidor puede estar arrancando (plan gratuito). */
const ESPERA_AVISO_MS = 4000;

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, IonicModule],
  templateUrl: './login.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./login.page.css']
})
export class LoginPage implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);

  loginError = '';
  aviso = '';
  isLoading = false;
  /** El servidor tarda en responder: se muestra la nota de arranque. */
  lento = false;
  readonly version = paquete.version;
  private temporizador?: ReturnType<typeof setTimeout>;

  // Se acepta nombre de usuario o correo: no se valida formato de email.
  loginForm = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  get username() {
    return this.loginForm.controls.username;
  }

  get password() {
    return this.loginForm.controls.password;
  }

  ngOnInit(): void {
    const avisos: Record<string, string> = {
      expirada: 'Tu sesión ha caducado. Vuelve a iniciar sesión.',
      'sin-conexion': 'No se pudo contactar con el servidor. Comprueba tu conexión e inicia sesión de nuevo.',
    };
    this.aviso = avisos[this.route.snapshot.queryParamMap.get('motivo') ?? ''] ?? '';
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loginError = '';
    this.aviso = '';
    this.isLoading = true;
    this.temporizador = setTimeout(() => (this.lento = true), ESPERA_AVISO_MS);

    this.auth.login({
      username: this.username.value.trim(),
      password: this.password.value,
    }).subscribe({
      next: () => {
        this.terminarEspera();
        this.loginForm.reset();
        this.router.navigateByUrl(this.destino(), { replaceUrl: true });
      },
      error: (error: unknown) => {
        this.loginError = mensajeDeError(error);
        this.terminarEspera();
      },
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.temporizador);
  }

  private terminarEspera(): void {
    clearTimeout(this.temporizador);
    this.isLoading = false;
    this.lento = false;
  }

  /** Vuelve a la página que pidió el usuario antes del login, si es una ruta interna. */
  private destino(): string {
    const volver = this.route.snapshot.queryParamMap.get('volver');
    return volver && volver.startsWith('/') && !volver.startsWith('//') && !volver.startsWith('/login')
      ? volver
      : '/inicio';
  }
}
