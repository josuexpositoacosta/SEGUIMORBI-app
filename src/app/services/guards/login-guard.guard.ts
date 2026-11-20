import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoginService } from '../auth/login.service';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginGuardService implements CanActivate {
  
  constructor(
    private loginService: LoginService,
    private router: Router
  ) { }

  canActivate(): Observable<boolean> {
    return this.loginService.userLoginOn.pipe(
      take(1),
      map(isLoggedIn => {
        if (isLoggedIn) {
          console.log('PASO POR EL GUARD - Usuario autenticado');
          return true;
        } else {
          console.log('Bloqueado por el Guard - Usuario no autenticado');
          this.router.navigate(['/folder/iniciar-sesion']);
          return false;
        }
      })
    );
  }
}
