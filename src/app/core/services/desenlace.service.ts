import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Desenlace } from '../models/admin';

/** Catálogo de desenlaces de cierre de caso. */
@Injectable({ providedIn: 'root' })
export class DesenlaceService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.urlApi}desenlaces`;

  listar(soloActivos = false): Observable<Desenlace[]> {
    return this.http.get<Desenlace[]>(this.url, { params: { soloActivos } });
  }

  crear(codigo: string, nombre: string): Observable<Desenlace> {
    return this.http.post<Desenlace>(this.url, { codigo, nombre });
  }

  /** Solo cambia el nombre: el código es estable porque lo usan los casos cerrados. */
  renombrar(id: number, nombre: string): Observable<Desenlace> {
    return this.http.put<Desenlace>(`${this.url}/${id}`, { nombre });
  }

  cambiarEstado(id: number, activo: boolean): Observable<Desenlace> {
    return this.http.patch<Desenlace>(`${this.url}/${id}/${activo ? 'activar' : 'desactivar'}`, {});
  }
}
