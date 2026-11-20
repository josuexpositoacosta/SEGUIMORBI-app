import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Credenciales, Usuario } from '../models/usuario';

const CLAVE_TOKEN = 'oropouche.token';

/** Motivo por el que se cierra la sesión; el login lo muestra al usuario. */
export type MotivoCierre = 'manual' | 'expirada' | 'sin-conexion';

/**
 * Sesión del usuario: token JWT y perfil (/user/me).
 * El token se guarda en sessionStorage: se borra al cerrar el navegador, lo que conviene en
 * equipos compartidos de un centro de salud.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _token = signal<string | null>(leerTokenVigente());
  private readonly _usuario = signal<Usuario | null>(null);

  readonly token = this._token.asReadonly();
  readonly usuario = this._usuario.asReadonly();
  readonly autenticado = computed(() => this._token() !== null);

  login(credenciales: Credenciales): Observable<Usuario> {
    return this.http
      .post<{ token: string }>(`${environment.urlHost}auth/login`, credenciales)
      .pipe(
        tap(({ token }) => this.guardarToken(token)),
        switchMap(() => this.cargarPerfil()),
      );
  }

  /** Pide el perfil al backend y lo deja disponible en {@link usuario}. */
  cargarPerfil(): Observable<Usuario> {
    return this.http
      .get<Usuario>(`${environment.urlApi}user/me`)
      .pipe(tap(usuario => this._usuario.set(usuario)));
  }

  /** Actualiza el perfil en memoria tras cambiar los datos personales. */
  actualizarPerfilLocal(cambios: Partial<Usuario>): void {
    const actual = this._usuario();
    if (actual) {
      this._usuario.set({ ...actual, ...cambios });
    }
  }

  /** Indica si el token guardado sigue vigente; si caducó, cierra la sesión. */
  sesionVigente(): boolean {
    const token = this._token();
    if (token && !tokenCaducado(token)) {
      return true;
    }
    if (token) {
      this.cerrarSesionLocal();
    }
    return false;
  }

  logout(motivo: MotivoCierre = 'manual'): void {
    this.cerrarSesionLocal();
    const queryParams = motivo === 'manual' ? {} : { motivo };
    this.router.navigate(['/folder/iniciar-sesion'], { queryParams });
  }

  /** Borra token y perfil sin navegar (para guards que devuelven su propia redirección). */
  cerrarSesionLocal(): void {
    sessionStorage.removeItem(CLAVE_TOKEN);
    this._token.set(null);
    this._usuario.set(null);
  }

  private guardarToken(token: string): void {
    sessionStorage.setItem(CLAVE_TOKEN, token);
    this._token.set(token);
  }
}

function leerTokenVigente(): string | null {
  const token = sessionStorage.getItem(CLAVE_TOKEN);
  if (token && !tokenCaducado(token)) {
    return token;
  }
  sessionStorage.removeItem(CLAVE_TOKEN);
  return null;
}

/** Lee la fecha de caducidad (exp) del JWT. Si no se puede leer, lo da por caducado. */
function tokenCaducado(token: string): boolean {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(payload)) as { exp?: number };
    return typeof exp === 'number' && exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}
