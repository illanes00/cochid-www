import test from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync, readFileSync, statSync} from 'node:fs';
import {join} from 'node:path';
import {iconoSvg, iconosDisponibles, nombreIcono} from '../scripts/iconos.mjs';
import {leerTarjetas} from '../scripts/tarjetas.mjs';

const dist = new URL('../dist/', import.meta.url).pathname;
const leer = ruta => readFileSync(join(dist, ruta === '/' ? 'index.html' : `${ruta.slice(1)}index.html`), 'utf8');
const rutas = [
  '/', '/quienes-somos/', '/contacto/', '/servicios/', '/datos/', '/mapas/',
  '/herramientas/', '/investigaciones/', '/documentacion/', '/mapa-del-sitio/',
  '/cambio-de-hora/', '/concepciones/',
];
const archivos = directorio => readdirSync(directorio).flatMap(nombre => {
  const ruta = join(directorio, nombre);
  return statSync(ruta).isDirectory() ? archivos(ruta) : [ruta];
});
const tarjetas = (html, clase = 'portal-tarjetas') => {
  const inicio = html.indexOf(`<ul class="${clase}">`);
  return inicio === -1 ? [] : html.slice(inicio).split('<li class="portal-tarjeta">').slice(1);
};

test('ningún archivo publicado imprime el nombre de un ícono', () => {
  const textos = archivos(dist).filter(ruta => /\.(html|json|xml|txt|css|js|mjs|csv)$/.test(ruta));
  assert.ok(textos.length > 10);
  for (const ruta of textos) {
    assert.doesNotMatch(readFileSync(ruta, 'utf8'), /Ícono:/, `${ruta} imprime «Ícono:»`);
  }
});

test('la cabecera del apex muestra solo el lockup COCHID', () => {
  for (const ruta of rutas) {
    const html = leer(ruta);
    const cabecera = html.match(/<header class="gr-nav"[\s\S]*?<\/header>/);
    assert.ok(cabecera, `${ruta}: falta la cabecera`);
    const marca = cabecera[0].match(/<div class="gr-nav__inner">([\s\S]*?)<button class="gr-nav__toggle"/);
    assert.ok(marca, `${ruta}: falta la zona de marca`);
    assert.equal(marca[1].replace(/<[^>]+>/g, '').trim(), '', `${ruta}: la marca tiene texto visible`);
    assert.equal((marca[1].match(/<a\b/g) || []).length, 1, `${ruta}: la marca debe ser un solo enlace`);
    assert.match(marca[1], /compania-chilena-inteligencia-datos-lockup\.svg/);
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

test('/datos/ publica los diez dominios y enlaza sus sitios temáticos', () => {
  const html = leer('/datos/');
  const lista = tarjetas(html);
  assert.equal(lista.length, 10);
  for (const tarjeta of lista) {
    assert.match(tarjeta, /<span class="portal-tarjeta__icono"><svg [^>]*stroke="currentColor"[^>]*aria-hidden="true" focusable="false"/);
    assert.match(tarjeta, /<h2 class="portal-tarjeta__titulo"><a class="portal-tarjeta__enlace" href="https?:\/\//);
    assert.match(tarjeta, /class="portal-tarjeta__resumen"/);
  }
  for (const [etiqueta, href] of [
    ['Presupuesto', 'https://datos.cochid.cl/presupuesto'],
    ['Cuándo se concibe en Chile', '/concepciones/'],
    ['Economía', 'https://economia.cochid.cl/'],
    ['Elecciones', 'https://elecciones.cochid.cl/'],
    ['Congreso', 'https://congreso.cochid.cl/'],
    ['Lex', 'https://lex.cochid.cl/'],
    ['Transporte', 'https://tpte.cochid.cl/'],
    ['Mapas', 'https://mapas.cochid.cl/'],
    ['Medicamentos', 'https://medicamentos.cochid.cl/'],
  ]) {
    assert.match(html, new RegExp(`Ver también:[\\s\\S]{0,500}href="${href.replaceAll('/', '\\/')}"[^>]*>${etiqueta}<`));
  }
  assert.doesNotMatch(html, /\b(moneda|escudo|personas|urna|balanza|brújula)\b(?![^<]*>)/i);
  assert.match(html, /<ul class="portal-vistas">/);
});

test('la portada agrega seis dominios compactos y enlaza la puerta de datos', () => {
  const html = leer('/');
  const seccion = html.match(/<section id="dominios"[\s\S]*?<\/section>/);
  assert.ok(seccion, 'falta la sección de dominios');
  assert.equal(tarjetas(seccion[0], 'portal-tarjetas portal-tarjetas--compacta').length, 6);
  assert.match(seccion[0], /<a class="portal-enlace" href="\/datos\/">Ver todos los dominios<\/a>/);
  assert.ok(html.indexOf('class="task-grid"') < html.indexOf('id="dominios"'));
  assert.match(html, /<p class="portal-mas"><a class="portal-enlace" href="#proyectos">Ver todos los proyectos y herramientas<\/a><\/p>/);
  assert.equal((html.match(/<svg class="task-icon"[^>]*aria-hidden="true" focusable="false"/g) || []).length, 3);
});

test('el mapa del sitio tiene una sola introducción y etiquetas de tipo', () => {
  const html = leer('/mapa-del-sitio/');
  const cuerpo = html.match(/<main[\s\S]*?<\/main>/)[0];
  assert.equal((cuerpo.match(/Todas las páginas y sitios públicos de COCHID/g) || []).length, 1);
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
