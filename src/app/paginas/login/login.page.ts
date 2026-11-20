import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { mensajeDeError } from 'src/app/core/http/errores';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.css']
})
export class LoginPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);

  loginError = '';
  aviso = '';
  isLoading = false;

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

    this.auth.login({
      username: this.username.value.trim(),
      password: this.password.value,
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.loginForm.reset();
        this.router.navigateByUrl(this.destino(), { replaceUrl: true });
      },
      error: (error: unknown) => {
        this.loginError = mensajeDeError(error);
        this.isLoading = false;
      },
    });
  }

  /** Vuelve a la página que pidió el usuario antes del login, si es una ruta interna. */
  private destino(): string {
    const volver = this.route.snapshot.queryParamMap.get('volver');
    return volver && volver.startsWith('/') && !volver.startsWith('//') && !volver.startsWith('/login')
      ? volver
      : '/inicio';
  }
}
