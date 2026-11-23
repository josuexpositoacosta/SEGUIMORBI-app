import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { jwtDePrueba } from 'src/testing/jwt';
import { Usuario } from '../models/usuario';
import { AuthService } from './auth.service';

const CLAVE_TOKEN = 'seguimorbi.token';
const MEDICO: Usuario = { id: 1, username: 'medico', firstname: 'Ana', lastname: 'Pérez', role: 'MEDICO' };

describe('AuthService', () => {
  let http: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  function crear(): AuthService {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    return TestBed.inject(AuthService);
  }

  beforeEach(() => {
    sessionStorage.clear();
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  it('empieza sin sesión si no hay token guardado', () => {
    const auth = crear();
    expect(auth.autenticado()).toBeFalse();
    expect(auth.sesionVigente()).toBeFalse();
  });

  it('recupera un token vigente de sessionStorage', () => {
    const token = jwtDePrueba(3600);
    sessionStorage.setItem(CLAVE_TOKEN, token);
    const auth = crear();
    expect(auth.token()).toBe(token);
    expect(auth.sesionVigente()).toBeTrue();
  });

  it('descarta un token caducado al arrancar', () => {
    sessionStorage.setItem(CLAVE_TOKEN, jwtDePrueba(-60));
    const auth = crear();
    expect(auth.autenticado()).toBeFalse();
    expect(sessionStorage.getItem(CLAVE_TOKEN)).toBeNull();
  });

  it('descarta un token ilegible', () => {
    sessionStorage.setItem(CLAVE_TOKEN, 'no-es-un-jwt');
    expect(crear().autenticado()).toBeFalse();
  });

  it('login guarda el token y carga el perfil', () => {
    const auth = crear();
    const token = jwtDePrueba(3600);
    let usuario: Usuario | undefined;

    auth.login({ username: 'medico', password: 'secreta123' }).subscribe(u => (usuario = u));

    const login = http.expectOne(`${environment.urlHost}auth/login`);
    expect(login.request.method).toBe('POST');
    expect(login.request.body).toEqual({ username: 'medico', password: 'secreta123' });
    login.flush({ token });

    http.expectOne(`${environment.urlApi}user/me`).flush(MEDICO);

    expect(usuario).toEqual(MEDICO);
    expect(auth.usuario()).toEqual(MEDICO);
    expect(auth.token()).toBe(token);
    expect(sessionStorage.getItem(CLAVE_TOKEN)).toBe(token);
  });

  it('actualizarPerfilLocal mezcla los cambios con el perfil actual', () => {
    const auth = crear();
    auth.cargarPerfil().subscribe();
    http.expectOne(`${environment.urlApi}user/me`).flush(MEDICO);

    auth.actualizarPerfilLocal({ firstname: 'Ana María' });

    expect(auth.usuario()).toEqual({ ...MEDICO, firstname: 'Ana María' });
  });

  it('logout manual borra la sesión y va al login sin motivo', () => {
    sessionStorage.setItem(CLAVE_TOKEN, jwtDePrueba(3600));
    const auth = crear();

    auth.logout();

    expect(auth.autenticado()).toBeFalse();
    expect(auth.usuario()).toBeNull();
    expect(sessionStorage.getItem(CLAVE_TOKEN)).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: {} });
  });

  it('logout por caducidad pasa el motivo al login', () => {
    const auth = crear();
    auth.logout('expirada');
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { motivo: 'expirada' } });
  });
});
