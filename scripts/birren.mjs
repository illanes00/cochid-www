/* BW-37: composición estática con los tokens, componentes e íconos del kit .46.
   El snapshot aprobado y la identidad congelada tienen procedencia en vendor/birren-v2. */
import {readFileSync} from 'node:fs';

const leer = nombre => JSON.parse(readFileSync(new URL(`../vendor/birren-v2/${nombre}`, import.meta.url), 'utf8'));
const iconos = leer('icons.json');
const secciones = Object.fromEntries(leer('secciones-portal.json').map(seccion => [seccion.slug, seccion]));
const procedencia = leer('provenance.json');
const escapar = valor => String(valor).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');

export function iconoKit(nombre, {tamano = 20, clase = 'ico ui-kit-icon'} = {}) {
  if (!Object.hasOwn(iconos, nombre)) throw new Error(`Ícono ausente del kit .46: ${nombre}`);
  const nodos = iconos[nombre].map(([tag, atributos]) => `<${tag} ${Object.entries(atributos).map(([k,v]) => `${k}="${escapar(v)}"`).join(' ')}/>`).join('');
  return `<svg class="${escapar(clase)}" data-kit-icon="${nombre}" width="${tamano}" height="${tamano}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${nodos}</svg>`;
}

export const familiaDeSeccion = seccion => seccion.familia.startsWith('--fam-') ? seccion.familia.slice(6) : null;
const familia = familiaDeSeccion;
export function seccionDeEnlace(href) {
  const url = new URL(href, 'https://cochid.cl/');
  if (url.hostname !== 'cochid.cl') return secciones[url.hostname.split('.')[0]] || secciones.herramientas;
  const ruta = url.pathname;
  if (ruta.startsWith('/temas/')) return secciones[ruta.split('/')[2]] || secciones.datos;
  const slug = ruta.split('/')[1];
  return secciones[slug === 'sobre-nosotros' || slug === 'quienes-somos' ? 'sobre' : slug === 'cambio-de-hora' ? 'cambio-hora' : slug] || secciones.metodologia;
}

export function leyendaDePared(ambiente) {
  const textos = {
    acogida: 'Durazno portada: estás conociendo el sitio.',
    datos: 'Azul datos: estás consultando cifras.',
    lectura: 'Gris cálido: estás leyendo un estudio o una nota.',
    trabajo: 'Verde trabajo: estás usando una herramienta.',
    servicio: 'Gris servicio: estás buscando ayuda o información práctica.',
  };
  const ambientes = ambiente ? [ambiente] : ['acogida', 'datos'];
  const entradas = ambientes.map(nombre => {
    if (!Object.hasOwn(textos, nombre)) throw new Error(`Ambiente desconocido: ${nombre}`);
    return `<li><span class="ui-wall-legend__swatch" data-environment="${nombre}" aria-hidden="true"></span>${textos[nombre]}</li>`;
  }).join('');
  return `<div class="portal-leyenda wrap"><div class="ui-wall-legend" tabindex="0" aria-label="Ambientes del portal"><ul>${entradas}</ul></div></div>`;
}
export function ambienteDePagina(ruta) {
  if (['/', '/sobre-nosotros/', '/quienes-somos/', '/proyectos/'].includes(ruta)) return 'acogida';
  if (ruta === '/g/para-x/' || ruta === '/herramientas/' || ruta.endsWith('/hilo/')) return 'trabajo';
  if (ruta.startsWith('/temas/') || ['/datos/', '/mapas/', '/mapa-del-sitio/', '/g/'].includes(ruta)) return 'datos';
  if (['/investigaciones/', '/concepciones/', '/cambio-de-hora/', '/documentacion/', '/novedades/'].includes(ruta) || ruta.startsWith('/blog/') || ruta.startsWith('/g/')) return 'lectura';
  return 'servicio';
}

export function aplicarAmbiente(html, ruta) {
  return html.replace(/<html\b([^>]*)>/, (_, atributos) => `<html${atributos.replace(/\sdata-brand="[^"]*"/g, '')} data-brand="cochid">`)
    .replace(/<body\b([^>]*)>/, (_, atributos) => `<body${atributos.replace(/\sdata-environment="[^"]*"/g, '')} data-environment="${ambienteDePagina(ruta)}">`);
}

