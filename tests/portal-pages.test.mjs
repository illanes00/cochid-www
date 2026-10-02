import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';

const raiz = new URL('../', import.meta.url);
const dist = new URL('../dist/', import.meta.url);
const rutas = [
  '/', '/quienes-somos/', '/contacto/', '/servicios/', '/datos/', '/mapas/',
  '/herramientas/', '/investigaciones/', '/documentacion/', '/mapa-del-sitio/',
  '/asesoria/', '/asesoria/gracias/', '/blog/', '/novedades/',
];
const rutasNavegables = rutas.filter(ruta => ruta !== '/asesoria/gracias/');
const archivoRuta = ruta => ruta === '/'
  ? new URL('index.html', dist)
  : new URL(`${ruta.slice(1)}index.html`, dist);
const leer = ruta => readFileSync(archivoRuta(ruta), 'utf8');

test('publica todas las puertas editoriales con el chrome de familia', () => {
  for (const ruta of rutas) {
    assert.ok(existsSync(archivoRuta(ruta)), `falta ${ruta}`);
    const html = leer(ruta);
    assert.match(html, /<main id="contenido" tabindex="-1"(?: class="[^"]+")?>/);
    assert.match(html, /data-site-header/);
    assert.match(html, /data-footer-owner="cochid"/);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${ruta}: debe tener un h1`);
    assert.doesNotMatch(html, /\[\[VERIFICAR/);
    assert.doesNotMatch(html, /<!--|Nota de implementación|Árbol generado|Precarga:/);
    assert.doesNotMatch(html, /\bCIS\b/);
  }
});

test('publica el formulario propio de asesoría y conserva sus enlaces', () => {
  for (const ruta of rutas) {
    const html = leer(ruta);
    if (ruta !== '/asesoria/gracias/') assert.doesNotMatch(html, /innovacionsantiago\.cl\/contacto\?servicio=/);
  }
  const servicios = leer('/servicios/');
  for (const servicio of ['dato-a-medida', 'descarga-masiva', 'informe', 'mas-cuota']) {
    assert.match(servicios, new RegExp(`href="/asesoria/\\?tipo=${servicio}`));
  }
  const asesoria = leer('/asesoria/');
  assert.match(asesoria, /<form[^>]+method="post"[^>]+action="\/api\/asesoria"/);
  assert.match(asesoria, /name="canal" value="cochid"/);
  assert.match(asesoria, /name="sitio_web"/);
  assert.match(asesoria, /name="nombre"[^>]+required/);
  assert.match(asesoria, /name="email"[^>]+required/);
  assert.match(asesoria, /name="mensaje"[^>]+required/);
  assert.match(asesoria, /Usamos estos datos solo para responderte/);
  assert.doesNotMatch(asesoria, /google-analytics|googletagmanager|recaptcha|turnstile/i);
});

test('mantiene todos los enlaces internos resolubles en dist', () => {
  for (const ruta of rutas) {
    const html = leer(ruta);
    const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(coincidencia => coincidencia[1]));
    for (const coincidencia of html.matchAll(/\bhref="([^"]+)"/g)) {
      const href = coincidencia[1];
      if (href.startsWith('#')) {
        assert.ok(ids.has(href.slice(1)), `${ruta}: no existe ${href}`);
        continue;
      }
      if (!href.startsWith('/')) continue;
      const url = new URL(href, 'https://cochid.cl');
      const destino = url.pathname.endsWith('/')
        ? join(new URL('.', dist).pathname, url.pathname, 'index.html')
        : join(new URL('.', dist).pathname, url.pathname);
      assert.ok(existsSync(destino), `${ruta}: ${href} no resuelve en dist`);
      if (url.hash) {
        const destinoHtml = readFileSync(destino, 'utf8');
        assert.match(destinoHtml, new RegExp(`\\bid="${url.hash.slice(1)}"`), `${ruta}: no existe ${href}`);
      }
    }
  }
});

