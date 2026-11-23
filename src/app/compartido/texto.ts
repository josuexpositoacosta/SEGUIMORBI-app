/** Para búsquedas: sin tildes, en minúsculas y sin espacios sobrantes. */
export function normalizar(texto: string | null | undefined): string {
  return (texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
