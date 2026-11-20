import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AreaSalud } from '../models/area-salud';
import { DatosArea } from '../models/admin';

@Injectable({ providedIn: 'root' })
export class AreaSaludService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.urlApi}areas-salud`;

  listar(): Observable<AreaSalud[]> {
    return this.http.get<AreaSalud[]>(this.url);
  }

  listarActivas(): Observable<AreaSalud[]> {
    return this.http.get<AreaSalud[]>(`${this.url}/activas`);
  }

  obtener(id: number): Observable<AreaSalud> {
    return this.http.get<AreaSalud>(`${this.url}/${id}`);
  }

  crear(datos: DatosArea): Observable<AreaSalud> {
    return this.http.post<AreaSalud>(this.url, datos);
  }

  actualizar(id: number, datos: DatosArea): Observable<AreaSalud> {
    return this.http.put<AreaSalud>(`${this.url}/${id}`, datos);
  }

  desactivar(id: number): Observable<AreaSalud> {
    return this.http.patch<AreaSalud>(`${this.url}/${id}/desactivar`, {});
  }

  activar(id: number): Observable<AreaSalud> {
    return this.http.patch<AreaSalud>(`${this.url}/${id}/activar`, {});
  }
}
