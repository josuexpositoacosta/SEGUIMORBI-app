import { Rol } from '../models/usuario';

export type Seccion = 'general' | 'administracion' | 'clinica' | 'vigilancia';

export const NOMBRE_SECCION: Record<Seccion, string> = {
  general: 'General',
  administracion: 'Administración',
  clinica: 'Atención clínica',
  vigilancia: 'Vigilancia epidemiológica',
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
    titulo: 'Inicio',
    descripcion: 'Resumen y accesos rápidos',
    icono: 'home',
    seccion: 'general',
    roles: [],
  },
  {
    ruta: 'perfil',
    titulo: 'Mi perfil',
    descripcion: 'Tus datos personales y de acceso',
    icono: 'person-circle',
    seccion: 'general',
    roles: [],
  },

  // ADMIN: usuarios, áreas de salud y catálogos (sin datos clínicos)
  {
    ruta: 'admin/usuarios',
    titulo: 'Usuarios',
    descripcion: 'Altas, roles, áreas y contraseñas',
    icono: 'people',
    seccion: 'administracion',
    roles: ['ADMIN'],
  },
  {
    ruta: 'admin/areas-salud',
    titulo: 'Áreas de salud',
    descripcion: 'Policlínicos y áreas que atienden casos',
    icono: 'business',
    seccion: 'administracion',
    roles: ['ADMIN'],
  },
  {
    ruta: 'admin/desenlaces',
    titulo: 'Desenlaces',
    descripcion: 'Catálogo de desenlaces de los casos',
    icono: 'list',
    seccion: 'administracion',
    roles: ['ADMIN'],
  },

  // MEDICO: pacientes, casos y atención clínica de su área
  {
    ruta: 'pacientes',
    titulo: 'Pacientes',
    descripcion: 'Pacientes de tu área de salud',
    icono: 'people-circle',
    seccion: 'clinica',
    roles: ['MEDICO'],
  },
  {
    ruta: 'casos',
    titulo: 'Casos',
    descripcion: 'Casos de fiebre de Oropouche',
    icono: 'medkit',
    seccion: 'clinica',
    roles: ['MEDICO', 'EPIDEMIOLOGO'],
  },
  {
    ruta: 'agenda',
    titulo: 'Agenda de controles',
    descripcion: 'Seguimientos programados',
    icono: 'calendar',
    seccion: 'clinica',
    roles: ['MEDICO'],
  },

  // EPIDEMIOLOGO: todas las áreas, validación y vigilancia
  {
    ruta: 'validaciones',
    titulo: 'Validaciones',
    descripcion: 'Clasificaciones pendientes de validar',
    icono: 'checkmark-done-circle',
    seccion: 'vigilancia',
    roles: ['EPIDEMIOLOGO'],
    proximamente: ['Clasificaciones propuestas por los médicos', 'Validar con observaciones'],
  },
  {
    ruta: 'vigilancia',
    titulo: 'Panel de vigilancia',
    descripcion: 'Indicadores, curva epidémica y áreas',
    icono: 'stats-chart',
    seccion: 'vigilancia',
    roles: ['EPIDEMIOLOGO'],
    proximamente: [
      'Indicadores resumen',
      'Curva epidémica por semana epidemiológica',
      'Casos por área de salud',
      'Descarga CSV sin datos personales',
    ],
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
