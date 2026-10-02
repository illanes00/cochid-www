import test from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync, readFileSync, statSync} from 'node:fs';
import {join} from 'node:path';
import {iconoSvg, iconosDisponibles, nombreIcono} from '../scripts/iconos.mjs';
import {leerTarjetas} from '../scripts/tarjetas.mjs';

const dist = new URL('../dist/', import.meta.url).pathname;
const leer = ruta => readFileSync(join(dist, ruta === '/' ? 'index.html' : `${ruta.slice(1)}index.html`), 'utf8');
const rutas = [
  '/', '/sobre-nosotros/', '/contacto/', '/servicios/', '/temas/', '/mapas/',
  '/herramientas/', '/investigaciones/', '/documentacion/', '/mapa-del-sitio/',
  '/cambio-de-hora/', '/concepciones/',
];
const archivos = directorio => readdirSync(directorio).flatMap(nombre => {
  const ruta = join(directorio, nombre);
  return statSync(ruta).isDirectory() ? archivos(ruta) : [ruta];
});
const tarjetas = (html, clase = 'portal-tarjetas') => {
  const inicio = html.indexOf(`<ul class="${clase}">`);
  if (inicio === -1) return [];
  const etiquetas = html.slice(inicio).matchAll(/<ul\b[^>]*>|<\/ul>/g);
  let profundidad = 0;
  let fin = -1;
  for (const etiqueta of etiquetas) {
    profundidad += etiqueta[0].startsWith('</') ? -1 : 1;
    if (profundidad === 0) {
      fin = inicio + etiqueta.index + etiqueta[0].length;
      break;
    }
  }
  assert.notEqual(fin, -1, 'lista de tarjetas sin cierre');
  return html.slice(inicio, fin).split('<li class="portal-tarjeta">').slice(1);
};

test('ningún archivo publicado imprime el nombre de un ícono', () => {
  const textos = archivos(dist).filter(ruta => /\.(html|json|xml|txt|css|js|mjs|csv)$/.test(ruta));
  assert.ok(textos.length > 10);
  for (const ruta of textos) {
    assert.doesNotMatch(readFileSync(ruta, 'utf8'), /Ícono:/, `${ruta} imprime «Ícono:»`);
  }
});

test('la cabecera del apex muestra solo el lockup Compañía Chilena de Inteligencia de Datos', () => {
  for (const ruta of rutas) {
    const html = leer(ruta);
    const cabecera = html.match(/<header class="cx-nav"[\s\S]*?<\/header>/);
    assert.ok(cabecera, `${ruta}: falta la cabecera`);
    const marca = cabecera[0].match(/<a class="cx-nav__marca"[\s\S]*?<\/a>/);
    assert.ok(marca, `${ruta}: falta la zona de marca`);
    assert.match(marca[0], /compania-chilena-inteligencia-datos-lockup\.svg/);
    assert.doesNotMatch(cabecera[0], /cochid-producto|>\s*Portal\s*</, `${ruta}: la cabecera nombra un producto`);
  }
});

test('el módulo de íconos rechaza nombres sin SVG y entrega trazo accesible', () => {
  assert.throws(() => nombreIcono('inexistente'), /Ícono sin SVG/);
  assert.equal(nombreIcono('Brújula'), 'brujula');
  for (const nombre of iconosDisponibles) {
    const svg = iconoSvg(nombre);
    assert.match(svg, /stroke="currentColor"/);
    assert.match(svg, /aria-hidden="true"/);
    assert.match(svg, /focusable="false"/);
    assert.doesNotMatch(svg.replace(/<[^>]+>/g, ''), /\S/, `${nombre} imprime texto`);
  }
});

test('el parser de tarjetas usa el ícono como metadato y no como texto', () => {
  const [tarjeta] = leerTarjetas([
    '## Presupuesto y gasto público', 'Ícono: moneda', 'Resumen.',
    'Temas: [Presupuesto público](https://datos.cochid.cl/tema/presupuesto)',
  ]);
  assert.equal(tarjeta.icono, 'moneda');
  assert.equal(tarjeta.resumen, 'Resumen.');
  assert.equal(tarjeta.href, 'https://datos.cochid.cl/tema/presupuesto');
  assert.throws(() => leerTarjetas(['## Sin destino', 'Texto.']), /no tiene destino/);
});

test('/temas/ publica los once dominios y sus páginas', () => {
  const html = leer('/temas/');
  assert.equal((html.match(/<li class="tema">/g) || []).length, 11);
  for (const tema of ['salud', 'educacion', 'economia-trabajo', 'empresas-innovacion',
    'finanzas-publicas', 'seguridad-justicia', 'poblacion-sociedad', 'territorio-vivienda',
    'transporte-infraestructura', 'medio-ambiente-energia', 'politica-instituciones']) {
    assert.match(html, new RegExp(`href="\\.\\.\\/temas\\/${tema}\\/"`), tema);
  }
});

test('la portada muestra cuatro temas y permite desplegar los once', () => {
  const html = leer('/');
  const seccion = html.match(/<section class="sec" id="temas"[\s\S]*?<\/section>/);
  assert.ok(seccion, 'falta la sección de temas');
  assert.equal((seccion[0].match(/<li class="tema">/g) || []).length, 4);
  assert.match(seccion[0], /href="\.\.\/temas\/">Ver los 11 temas/);
});

test('el mapa del sitio tiene una sola introducción y etiquetas de tipo', () => {
  const html = leer('/mapa-del-sitio/');
  const cuerpo = html.match(/<main[\s\S]*?<\/main>/)[0];
  assert.equal((cuerpo.match(/Todas las páginas y sitios públicos de Compañía Chilena de Inteligencia de Datos/g) || []).length, 1);
  const tipos = [...cuerpo.matchAll(/<span class="badge portal-tipo">([^<]+)<\/span>/g)].map(m => m[1]);
  assert.ok(tipos.length > 20);
  for (const tipo of ['Página', 'Producto', 'Vista', 'Herramienta']) assert.ok(tipos.includes(tipo), `falta ${tipo}`);
  assert.doesNotMatch(cuerpo, /<\/a> (Página|Producto|Vista|Herramienta)</);
});

test('mapas, herramientas, investigaciones y servicios usan tarjetas', () => {
  const esperado = {'/mapas/': 7, '/herramientas/': 4, '/investigaciones/': 3, '/servicios/': 3};
  for (const [ruta, total] of Object.entries(esperado)) {
    const html = leer(ruta);
    const cantidad = (html.match(/<li class="portal-tarjeta">/g) || []).length;
    assert.equal(cantidad, total, `${ruta}: ${cantidad} tarjetas`);
    assert.doesNotMatch(html, /Tipo: |Ícono/);
  }
  assert.match(leer('/herramientas/'), /<span class="badge">Requiere cuenta<\/span>/);
  assert.match(leer('/investigaciones/'), /<span class="badge">Cuaderno<\/span>/);
});
