import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';
import { PANTALLAS, puedeVer } from '../navegacion/navegacion';

const RUTA_LOGIN = '/login';
const RUTA_INICIO = '/inicio';

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

/**
 * Comprueba que el rol del usuario puede entrar en la pantalla (route.data.ruta, ver PANTALLAS).
 * Se usa como canActivateChild de la zona autenticada, cuando el perfil ya está cargado.
 */
export const rolGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const ruta = route.data['ruta'] as string | undefined;
  const pantalla = ruta ? PANTALLAS.find(p => p.ruta === ruta) : undefined;
  if (!pantalla) {
    return true;
  }
  const rol = inject(AuthService).usuario()?.role;
  return puedeVer(pantalla, rol) ? true : inject(Router).createUrlTree(['/sin-permiso']);
};
