#!/usr/bin/env node
/**
 * Revisión de diseño adaptable (responsive) de SEGUIMORBI.
 *
 * Abre cada pantalla con cada rol en varios anchos (móvil, tablet, portátil) y falla si alguna obliga a desplazar
 * la página de lado. También abre los formularios principales (modales) y comprueba que caben. Las barras que se desplazan solas (pestañas, botones de opción, tablas con su propio scroll)
 * no cuentan: solo se mide el área de contenido de la página.
 *
 * Requisitos: la app servida (npm start o www/ con cualquier servidor) y la API local con los datos de demostración
 * (SEGUIMORBI-backend: scripts/datos-demo.py). Ver docs/guia-responsive.md.
 *
 * Uso:
 *   npm run revisar:responsive
 *   APP_URL=http://localhost:4200 API_URL=http://localhost:8080 ADMIN_PASSWORD=… npm run revisar:responsive
 *
 * Variables:
 *   APP_URL         app a revisar (por defecto http://localhost:4200)
 *   API_URL         API para iniciar sesión (por defecto http://localhost:8080)
 *   DEMO_PASSWORD   contraseña de los usuarios de demo (por defecto la de scripts/datos-demo.py)
 *   ADMIN_PASSWORD  si se da, también se revisan las pantallas de administración
 *   MEDICO_USUARIO / MEDICO_PASSWORD   médico con el que entrar (por defecto medico.centro y DEMO_PASSWORD)
 *   EPI_USUARIO / EPI_PASSWORD         epidemiólogo (por defecto epidemiologa y DEMO_PASSWORD)
 *   Con MEDICO_USUARIO= o EPI_USUARIO= vacíos se salta ese rol (se avisa al final).
 *   CHROME_PATH     navegador Chrome/Chromium (se busca solo si no se da)
 *   CAPTURAS        carpeta donde guardar una captura de cada pantalla y ancho (opcional)
 *   IDIOMA          es (por defecto) o en: idioma de la interfaz durante la revisión
 */
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const APP = (process.env.APP_URL ?? 'http://localhost:4200').replace(/\/$/, '');
const API = (process.env.API_URL ?? 'http://localhost:8080').replace(/\/$/, '');
const DEMO = process.env.DEMO_PASSWORD ?? 'Demo.Seguimorbi2026';
const CAPTURAS = process.env.CAPTURAS;

/** Texto de un botón en el idioma de la revisión (los botones se buscan por su texto visible). */
const EN = Object.fromEntries([...readFileSync(new URL('../src/app/core/i18n/traducciones.en.ts', import.meta.url), 'utf8')
  .matchAll(/^\s*'((?:[^'\\]|\\.)*)':\s*'((?:[^'\\]|\\.)*)'/gm)].map(m => [m[1], m[2]]));
const enIdioma = texto => (process.env.IDIOMA === 'en' ? EN[texto] ?? texto : texto);

/** Anchos que toda pantalla debe soportar: móvil pequeño, móvil, tablet y portátil pequeño (menú fijo). */
const ANCHOS = [360, 390, 768, 1024];

/** Pantallas por rol. ':caso' y ':paciente' se sustituyen por un id real leído de la API. */
const ROLES = [
  {
    usuario: process.env.MEDICO_USUARIO ?? 'medico.centro', clave: process.env.MEDICO_PASSWORD ?? DEMO,
    rutas: ['inicio', 'perfil', 'pacientes', 'pacientes/:paciente', 'casos', 'casos/:caso', 'agenda'],
    // Formularios (modales): ruta y texto del botón que los abre.
    modales: [
      ['pacientes', 'Nuevo paciente'],
      ['pacientes/:paciente', 'Abrir caso'],
      ['casos/:caso', 'Añadir evaluación'],
      ['casos/:caso', 'Añadir resultado'],
    ],
  },
  {
    usuario: process.env.EPI_USUARIO ?? 'epidemiologa', clave: process.env.EPI_PASSWORD ?? DEMO,
    rutas: ['inicio', 'casos', 'casos/:caso', 'validaciones', 'vigilancia'],
  },
  ...(process.env.ADMIN_PASSWORD
    ? [{
      usuario: 'admin', clave: process.env.ADMIN_PASSWORD,
      rutas: ['inicio', 'admin/usuarios', 'admin/areas-salud', 'admin/desenlaces'],
      modales: [['admin/usuarios', 'Nuevo usuario'], ['admin/areas-salud', 'Nueva área'], ['admin/desenlaces', 'Nuevo desenlace']],
    }]
    : []),
];

