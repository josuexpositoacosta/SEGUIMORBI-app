import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ActualizarAcceso, CrearUsuario, UsuarioAdmin } from '../models/admin';

/** Administración de usuarios (solo ADMIN). */
@Injectable({ providedIn: 'root' })
export class AdminUsuariosService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.urlApi}admin/usuarios`;

  listar(): Observable<UsuarioAdmin[]> {
    return this.http.get<UsuarioAdmin[]>(this.url);
  }

  crear(datos: CrearUsuario): Observable<UsuarioAdmin> {
    return this.http.post<UsuarioAdmin>(this.url, datos);
  }

  /** Cambia rol, área y estado. */
  actualizarAcceso(id: number, datos: ActualizarAcceso): Observable<UsuarioAdmin> {
    return this.http.put<UsuarioAdmin>(`${this.url}/${id}`, datos);
  }

  /** Asigna o cambia el correo; vacío lo quita. */
  cambiarEmail(id: number, email: string | null): Observable<UsuarioAdmin> {
    return this.http.patch<UsuarioAdmin>(`${this.url}/${id}/email`, { email });
  }

  restablecerPassword(id: number, password: string): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/password`, { password });
  }
}
