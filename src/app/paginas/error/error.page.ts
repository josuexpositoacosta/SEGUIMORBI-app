import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';

const CONTENIDO = {
  404: {
    icono: 'compass-outline',
    titulo: 'Página no encontrada',
    texto: 'La dirección que has abierto no existe o ha cambiado.',
  },
  403: {
    icono: 'lock-closed-outline',
    titulo: 'No tienes acceso a esta sección',
    texto: 'Tu rol no permite entrar aquí. Si crees que es un error, habla con el administrador.',
  },
} as const;

/** Página de error de navegación: 404 (no existe) o 403 (sin permiso por rol). */
@Component({
  selector: 'app-error',
  imports: [IonicModule, RouterLink],
  template: `
    <ion-content>
      <div class="error">
        <div class="codigo">{{ tipo }}</div>
        <div class="icono" aria-hidden="true"><ion-icon [name]="contenido.icono"></ion-icon></div>
        <h1>{{ contenido.titulo }}</h1>
        <p class="text-muted">{{ contenido.texto }}</p>
        <ion-button routerLink="/inicio" [replaceUrl]="true">
          <ion-icon slot="start" name="home-outline"></ion-icon>
          Ir al inicio
        </ion-button>
      </div>
    </ion-content>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100%;
      padding: 32px 20px;
      text-align: center;
    }
    .codigo {
      font-size: 4.5rem;
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.04em;
      background: var(--app-gradient);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .icono {
      margin: 12px 0 4px;
      font-size: 36px;
      color: var(--app-text-muted);
    }
    h1 { margin: 8px 0; font-size: 1.4rem; }
    p { max-width: 420px; margin: 0 0 24px; line-height: 1.5; }
  `],
})
export class ErrorPage {
  readonly tipo: 404 | 403 = inject(ActivatedRoute).snapshot.data['tipo'] === 403 ? 403 : 404;
  readonly contenido = CONTENIDO[this.tipo];
}