function buscarChrome() {
  const candidatos = [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  ].filter(Boolean);
  const encontrado = candidatos.find(c => existsSync(c));
  if (!encontrado) {
    throw new Error('No se encontró Chrome. Indica su ruta con CHROME_PATH.');
  }
  return encontrado;
}

async function iniciarSesion(usuario, clave) {
  const r = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: usuario, password: clave }),
  });
  if (!r.ok) {
    throw new Error(`No se pudo iniciar sesión como ${usuario} (HTTP ${r.status}). ¿Están cargados los datos de demo?`);
  }
  return (await r.json()).token;
}

async function primerId(token, ruta) {
  const r = await fetch(`${API}/api/v1/${ruta}`, { headers: { Authorization: `Bearer ${token}` } });
  const lista = r.ok ? await r.json() : [];
  return lista[0]?.id;
}

/** Ancho del contenido de la página visible frente al ancho de la ventana, y los elementos que más sobresalen. */
function medir() {
  const pagina = document.querySelector('ion-router-outlet > .ion-page:not(.ion-page-hidden)')
    ?? document.querySelector('ion-app .ion-page');
  const contenido = pagina?.querySelector('ion-content');
  const scroll = contenido?.shadowRoot?.querySelector('.inner-scroll');
  const ventana = window.innerWidth;
  const ancho = Math.max(scroll?.scrollWidth ?? 0, document.documentElement.scrollWidth);
  const culpables = [];
  if (ancho > ventana + 1 && pagina) {
    for (const e of pagina.querySelectorAll('*')) {
      const r = e.getBoundingClientRect();
      // Se ignoran los elementos dentro de un contenedor que se desplaza solo (pestañas, tablas, segmentos).
      let padre = e.parentElement;
      let dentroDeScroll = false;
      while (padre && padre !== pagina) {
        const o = getComputedStyle(padre).overflowX;
        if (o === 'auto' || o === 'scroll' || o === 'hidden') { dentroDeScroll = true; break; }
        padre = padre.parentElement;
      }
      if (!dentroDeScroll && r.width > 0 && r.right > ventana + 1) {
        culpables.push(`${e.tagName.toLowerCase()}${e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 3).join('.') : ''} (llega a ${Math.round(r.right)} px)`);
      }
    }
  }
  return { ventana, ancho, culpables: culpables.slice(-4) };
}

