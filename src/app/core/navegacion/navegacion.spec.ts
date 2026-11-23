import { PANTALLAS, menuDe, pantallasDe, puedeVer } from './navegacion';

const rutas = (rol: Parameters<typeof pantallasDe>[0]) => pantallasDe(rol).map(p => p.ruta);

describe('navegación por rol', () => {
  it('sin rol solo se ven las pantallas generales', () => {
    expect(rutas(undefined)).toEqual(['inicio', 'perfil']);
  });

  it('el ADMIN ve la administración y no los datos clínicos', () => {
    expect(rutas('ADMIN')).toEqual(['inicio', 'perfil', 'admin/usuarios', 'admin/areas-salud', 'admin/desenlaces']);
  });

  it('el MEDICO ve pacientes, casos y agenda', () => {
    expect(rutas('MEDICO')).toEqual(['inicio', 'perfil', 'pacientes', 'casos', 'agenda']);
  });

  it('el EPIDEMIOLOGO ve casos, validaciones y vigilancia, pero no pacientes', () => {
    expect(rutas('EPIDEMIOLOGO')).toEqual(['inicio', 'perfil', 'casos', 'validaciones', 'vigilancia']);
  });

  it('puedeVer respeta las pantallas abiertas a cualquier usuario', () => {
    const inicio = PANTALLAS.find(p => p.ruta === 'inicio')!;
    expect(puedeVer(inicio, undefined)).toBeTrue();
    expect(puedeVer(inicio, 'ADMIN')).toBeTrue();
  });

  it('las rutas de la tabla no se repiten', () => {
    const todas = PANTALLAS.map(p => p.ruta);
    expect(new Set(todas).size).toBe(todas.length);
  });

  it('menuDe agrupa por sección en orden', () => {
    const menu = menuDe('MEDICO');
    expect(menu.map(g => g.seccion)).toEqual(['general', 'clinica']);
    expect(menu[1].titulo).toBe('Atención clínica');
    expect(menu[1].pantallas.map(p => p.ruta)).toEqual(['pacientes', 'casos', 'agenda']);
  });
});
