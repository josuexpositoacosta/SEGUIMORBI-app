import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';

const RUTA_LOGIN = '/folder/iniciar-sesion';
const RUTA_INICIO = '/folder/dashboard';

/** Solo deja pasar con sesión vigente. Carga el perfil (/user/me) si aún no está. */
export const autenticadoGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const alLogin = (motivo?: string) =>
    router.createUrlTree([RUTA_LOGIN], { queryParams: { volver: state.url, ...(motivo ? { motivo } : {}) } });

  if (!auth.sesionVigente()) {
    return alLogin();
  }
  if (auth.usuario()) {
    return true;
  }
  // Si el perfil no se puede cargar, se cierra la sesión local antes de ir al login; si no,
  // el login vería un token sin caducar y devolvería aquí, en bucle.
  return auth.cargarPerfil().pipe(
    map(() => true),
    catchError((error: unknown) => {
      auth.cerrarSesionLocal();
      const sinConexion = error instanceof HttpErrorResponse && error.status === 0;
      return of(alLogin(sinConexion ? 'sin-conexion' : 'expirada'));
    }),
  );
};

/** La pantalla de login solo tiene sentido sin sesión. */
export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.sesionVigente() ? inject(Router).createUrlTree([RUTA_INICIO]) : true;
};
