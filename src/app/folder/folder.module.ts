import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';

import { FolderPageRoutingModule } from './folder-routing.module';
import { FolderPage } from './folder.page';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from '../auth/login/login.component';
import { PersonalDetailsComponent } from '../components/personal-details/personal-details.component';
import { ErrorInterceptorService, JwtInterceptorService } from '../services/service.index';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    HttpClientModule,
    FolderPageRoutingModule,
  ],
  declarations: [
    FolderPage,
    LoginComponent,
    DashboardComponent,
    PersonalDetailsComponent,
  ],
  // Provisional: los interceptores pasan a ser globales en la fase de autenticación.
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptorService, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptorService, multi: true },
  ],
})
export class FolderPageModule {}
