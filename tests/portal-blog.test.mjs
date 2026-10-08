import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {novedadesDesdeReleases} from '../scripts/novedades.mjs';

/* Lee el dist/ que construye `node scripts/build.mjs` antes de las pruebas;
   ninguna prueba lo reconstruye ni lo modifica. */
const raiz = new URL('../', import.meta.url).pathname;
const dist = join(raiz, 'dist');
const leer = ruta => readFileSync(join(dist, ruta), 'utf8');
const pagina = ruta => leer(ruta === '/' ? 'index.html' : `${ruta.slice(1)}index.html`);
const archivos = directorio => readdirSync(directorio, {withFileTypes: true}).flatMap(entrada => {
  const ruta = join(directorio, entrada.name);
  return entrada.isDirectory() ? archivos(ruta) : [ruta];
});
const htmls = archivos(dist).filter(ruta => ruta.endsWith('.html') && !ruta.includes('/assets/chrome-v2/'));
const fuentes = readdirSync(join(raiz, 'content/blog')).filter(nombre => nombre.endsWith('.md')).sort();
const frontmatter = nombre => {
  const bloque = readFileSync(join(raiz, 'content/blog', nombre), 'utf8').match(/^---\n([\s\S]*?)\n---/)[1];
  return Object.fromEntries(bloque.split('\n').map(linea => [linea.slice(0, linea.indexOf(':')).trim(), linea.slice(linea.indexOf(':') + 1).trim()]));
};
const entradas = fuentes.map(frontmatter);
const rutasEntradas = entradas.map(meta => meta.ruta);

test('publica las entradas aprobadas en índice, páginas y RSS, conservando las cinco originales', () => {
  assert.ok(fuentes.length >= 5);
  const directorios = readdirSync(join(dist, 'blog'), {withFileTypes: true}).filter(entrada => entrada.isDirectory()).map(entrada => entrada.name).sort();
  assert.deepEqual(directorios, entradas.map(meta => meta.slug).sort());
  const indice = pagina('/blog/');
  assert.equal((indice.match(/<article class="blog-tarjeta"/g) || []).length, fuentes.length);
  assert.equal((leer('blog/feed.xml').match(/<item>/g) || []).length, fuentes.length);
  /* Índice por fecha descendente. */
  const fechas = [...indice.matchAll(/<article class="blog-tarjeta"[\s\S]*?<time datetime="([\d-]+)"/g)].map(m => m[1]);
  assert.deepEqual(fechas, [...fechas].sort().reverse());
});

test('ningún archivo publicado contiene notas internas ni marcas de verificación', () => {
  const textos = archivos(dist).filter(ruta => /\.(html|xml|json|txt|css|js|mjs|csv|md)$/.test(ruta));
  for (const ruta of textos) {
    const contenido = readFileSync(ruta, 'utf8');
    assert.doesNotMatch(contenido, /VERIFICAR/, ruta);
    if (/\.(html|xml)$/.test(ruta)) assert.doesNotMatch(contenido, /<!--/, ruta);
    for (const nota of ['es provisional', 'entrada transversal sin dominio', 'sitios de la familia que ya usan', 'La imagen de portada está por producir', 'revisar antes de publicar']) {
      assert.ok(!contenido.includes(nota), `${ruta}: publica la nota «${nota}»`);
    }
  }
});

test('no referencia imágenes de portada inexistentes', () => {
  for (const ruta of [...htmls, join(dist, 'blog/feed.xml')]) {
    assert.doesNotMatch(readFileSync(ruta, 'utf8'), /portada\.png/, ruta);
  }
});

test('todos los enlaces internos de dist resuelven', () => {
  for (const archivo of htmls) {
    const html = readFileSync(archivo, 'utf8');
    const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
    for (const [, href] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      if (href.startsWith('#')) {
        assert.ok(ids.has(href.slice(1)), `${archivo}: no existe ${href}`);
        continue;
      }
      if (!href.startsWith('/') || href.startsWith('//')) continue;
      const url = new URL(href, 'https://cochid.cl');
      const destino = url.pathname.endsWith('/') ? join(dist, url.pathname, 'index.html') : join(dist, url.pathname);
      assert.ok(existsSync(destino), `${archivo}: ${href} no resuelve en dist`);
      if (url.hash) assert.match(readFileSync(destino, 'utf8'), new RegExp(`\\bid="${url.hash.slice(1)}"`), `${archivo}: ${href}`);
    }
  }
});

