import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DatosPersonales } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);

  /** Cambia los datos personales del usuario autenticado. */
  actualizarDatosPersonales(datos: DatosPersonales): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${environment.urlApi}user`, datos);
  }
}
