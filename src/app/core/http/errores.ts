import { HttpErrorResponse } from '@angular/common/http';

/**
 * Convierte un error HTTP en un mensaje para el usuario.
 * El backend responde los errores como texto en español; si viene, se muestra tal cual.
 */
export function mensajeDeError(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return error instanceof Error ? error.message : 'Ha ocurrido un error inesperado.';
  }

  if (error.status === 0) {
    return 'No se puede conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.';
  }

  const cuerpo = error.error;
  if (typeof cuerpo === 'string' && cuerpo.trim() && !cuerpo.trim().startsWith('<')) {
    return cuerpo.trim();
  }

  switch (error.status) {
    case 400: return 'Los datos enviados no son válidos.';
    case 401: return 'Tu sesión ha caducado. Vuelve a iniciar sesión.';
    case 403: return 'No tienes permiso para realizar esta acción.';
    case 404: return 'No se ha encontrado lo que buscas.';
    case 409: return 'Ya existe un registro con esos datos.';
    default: return 'Ha ocurrido un error inesperado. Inténtalo de nuevo.';
  }
}
