import { Component, computed, inject } from '@angular/core';
import { AuthService } from './core/auth/auth.service';
import { NOMBRE_ROL } from './core/models/usuario';
import { menuDe } from './core/navegacion/navegacion';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  private readonly auth = inject(AuthService);

  /** Sin sesión no hay menú lateral (pantalla de login). */
  readonly autenticado = this.auth.autenticado;
  readonly usuario = this.auth.usuario;
  /** Menú según el rol, agrupado por secciones (ver core/navegacion). */
  readonly menu = computed(() => menuDe(this.usuario()?.role));
  readonly rol = computed(() => {
    const u = this.usuario();
    return u ? NOMBRE_ROL[u.role] : '';
  });
  readonly iniciales = computed(() => {
    const u = this.usuario();
    return ((u?.firstname?.charAt(0) ?? '') + (u?.lastname?.charAt(0) ?? '')).toUpperCase() || '?';
  });

  cerrarSesion(): void {
    this.auth.logout();
  }
}
