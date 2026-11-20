import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/auth/login.service';
import { LoginRequest } from 'src/app/services/auth/loginRequest';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginError = '';
  isLoading = false;

  // Se acepta nombre de usuario o correo: no se valida formato de email.
  loginForm = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private loginService: LoginService
  ) { }

  get username() {
    return this.loginForm.controls.username;
  }

  get password() {
    return this.loginForm.controls.password;
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loginError = '';
    this.isLoading = true;

    const credenciales: LoginRequest = {
      username: this.username.value.trim(),
      password: this.password.value,
    };

    this.loginService.login(credenciales).subscribe({
      next: () => {
        this.isLoading = false;
        this.loginForm.reset();
        this.router.navigateByUrl('/folder/dashboard');
      },
      error: (error: Error) => {
        this.loginError = error.message;
        this.isLoading = false;
      },
    });
  }
}
