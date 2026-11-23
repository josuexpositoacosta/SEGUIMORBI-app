import { edad, hoyIso, sumarDias, textoEdad } from './fechas';

describe('fechas', () => {
  beforeEach(() => jasmine.clock().install().mockDate(new Date(2026, 10, 23, 12, 0)));
  afterEach(() => jasmine.clock().uninstall());

  it('hoyIso da la fecha local en AAAA-MM-DD', () => {
    expect(hoyIso()).toBe('2026-11-23');
  });

  it('edad cuenta solo los años cumplidos', () => {
    expect(edad('1990-11-23')).toBe(36);
    expect(edad('1990-11-24')).toBe(35);
    expect(edad('1990-12-01')).toBe(35);
    expect(edad(null)).toBeNull();
  });

  it('textoEdad usa singular, plural y «menos de 1 año»', () => {
    expect(textoEdad('1990-01-01')).toBe('36 años');
    expect(textoEdad('2025-11-23')).toBe('1 año');
    expect(textoEdad('2026-06-01')).toBe('menos de 1 año');
    expect(textoEdad(undefined)).toBe('');
  });

  it('sumarDias cruza meses y años', () => {
    expect(sumarDias('2026-11-23', 7)).toBe('2026-11-30');
    expect(sumarDias('2026-12-30', 3)).toBe('2027-01-02');
    expect(sumarDias('2026-03-01', -1)).toBe('2026-02-28');
  });
});
