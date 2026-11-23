# Changelog

Cambios de cada versión del frontend de SEGUIMORBI. Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/);
versiones: [SemVer](https://semver.org/lang/es/).

## v1.0.0 — 2026-11-23

Primera versión completa del frontend, rehecho por fases sobre la plantilla inicial de Ionic.

### Nuevo

- **Inicio de sesión** rediseñado, con aviso de sesión caducada o sin conexión.
- **Tema visual sanitario** y nuevo diseño del menú lateral y de la pantalla de inicio.
- **Menú y rutas según el rol** (administrador, médico, epidemiólogo); cada usuario solo ve y abre sus pantallas.
- **Administración**: gestión de usuarios (altas, roles, áreas, contraseñas), áreas de salud y catálogo de desenlaces.
- **Pacientes del médico**: lista con búsqueda, ficha y formulario de alta y edición.
- **Casos de fiebre de Oropouche**: registro con la sugerencia de clasificación de la OPS en directo, ficha y lista.
- **Atención clínica**: línea de tiempo del caso (evaluación, dictamen, plan, seguimiento), cierre, reapertura y
  agenda de controles.
- **Vigilancia epidemiológica**: bandeja de validaciones y panel con indicadores, curva epidémica y áreas.

### Arreglado

- El token se envía en todas las peticiones al backend y el perfil se lee de `/user/me`; un 401 lleva al login.

### Cambios importantes

- El proyecto pasa a llamarse **SEGUIMORBI** (antes Oropouche). La enfermedad conserva su nombre.

### Técnico

- Angular 18 → 22, TypeScript 6, Ionic 8.8; plantillas con la sintaxis `@if` / `@for` / `@switch`.
- ESLint 9 con configuración plana y angular-eslint 22.
- 48 pruebas unitarias (sesión, interceptor, guards, menú por rol, utilidades): `npm run test:ci`.
- Integración continua en GitHub Actions: lint, pruebas y compilación de producción.
- Limpieza de restos de la plantilla y README reescrito.
