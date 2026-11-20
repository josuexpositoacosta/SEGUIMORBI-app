import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { FolderPageRoutingModule } from './folder-routing.module';
import { FolderPage } from './folder.page';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from '../auth/login/login.component';
import { PersonalDetailsComponent } from '../components/personal-details/personal-details.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    FolderPageRoutingModule,
  ],
  declarations: [
    FolderPage,
    LoginComponent,
    DashboardComponent,
    PersonalDetailsComponent,
  ],
})
export class FolderPageModule {}
