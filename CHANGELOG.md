# Changelog

Cambios de cada versión del frontend de SEGUIMORBI. Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/);
versiones: [SemVer](https://semver.org/lang/es/).

## v1.1.1 — 2026-11-24

### Arreglado

- **La app se adapta al móvil y la tablet**: el panel de vigilancia, las validaciones, la gestión de usuarios, la
  ficha del caso y la lista de casos ya no se salen de la pantalla ni quedan apretadas en anchos pequeños.
- **Formularios en el móvil**: «Abrir caso» y los registros clínicos ya no se salen por la derecha.

### Técnico

- Regla del proyecto: toda pantalla y formulario nuevo debe funcionar en móvil, tablet y escritorio
  (`AGENTS.md`, `docs/guia-responsive.md`).
- `npm run revisar:responsive`: abre cada pantalla y formulario principal con cada rol en 360, 390, 768 y
  1024 px y falla si algo se desborda.

## v1.1.0 — 2026-11-23

Rediseño completo de la interfaz, a partir de un diseño hecho en Stitch.

### Nuevo

- **Menú lateral oscuro que se pliega** a una franja de iconos (con el nombre al pasar el ratón); un botón lo
  abre con textos y el navegador recuerda la elección. En el móvil sigue siendo un cajón.
- **Inicio de sesión** con panel de marca y aviso solo si el servidor tarda en despertar.
- **Inicio del médico** con indicadores (casos abiertos, controles de hoy, pendientes de validar, pacientes),
  próximos controles de 7 días, aviso de validaciones y casos recientes.
- **Lista de casos en tabla** con día de evolución, validación, alertas y próximo control; chips con el número de
  casos de cada clasificación. En el móvil, cada caso es una tarjeta.
- **Ficha del caso con pestañas**: Resumen, Línea de tiempo (con eje vertical), Laboratorio e Historial.
- **Panel de vigilancia con pestañas**: Resumen, Curva epidémica, Clínica y Áreas; filtros en la cabecera.
- El resto de pantallas (pacientes, agenda, validaciones, perfil y administración) siguen el mismo estilo:
  cabecera dentro de la página, filtros en una tarjeta y migas en las fichas.

### Cambios

- Colores de clasificación unificados en etiquetas y gráficos: sospechoso azul, probable ámbar, confirmado rojo
  y descartado gris (antes sospechoso era ámbar y probable azul).
- Títulos con la tipografía Manrope, incluida en la app.

## v1.0.1 — 2026-11-23

### Nuevo

- **Demo pública** en <https://josuexpositoacosta.github.io/SEGUIMORBI-app/>, publicada con GitHub Pages en cada
  versión y conectada a la API de Render (`https://seguimorbi-api.onrender.com`). La API gratuita se duerme tras
  15 minutos sin uso: la primera petición puede tardar alrededor de un minuto.

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
