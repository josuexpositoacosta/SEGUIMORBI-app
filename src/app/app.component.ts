import { Component, computed, inject } from '@angular/core';
import { AuthService } from './core/auth/auth.service';
import { NOMBRE_ROL } from './core/models/usuario';

interface MenuItem {
  title: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  private readonly auth = inject(AuthService);

  // El menú según el rol del usuario llega en la fase de navegación.
  readonly menu: MenuItem[] = [
    { title: 'Inicio', url: '/folder/dashboard', icon: 'home' },
  ];

  /** Sin sesión no hay menú lateral (pantalla de login). */
  readonly autenticado = this.auth.autenticado;
  readonly usuario = this.auth.usuario;
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
