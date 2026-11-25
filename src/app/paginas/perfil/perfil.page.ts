import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { DatosPersonalesComponent } from './datos-personales/datos-personales.component';
import { TraducirPipe } from 'src/app/core/i18n/traducir.pipe';

@Component({
  selector: 'app-perfil',
  imports: [TraducirPipe, IonicModule, DatosPersonalesComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <ion-header class="ion-hide-lg-up">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ 'Mi perfil' | t }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="page-container">
        <header class="cabecera">
          <h1>{{ 'Mi perfil' | t }}</h1>
        </header>
        <ion-card>
          <ion-card-header>
            <ion-card-title>{{ 'Mis datos personales' | t }}</ion-card-title>
            <ion-card-subtitle>{{ 'Información de tu cuenta' | t }}</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <app-datos-personales></app-datos-personales>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
})
export class PerfilPage {}
