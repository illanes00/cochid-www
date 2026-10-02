import {existsSync, lstatSync, readFileSync, readdirSync} from 'node:fs';
import {join} from 'node:path';
import {TIPOS, fechaLarga} from './blog.mjs';

/* Novedades del apex (SPEC §6), instantánea tomada al construir. Solo dos
   fuentes locales y verificables:
   1. las entradas del blog ya validadas;
   2. el campo explícito `novedad` del RELEASE.json de cada release Compañía Chilena de Inteligencia de Datos
      alcanzable como <releases>/cochid-<servicio>/current, leído sin escribir.
   No se leen mensajes de commit, ni la red, ni ninguna API. Un RELEASE.json
   sin `novedad` no produce ítem. */

const escapar = valor => String(valor).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

export const RELEASES = '/srv/projects/releases';

export function novedadesDesdeBlog(entradas) {
  return entradas.map(entrada => ({
    id: `blog-${entrada.slug}`,
    origen: 'blog',
    tipo: TIPOS[entrada.tipo],
    titulo: entrada.titulo,
    resumen: entrada.resumen,
    fecha: entrada.fecha,
    url: entrada.ruta,
    dominio: entrada.dominioEtiqueta,
    fuente: `Blog de Compañía Chilena de Inteligencia de Datos, entrada del ${fechaLarga(entrada.fecha)}`,
  }));
}

