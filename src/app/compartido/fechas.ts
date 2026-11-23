/** Fecha de hoy en formato AAAA-MM-DD (hora local). */
export function hoyIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Edad en años cumplidos a partir de una fecha AAAA-MM-DD. */
export function edad(fechaNacimiento: string | null | undefined): number | null {
  if (!fechaNacimiento) {
    return null;
  }
  const [a, m, d] = fechaNacimiento.split('-').map(Number);
  const hoy = new Date();
  let anios = hoy.getFullYear() - a;
  if (hoy.getMonth() + 1 < m || (hoy.getMonth() + 1 === m && hoy.getDate() < d)) {
    anios--;
  }
  return anios;
}

/** «34 años», «1 año», o «menos de 1 año». */
export function textoEdad(fechaNacimiento: string | null | undefined): string {
  const e = edad(fechaNacimiento);
  if (e === null) {
    return '';
  }
  if (e < 1) {
    return 'menos de 1 año';
  }
  return e === 1 ? '1 año' : `${e} años`;
}

/** Suma días a una fecha AAAA-MM-DD (hora local). */
export function sumarDias(fechaIso: string, dias: number): string {
  const [a, m, d] = fechaIso.split('-').map(Number);
  const f = new Date(a, m - 1, d + dias);
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
}
