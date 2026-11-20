# SEGUIMORBI App

Frontend de **SEGUIMORBI**, sistema de gestión epidemiológica y apoyo a la evaluación clínica de la fiebre de Oropouche.
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

## Pantallas y roles

La tabla `src/app/core/navegacion/navegacion.ts` define cada pantalla (ruta, icono y roles). De ella salen el
menú lateral, los accesos rápidos de Inicio y el control de acceso, así que una pantalla nueva solo se añade ahí.

| Rol | Pantallas |
|---|---|
| Todos | `/inicio`, `/perfil` |
| ADMIN | `/admin/usuarios`, `/admin/areas-salud`, `/admin/desenlaces` |
| MEDICO | `/pacientes`, `/casos`, `/agenda` |
| EPIDEMIOLOGO | `/casos`, `/validaciones`, `/vigilancia` |

Si alguien abre a mano una pantalla de otro rol ve `/sin-permiso`; una ruta que no existe muestra la página 404.
Las pantallas aún sin construir muestran «En preparación» con lo que harán.

### Administración (ADMIN)

- **Usuarios:** alta con rol, área de salud (obligatoria para el médico) y correo opcional; cambiar rol, área y
  estado; asignar o quitar el correo; restablecer la contraseña; activar o desactivar cuentas (nunca la propia).
- **Áreas de salud:** alta, edición, desactivación y reactivación.
- **Desenlaces:** catálogo para el cierre de casos; alta, cambio de nombre (el código es fijo) y activación.

### Atención clínica (MEDICO)

- **Pacientes de su área:** lista con búsqueda por nombre o documento y edad calculada; alta y edición
  (el área es siempre la del médico); ficha del paciente; desactivación y reactivación (si su área sigue
  activa). El backend impide ver o tocar
  pacientes de otra área.
- **Casos:** se abren desde la ficha del paciente con la **clasificación sugerida por la OPS en directo**
  (`POST /casos/sugerencia`) y los criterios que se cumplen; si no cumple la definición de sospechoso pide un
  motivo. Ficha del caso con alertas, clasificación actual frente a la sugerida, datos clínicos editables,
  resultados de laboratorio, cambio de clasificación con motivo (Confirmado solo con laboratorio confirmatorio)
  e historial. Lista de casos con filtros por estado y clasificación (el epidemiólogo ve todas las áreas).
- **Atención clínica:** línea de tiempo del caso con evaluaciones (signos vitales con los rangos del backend,
  signos clínicos y de alarma de dengue), dictámenes, planes de atención y seguimientos, con atajos para el
  próximo control. Los registros son inmutables. Las **alertas clínicas** las calcula el backend al guardar y se
  muestran al instante. Cierre con un desenlace del catálogo y reapertura con motivo.
- **Agenda de controles:** controles vencidos, de hoy y de los próximos 7 o 30 días, con acceso al caso.

### Vigilancia epidemiológica (EPIDEMIOLOGO)

- **Validaciones:** bandeja con las clasificaciones propuestas por los médicos en casos abiertos, primero las que
  difieren de la sugerencia OPS; validar con observaciones o abrir el caso para cambiarla con motivo.
- **Panel de vigilancia:** filtros de periodo (4, 12, 26 o 52 semanas), área y criterio de fecha; indicadores
  (casos, % confirmados, pendientes de validar, hospitalizados, formas neuroinvasivas, gestantes, recaídas,
  laboratorio); **curva epidémica** por semana epidemiológica apilada por clasificación, con detalle al pasar el
  ratón y vista de tabla; casos por área y por desenlace; descarga del **CSV** sin datos personales.
- Los colores de las clasificaciones en los gráficos están validados para daltonismo en modo claro y oscuro
  (variables `--serie-*` en `src/global.scss`).

Todas las listas tienen buscador (sin tildes), filtros y «tirar para actualizar» en el móvil.

## Estado

En desarrollo. Están todas las pantallas de los tres roles (fases 1 a 6). El plan, por fases, es:

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
