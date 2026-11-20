import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  Caso, Clasificacion, ControlPendiente, DatosCaso, EstadoCaso, NuevaEvaluacion, NuevoDictamen, NuevoPlan, NuevoResultado,
  NuevoSeguimiento, Sugerencia,
} from '../models/caso';

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

  // ---------- Atención clínica (registros inmutables; fecha y usuario los pone el backend)

  registrarEvaluacion(id: number, datos: NuevaEvaluacion): Observable<Caso> {
    return this.http.post<Caso>(`${this.url}/${id}/evaluaciones`, datos);
  }

  registrarDictamen(id: number, datos: NuevoDictamen): Observable<Caso> {
    return this.http.post<Caso>(`${this.url}/${id}/dictamenes`, datos);
  }

  registrarPlan(id: number, datos: NuevoPlan): Observable<Caso> {
    return this.http.post<Caso>(`${this.url}/${id}/planes`, datos);
  }

  /** RECAIDA marca el caso como recaída. */
  registrarSeguimiento(id: number, datos: NuevoSeguimiento): Observable<Caso> {
    return this.http.post<Caso>(`${this.url}/${id}/seguimientos`, datos);
  }

  /** Cierra con el código de un desenlace activo del catálogo. */
  cerrar(id: number, desenlace: string, fechaCierre: string, observaciones: string | null): Observable<Caso> {
    return this.http.patch<Caso>(`${this.url}/${id}/cierre`, { desenlace, fechaCierre, observaciones });
  }

  reabrir(id: number, motivo: string): Observable<Caso> {
    return this.http.patch<Caso>(`${this.url}/${id}/reapertura`, { motivo });
  }

  /** Controles programados hasta la fecha indicada (incluye los vencidos). */
  controlesPendientes(hasta?: string): Observable<ControlPendiente[]> {
    const params = hasta ? new HttpParams().set('hasta', hasta) : undefined;
    return this.http.get<ControlPendiente[]>(`${this.url}/controles-pendientes`, { params });
  }
}
