import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/auth/login.service';
import { LoginRequest } from 'src/app/services/auth/loginRequest';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginError: string = "";
  hidePassword: boolean = true;
  isLoading: boolean = false;

  loginForm = this.formBuilder.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
  }

  get email() {
    return this.loginForm.controls.username;
  }

  get password() {
    return this.loginForm.controls.password;
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  login() {
    if (this.loginForm.valid) {
      this.loginError = "";
      this.isLoading = true;

      this.loginService.login(this.loginForm.value as LoginRequest).subscribe({
        next: (userData) => {
          console.log(userData);
        },
        error: (errorData) => {
          console.error(errorData);
          this.loginError = errorData;
          this.isLoading = false;
        },
        complete: () => {
          console.info("Login completo");
          this.isLoading = false;
          this.router.navigateByUrl('/folder/dashboard');
          this.loginForm.reset();
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
