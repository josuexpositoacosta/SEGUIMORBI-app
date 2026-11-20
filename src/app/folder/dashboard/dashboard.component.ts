import { Component, computed, inject } from '@angular/core';
import { AuthService } from 'src/app/core/auth/auth.service';
import { NOMBRE_ROL } from 'src/app/core/models/usuario';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  private readonly usuario = inject(AuthService).usuario;

  readonly nombre = computed(() => this.usuario()?.firstname ?? '');
  readonly rol = computed(() => {
    const u = this.usuario();
    return u ? NOMBRE_ROL[u.role] : '';
  });
  readonly saludo = saludoSegunHora();
}

function saludoSegunHora(): string {
  const hora = new Date().getHours();
  if (hora < 12) {
    return 'Buenos días';
  }
  return hora < 20 ? 'Buenas tardes' : 'Buenas noches';
}
