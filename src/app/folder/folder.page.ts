import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Página provisional que elige la vista según la URL. En la fase de navegación
// se sustituye por rutas reales con router-outlet.
@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  folder = '';

  private readonly titulos: Record<string, string> = {
    dashboard: 'Inicio',
    'iniciar-sesion': 'Iniciar sesión',
  };

  ngOnInit(): void {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') ?? '';
  }

  get titulo(): string {
    return this.titulos[this.folder] ?? 'Oropouche';
  }

  isDashboard(): boolean {
    return this.folder === 'dashboard';
  }

  isiniciarsesion(): boolean {
    return this.folder === 'iniciar-sesion';
  }
}
