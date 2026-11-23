import { Clasificacion } from './caso';

export type CriterioFecha = 'INICIO_SINTOMAS' | 'NOTIFICACION';

export interface FiltroVigilancia {
  desde?: string;
  hasta?: string;
  areaSaludId?: number | null;
  criterio?: CriterioFecha;
}

export interface ResumenVigilancia {
  desde: string;
  hasta: string;
  areaSaludId?: number | null;
  criterio: CriterioFecha;
  totalCasos: number;
  porClasificacion: Partial<Record<Clasificacion, number>>;
  porcentajeConfirmados: number;
  abiertos: number;
  cerrados: number;
  clasificacionValidada: number;
  pendientesDeValidar: number;
  conLaboratorio: number;
  gestantes: number;
  neuroinvasivos: number;
  recaidas: number;
  hospitalizados: number;
  porDesenlace: Record<string, number>;
}

/** Fila de la curva epidémica: una semana epidemiológica (domingo a sábado). */
export interface SemanaVigilancia {
  anio: number;
  semana: number;
  etiqueta: string;
  inicio: string;
  fin: string;
  total: number;
  porClasificacion: Partial<Record<Clasificacion, number>>;
}

export interface AreaVigilancia {
  areaSaludId: number;
  codigo: string;
  nombre: string;
  total: number;
  abiertos: number;
  porClasificacion: Partial<Record<Clasificacion, number>>;
}
