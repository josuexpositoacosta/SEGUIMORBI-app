import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AreaSalud } from '../models/area-salud';

@Injectable({ providedIn: 'root' })
export class AreaSaludService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.urlApi}areas-salud`;

  obtener(id: number): Observable<AreaSalud> {
    return this.http.get<AreaSalud>(`${this.url}/${id}`);
  }
}