test('publica el registro y genera desde él el mapa del sitio', () => {
  const rutaRegistro = new URL('destinos.json', dist);
  assert.ok(existsSync(rutaRegistro));
  const registro = JSON.parse(readFileSync(rutaRegistro, 'utf8'));
  assert.ok(registro.destinos.some(destino => destino.id === 'cochid.mapas.ciudad' && destino.ruta === '/ciudad'));
  assert.ok(registro.destinos.filter(destino => destino.grupo === 'fuera')
    .every(destino => Object.values(destino.visible).every(valor => valor === false)));
  const mapa = leer('/mapa-del-sitio/');
  assert.match(mapa, /Verificado el 1 de octubre de 2026/);
  assert.match(mapa, /https:\/\/mapas\.cochid\.cl\/ciudad/);
  assert.match(mapa, /mapas\.cochid\.cl\/ciudad/);
  const grupos = [...mapa.matchAll(/<section><h2>([^<]+)<\/h2>/g)].map(coincidencia => coincidencia[1]);
  assert.deepEqual(grupos, ['Datos', 'Territorio', 'Investigaciones', 'Herramientas', 'Especiales']);
  assert.match(mapa, /Mundial[\s\S]{0,500}Proyecto terminado el 19 de julio de 2026/);
  assert.doesNotMatch(mapa, /Fuera de COCHID/);
  const cuerpo = mapa.match(/<main[\s\S]*?<div class="portal-arbol">([\s\S]*?)<\/div>[\s\S]*?<\/main>/)[1];
  const esperados = {
    Datos: [
      'https://datos.cochid.cl/', 'https://datos.cochid.cl/presupuesto',
      'https://economia.cochid.cl/', 'https://elecciones.cochid.cl/',
      'https://congreso.cochid.cl/', 'https://votos.cochid.cl/', 'https://lex.cochid.cl/',
    ],
    Territorio: [
      'https://mapas.cochid.cl/', 'https://mapas.cochid.cl/ciudad',
      'https://trenes.cochid.cl/', 'https://tpte.cochid.cl/',
      'https://bici.cochid.cl/', 'https://cables.cochid.cl/', 'https://clima.cochid.cl/',
    ],
    Investigaciones: ['https://medicamentos.cochid.cl/', '/concepciones/', '/cambio-de-hora/'],
    Herramientas: [
      'https://graphs.cochid.cl/', 'https://taller.cochid.cl/',
      'https://prosa.medicamentos.cochid.cl/', 'https://scribe.cochid.cl/',
    ],
    Especiales: ['https://mundial.cochid.cl/'],
  };
  const secciones = [...cuerpo.matchAll(/<section><h2>([^<]+)<\/h2>/g)];
  for (const [indice, coincidencia] of secciones.entries()) {
    const fragmento = cuerpo.slice(coincidencia.index, secciones[indice + 1]?.index ?? cuerpo.length);
    const posiciones = esperados[coincidencia[1]].map(href => fragmento.indexOf(`href="${href}"`));
    assert.ok(posiciones.every(posicion => posicion >= 0), `${coincidencia[1]}: falta un destino`);
    assert.deepEqual(posiciones, [...posiciones].sort((a, b) => a - b), `${coincidencia[1]}: orden incorrecto`);
  }
  for (const href of Object.values(esperados).flat()) {
    assert.equal((cuerpo.match(new RegExp(`href="${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g')) || []).length, 1,
      `${href}: debe aparecer una vez`);
  }
  for (const host of ['thesis', 'peru', 'sdr', 'vpn', 'ciudad', 'tiles', 'style', 'medicamentos-staging']) {
    assert.doesNotMatch(cuerpo, new RegExp(`https://${host}\\.cochid\\.cl`));
  }
  assert.ok(existsSync(new URL('sitemap-hosts.xml', dist)));
});

test('la portada enlaza las páginas nuevas y conserva sus anclas públicas', () => {
  const home = leer('/');
  for (const ruta of rutasNavegables.slice(1)) assert.match(home, new RegExp(`href="${ruta}"`));
  assert.match(home, /id="investigaciones"/);
  assert.match(home, /id="proyectos"/);
});

test('sitemap y robots describen la candidata completa', () => {
  const sitemap = readFileSync(new URL('sitemap.xml', dist), 'utf8');
  for (const ruta of rutasNavegables) assert.match(sitemap, new RegExp(`<loc>https://cochid\\.cl${ruta}</loc>`));
  assert.doesNotMatch(sitemap, /asesoria\/gracias/);
  const robots = readFileSync(new URL('robots.txt', dist), 'utf8');
  assert.match(robots, /Allow: \//);
  assert.match(robots, /Sitemap: https:\/\/cochid\.cl\/sitemap\.xml/);
});
