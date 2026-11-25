import { CUSTOM_ELEMENTS_SCHEMA, computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthService } from './core/auth/auth.service';
import { Usuario } from './core/models/usuario';
import { TraducirPipe } from './core/i18n/traducir.pipe';

describe('AppComponent', () => {
  const usuario = signal<Usuario | null>(null);
  let auth: { usuario: typeof usuario; autenticado: ReturnType<typeof computed<boolean>>; logout: jasmine.Spy };

  beforeEach(async () => {
    usuario.set(null);
    auth = { usuario, autenticado: computed(() => usuario() !== null), logout: jasmine.createSpy('logout') };
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [TraducirPipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    }).compileComponents();
  });

  function crear() {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    return { app: fixture.componentInstance, dom: fixture.nativeElement as HTMLElement };
  }

  const titulosMenu = (dom: HTMLElement) =>
    Array.from(dom.querySelectorAll('nav ion-label')).map(e => e.textContent?.trim());

  it('sin sesión no muestra la tarjeta del usuario', () => {
    const { dom } = crear();
    expect(dom.querySelector('.user-card')).toBeNull();
  });

  it('muestra el menú y los datos del médico', () => {
    usuario.set({ id: 1, username: 'medico', firstname: 'ana', lastname: 'pérez', role: 'MEDICO' });
    const { app, dom } = crear();

    expect(titulosMenu(dom)).toEqual(['Inicio', 'Mi perfil', 'Pacientes', 'Casos', 'Agenda de controles']);
    expect(dom.querySelector('.user-role')?.textContent).toBe('Médico');
    expect(app.iniciales()).toBe('AP');
  });

  it('el epidemiólogo no ve Pacientes en el menú', () => {
    usuario.set({ id: 2, username: 'epi', firstname: 'Luis', lastname: 'Gómez', role: 'EPIDEMIOLOGO' });
    const { dom } = crear();
    expect(titulosMenu(dom)).not.toContain('Pacientes');
    expect(titulosMenu(dom)).toContain('Panel de vigilancia');
  });

  it('cerrar sesión llama a logout', () => {
    const { app } = crear();
    app.cerrarSesion();
    expect(auth.logout).toHaveBeenCalled();
  });
});
