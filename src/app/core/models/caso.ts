export type Clasificacion = 'SOSPECHOSO' | 'PROBABLE' | 'CONFIRMADO' | 'DESCARTADO';
export type EstadoCaso = 'ABIERTO' | 'CERRADO';
export type Manifestacion =
  | 'MIALGIA_ARTRALGIA' | 'ESCALOFRIOS' | 'FOTOFOBIA' | 'MAREOS' | 'DOLOR_RETROOCULAR' | 'GASTROINTESTINAL' | 'NEUROLOGICA';
export type AgenteEtiologico = 'OROPOUCHE' | 'DENGUE';
export type TipoPrueba = 'RT_PCR' | 'ANTIGENO' | 'SEROCONVERSION_PAREADA' | 'POST_MORTEM' | 'IGM_LCR' | 'ELISA_IGM';
export type TipoMuestra = 'SUERO' | 'SANGRE' | 'LCR' | 'TEJIDO' | 'OTRA';
export type ResultadoPrueba = 'POSITIVO' | 'NEGATIVO' | 'INDETERMINADO';

export const CLASIFICACIONES: { valor: Clasificacion; nombre: string; clase: string }[] = [
  { valor: 'SOSPECHOSO', nombre: 'Sospechoso', clase: 'secundaria' },
  { valor: 'PROBABLE', nombre: 'Probable', clase: 'terciaria' },
  { valor: 'CONFIRMADO', nombre: 'Confirmado', clase: 'peligro' },
  { valor: 'DESCARTADO', nombre: 'Descartado', clase: '' },
];

/** Manifestaciones de la definición de caso sospechoso de la OPS. */
export const MANIFESTACIONES: { valor: Manifestacion; nombre: string }[] = [
  { valor: 'MIALGIA_ARTRALGIA', nombre: 'Mialgia o artralgia' },
  { valor: 'ESCALOFRIOS', nombre: 'Escalofríos' },
  { valor: 'FOTOFOBIA', nombre: 'Fotofobia' },
  { valor: 'MAREOS', nombre: 'Mareos' },
  { valor: 'DOLOR_RETROOCULAR', nombre: 'Dolor retroocular' },
  { valor: 'GASTROINTESTINAL', nombre: 'Náusea, vómitos o diarrea' },
  { valor: 'NEUROLOGICA', nombre: 'Manifestación neurológica' },
];

export const AGENTES: { valor: AgenteEtiologico; nombre: string }[] = [
  { valor: 'OROPOUCHE', nombre: 'Oropouche' },
  { valor: 'DENGUE', nombre: 'Dengue' },
];

export const TIPOS_PRUEBA: { valor: TipoPrueba; nombre: string }[] = [
  { valor: 'RT_PCR', nombre: 'RT-PCR' },
  { valor: 'ANTIGENO', nombre: 'Antígeno' },
  { valor: 'ELISA_IGM', nombre: 'ELISA IgM' },
  { valor: 'IGM_LCR', nombre: 'IgM en LCR' },
  { valor: 'SEROCONVERSION_PAREADA', nombre: 'Seroconversión (muestras pareadas)' },
  { valor: 'POST_MORTEM', nombre: 'Post mortem' },
];

export const TIPOS_MUESTRA: { valor: TipoMuestra; nombre: string }[] = [
  { valor: 'SUERO', nombre: 'Suero' },
  { valor: 'SANGRE', nombre: 'Sangre' },
  { valor: 'LCR', nombre: 'Líquido cefalorraquídeo' },
  { valor: 'TEJIDO', nombre: 'Tejido' },
  { valor: 'OTRA', nombre: 'Otra' },
];

export const RESULTADOS: { valor: ResultadoPrueba; nombre: string; clase: string }[] = [
  { valor: 'POSITIVO', nombre: 'Positivo', clase: 'peligro' },
  { valor: 'NEGATIVO', nombre: 'Negativo', clase: 'exito' },
  { valor: 'INDETERMINADO', nombre: 'Indeterminado', clase: 'secundaria' },
];

/** Busca el nombre visible de un valor en una de las listas anteriores. */
export function nombreDe<T extends string>(lista: { valor: T; nombre: string }[], valor: T | null | undefined): string {
  return lista.find(x => x.valor === valor)?.nombre ?? (valor ?? '');
}

export function claseClasificacion(c: Clasificacion | null | undefined): string {
  return CLASIFICACIONES.find(x => x.valor === c)?.clase ?? '';
}

export interface Sugerencia {
  clasificacion: Clasificacion | null;
  coincideConActual?: boolean;
  criterios: string[];
}

export interface ResultadoLaboratorio {
  id: number;
  agente: AgenteEtiologico;
  tipoPrueba: TipoPrueba;
  tipoMuestra: TipoMuestra;
  resultado: ResultadoPrueba;
  fechaToma: string;
  fechaResultado?: string | null;
}

export interface CambioClasificacion {
  fecha: string;
  anterior: Clasificacion | null;
  nueva: Clasificacion;
  motivo: string;
  usuario: string;
}

export interface Alerta {
  tipo: string;
  mensaje: string;
}

export interface EventoCaso {
  fecha: string;
  tipo: string;
  detalle?: string | null;
  usuario: string;
}

/** Datos clínicos y epidemiológicos que el médico registra o edita. */
export interface DatosCaso {
  pacienteId: number;
  fechaInicioSintomas: string;
  fechaNotificacion: string;
  fiebre: boolean;
  cefaleaIntensa: boolean;
  manifestaciones: Manifestacion[];
  recaida: boolean;
  embarazada: boolean;
  semanasGestacion?: number | null;
  areaTransmisionOViaje: boolean;
  detalleAreaTransmision?: string | null;
  nexoCasoConfirmado: boolean;
  /** Solo al registrar, si no cumple la definición de sospechoso. */
  motivo?: string | null;
}

export interface Caso extends DatosCaso {
  id: number;
  areaSaludId: number;
  clasificacion: Clasificacion;
  clasificacionValidada: boolean;
  estado: EstadoCaso;
  sugerencia: Sugerencia;
  alertas: Alerta[];
  proximoControl?: string | null;
  resultados: ResultadoLaboratorio[];
  historial: CambioClasificacion[];
  eventos?: EventoCaso[];
  fechaCierre?: string | null;
  // La atención clínica (evaluaciones, dictámenes, planes, seguimientos, desenlace) llega en la parte 3.
  [extra: string]: unknown;
}

export type NuevoResultado = Omit<ResultadoLaboratorio, 'id'>;
