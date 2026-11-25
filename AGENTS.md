# SEGUIMORBI (frontend): reglas para agentes

Frontend Ionic 8 + Angular 22 de SEGUIMORBI (vigilancia y seguimiento clínico de la fiebre de Oropouche).
Interfaz en español. La API es el repositorio hermano `../SEGUIMORBI-backend`.

## Diseño adaptable (obligatorio)

Toda pantalla, formulario, modal o componente nuevo **tiene que funcionar en móvil (360 px), tablet (768 px) y
escritorio**, sin desplazar la página de lado. Antes de escribir estilos, lee **`docs/guia-responsive.md`** y usa las
piezas comunes de `src/global.scss` (`.page-container`, `.cabecera`, `.tarjeta`, `.filtros`, `.segmento`,
`.lista-registros`, `.pestanas`, `.formulario`, `.datos`…).

Lo esencial:
- Nada de anchos fijos en contenedores; rejillas con `minmax(0, 1fr)` (nunca `1fr` a secas) y `min-width: 0` en
  hijos flex con texto largo o gráficos.
- Filas de botones y chips con `flex-wrap`; tablas que pasan a tarjetas por debajo de 900 px.
- Barra superior solo en móvil (`<ion-header class="ion-hide-lg-up">`); en escritorio el título va en `.cabecera`.
- Una pantalla nueva no está terminada hasta que pasa **`npm run revisar:responsive`** (con la API local y los datos
  de demo). Añade su ruta, y sus formularios si los tiene, a `ROLES` en `scripts/revisar-responsive.mjs`.

## Comprobaciones antes de cada commit

```bash
npm run lint
npm run test:ci
npm run revisar:responsive   # si cambias pantallas o estilos
```

## Otras convenciones

- Componentes standalone con `ChangeDetectionStrategy.Eager`, señales y plantillas `@if` / `@for` / `@switch`.
- Colores y tipografía: tokens de `src/theme/variables.scss` (`--estado-*` para las clasificaciones). No inventes
  colores sueltos.
- No muestres datos que la API no da (nada de cifras, centros o certificaciones inventadas).
- Git: ramas `feat/…`/`fix/…` desde `develop`, Conventional Commits en español, `main` solo con versiones etiquetadas.
