/** JWT de prueba (sin firma válida) que caduca dentro de `segundos` (negativo = ya caducado). */
export function jwtDePrueba(segundos: number): string {
  const base64url = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const exp = Math.floor(Date.now() / 1000) + segundos;
  return `${base64url({ alg: 'HS256' })}.${base64url({ sub: 'medico', exp })}.firma`;
}