test('cada entrada trae migas, fecha, dominio, etiquetas, cuerpo, relacionadas, vecinas y RSS', () => {
  for (const meta of entradas) {
    const html = pagina(meta.ruta);
    assert.match(html, /<nav class="portal-migas"[\s\S]*href="\/blog\/">Blog<\/a>/, meta.slug);
    assert.match(html, new RegExp(`<time datetime="${meta.fecha}">`), meta.slug);
    assert.match(html, /<ul class="blog-etiquetas"/, meta.slug);
    assert.match(html, /<div class="blog-cuerpo">\s*<p>/, meta.slug);
    assert.match(html, /aria-label="Entradas anterior y siguiente"/, meta.slug);
    assert.match(html, /(Anterior|Siguiente): <a href="\/blog\//, meta.slug);
    assert.match(html, /<h2 id="relacionadas">Relacionadas<\/h2>/, meta.slug);
    assert.match(html, /href="\/blog\/feed\.xml"/, meta.slug);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, meta.slug);
    if (meta.dominio.startsWith('null')) assert.doesNotMatch(html, /Tema:/, meta.slug);
    else assert.match(html, /Tema: Finanzas públicas/, meta.slug);
  }
  assert.match(pagina('/blog/'), /Tema: Finanzas públicas/);
  assert.match(pagina('/blog/'), /class="badge">navegación</);
});

test('la portada muestra exactamente las tres entradas recientes aprobadas', () => {
  const home = pagina('/');
  const bloque = home.match(/<section class="sec" id="publicaciones"[\s\S]*?<\/section>/);
  assert.ok(bloque, 'falta el bloque de publicaciones');
  const blog = bloque[0].slice(bloque[0].indexOf('id="t-blog"'));
  const enlaces = [...blog.matchAll(/<h4><a href="https:\/\/cochid\.cl(\/blog\/[^"]+)"/g)].map(m => m[1]);
  assert.equal(enlaces.length, 3);
  assert.match(blog, /href="https:\/\/cochid\.cl\/blog\/">Ir al blog/);
});

test('el pie v2 enlaza Blog y la barra secundaria enlaza Novedades', () => {
  for (const archivo of htmls.filter(ruta => !ruta.includes('/concepciones/datos/'))) {
    const html = readFileSync(archivo, 'utf8');
    if (!html.includes('data-footer-owner="cochid"')) continue;
    // Birren v2 agrega un ícono decorativo del kit junto al nombre; el destino y la etiqueta siguen siendo obligatorios.
    const textoHtml = html.replace(/<svg\b[^>]*data-kit-icon="[^"]+"[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/svg>/g, '');
    assert.match(textoHtml, /data-nav-id="blog" href="https:\/\/cochid\.cl\/blog\/">Blog<\/a>/, archivo);
    assert.match(html, /href="https:\/\/cochid\.cl\/novedades\/">Novedades<\/a>/, archivo);
  }
  const mapa = pagina('/mapa-del-sitio/');
  assert.match(mapa, /<a href="\/blog\/">Blog<\/a>/);
  assert.match(mapa, /<a href="\/novedades\/">Novedades<\/a>/);
});

