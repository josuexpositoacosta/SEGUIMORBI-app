import { EN } from './traducciones.en';

/**
 * Idioma de la interfaz (español o inglés).
 *
 * Los textos se escriben en español en las plantillas y el código; el diccionario `EN` da su traducción. Un texto
 * sin traducción se muestra en español, así que nunca aparece una clave vacía.
 *
 * El idioma se elige al arrancar (preferencia guardada o, si no hay, español) y no cambia en caliente:
 * al cambiarlo se recarga la app. Así el LOCALE_ID de Angular (fechas, números) siempre coincide con los textos.
 */
export type Idioma = 'es' | 'en';

export const IDIOMAS: { valor: Idioma; nombre: string; corto: string }[] = [
  { valor: 'es', nombre: 'Español', corto: 'ES' },
  { valor: 'en', nombre: 'English', corto: 'EN' },
];

const CLAVE = 'seguimorbi.idioma';

function leerIdioma(): Idioma {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado === 'es' || guardado === 'en') {
      return guardado;
    }
  } catch {
    // Sin almacenamiento (modo privado): español.
  }
  return 'es';
}

/** Idioma activo durante toda la sesión de la app. */
export const IDIOMA: Idioma = leerIdioma();

/** Guarda el idioma y recarga la app para aplicarlo en textos, fechas y números. */
export function cambiarIdioma(idioma: Idioma): void {
  if (idioma === IDIOMA) {
    return;
  }
  try {
    localStorage.setItem(CLAVE, idioma);
  } catch {
    // Sin almacenamiento la preferencia no se puede guardar; no se recarga para no perder el cambio.
    return;
  }
  location.reload();
}

/**
 * Traduce un texto escrito en español al idioma activo.
 * Admite huecos con nombre: t('{n} casos', { n: 3 }) → «3 casos» / «3 cases».
 */
export function t(texto: string, valores?: Record<string, unknown>): string {
  let resultado = IDIOMA === 'en' ? EN[texto] ?? texto : texto;
  if (valores) {
    for (const [clave, valor] of Object.entries(valores)) {
      resultado = resultado.split(`{${clave}}`).join(valor === null || valor === undefined ? '' : String(valor));
    }
  }
  return resultado;
}