export function aplicarBirren(html, ruta, kitHead) {
  html = aplicarAmbiente(html, ruta);
  html = html.replace(/<div class="portal-leyenda wrap">[\s\S]*?<\/ul><\/div><\/div>/,
    leyendaDePared(ruta === '/' ? undefined : ambienteDePagina(ruta)));
  // Todos los documentos, incluidos los especiales y redirects, reciben el mismo pin con SRI.
  html = html.replace(/<(?:link|script)\b[^>]*(?:https:\/\/kit\.innovacionsantiago\.cl\/v10\/[a-f0-9]{64}\/(?:style\.css|theme\.js|chrome\.js)|\/assets\/portal\.css)[^>]*>(?:<\/script>)?\s*/g, '');
  html = html.replace(/<link\b[^>]*rel="icon"[^>]*>\s*/g, '');
  html = html.replace(/(<meta\b[^>]*charset="[^"]+"[^>]*>)/, '$1\n'+kitHead);
  for (const [archivo, fuente] of Object.entries(procedencia.frozen_identity)) html = html.replaceAll(fuente.source_url, '/'+archivo);
  html = html.replace(/<li class="tema"><span class="tema__ico">[\s\S]*?<\/span>([\s\S]*?<a href="[^"]*\/temas\/([a-z-]+)\/">)/g, (_, despues, slug) => {
    const seccion = secciones[slug];
    if (!seccion || !familia(seccion)) throw new Error(`Tema sin familia aprobada: ${slug}`);
    return `<li class="tema"><span class="tema__ico" data-family="${familia(seccion)}">${iconoKit(seccion.icono, {tamano:24})}</span>${despues}`;
  });
  const tema = ruta.startsWith('/temas/') ? secciones[ruta.split('/')[2]] : null;
  if (tema) {
    html = html.replace(/<span class="pt__ico">[\s\S]*?<\/span>/, `<span class="pt__ico ui-family-square" data-family="${familia(tema)}">${iconoKit(tema.icono, {tamano:28})}</span>`);
    html = html.replace(/<span class="sub__ico">[\s\S]*?<\/span>/g, `<span class="sub__ico" data-family="${familia(tema)}">${iconoKit(tema.icono)}</span>`);
  }
  const iconoPagina = tema?.icono || (ruta.startsWith('/g/') ? 'bar-chart-3' : seccionDeEnlace(ruta).icono);
  // El tema ya tiene su cuadrado de encabezado, las demás áreas tienen un ícono neutro junto al nombre.
  if (!tema) {
    const familiaPagina = familia(seccionDeEnlace(ruta));
    const icono = iconoKit(iconoPagina, {tamano:28, clase:'ico portal-titulo-icono ui-kit-icon'});
    const marca = familiaPagina ? `<span class="ui-family-square portal-titulo-icono" data-family="${familiaPagina}">${iconoKit(iconoPagina, {tamano:28})}</span>` : icono;
    html = html.replace(/(<h1\b[^>]*>)/, '$1'+marca);
  }
  const titulos = {'t-temas':'database','t-mapa':'map','t-pub':'book-open','t-proy':'folder-kanban','t-qs':'info','t-inv':'book-open','t-blog':'file-text'};
  html = html.replace(/(<h[23]\b[^>]*id="([^"]+)"[^>]*>)/g, (abrir, _, id) => titulos[id] ? abrir+iconoKit(titulos[id], {tamano:24, clase:'ico portal-titulo-icono ui-kit-icon'}) : abrir);
  html = html.replace(/(<li class="grupo">)<svg\b[\s\S]*?<\/svg>([\s\S]*?<a href="([^"]+)">)/g, (_, abrir, contenido, href) => abrir+iconoKit(seccionDeEnlace(href).icono, {tamano:28})+contenido);
  // Señal con palabra e ícono; el texto factual de cada aviso permanece intacto.
  html = html.replace(/<(p|aside) class="(g-aviso|blog-aviso|aviso|notice)">([\s\S]*?)<\/\1>/g, (_, tag, clase, contenido) => {
    const estado = ['g-aviso','aviso'].includes(clase) ? 'caution' : 'info';
    const titulo = estado === 'caution' ? 'Precaución' : 'Información';
    return `<aside class="${clase} ui-state-notice" data-state="${estado}">${iconoKit(estado === 'caution' ? 'triangle-alert' : 'info')}<div><strong class="ui-state-notice__title" data-birren-added="state-title">${titulo}</strong><div class="ui-state-notice__body">${contenido}</div></div></aside>`;
  });
  return html;
}
