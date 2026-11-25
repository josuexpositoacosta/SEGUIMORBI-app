# Guía de diseño adaptable (responsive)

**Regla:** toda pantalla, formulario, modal o componente de SEGUIMORBI tiene que funcionar bien en **móvil (360 px),
tablet (768 px) y escritorio**, sin desplazar la página de lado. Una pantalla nueva no se da por terminada hasta que
pasa `npm run revisar:responsive`.

## Cómo comprobarlo

```bash
# 1. API local con datos de demo (SEGUIMORBI-backend): ./mvnw spring-boot:run y python3 scripts/datos-demo.py http://localhost:8080
# 2. App servida en http://localhost:4200 (npm start)
npm run revisar:responsive                       # médico y epidemióloga
ADMIN_PASSWORD=… npm run revisar:responsive      # también administración
CAPTURAS=/tmp/capturas npm run revisar:responsive  # y guarda una captura de cada pantalla y ancho
```

Abre cada pantalla con cada rol en 360, 390, 768 y 1024 px y falla si el contenido es más ancho que la ventana,
diciendo qué elementos sobresalen. Las barras que se desplazan solas (pestañas, botones de opción) no cuentan.

**Al añadir una pantalla nueva, añade su ruta a `ROLES` en `scripts/revisar-responsive.mjs`.** El script no
comprueba lo que se ve feo pero no desborda (botones apretados, textos cortados): mira también las capturas.

## Anchos de referencia

| Ancho | Qué cambia |
|---|---|
| ≤ 576 px (móvil) | márgenes pequeños, acciones de la cabecera a todo el ancho, pestañas sin iconos, una columna |
| ≤ 900 px | las tablas pasan a tarjetas (una por fila) |
| ≤ 1100 px | las rejillas de 2-3 columnas pasan a una |
| ≥ 992 px (`lg`) | el menú lateral queda fijo (plegado a iconos) y desaparece la barra superior |

Usa siempre estos mismos cortes en `@media (max-width: …)`.

## Piezas comunes (en `src/global.scss`): úsalas antes de inventar estilos

| Clase | Para qué |
|---|---|
| `.page-container` (+ `.ancho` en paneles) | contenedor centrado con márgenes que se reducen en el móvil |
| `<ion-header class="ion-hide-lg-up">` | barra superior con ☰ o «atrás», solo en móvil y tablet |
| `.cabecera` | título (`h1`) y acción principal; en el móvil la acción ocupa todo el ancho |
| `.tarjeta` | tarjeta blanca con borde fino |
| `.tarjeta.filtros` + `.filtros-fila` | buscador y filtros; en el móvil se apilan |
| `.segmento` con `<button>` | opciones del tipo Abiertos / Cerrados / Todos; se desplaza solo si no cabe |
| `.chips` / `.chip` | filtros por clasificación, se parten en varias líneas |
| `.lista-registros` + `.registro` | lista de tarjetas que se ajusta a cualquier ancho |
| `.pestanas` | pestañas dentro de una página; se desplazan de lado si no caben |
| `.etiqueta` (+ `sospechoso`, `probable`…) | chips de estado |
| `.datos` | pares dato/valor que pasan a una columna en el móvil |

## Reglas

1. **Nada de anchos fijos en contenedores.** Nada de `width: 600px` ni `min-width` grandes: usa `max-width`,
   `flex: 1` y porcentajes de la rejilla. Un `min-width` solo en piezas pequeñas (un selector, un botón).
2. **Rejillas que pueden encoger.** Escribe `grid-template-columns: minmax(0, 1fr)`, no `1fr`, en rejillas de una
   columna, y `minmax(0, 7fr) minmax(0, 5fr)` en las de varias. Con `1fr` la columna crece hasta el texto más largo
   y desborda. En hijos flex que contienen texto largo o gráficos, `min-width: 0`.
3. **Las filas se parten.** Toda fila de botones, chips o datos lleva `flex-wrap: wrap` (o pasa a columna en el
   móvil).
4. **Tablas:** en escritorio, `<table>`; por debajo de 900 px, cada fila es una tarjeta con `data-titulo` en cada
   celda (ver `src/app/paginas/casos/casos.page.css`). Si la tabla es secundaria, basta con envolverla en un
   contenedor con `overflow-x: auto`.
5. **Gráficos:** miden el ancho de su contenedor (ResizeObserver) y el contenedor tiene `overflow: hidden` y
   `min-width: 0`; nunca un ancho fijo en px.
6. **Textos largos** (nombres, correos, motivos): `overflow-wrap: anywhere` o recorte con `text-overflow: ellipsis`
   dentro de un elemento con `min-width: 0`.
7. **Botones táctiles** de al menos 40-44 px de alto; en el móvil, la acción principal a todo el ancho.
8. **Formularios y modales:** campos en una columna en el móvil (`.formulario-fila` se apila); los modales usan la
   clase `modal-formulario`, que ocupa todo el ancho en el móvil y desplaza su contenido si no cabe en alto.
9. **Barras que se desplazan solas** (pestañas, segmentos) llevan `overflow-x: auto` y botones con
   `flex-shrink: 0; white-space: nowrap`.
10. **Prueba en los tres tamaños** antes de dar la pantalla por terminada: `npm run revisar:responsive` y un
    vistazo a las capturas.
