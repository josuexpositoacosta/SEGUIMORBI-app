import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

/**
 * Añade el token a las peticiones al backend y, si el backend responde 401 fuera del login,
 * cierra la sesión y lleva al login avisando de que caducó.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();
  const esBackend = req.url.startsWith(environment.urlHost);
  const esLogin = req.url.startsWith(`${environment.urlHost}auth/`);

  const peticion = token && esBackend && !esLogin
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(peticion).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && esBackend && !esLogin) {
        auth.logout('expirada');
      }
      return throwError(() => error);
    }),
  );
};
