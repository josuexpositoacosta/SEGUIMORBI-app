//folder-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FolderPage } from './folder.page';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from '../auth/login/login.component';
import { LoginGuardService } from '../services/guards/login-guard.guard';

const routes: Routes = [
  {
    path: '',
    component: FolderPage,
    // canActivate: [LoginGuardService],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
       canActivate: [LoginGuardService]
      },
      {path:'iniciar-sesion',component:LoginComponent},

  

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FolderPageRoutingModule {}
