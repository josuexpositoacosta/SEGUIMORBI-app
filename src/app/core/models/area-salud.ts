export interface AreaSalud {
  id: number;
  codigo: string;
  nombre: string;
  provincia: string;
  municipio: string;
  direccion?: string | null;
  telefono?: string | null;
  activo: boolean;
  fechaRegistro?: string;
}
