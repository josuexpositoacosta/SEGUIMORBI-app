import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NOMBRE_SECCION, PANTALLAS, Pantalla } from 'src/app/core/navegacion/navegacion';

/** Pantalla aún no construida: explica qué hará. La sustituye la fase correspondiente. */
@Component({
  selector: 'app-en-preparacion',
  imports: [IonicModule, RouterLink],
  templateUrl: './en-preparacion.page.html',
  styleUrls: ['./en-preparacion.page.css'],
})
export class EnPreparacionPage {
  private readonly ruta = inject(ActivatedRoute).snapshot.data['ruta'] as string;
  readonly pantalla: Pantalla | undefined = PANTALLAS.find(p => p.ruta === this.ruta);
  readonly seccion = this.pantalla ? NOMBRE_SECCION[this.pantalla.seccion] : '';
}
