import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { autenticadoGuard, invitadoGuard } from './core/auth/auth.guards';

const cargarFolder = () => import('./folder/folder.module').then(m => m.FolderPageModule);

const routes: Routes = [
  { path: '', redirectTo: 'folder/dashboard', pathMatch: 'full' },
  {
    path: 'folder/iniciar-sesion',
    canActivate: [invitadoGuard],
    data: { vista: 'iniciar-sesion' },
    loadChildren: cargarFolder,
  },
  {
    path: 'folder/:id',
    canActivate: [autenticadoGuard],
    loadChildren: cargarFolder,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
