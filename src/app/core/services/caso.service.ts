import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Caso, Clasificacion, DatosCaso, EstadoCaso, NuevoResultado, Sugerencia } from '../models/caso';

export interface FiltrosCasos {
  areaSaludId?: number;
  clasificacion?: Clasificacion;
  estado?: EstadoCaso;
}

/** Casos de Oropouche. El médico ve los de su área; el epidemiólogo, todos (lo aplica el backend). */
@Injectable({ providedIn: 'root' })
export class CasoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.urlApi}casos`;

  listar(filtros: FiltrosCasos = {}): Observable<Caso[]> {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor !== undefined && valor !== null) {
        params = params.set(clave, String(valor));
      }
    }
    return this.http.get<Caso[]>(this.url, { params });
  }

  obtener(id: number): Observable<Caso> {
    return this.http.get<Caso>(`${this.url}/${id}`);
  }

  dePaciente(pacienteId: number): Observable<Caso[]> {
    return this.http.get<Caso[]>(`${environment.urlApi}pacientes/${pacienteId}/casos`);
  }

  /** Vista previa de la clasificación según la OPS, sin guardar nada. */
  sugerir(datos: DatosCaso): Observable<Sugerencia> {
    return this.http.post<Sugerencia>(`${this.url}/sugerencia`, datos);
  }

  registrar(datos: DatosCaso): Observable<Caso> {
    return this.http.post<Caso>(this.url, datos);
  }

  actualizar(id: number, datos: DatosCaso): Observable<Caso> {
    return this.http.put<Caso>(`${this.url}/${id}`, datos);
  }

  registrarResultado(id: number, resultado: NuevoResultado): Observable<Caso> {
    return this.http.post<Caso>(`${this.url}/${id}/resultados`, resultado);
  }

  cambiarClasificacion(id: number, clasificacion: Clasificacion, motivo: string): Observable<Caso> {
    return this.http.patch<Caso>(`${this.url}/${id}/clasificacion`, { clasificacion, motivo });
  }
}
