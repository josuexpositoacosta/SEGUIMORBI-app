export interface Paciente {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  /** AAAA-MM-DD */
  fechaNacimiento: string;
  sexo: string;
  direccion?: string | null;
  telefono?: string | null;
  areaSaludId: number;
  fechaRegistro?: string;
  activo: boolean;
}

export type DatosPaciente = Omit<Paciente, 'id' | 'fechaRegistro' | 'activo'>;

export const TIPOS_DOCUMENTO = [
  { valor: 'CI', nombre: 'Carné de identidad' },
  { valor: 'PASAPORTE', nombre: 'Pasaporte' },
  { valor: 'OTRO', nombre: 'Otro documento' },
];

export const SEXOS = [
  { valor: 'F', nombre: 'Femenino' },
  { valor: 'M', nombre: 'Masculino' },
];

export function nombreSexo(valor: string): string {
  return SEXOS.find(s => s.valor === valor)?.nombre ?? valor;
}

export function nombreDocumento(valor: string): string {
  return TIPOS_DOCUMENTO.find(t => t.valor === valor)?.nombre ?? valor;
}
