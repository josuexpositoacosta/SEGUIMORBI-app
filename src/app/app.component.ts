import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from './core/auth/auth.service';
import { NOMBRE_ROL } from './core/models/usuario';
import { menuDe } from './core/navegacion/navegacion';

/** Dónde se recuerda si el usuario dejó el menú plegado (solo es una preferencia de este navegador). */
const CLAVE_PLEGADO = 'seguimorbi.menu-plegado';

function leerPlegado(): boolean {
  try {
    return localStorage.getItem(CLAVE_PLEGADO) !== 'no';
  } catch {
    return true;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
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

  /** En escritorio el menú es una barra fija; plegada solo muestra iconos (por defecto). */
  readonly plegado = signal(leerPlegado());
  /** true cuando el split-pane muestra el menú fijo (pantallas anchas). */
  readonly escritorio = signal(false);
  /** Barra estrecha de iconos: textos ocultos y nombres en el tooltip. */
  readonly compacto = computed(() => this.escritorio() && this.plegado());

  alternarPlegado(): void {
    const valor = !this.plegado();
    this.plegado.set(valor);
    try {
      localStorage.setItem(CLAVE_PLEGADO, valor ? 'si' : 'no');
    } catch {
      // Sin almacenamiento (modo privado): la preferencia dura hasta recargar.
    }
  }

  cerrarSesion(): void {
    this.auth.logout();
  }
}