async function main() {
  const navegador = await puppeteer.launch({ executablePath: buscarChrome(), headless: true, args: ['--no-sandbox'] });
  const pagina = await navegador.newPage();
  if (process.env.IDIOMA) {
    // Los textos en inglés tienen otra longitud: conviene revisar los dos idiomas.
    await pagina.evaluateOnNewDocument(i => localStorage.setItem('seguimorbi.idioma', i), process.env.IDIOMA);
  }
  if (CAPTURAS) {
    mkdirSync(CAPTURAS, { recursive: true });
  }
  const fallos = [];
  let revisadas = 0;

  // Login, sin sesión.
  for (const ancho of ANCHOS) {
    await pagina.setViewport({ width: ancho, height: ancho < 600 ? 800 : 900 });
    await pagina.goto(`${APP}/login`, { waitUntil: 'networkidle0' });
    const m = await pagina.evaluate(medir);
    revisadas++;
    if (m.ancho > m.ventana + 1) {
      fallos.push({ pantalla: 'login', vista: ancho, ...m });
    }
  }

  const omitidos = ROLES.filter(r => !r.usuario).length;
  for (const rol of ROLES.filter(r => r.usuario)) {
    const token = await iniciarSesion(rol.usuario, rol.clave);
    const ids = { caso: await primerId(token, 'casos'), paciente: await primerId(token, 'pacientes') };
    await pagina.goto(`${APP}/login`, { waitUntil: 'networkidle0' });
    await pagina.evaluate(t => sessionStorage.setItem('seguimorbi.token', t), token);

    for (const plantilla of rol.rutas) {
      const ruta = plantilla.replace(/:(\w+)/g, (_, k) => ids[k] ?? '0');
      for (const ancho of ANCHOS) {
        await pagina.setViewport({ width: ancho, height: ancho < 600 ? 800 : 900 });
        await pagina.goto(`${APP}/${ruta}`, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 600));
        const m = await pagina.evaluate(medir);
        revisadas++;
        if (CAPTURAS) {
          await pagina.screenshot({ path: join(CAPTURAS, `${rol.usuario}-${ruta.replace(/\//g, '_')}-${ancho}.png`) });
        }
        if (m.ancho > m.ventana + 1) {
          fallos.push({ pantalla: `${ruta} (${rol.usuario})`, vista: ancho, ...m });
        }
      }
    }

    for (const [plantilla, boton] of rol.modales ?? []) {
      const ruta = plantilla.replace(/:(\w+)/g, (_, k) => ids[k] ?? '0');
      for (const ancho of ANCHOS) {
        await pagina.setViewport({ width: ancho, height: ancho < 600 ? 800 : 900 });
        await pagina.goto(`${APP}/${ruta}`, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 600));
        const abierto = await pagina.evaluate(texto => {
          const b = [...document.querySelectorAll('ion-router-outlet > .ion-page:not(.ion-page-hidden) ion-button')]
            .find(x => x.textContent.trim().includes(texto));
          b?.click();
          return !!b;
        }, enIdioma(boton));
        if (!abierto) {
          fallos.push({ pantalla: `${ruta} → «${boton}» (${rol.usuario})`, vista: ancho, ventana: ancho, ancho: 0, culpables: ['no se encontró el botón que abre el formulario'] });
          continue;
        }
        await new Promise(r => setTimeout(r, 900));
        const m = await pagina.evaluate(() => {
          const cuerpo = [...document.querySelectorAll('ion-modal')].pop()?.querySelector('.modal-cuerpo, ion-content');
          const caja = cuerpo?.shadowRoot?.querySelector('.inner-scroll') ?? cuerpo;
          return { ventana: caja?.clientWidth ?? 0, ancho: caja?.scrollWidth ?? 0, culpables: [] };
        });
        revisadas++;
        if (CAPTURAS) {
          await pagina.screenshot({ path: join(CAPTURAS, `${rol.usuario}-${ruta.replace(/\//g, '_')}-modal-${ancho}.png`) });
        }
        if (m.ancho > m.ventana + 1) {
          fallos.push({ pantalla: `${ruta} → formulario «${boton}» (${rol.usuario})`, vista: ancho, ...m });
        }
        await pagina.keyboard.press('Escape');
      }
    }
  }
  await navegador.close();

  if (omitidos) {
    console.log(`Aviso: se ha saltado ${omitidos} rol(es) sin usuario (MEDICO_USUARIO / EPI_USUARIO vacíos).`);
  }
  if (!process.env.ADMIN_PASSWORD) {
    console.log('Aviso: sin ADMIN_PASSWORD no se revisan las pantallas de administración.');
  }
  if (fallos.length) {
    console.error(`\n✗ ${fallos.length} de ${revisadas} pantallas se desbordan a lo ancho:\n`);
    for (const f of fallos) {
      console.error(`  · ${f.pantalla} a ${f.vista} px: el contenido mide ${f.ancho} px`);
      for (const c of f.culpables) {
        console.error(`    - ${c}`);
      }
    }
    console.error('\nVer docs/guia-responsive.md.');
    process.exit(1);
  }
  console.log(`✓ ${revisadas} pantallas revisadas en ${ANCHOS.join(', ')} px: ninguna se desborda.`);
}

main().catch(e => {
  console.error(`✗ ${e.message}`);
  process.exit(2);
});
