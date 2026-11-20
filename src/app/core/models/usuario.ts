export type Rol = 'ADMIN' | 'MEDICO' | 'EPIDEMIOLOGO';

export const NOMBRE_ROL: Record<Rol, string> = {
  ADMIN: 'Administrador',
  MEDICO: 'Médico',
  EPIDEMIOLOGO: 'Epidemiólogo',
};

/** Perfil del usuario autenticado (GET /api/v1/user/me). */
export interface Usuario {
  id: number;
  username: string;
  email?: string | null;
  firstname: string;
  lastname: string;
  country?: string | null;
  role: Rol;
  areaSaludId?: number | null;
}

/** Datos personales que cada usuario puede cambiar (PUT /api/v1/user). */
export interface DatosPersonales {
  id: number;
  firstname: string;
  lastname: string;
  country: string;
}

export interface Credenciales {
  /** Nombre de usuario o email. */
  username: string;
  password: string;
}
