import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DatosPaciente, Paciente } from '../models/paciente';

/** Pacientes. El médico solo ve y gestiona los de su área (lo aplica el backend). */
@Injectable({ providedIn: 'root' })
export class PacienteService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.urlApi}pacientes`;

  listar(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.url);
  }

  obtener(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.url}/${id}`);
  }

  registrar(datos: DatosPaciente): Observable<Paciente> {
    return this.http.post<Paciente>(this.url, datos);
  }

  actualizar(id: number, datos: DatosPaciente): Observable<Paciente> {
    return this.http.put<Paciente>(`${this.url}/${id}`, datos);
  }

  desactivar(id: number): Observable<Paciente> {
    return this.http.patch<Paciente>(`${this.url}/${id}/desactivar`, {});
  }

  /** Reactiva un paciente; el backend exige que su área siga activa. */
  activar(id: number): Observable<Paciente> {
    return this.http.patch<Paciente>(`${this.url}/${id}/activar`, {});
  }
}
