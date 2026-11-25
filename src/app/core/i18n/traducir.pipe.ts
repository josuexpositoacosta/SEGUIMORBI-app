import { Pipe, PipeTransform } from '@angular/core';
import { t } from './idioma';

/**
 * Traduce en las plantillas un texto escrito en español: {{ 'Casos' | t }}.
 * Con huecos: {{ '{n} de {total} casos' | t: { n: 3, total: 10 } }}.
 * Es pura porque el idioma no cambia sin recargar la app (ver idioma.ts).
 */
@Pipe({ name: 't' })
export class TraducirPipe implements PipeTransform {
  transform(texto: string | null | undefined, valores?: Record<string, unknown>): string {
    return texto ? t(texto, valores) : '';
  }
}