test('sitemap con blog, entradas y novedades, y lastmod de cada entrada', () => {
  const sitemap = leer('sitemap.xml');
  for (const ruta of ['/blog/', '/novedades/']) assert.match(sitemap, new RegExp(`<loc>https://cochid\\.cl${ruta}</loc>`));
  assert.doesNotMatch(sitemap, /blog\/feed\.xml/);
  for (const meta of entradas) {
    assert.match(sitemap, new RegExp(`<loc>https://cochid\\.cl${meta.ruta}</loc><lastmod>${meta.actualizado || meta.fecha}</lastmod>`));
  }
  const reciente = entradas.map(meta => meta.actualizado || meta.fecha).sort().at(-1);
  assert.match(sitemap, new RegExp(`<loc>https://cochid\\.cl/blog/</loc><lastmod>${reciente}</lastmod>`));
  assert.doesNotMatch(sitemap, /<loc>https:\/\/cochid\.cl\/(?:datos|quienes-somos)\//);
});

test('la fecha de actualización publicada coincide en el artículo, sus metadatos y el hilo', () => {
  const meta = entradas.find(meta => meta.slug === 'presupuesto-2027-aportes-cambios-nominal-real');
  assert.equal(meta.fecha, '2026-10-05');
  assert.equal(meta.actualizado, '2026-10-08');
  const html = pagina(meta.ruta);
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(m => JSON.parse(m[1])).find(d => d['@type'] === 'BlogPosting');
  assert.equal(ld.datePublished, meta.fecha);
  assert.equal(ld.dateModified, meta.actualizado);
  assert.match(html, /Actualizado el <time datetime="2026-10-08">8 de octubre de 2026<\/time>/);
  assert.match(leer('sitemap.xml'), /<loc>https:\/\/cochid\.cl\/blog\/presupuesto-2027-aportes-cambios-nominal-real\/hilo\/<\/loc><lastmod>2026-10-08<\/lastmod>/);
});

test('robots anuncia ambos sitemaps y el índice enumera sólo sitemaps absolutos', () => {
  const robots = leer('robots.txt');
  assert.match(robots, /Disallow: \/api\//);
  assert.match(robots, /Sitemap: https:\/\/cochid\.cl\/sitemap\.xml/);
  assert.match(robots, /Sitemap: https:\/\/cochid\.cl\/sitemap-hosts\.xml/);
  const index = leer('sitemap-hosts.xml');
  assert.match(index, /<sitemapindex xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  const locations = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  assert.ok(locations.length >= 10);
  assert.ok(locations.every(location => /^https:\/\/[^/]+\/sitemap\.xml$/.test(location)));
  assert.equal(new Set(locations).size, locations.length);
});

test('publica una página 404 propia con kit, logo y enlaces de recuperación', () => {
  const page404 = leer('404.html');
  assert.match(page404, /<meta name="robots" content="noindex">/);
  assert.match(page404, /kit\.innovacionsantiago\.cl\/v10\//);
  assert.match(page404, /assets\/namebrands\/compania-chilena-inteligencia-datos-lockup\.svg/);
  for (const href of ['href="/"', 'href="/datos/"', 'href="/mapas/"', 'href="/contacto/"']) assert.ok(page404.includes(href));
});

test('anuncia el RSS en portada, blog, entradas y novedades', () => {
  const alterno = '<link rel="alternate" type="application/rss+xml" title="Blog de la Compañía Chilena de Inteligencia de Datos" href="https://cochid.cl/blog/feed.xml">';
  for (const ruta of ['/', '/blog/', '/novedades/', ...rutasEntradas]) assert.ok(pagina(ruta).includes(alterno), ruta);
});

test('novedades solo vienen del blog o del campo novedad de releases Compañía Chilena de Inteligencia de Datos', () => {
  const html = pagina('/novedades/');
  const items = [...html.matchAll(/<li class="novedad" data-novedad-origen="([a-z]+)">([\s\S]*?)<\/li>/g)];
  assert.ok(items.length >= 5);
  for (const [, origen, cuerpo] of items) {
    assert.ok(['blog', 'release'].includes(origen), origen);
    assert.match(cuerpo, /<time datetime="\d{4}-\d{2}-\d{2}">/);
    assert.match(cuerpo, /Fuente: /);
  }
  const delBlog = items.filter(([, origen]) => origen === 'blog').map(([, , cuerpo]) => cuerpo.match(/href="([^"]+)"/)[1]).sort();
  assert.deepEqual(delBlog, [...rutasEntradas].sort());
  const fuente = readFileSync(join(raiz, 'scripts/novedades.mjs'), 'utf8');
  for (const prohibido of [/fetch\(/, /child_process/, /git log/, /https?:\/\/(?!cochid)/, /writeFile|mkdir|unlink|rmSync/]) {
    assert.doesNotMatch(fuente.replace(/\/\*[\s\S]*?\*\//g, ''), prohibido);
  }
  assert.doesNotMatch(pagina('/'), /fetch\(/);
});

test('el lector de releases acepta solo el campo novedad y no escribe', () => {
  const base = mkdtempSync(join(tmpdir(), 'cochid-releases-'));
  try {
    const release = (servicio, contenido) => {
      const dir = join(base, servicio, 'r1');
      mkdirSync(dir, {recursive: true});
      if (contenido !== undefined) writeFileSync(join(dir, 'RELEASE.json'), JSON.stringify(contenido));
      symlinkSync(dir, join(base, servicio, 'current'));
    };
    release('cochid-uno', {created_at: '2026-10-01T15:00:00Z', novedad: 'El catálogo agrega un filtro por dominio.'});
    release('cochid-dos', {created_at: '2026-10-01T15:00:00Z', status: 'ok', changes: ['mensaje interno de commit']});
    release('cochid-tres', {novedad: {texto: 'Mapa nuevo', url: 'https://ejemplo.com/', fecha: '2026-09-01'}});
    release('cochid-cuatro', {novedad: 'Sin fecha'});
    release('cochid-cinco');
    release('otro-sitio', {created_at: '2026-10-01T15:00:00Z', novedad: 'No es Compañía Chilena de Inteligencia de Datos'});
    mkdirSync(join(base, 'cochid-seis'));
    symlinkSync(join(base, 'no-existe'), join(base, 'cochid-seis', 'current'));
    const huella = () => archivos(base).filter(ruta => existsSync(ruta)).map(ruta => [ruta, statSync(ruta).mtimeMs, statSync(ruta).size]);
    const antes = huella();
    const resultado = novedadesDesdeReleases(base);
    assert.deepEqual(resultado.items.map(item => [item.titulo, item.fecha, item.origen]), [['El catálogo agrega un filtro por dominio.', '2026-10-01', 'release']]);
    assert.deepEqual(Object.fromEntries(resultado.omitidas.map(item => [item.release, item.motivo])), {
      'cochid-cinco': 'sin RELEASE.json',
      'cochid-cuatro': 'novedad sin fecha verificable',
      'cochid-dos': 'RELEASE.json sin campo novedad',
      'cochid-seis': 'current apunta a un destino inexistente',
      'cochid-tres': 'novedad con enlace fuera de cochid.cl',
    });
    assert.ok(!resultado.items.some(item => /commit|No es Compañía Chilena de Inteligencia de Datos/.test(item.titulo)));
    assert.deepEqual(huella(), antes);
  } finally {
    rmSync(base, {recursive: true, force: true});
  }
});
