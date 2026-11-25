# Idiomas: español e inglés

La interfaz está en **español** (por defecto) e **inglés**. El usuario cambia de idioma con el selector ES / EN del
login o del menú lateral; la elección se guarda en el navegador y la app se recarga para aplicarla también a fechas y
números.

## Cómo se escribe un texto

Los textos se escriben **en español** y se marcan para traducir:

| Dónde | Cómo |
|---|---|
| Plantilla, texto | `{{ 'Registrar caso' | t }}` |
| Plantilla, atributo | `[placeholder]="'Buscar por nombre' | t"`, `[attr.aria-label]="'Cerrar' | t"` |
| Con datos | `{{ 'Caso nº {p0} de {p1}' | t: { p0: c.id, p1: nombre } }}` |
| Código (TypeScript) | `t('Usuario creado')`, `t('{p0} vencidos', { p0: n })` |
| Fechas | `date: 'fullDate'` o formatos numéricos (`dd/MM/yyyy`); si el formato lleva palabras, pásalo por `t` |

Y su traducción va en **`src/app/core/i18n/traducciones.en.ts`** (clave: el texto en español; valor: el inglés,
con los mismos huecos `{p0}`, `{p1}`…). Si falta, se ve en español.

Reglas:
- Nada de construir frases pegando trozos (`'Caso ' + id + ' de ' + nombre`) ni plurales a mano (`'caso' + (n > 1 ? 's' : '')`):
  una frase entera con huecos, y una frase por cada forma (`'1 vencido'` / `'{p0} vencidos'`).
- No traduzcas valores de lógica (códigos como `'ABIERTO'`, textos con los que se compara).
- Los nombres de listas (clasificaciones, síntomas, roles, menú) se traducen donde se definen, con `t()`.

## Comprobación

```bash
npm run revisar:traducciones   # falla si algún texto marcado no tiene traducción (también en la CI)
```

Las pruebas unitarias (`src/app/core/i18n/idioma.spec.ts`) comprueban además que cada traducción conserva los mismos
huecos que el original.

## Límite conocido

Los textos que genera el **backend** llegan en español aunque la app esté en inglés: alertas clínicas, criterios de
la clasificación OPS, detalles de los eventos y mensajes de error de la API. Traducirlos requiere que la API devuelva
códigos en lugar de frases (o que acepte el idioma).
