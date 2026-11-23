import { normalizar } from './texto';

describe('normalizar', () => {
  it('quita tildes, pasa a minúsculas y recorta espacios', () => {
    expect(normalizar('  José Pérez ÑANDÚ ')).toBe('jose perez nandu');
  });

  it('acepta null y undefined', () => {
    expect(normalizar(null)).toBe('');
    expect(normalizar(undefined)).toBe('');
  });
});
