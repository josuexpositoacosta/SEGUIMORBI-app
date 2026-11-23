import { Rol } from './usuario';

/** Usuario tal como lo ve el administrador (GET /api/v1/admin/usuarios). */
export interface UsuarioAdmin {
  id: number;
  username: string;
  email?: string | null;
  firstname: string;
  lastname: string;
  country?: string | null;
  role: Rol;
  areaSaludId?: number | null;
  activo: boolean;
}

export interface CrearUsuario {
  username: string;
  email?: string | null;
  password: string;
  firstname: string;
  lastname: string;
  country?: string | null;
  role: Rol;
  areaSaludId?: number | null;
}

export interface ActualizarAcceso {
  role: Rol;
  areaSaludId?: number | null;
  activo: boolean;
}

export interface Desenlace {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

export type DatosArea = {
  codigo: string;
  nombre: string;
  provincia: string;
  municipio: string;
  direccion?: string | null;
  telefono?: string | null;
};
