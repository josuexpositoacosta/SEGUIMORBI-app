import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('authInterceptor', () => {
  const token = signal<string | null>('token-de-prueba');
  let auth: { token: typeof token; logout: jasmine.Spy };
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    token.set('token-de-prueba');
    auth = { token, logout: jasmine.createSpy('logout') };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('añade el token a las peticiones al backend', () => {
    http.get(`${environment.urlApi}casos`).subscribe();
    const req = backend.expectOne(`${environment.urlApi}casos`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-de-prueba');
    req.flush([]);
  });

  it('no envía el token al login', () => {
    http.post(`${environment.urlHost}auth/login`, {}).subscribe();
    const req = backend.expectOne(`${environment.urlHost}auth/login`);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('no envía el token a otros servidores', () => {
    http.get('https://example.org/datos').subscribe();
    const req = backend.expectOne('https://example.org/datos');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('sin sesión no añade cabecera', () => {
    token.set(null);
    http.get(`${environment.urlApi}casos`).subscribe();
    const req = backend.expectOne(`${environment.urlApi}casos`);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush([]);
  });

  it('un 401 del backend cierra la sesión por caducidad y propaga el error', () => {
    let status = 0;
    http.get(`${environment.urlApi}casos`).subscribe({ error: e => (status = e.status) });
    backend.expectOne(`${environment.urlApi}casos`).flush('', { status: 401, statusText: 'Unauthorized' });
    expect(auth.logout).toHaveBeenCalledWith('expirada');
    expect(status).toBe(401);
  });

  it('un 401 del login no cierra la sesión (son credenciales incorrectas)', () => {
    http.post(`${environment.urlHost}auth/login`, {}).subscribe({ error: () => undefined });
    backend.expectOne(`${environment.urlHost}auth/login`).flush('', { status: 401, statusText: 'Unauthorized' });
    expect(auth.logout).not.toHaveBeenCalled();
  });

  it('otros errores no cierran la sesión', () => {
    http.get(`${environment.urlApi}casos`).subscribe({ error: () => undefined });
    backend.expectOne(`${environment.urlApi}casos`).flush('', { status: 500, statusText: 'Error' });
    expect(auth.logout).not.toHaveBeenCalled();
  });
});
