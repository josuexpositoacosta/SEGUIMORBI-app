import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/core/auth/auth.service';
import { NOMBRE_ROL } from 'src/app/core/models/usuario';
import { pantallasDe } from 'src/app/core/navegacion/navegacion';

@Component({
  selector: 'app-inicio',
  imports: [IonicModule, RouterLink],
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.css'],
})
export class InicioPage {
  private readonly usuario = inject(AuthService).usuario;

  readonly nombre = computed(() => this.usuario()?.firstname ?? '');
  readonly rol = computed(() => {
    const u = this.usuario();
    return u ? NOMBRE_ROL[u.role] : '';
  });
  /** Accesos rápidos: las pantallas del rol, sin la propia de Inicio. */
  readonly accesos = computed(() => pantallasDe(this.usuario()?.role).filter(p => p.ruta !== 'inicio'));
  readonly saludo = saludoSegunHora();
}

function saludoSegunHora(): string {
  const hora = new Date().getHours();
  if (hora < 12) {
    return 'Buenos días';
  }
  return hora < 20 ? 'Buenas tardes' : 'Buenas noches';
}
