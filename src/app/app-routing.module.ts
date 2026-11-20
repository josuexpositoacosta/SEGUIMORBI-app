import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { autenticadoGuard, invitadoGuard, rolGuard } from './core/auth/auth.guards';
import { PANTALLAS } from './core/navegacion/navegacion';

const enPreparacion = () => import('./paginas/en-preparacion/en-preparacion.page').then(m => m.EnPreparacionPage);
const error = () => import('./paginas/error/error.page').then(m => m.ErrorPage);

/** Pantallas aún sin construir: muestran "En preparación". Las fases 4-6 las sustituyen. */
const rutasEnPreparacion: Routes = PANTALLAS
  .filter(p => p.proximamente)
  .map(p => ({ path: p.ruta, loadComponent: enPreparacion, data: { ruta: p.ruta } }));

const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./paginas/login/login.page').then(m => m.LoginPage),
  },
  {
    // Zona con sesión: carga el perfil (autenticadoGuard) y comprueba el rol de cada pantalla.
    path: '',
    canActivate: [autenticadoGuard],
    canActivateChild: [rolGuard],
    children: [
      {
        path: 'inicio',
        data: { ruta: 'inicio' },
        loadComponent: () => import('./paginas/inicio/inicio.page').then(m => m.InicioPage),
      },
      {
        path: 'perfil',
        data: { ruta: 'perfil' },
        loadComponent: () => import('./paginas/perfil/perfil.page').then(m => m.PerfilPage),
      },
      ...rutasEnPreparacion,
      { path: 'sin-permiso', loadComponent: error, data: { tipo: 403 } },
    ],
  },
  { path: '**', loadComponent: error, data: { tipo: 404 } },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