/* Fecha de calendario en Santiago de una marca ISO con hora. */
const fechaSantiago = marca => {
  const instante = new Date(marca);
  if (Number.isNaN(instante.getTime())) return null;
  return new Intl.DateTimeFormat('en-CA', {timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit'}).format(instante);
};
const urlPublica = valor => {
  try {
    const url = new URL(valor);
    return url.protocol === 'https:' && (url.hostname === 'cochid.cl' || url.hostname.endsWith('.cochid.cl')) ? url.href : null;
  } catch {
    return null;
  }
};

/* `novedad` admite un texto de una línea o un objeto {texto, fecha?, url?}.
   La fecha sale de la propia novedad o de la marca de creación del
   RELEASE.json; sin fecha verificable el ítem se omite. */
function itemRelease(nombre, release) {
  const novedad = typeof release.novedad === 'string' ? {texto: release.novedad} : release.novedad;
  if (!novedad || typeof novedad !== 'object') return {motivo: 'campo novedad con formato no reconocido'};
  const texto = String(novedad.texto || novedad.titulo || '').trim();
  if (!texto || /\n/.test(texto) || texto.length > 280) return {motivo: 'novedad vacía, de varias líneas o de más de 280 caracteres'};
  if (/\[\[|<!--|<|[–—]|\bCIS\b/.test(texto)) return {motivo: 'novedad con nota interna, marcado, guion largo o sigla prohibida'};
  const marca = novedad.fecha || release.created_at || release.created_at_utc || release.built_at;
  const fecha = marca && (/^\d{4}-\d{2}-\d{2}$/.test(marca) ? marca : fechaSantiago(marca));
  if (!fecha) return {motivo: 'novedad sin fecha verificable'};
  const url = novedad.url ? urlPublica(novedad.url) : null;
  if (novedad.url && !url) return {motivo: 'novedad con enlace fuera de cochid.cl'};
  return {item: {
    id: `release-${nombre}-${fecha}`,
    origen: 'release',
    tipo: 'Publicación',
    titulo: texto,
    resumen: null,
    fecha,
    url,
    dominio: null,
    fuente: `Nota de publicación del ${fechaLarga(fecha)}`,
  }};
}

export function novedadesDesdeReleases(base = RELEASES) {
  const aceptadas = [], omitidas = [];
  if (!existsSync(base)) return {items: [], aceptadas, omitidas: [{release: base, motivo: 'directorio de releases inexistente'}]};
  for (const nombre of readdirSync(base).filter(nombre => nombre.startsWith('cochid-')).sort()) {
    const actual = join(base, nombre, 'current');
    if (!existsSync(actual)) {
      let colgante = false;
      try { colgante = lstatSync(actual).isSymbolicLink(); } catch { /* sin current: no es alcanzable */ }
      if (colgante) omitidas.push({release: nombre, motivo: 'current apunta a un destino inexistente'});
      continue;
    }
    const archivo = join(actual, 'RELEASE.json');
    if (!existsSync(archivo)) { omitidas.push({release: nombre, motivo: 'sin RELEASE.json'}); continue; }
    let release;
    try {
      release = JSON.parse(readFileSync(archivo, 'utf8'));
    } catch {
      omitidas.push({release: nombre, motivo: 'RELEASE.json ilegible'});
      continue;
    }
    if (!release || typeof release !== 'object' || !('novedad' in release)) {
      omitidas.push({release: nombre, motivo: 'RELEASE.json sin campo novedad'});
      continue;
    }
    const {item, motivo} = itemRelease(nombre, release);
    if (item) aceptadas.push({release: nombre, ...item});
    else omitidas.push({release: nombre, motivo});
  }
  return {items: aceptadas.map(({release, ...item}) => item), aceptadas, omitidas};
}

/* Orden: fecha descendente; a igual fecha, el blog antes que las notas de
   publicación y luego por título, para un resultado estable. */
export function unirNovedades(...listas) {
  const orden = {blog: 0, release: 1};
  return listas.flat().sort((a, b) => b.fecha.localeCompare(a.fecha)
    || orden[a.origen] - orden[b.origen] || a.titulo.localeCompare(b.titulo, 'es'));
}

function itemHtml(item, nivel, {resumen}) {
  const meta = [
    `<span class="blog-tipo">${escapar(item.tipo)}</span>`,
    `<time datetime="${item.fecha}">${fechaLarga(item.fecha)}</time>`,
  ].join(' ');
  const dominio = item.dominio ? `<p class="blog-dominio">Dominio: ${escapar(item.dominio)}</p>` : '';
  const titulo = item.url ? `<a href="${escapar(item.url)}">${escapar(item.titulo)}</a>` : escapar(item.titulo);
  return `<li class="novedad" data-novedad-origen="${item.origen}">
<p class="blog-meta">${meta}</p>${dominio}
<h${nivel} class="novedad__titulo">${titulo}</h${nivel}>
${resumen && item.resumen ? `<p>${escapar(item.resumen)}</p>` : ''}
<p class="novedad__fuente">Fuente: ${escapar(item.fuente)}</p>
</li>`;
}

export function paginaNovedades(items) {
  return `<p>Esta lista se genera al publicar el sitio a partir de dos fuentes: las entradas del <a href="/blog/">blog de Compañía Chilena de Inteligencia de Datos</a> y las notas de publicación que cada servicio de Compañía Chilena de Inteligencia de Datos declara en su release. No incluye mensajes internos de desarrollo. Última novedad: <time datetime="${items[0].fecha}">${fechaLarga(items[0].fecha)}</time>.</p>
<ol class="novedades-lista">
${items.map(item => itemHtml(item, 2, {resumen: true})).join('\n')}
</ol>
<p class="blog-rss"><a class="portal-enlace" href="/blog/feed.xml">Suscribirse al blog por RSS</a></p>`;
}

export function loNuevo(items) {
  if (items.length < 3) throw new Error(`«Lo nuevo» necesita tres novedades y hay ${items.length}`);
  return `<section id="lo-nuevo" aria-labelledby="lo-nuevo-titulo">
    <h2 id="lo-nuevo-titulo">Lo nuevo</h2>
    <p class="h2-sub">Las tres novedades más recientes del blog y de las publicaciones de Compañía Chilena de Inteligencia de Datos.</p>
    <ol class="novedades-lista novedades-lista--portada">
${items.slice(0, 3).map(item => itemHtml(item, 3, {resumen: false})).join('\n')}
    </ol>
    <p class="portal-mas"><a class="portal-enlace" href="/novedades/">Ver todas las novedades</a></p>
  </section>`;
}
