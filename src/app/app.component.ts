import { Component, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

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
  // El menú definitivo, según el rol del usuario, llega en la fase de navegación.
  readonly menu: MenuItem[] = [
    { title: 'Inicio', url: '/folder/dashboard', icon: 'home' },
    { title: 'Iniciar sesión', url: '/folder/iniciar-sesion', icon: 'log-in' },
  ];

  // En la pantalla de login no se muestra el menú lateral.
  readonly enLogin$ = inject(Router).events.pipe(
    filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    map(e => e.urlAfterRedirects.includes('iniciar-sesion')),
  );
}
