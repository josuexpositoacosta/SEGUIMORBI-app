import { t } from 'src/app/core/i18n/idioma';
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
  { valor: 'SOSPECHOSO', nombre: t('Sospechoso'), clase: 'sospechoso' },
  { valor: 'PROBABLE', nombre: t('Probable'), clase: 'probable' },
  { valor: 'CONFIRMADO', nombre: t('Confirmado'), clase: 'confirmado' },
  { valor: 'DESCARTADO', nombre: t('Descartado'), clase: 'descartado' },
];

/** Manifestaciones de la definición de caso sospechoso de la OPS. */
export const MANIFESTACIONES: { valor: Manifestacion; nombre: string }[] = [
  { valor: 'MIALGIA_ARTRALGIA', nombre: t('Mialgia o artralgia') },
  { valor: 'ESCALOFRIOS', nombre: t('Escalofríos') },
  { valor: 'FOTOFOBIA', nombre: t('Fotofobia') },
  { valor: 'MAREOS', nombre: t('Mareos') },
  { valor: 'DOLOR_RETROOCULAR', nombre: t('Dolor retroocular') },
  { valor: 'GASTROINTESTINAL', nombre: t('Náusea, vómitos o diarrea') },
  { valor: 'NEUROLOGICA', nombre: t('Manifestación neurológica') },
];

export const AGENTES: { valor: AgenteEtiologico; nombre: string }[] = [
  { valor: 'OROPOUCHE', nombre: t('Oropouche') },
  { valor: 'DENGUE', nombre: t('Dengue') },
];

export const TIPOS_PRUEBA: { valor: TipoPrueba; nombre: string }[] = [
  { valor: 'RT_PCR', nombre: t('RT-PCR') },
  { valor: 'ANTIGENO', nombre: t('Antígeno') },
  { valor: 'ELISA_IGM', nombre: t('ELISA IgM') },
  { valor: 'IGM_LCR', nombre: t('IgM en LCR') },
  { valor: 'SEROCONVERSION_PAREADA', nombre: t('Seroconversión (muestras pareadas)') },
  { valor: 'POST_MORTEM', nombre: t('Post mortem') },
];

export const TIPOS_MUESTRA: { valor: TipoMuestra; nombre: string }[] = [
  { valor: 'SUERO', nombre: t('Suero') },
  { valor: 'SANGRE', nombre: t('Sangre') },
  { valor: 'LCR', nombre: t('Líquido cefalorraquídeo') },
  { valor: 'TEJIDO', nombre: t('Tejido') },
  { valor: 'OTRA', nombre: t('Otra') },
];

export const RESULTADOS: { valor: ResultadoPrueba; nombre: string; clase: string }[] = [
  { valor: 'POSITIVO', nombre: t('Positivo'), clase: 'peligro' },
  { valor: 'NEGATIVO', nombre: t('Negativo'), clase: 'exito' },
  { valor: 'INDETERMINADO', nombre: t('Indeterminado'), clase: 'secundaria' },
];

export const SIGNOS_CLINICOS: { valor: SignoClinico; nombre: string }[] = [
  { valor: 'POSTRACION', nombre: t('Postración') },
  { valor: 'LUMBALGIA', nombre: t('Lumbalgia') },
  { valor: 'VOMITOS_PERSISTENTES', nombre: t('Vómitos persistentes') },
  { valor: 'PETEQUIAS', nombre: t('Petequias') },
  { valor: 'EPISTAXIS', nombre: t('Epistaxis') },
  { valor: 'SANGRADO_GINGIVAL', nombre: t('Sangrado gingival') },
  { valor: 'VERTIGO', nombre: t('Vértigo') },
  { valor: 'LETARGIA', nombre: t('Letargia') },
  { valor: 'NISTAGMO', nombre: t('Nistagmo') },
  { valor: 'RIGIDEZ_NUCA', nombre: t('Rigidez de nuca') },
];

/** Signos de alarma de dengue (OPS, algoritmos de manejo clínico 2024). */
export const SIGNOS_ALARMA_DENGUE: { valor: SignoAlarmaDengue; nombre: string }[] = [
  { valor: 'DOLOR_ABDOMINAL_INTENSO', nombre: t('Dolor abdominal intenso o a la palpación') },
  { valor: 'VOMITOS_PERSISTENTES', nombre: t('Vómitos persistentes') },
  { valor: 'ACUMULACION_LIQUIDOS', nombre: t('Acumulación de líquidos') },
  { valor: 'SANGRADO_MUCOSAS', nombre: t('Sangrado de mucosas') },
  { valor: 'LETARGO_IRRITABILIDAD', nombre: t('Letargo o irritabilidad') },
  { valor: 'HIPOTENSION_POSTURAL', nombre: t('Hipotensión postural (lipotimia)') },
  { valor: 'HEPATOMEGALIA', nombre: t('Hepatomegalia > 2 cm') },
  { valor: 'AUMENTO_PROGRESIVO_HEMATOCRITO', nombre: t('Aumento progresivo del hematocrito') },
];

export const MODALIDADES: { valor: ModalidadAtencion; nombre: string }[] = [
  { valor: 'AMBULATORIO', nombre: t('Ambulatorio') },
  { valor: 'INGRESO_HOSPITALARIO', nombre: t('Ingreso hospitalario') },
  { valor: 'INGRESO_UNIDAD_ESPECIALIZADA', nombre: t('Ingreso en unidad especializada') },
];

export const EVOLUCIONES: { valor: EvolucionCaso; nombre: string; clase: string }[] = [
  { valor: 'MEJORIA', nombre: t('Mejoría'), clase: 'exito' },
  { valor: 'ESTABLE', nombre: t('Estable'), clase: '' },
  { valor: 'EMPEORAMIENTO', nombre: t('Empeoramiento'), clase: 'peligro' },
  { valor: 'RECAIDA', nombre: t('Recaída'), clase: 'secundaria' },
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
