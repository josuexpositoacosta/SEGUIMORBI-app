#!/usr/bin/env node
/**
 * Comprueba que todos los textos marcados para traducir tienen su versión en inglés.
 *
 * Busca en src/app los textos con el pipe `t` ({{ 'Casos' | t }}, [label]="'Nombre' | t") y con la función
 * `t('…')`, y los compara con el diccionario src/app/core/i18n/traducciones.en.ts. Falla si falta alguno (y avisa de
 * las traducciones que ya no se usan). Ver docs/guia-i18n.md.
 *
 * Uso: npm run revisar:traducciones
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const RAIZ = new URL('../src/app/', import.meta.url).pathname;
const DICCIONARIO = join(RAIZ, 'core/i18n/traducciones.en.ts');

function archivos(dir) {
  return readdirSync(dir).flatMap(nombre => {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) {
      return archivos(ruta);
    }
    return /\.(html|ts)$/.test(nombre) && !nombre.endsWith('.spec.ts') && !ruta.includes('/i18n/') ? [ruta] : [];
  });
}

const desescapar = s => s.replace(/\\'/g, "'").replace(/\\\\/g, '\\');
const usadas = new Map();
for (const ruta of archivos(RAIZ)) {
  const fuente = readFileSync(ruta, 'utf8');
  for (const patron of [/'((?:[^'\\]|\\.)*)' \| t\b/g, /\bt\('((?:[^'\\]|\\.)*)'/g]) {
    for (const m of fuente.matchAll(patron)) {
      const clave = desescapar(m[1]);
      if (!usadas.has(clave)) {
        usadas.set(clave, ruta.replace(RAIZ, ''));
      }
    }
  }
}
usadas.set('Idioma', 'compartido/selector-idioma.component.ts');

const diccionario = readFileSync(DICCIONARIO, 'utf8');
const traducidas = new Set();
for (const m of diccionario.matchAll(/^\s*'((?:[^'\\]|\\.)*)':/gm)) {
  traducidas.add(desescapar(m[1]));
}
for (const m of diccionario.matchAll(/^\s*"((?:[^"\\]|\\.)*)":/gm)) {
  traducidas.add(m[1]);
}

const faltan = [...usadas].filter(([clave]) => !traducidas.has(clave));
const sobran = [...traducidas].filter(clave => !usadas.has(clave));

if (sobran.length) {
  console.log(`Aviso: ${sobran.length} traducciones ya no se usan (se pueden borrar de traducciones.en.ts):`);
  for (const clave of sobran) {
    console.log(`  · ${clave}`);
  }
}
if (faltan.length) {
  console.error(`\n✗ ${faltan.length} textos sin traducción al inglés en src/app/core/i18n/traducciones.en.ts:\n`);
  for (const [clave, ruta] of faltan) {
    console.error(`  · '${clave}'   (${ruta})`);
  }
  process.exit(1);
}
console.log(`✓ ${usadas.size} textos, todos con traducción al inglés.`);
