export type Clasificacion = 'SOSPECHOSO' | 'PROBABLE' | 'CONFIRMADO' | 'DESCARTADO';
export type EstadoCaso = 'ABIERTO' | 'CERRADO';
export type Manifestacion =
  | 'MIALGIA_ARTRALGIA' | 'ESCALOFRIOS' | 'FOTOFOBIA' | 'MAREOS' | 'DOLOR_RETROOCULAR' | 'GASTROINTESTINAL' | 'NEUROLOGICA';
export type AgenteEtiologico = 'OROPOUCHE' | 'DENGUE';
export type TipoPrueba = 'RT_PCR' | 'ANTIGENO' | 'SEROCONVERSION_PAREADA' | 'POST_MORTEM' | 'IGM_LCR' | 'ELISA_IGM';
export type TipoMuestra = 'SUERO' | 'SANGRE' | 'LCR' | 'TEJIDO' | 'OTRA';
export type ResultadoPrueba = 'POSITIVO' | 'NEGATIVO' | 'INDETERMINADO';
export type SignoClinico =
  | 'POSTRACION' | 'LUMBALGIA' | 'VOMITOS_PERSISTENTES' | 'PETEQUIAS' | 'EPISTAXIS' | 'SANGRADO_GINGIVAL'
  | 'VERTIGO' | 'LETARGIA' | 'NISTAGMO' | 'RIGIDEZ_NUCA';
export type SignoAlarmaDengue =
  | 'DOLOR_ABDOMINAL_INTENSO' | 'VOMITOS_PERSISTENTES' | 'ACUMULACION_LIQUIDOS' | 'SANGRADO_MUCOSAS'
  | 'LETARGO_IRRITABILIDAD' | 'HIPOTENSION_POSTURAL' | 'HEPATOMEGALIA' | 'AUMENTO_PROGRESIVO_HEMATOCRITO';
export type ModalidadAtencion = 'AMBULATORIO' | 'INGRESO_HOSPITALARIO' | 'INGRESO_UNIDAD_ESPECIALIZADA';
export type EvolucionCaso = 'MEJORIA' | 'ESTABLE' | 'EMPEORAMIENTO' | 'RECAIDA';

