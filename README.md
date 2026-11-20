# Oropouche App

Frontend del **Sistema de gestión epidemiológica y apoyo a la evaluación clínica de la fiebre de Oropouche**.
Web y app móvil (APK) construidas con Ionic, Angular y Capacitor.

El backend (Spring Boot, arquitectura hexagonal, JWT) está en
[josuexpositoacosta/SEGUIMORBI](https://github.com/josuexpositoacosta/SEGUIMORBI).

> Herramienta de apoyo a la decisión clínica. No sustituye el diagnóstico médico ni el criterio del
> profesional sanitario.

## Tecnologías

- Ionic 8 · Angular 18 · Capacitor 6 · TypeScript
- Tipografía Inter incluida en la app (funciona sin conexión)
- Tema propio con modo claro y oscuro automático (`src/theme/variables.scss`)

## Puesta en marcha

Requisitos: Node 20 o superior y el backend en marcha en `http://localhost:8080`
(ver su `docs/estado-del-proyecto.md`).

```bash
npm ci          # instalar dependencias
npm start       # servidor de desarrollo en http://localhost:4200
npm run build   # compilación de producción en www/
npm run lint    # revisión de código
```

La URL del backend se configura en `src/environments/environment.ts` (desarrollo) y
`src/environments/environment.prod.ts` (producción). El backend admite por defecto CORS desde
`http://localhost:4200` (variable `CORS_ALLOWED_ORIGINS` del backend).

## Autenticación

- Se entra con el **nombre de usuario o el email** y la contraseña que da el administrador.
- El token JWT se guarda en `sessionStorage` (se borra al cerrar el navegador) y se añade a cada
  petición al backend mediante un interceptor global (`src/app/core/auth/`).
- Tras el login se carga el perfil con `GET /api/v1/user/me` (rol y área de salud).
- Si el token caduca o el backend responde `401`, la sesión se cierra y se vuelve al login con un aviso.

## Estado

En desarrollo. Hoy incluye inicio de sesión (usuario o email), perfil y datos personales. El plan, por fases, es:

1. Puesta a punto y limpieza de la plantilla
2. Autenticación completa (token en todas las peticiones, perfil con `/user/me`, cierre de sesión)
3. Navegación y menú según el rol (ADMIN, MEDICO, EPIDEMIOLOGO)
4. Administración: usuarios, áreas de salud y catálogo de desenlaces
5. Médico: pacientes, casos con clasificación OPS, atención clínica y agenda
6. Epidemiólogo: validación de clasificaciones y panel de vigilancia
7. Actualización de Angular, pruebas y CI

## Ramas

- `main`: versiones estables.
- `develop`: integración.
- `feat/…`, `fix/…`, `chore/…`: una rama por tarea, que se fusiona en `develop`.

Los commits siguen [Conventional Commits](https://www.conventionalcommits.org/es/) en español.

## Autor

[Josué Expósito Acosta](https://github.com/josuexpositoacosta)
