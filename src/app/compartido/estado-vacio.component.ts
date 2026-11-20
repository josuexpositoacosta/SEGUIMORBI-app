import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/** Mensaje para listas vacías o búsquedas sin resultados. */
@Component({
  selector: 'app-estado-vacio',
  standalone: true,
  imports: [IonicModule],
  template: `
    <div class="vacio">
      <div class="vacio-icono" aria-hidden="true"><ion-icon [name]="icono"></ion-icon></div>
      <h3>{{ titulo }}</h3>
      <p class="text-muted">{{ texto }}</p>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .vacio { display: flex; flex-direction: column; align-items: center; padding: 48px 16px; text-align: center; }
    .vacio-icono {
      display: grid; place-items: center; width: 64px; height: 64px; margin-bottom: 12px;
      border-radius: 50%; background: var(--app-surface-muted); color: var(--app-text-muted); font-size: 30px;
    }
    h3 { margin: 0 0 6px; font-size: 1.05rem; }
    p { margin: 0 0 16px; max-width: 360px; line-height: 1.5; }
  `],
})
export class EstadoVacioComponent {
  @Input() icono = 'file-tray-outline';
  @Input({ required: true }) titulo = '';
  @Input() texto = '';
}