export const CLASIFICACIONES: { valor: Clasificacion; nombre: string; clase: string }[] = [
  { valor: 'SOSPECHOSO', nombre: 'Sospechoso', clase: 'secundaria' },
  { valor: 'PROBABLE', nombre: 'Probable', clase: 'terciaria' },
  { valor: 'CONFIRMADO', nombre: 'Confirmado', clase: 'peligro' },
  { valor: 'DESCARTADO', nombre: 'Descartado', clase: 'descartado' },
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

export const SIGNOS_CLINICOS: { valor: SignoClinico; nombre: string }[] = [
  { valor: 'POSTRACION', nombre: 'Postración' },
  { valor: 'LUMBALGIA', nombre: 'Lumbalgia' },
  { valor: 'VOMITOS_PERSISTENTES', nombre: 'Vómitos persistentes' },
  { valor: 'PETEQUIAS', nombre: 'Petequias' },
  { valor: 'EPISTAXIS', nombre: 'Epistaxis' },
  { valor: 'SANGRADO_GINGIVAL', nombre: 'Sangrado gingival' },
  { valor: 'VERTIGO', nombre: 'Vértigo' },
  { valor: 'LETARGIA', nombre: 'Letargia' },
  { valor: 'NISTAGMO', nombre: 'Nistagmo' },
  { valor: 'RIGIDEZ_NUCA', nombre: 'Rigidez de nuca' },
];

/** Signos de alarma de dengue (OPS, algoritmos de manejo clínico 2024). */
export const SIGNOS_ALARMA_DENGUE: { valor: SignoAlarmaDengue; nombre: string }[] = [
  { valor: 'DOLOR_ABDOMINAL_INTENSO', nombre: 'Dolor abdominal intenso o a la palpación' },
  { valor: 'VOMITOS_PERSISTENTES', nombre: 'Vómitos persistentes' },
  { valor: 'ACUMULACION_LIQUIDOS', nombre: 'Acumulación de líquidos' },
  { valor: 'SANGRADO_MUCOSAS', nombre: 'Sangrado de mucosas' },
  { valor: 'LETARGO_IRRITABILIDAD', nombre: 'Letargo o irritabilidad' },
  { valor: 'HIPOTENSION_POSTURAL', nombre: 'Hipotensión postural (lipotimia)' },
  { valor: 'HEPATOMEGALIA', nombre: 'Hepatomegalia > 2 cm' },
  { valor: 'AUMENTO_PROGRESIVO_HEMATOCRITO', nombre: 'Aumento progresivo del hematocrito' },
];

export const MODALIDADES: { valor: ModalidadAtencion; nombre: string }[] = [
  { valor: 'AMBULATORIO', nombre: 'Ambulatorio' },
  { valor: 'INGRESO_HOSPITALARIO', nombre: 'Ingreso hospitalario' },
  { valor: 'INGRESO_UNIDAD_ESPECIALIZADA', nombre: 'Ingreso en unidad especializada' },
];

export const EVOLUCIONES: { valor: EvolucionCaso; nombre: string; clase: string }[] = [
  { valor: 'MEJORIA', nombre: 'Mejoría', clase: 'exito' },
  { valor: 'ESTABLE', nombre: 'Estable', clase: '' },
  { valor: 'EMPEORAMIENTO', nombre: 'Empeoramiento', clase: 'peligro' },
  { valor: 'RECAIDA', nombre: 'Recaída', clase: 'secundaria' },
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

export interface Evaluacion {
  id: number;
  fecha: string;
  temperatura?: number | null;
  frecuenciaCardiaca?: number | null;
  frecuenciaRespiratoria?: number | null;
  tensionSistolica?: number | null;
  tensionDiastolica?: number | null;
  saturacionO2?: number | null;
  signosClinicos: SignoClinico[];
  signosAlarmaDengue: SignoAlarmaDengue[];
  observaciones?: string | null;
  usuario: string;
}

export interface Dictamen {
  id: number;
  fecha: string;
  diagnosticoPrincipal: string;
  diagnosticosDiferenciales?: string | null;
  conclusion: string;
  usuario: string;
}

export interface PlanAtencion {
  id: number;
  fecha: string;
  modalidad: ModalidadAtencion;
  indicaciones?: string | null;
  proximoControl?: string | null;
  usuario: string;
}

export interface Seguimiento {
  id: number;
  fecha: string;
  evolucion: EvolucionCaso;
  observaciones?: string | null;
  proximoControl?: string | null;
  usuario: string;
}

export interface DesenlaceCaso {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

/** Control programado pendiente (GET /casos/controles-pendientes). */
export interface ControlPendiente {
  casoId: number;
  pacienteId: number;
  areaSaludId: number;
  clasificacion: Clasificacion;
  fecha: string;
  vencido: boolean;
}

export type NuevaEvaluacion = Omit<Evaluacion, 'id' | 'fecha' | 'usuario'>;
export type NuevoDictamen = Omit<Dictamen, 'id' | 'fecha' | 'usuario'>;
export type NuevoPlan = Omit<PlanAtencion, 'id' | 'fecha' | 'usuario'>;
export type NuevoSeguimiento = Omit<Seguimiento, 'id' | 'fecha' | 'usuario'>;

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
  observacionesCierre?: string | null;
  desenlace?: DesenlaceCaso | null;
  evaluaciones: Evaluacion[];
  dictamenes: Dictamen[];
  planes: PlanAtencion[];
  seguimientos: Seguimiento[];
}

export type NuevoResultado = Omit<ResultadoLaboratorio, 'id'>;
