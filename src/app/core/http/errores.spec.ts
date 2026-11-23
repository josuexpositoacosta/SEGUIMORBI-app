import { HttpErrorResponse } from '@angular/common/http';
import { mensajeDeError } from './errores';

const http = (status: number, error: unknown = null) => new HttpErrorResponse({ status, error });

describe('mensajeDeError', () => {
  it('sin conexión (status 0) pide comprobar la conexión', () => {
    expect(mensajeDeError(http(0))).toContain('No se puede conectar');
  });

  it('muestra el texto que envía el backend', () => {
    expect(mensajeDeError(http(400, '  El paciente ya tiene un caso abierto  '))).toBe('El paciente ya tiene un caso abierto');
  });

  it('ignora cuerpos HTML y usa el mensaje del código', () => {
    expect(mensajeDeError(http(404, '<html>Not found</html>'))).toBe('No se ha encontrado lo que buscas.');
  });

  it('traduce los códigos habituales', () => {
    expect(mensajeDeError(http(401))).toContain('sesión ha caducado');
    expect(mensajeDeError(http(403))).toContain('No tienes permiso');
    expect(mensajeDeError(http(409))).toContain('Ya existe');
    expect(mensajeDeError(http(500))).toContain('error inesperado');
  });

  it('usa el mensaje de un Error normal', () => {
    expect(mensajeDeError(new Error('Fallo local'))).toBe('Fallo local');
  });

  it('da un mensaje genérico para cualquier otra cosa', () => {
    expect(mensajeDeError('raro')).toBe('Ha ocurrido un error inesperado.');
  });
});
