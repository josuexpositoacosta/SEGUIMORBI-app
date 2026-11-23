import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot, GuardResult, MaybeAsync, Router, RouterStateSnapshot, UrlTree, provideRouter,
} from '@angular/router';
import { Observable, firstValueFrom, isObservable, of, throwError } from 'rxjs';
import { Usuario } from '../models/usuario';
import { autenticadoGuard, invitadoGuard, rolGuard } from './auth.guards';
import { AuthService } from './auth.service';

const MEDICO: Usuario = { id: 1, username: 'medico', firstname: 'Ana', lastname: 'Pérez', role: 'MEDICO' };

describe('guards de autenticación', () => {
  let auth: jasmine.SpyObj<AuthService>;
  let router: Router;
  const estado = { url: '/casos' } as RouterStateSnapshot;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['sesionVigente', 'usuario', 'cargarPerfil', 'cerrarSesionLocal']);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
    router = TestBed.inject(Router);
  });

  function ejecutar(guard: typeof autenticadoGuard, route = {} as ActivatedRouteSnapshot): Promise<GuardResult> {
    const resultado = TestBed.runInInjectionContext(() => guard(route, estado)) as MaybeAsync<GuardResult>;
    return isObservable(resultado) ? firstValueFrom(resultado as Observable<GuardResult>) : Promise.resolve(resultado as GuardResult);
  }

  const url = (r: GuardResult) => router.serializeUrl(r as UrlTree);

  describe('autenticadoGuard', () => {
    it('sin sesión lleva al login recordando la pantalla', async () => {
      auth.sesionVigente.and.returnValue(false);
      expect(url(await ejecutar(autenticadoGuard))).toBe('/login?volver=%2Fcasos');
    });

    it('con sesión y perfil cargado deja pasar', async () => {
      auth.sesionVigente.and.returnValue(true);
      auth.usuario.and.returnValue(MEDICO);
      expect(await ejecutar(autenticadoGuard)).toBeTrue();
      expect(auth.cargarPerfil).not.toHaveBeenCalled();
    });

    it('con sesión sin perfil lo carga y deja pasar', async () => {
      auth.sesionVigente.and.returnValue(true);
      auth.usuario.and.returnValue(null);
      auth.cargarPerfil.and.returnValue(of(MEDICO));
      expect(await ejecutar(autenticadoGuard)).toBeTrue();
    });

    it('si el perfil falla cierra la sesión y avisa de que caducó', async () => {
      auth.sesionVigente.and.returnValue(true);
      auth.usuario.and.returnValue(null);
      auth.cargarPerfil.and.returnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
      expect(url(await ejecutar(autenticadoGuard))).toBe('/login?volver=%2Fcasos&motivo=expirada');
      expect(auth.cerrarSesionLocal).toHaveBeenCalled();
    });

    it('si no hay conexión lo indica en el login', async () => {
      auth.sesionVigente.and.returnValue(true);
      auth.usuario.and.returnValue(null);
      auth.cargarPerfil.and.returnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
      expect(url(await ejecutar(autenticadoGuard))).toBe('/login?volver=%2Fcasos&motivo=sin-conexion');
    });
  });

  describe('invitadoGuard', () => {
    it('sin sesión deja ver el login', async () => {
      auth.sesionVigente.and.returnValue(false);
      expect(await ejecutar(invitadoGuard)).toBeTrue();
    });

    it('con sesión manda a inicio', async () => {
      auth.sesionVigente.and.returnValue(true);
      expect(url(await ejecutar(invitadoGuard))).toBe('/inicio');
    });
  });

  describe('rolGuard', () => {
    const ruta = (r?: string) => ({ data: r ? { ruta: r } : {} }) as unknown as ActivatedRouteSnapshot;

    it('deja pasar a una pantalla permitida para el rol', async () => {
      auth.usuario.and.returnValue(MEDICO);
      expect(await ejecutar(rolGuard, ruta('pacientes'))).toBeTrue();
    });

    it('manda a sin-permiso si el rol no puede entrar', async () => {
      auth.usuario.and.returnValue(MEDICO);
      expect(url(await ejecutar(rolGuard, ruta('admin/usuarios')))).toBe('/sin-permiso');
    });

    it('deja pasar rutas que no están en la tabla de pantallas', async () => {
      auth.usuario.and.returnValue(MEDICO);
      expect(await ejecutar(rolGuard, ruta())).toBeTrue();
    });
  });
});
