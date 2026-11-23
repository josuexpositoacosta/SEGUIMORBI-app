import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { DatosPersonalesComponent } from './datos-personales/datos-personales.component';

@Component({
  selector: 'app-perfil',
  imports: [IonicModule, DatosPersonalesComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Mi perfil</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="page-container">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Mis datos personales</ion-card-title>
            <ion-card-subtitle>Información de tu cuenta</ion-card-subtitle>
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
