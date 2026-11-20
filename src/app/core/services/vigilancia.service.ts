import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AreaVigilancia, FiltroVigilancia, ResumenVigilancia, SemanaVigilancia } from '../models/vigilancia';

/** Estadísticas de vigilancia epidemiológica (solo EPIDEMIOLOGO). */
@Injectable({ providedIn: 'root' })
export class VigilanciaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.urlApi}estadisticas`;

  resumen(f: FiltroVigilancia): Observable<ResumenVigilancia> {
    return this.http.get<ResumenVigilancia>(`${this.url}/resumen`, { params: parametros(f) });
  }

  semanas(f: FiltroVigilancia): Observable<SemanaVigilancia[]> {
    return this.http.get<SemanaVigilancia[]>(`${this.url}/semanas`, { params: parametros(f) });
  }

  /** Todas las áreas (el filtro de área no aplica aquí). */
  areas(f: FiltroVigilancia): Observable<AreaVigilancia[]> {
    return this.http.get<AreaVigilancia[]>(`${this.url}/areas`, { params: parametros({ ...f, areaSaludId: null }) });
  }

  /** Línea de casos en CSV (sin datos personales). Se pide con el token, por eso no es un enlace directo. */
  csv(f: FiltroVigilancia): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.url}/casos.csv`, { params: parametros(f), responseType: 'blob', observe: 'response' });
  }
}

function parametros(f: FiltroVigilancia): HttpParams {
  let p = new HttpParams();
  for (const [clave, valor] of Object.entries(f)) {
    if (valor !== undefined && valor !== null && valor !== '') {
      p = p.set(clave, String(valor));
    }
  }
  return p;
}
