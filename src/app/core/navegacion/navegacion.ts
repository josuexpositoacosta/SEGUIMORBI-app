import { Rol } from '../models/usuario';
import { t } from 'src/app/core/i18n/idioma';

export type Seccion = 'general' | 'administracion' | 'clinica' | 'vigilancia';

export const NOMBRE_SECCION: Record<Seccion, string> = {
  general: t('General'),
  administracion: t('Administración'),
  clinica: t('Atención clínica'),
  vigilancia: t('Vigilancia epidemiológica'),
};

/** Una pantalla de la app: alimenta el menú, los accesos de Inicio y el control de acceso. */
export interface Pantalla {
  /** Ruta sin barra inicial. */
  ruta: string;
  titulo: string;
  descripcion: string;
  icono: string;
  seccion: Seccion;
  /** Roles que pueden entrar. Vacío = cualquier usuario autenticado. */
  roles: Rol[];
  /** Si aún no está construida, se muestra la página "En preparación" con esta lista. */
  proximamente?: string[];
}

export const PANTALLAS: Pantalla[] = [
  {
    ruta: 'inicio',
    titulo: t('Inicio'),
    descripcion: t('Resumen y accesos rápidos'),
    icono: 'home',
    seccion: 'general',
    roles: [],
  },
  {
    ruta: 'perfil',
    titulo: t('Mi perfil'),
    descripcion: t('Tus datos personales y de acceso'),
    icono: 'person-circle',
    seccion: 'general',
    roles: [],
  },

  // ADMIN: usuarios, áreas de salud y catálogos (sin datos clínicos)
  {
    ruta: 'admin/usuarios',
    titulo: t('Usuarios'),
    descripcion: t('Altas, roles, áreas y contraseñas'),
    icono: 'people',
    seccion: 'administracion',
    roles: ['ADMIN'],
  },
  {
    ruta: 'admin/areas-salud',
    titulo: t('Áreas de salud'),
    descripcion: t('Policlínicos y áreas que atienden casos'),
    icono: 'business',
    seccion: 'administracion',
    roles: ['ADMIN'],
  },
  {
    ruta: 'admin/desenlaces',
    titulo: t('Desenlaces'),
    descripcion: t('Catálogo de desenlaces de los casos'),
    icono: 'list',
    seccion: 'administracion',
    roles: ['ADMIN'],
  },

  // MEDICO: pacientes, casos y atención clínica de su área
  {
    ruta: 'pacientes',
    titulo: t('Pacientes'),
    descripcion: t('Pacientes de tu área de salud'),
    icono: 'people-circle',
    seccion: 'clinica',
    roles: ['MEDICO'],
  },
  {
    ruta: 'casos',
    titulo: t('Casos'),
    descripcion: t('Casos de fiebre de Oropouche'),
    icono: 'medkit',
    seccion: 'clinica',
    roles: ['MEDICO', 'EPIDEMIOLOGO'],
  },
  {
    ruta: 'agenda',
    titulo: t('Agenda de controles'),
    descripcion: t('Seguimientos programados'),
    icono: 'calendar',
    seccion: 'clinica',
    roles: ['MEDICO'],
  },

  // EPIDEMIOLOGO: todas las áreas, validación y vigilancia
  {
    ruta: 'validaciones',
    titulo: t('Validaciones'),
    descripcion: t('Clasificaciones pendientes de validar'),
    icono: 'checkmark-done-circle',
    seccion: 'vigilancia',
    roles: ['EPIDEMIOLOGO'],
  },
  {
    ruta: 'vigilancia',
    titulo: t('Panel de vigilancia'),
    descripcion: t('Indicadores, curva epidémica y áreas'),
    icono: 'stats-chart',
    seccion: 'vigilancia',
    roles: ['EPIDEMIOLOGO'],
  },
];

export function puedeVer(pantalla: Pantalla, rol: Rol | undefined): boolean {
  return pantalla.roles.length === 0 || (!!rol && pantalla.roles.includes(rol));
}

export function pantallasDe(rol: Rol | undefined): Pantalla[] {
  return PANTALLAS.filter(p => puedeVer(p, rol));
}

export interface GrupoMenu {
  seccion: Seccion;
  titulo: string;
  pantallas: Pantalla[];
}

/** Pantallas visibles para el rol, agrupadas por sección y en el orden de la tabla. */
export function menuDe(rol: Rol | undefined): GrupoMenu[] {
  const grupos: GrupoMenu[] = [];
  for (const pantalla of pantallasDe(rol)) {
    let grupo = grupos.find(g => g.seccion === pantalla.seccion);
    if (!grupo) {
      grupo = { seccion: pantalla.seccion, titulo: NOMBRE_SECCION[pantalla.seccion], pantallas: [] };
      grupos.push(grupo);
    }
    grupo.pantallas.push(pantalla);
  }
  return grupos;
}
