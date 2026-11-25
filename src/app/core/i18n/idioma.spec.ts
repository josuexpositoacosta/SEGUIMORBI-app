import { IDIOMA, IDIOMAS, t } from './idioma';
import { EN } from './traducciones.en';
import { TraducirPipe } from './traducir.pipe';

describe('idioma', () => {
  it('por defecto la app está en español', () => {
    // Las pruebas no guardan preferencia: sin ella, español (aunque el navegador esté en inglés).
    expect(IDIOMA).toBe('es');
  });

  it('ofrece español e inglés', () => {
    expect(IDIOMAS.map(i => i.valor)).toEqual(['es', 'en']);
  });

  it('en español devuelve el texto tal cual y rellena los huecos', () => {
    expect(t('Casos')).toBe('Casos');
    expect(t('Caso nº {p0}', { p0: 7 })).toBe('Caso nº 7');
  });

  it('los huecos nulos quedan vacíos', () => {
    expect(t('Área {p0}', { p0: null })).toBe('Área ');
  });

  it('el pipe traduce y admite valores', () => {
    const pipe = new TraducirPipe();
    expect(pipe.transform('Casos')).toBe('Casos');
    expect(pipe.transform('{p0} de {p1} pacientes', { p0: 2, p1: 5 })).toBe('2 de 5 pacientes');
    expect(pipe.transform(null)).toBe('');
  });

  it('cada traducción conserva los mismos huecos que el texto original', () => {
    const huecos = (s: string) => (s.match(/\{p\d+\}/g) ?? []).sort().join(',');
    const distintos = Object.entries(EN).filter(([es, en]) => huecos(es) !== huecos(en)).map(([es]) => es);
    expect(distintos).toEqual([]);
  });
});
