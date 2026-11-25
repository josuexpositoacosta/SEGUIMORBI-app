import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IDIOMA, IDIOMAS, Idioma, cambiarIdioma, t } from 'src/app/core/i18n/idioma';

/** Botones ES / EN para cambiar el idioma de la interfaz (recarga la app al cambiar). */
@Component({
  selector: 'app-selector-idioma',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="idiomas" [class.oscuro]="oscuro()" role="group" [attr.aria-label]="etiqueta">
      @for (i of idiomas; track i.valor) {
        <button type="button" [class.activo]="i.valor === actual" [attr.aria-pressed]="i.valor === actual"
          [attr.lang]="i.valor" [title]="i.nombre" (click)="cambiar(i.valor)">{{ i.corto }}</button>
      }
    </div>
  `,
  styles: `
    .idiomas {
      display: inline-flex;
      gap: 2px;
      padding: 3px;
      border-radius: 999px;
      background: var(--app-surface-muted);
    }

    button {
      min-width: 38px;
      padding: 5px 10px;
      border: 0;
      border-radius: 999px;
      background: transparent;
      color: var(--app-text-muted);
      font: inherit;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      cursor: pointer;
    }

    button.activo {
      background: var(--app-surface);
      color: var(--ion-text-color);
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.12);
    }

    .oscuro {
      background: rgba(255, 255, 255, 0.08);
    }

    .oscuro button {
      color: var(--app-ink-text);
    }

    .oscuro button.activo {
      background: rgba(255, 255, 255, 0.16);
      color: #fff;
      box-shadow: none;
    }
  `,
})
export class SelectorIdiomaComponent {
  /** Versión para fondos oscuros (menú lateral). */
  readonly oscuro = input(false);

  readonly idiomas = IDIOMAS;
  readonly actual: Idioma = IDIOMA;
  readonly etiqueta = t('Idioma');

  cambiar(idioma: Idioma): void {
    cambiarIdioma(idioma);
  }
}
