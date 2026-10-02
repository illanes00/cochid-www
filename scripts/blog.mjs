import {readFileSync, readdirSync} from 'node:fs';
import {depurarMarkdown, inline, markdownAHtml, notasInternas} from './markdown.mjs';

/* Blog del apex, v1 mínimo (SPEC §4.5 y §6.3): una entrada es un Markdown
   en content/blog/ con front matter. El build valida el front matter, omite
   las notas internas, convierte el cuerpo y genera índice, entradas y RSS 2.0.
   Las notas omitidas se devuelven para que el build las informe. */

const SITIO = 'https://cochid.cl';
const escapar = valor => String(valor).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

export const TIPOS = {
  'datos-nuevos': 'Datos nuevos',
  metodologia: 'Metodología',
  analisis: 'Análisis',
  estudio: 'Estudio',
};

/* Rótulos visibles de las etiquetas, con tildes. Una etiqueta sin rótulo
   detiene el build: nunca se publica un identificador sin acentos. */
export const ROTULOS_ETIQUETAS = {
  accesibilidad: 'accesibilidad',
  deuda: 'deuda',
  dipres: 'DIPRES',
  ejecucion: 'ejecución',
  'empleo-publico': 'empleo público',
  'finanzas-publicas': 'finanzas públicas',
  glosas: 'glosas',
  'ley-de-presupuestos': 'Ley de Presupuestos',
  navegacion: 'navegación',
  presupuesto: 'presupuesto',
  sitio: 'sitio',
  visor: 'visor',
};

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
  'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DIAS_RFC = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MESES_RFC = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const partesFecha = iso => {
  const [anio, mes, dia] = iso.split('-').map(Number);
  return {anio, mes, dia, utc: new Date(Date.UTC(anio, mes - 1, dia))};
};
export const fechaLarga = iso => {
  const {anio, mes, dia} = partesFecha(iso);
  return `${dia} de ${MESES[mes - 1]} de ${anio}`;
};
/* RFC 822 para RSS. La fuente solo trae el día: se publica a medianoche de
   Santiago (UTC-3 en horario de verano), sin inventar una hora. */
export const fechaRfc822 = iso => {
  const {anio, mes, dia, utc} = partesFecha(iso);
  return `${DIAS_RFC[utc.getUTCDay()]}, ${String(dia).padStart(2, '0')} ${MESES_RFC[mes - 1]} ${anio} 00:00:00 -0300`;
};

/* Front matter del blog: `clave: valor`, listas `[a, b]`, `null` y
   comentarios YAML `# …`. Un comentario con una nota [[VERIFICAR]] se omite y
   se informa; el valor queda tal como está escrito antes del comentario. */
function leerFrontmatterBlog(fuente, archivo) {
  const coincidencia = fuente.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!coincidencia) throw new Error(`${archivo}: sin front matter`);
  const meta = {}, notas = [];
  for (const linea of coincidencia[1].split('\n')) {
    if (!linea.trim()) continue;
    const indice = linea.indexOf(':');
    if (indice < 1) throw new Error(`${archivo}: línea de front matter inválida: ${linea}`);
    const clave = linea.slice(0, indice).trim();
    let valor = linea.slice(indice + 1).trim();
    const comentario = valor.match(/\s+#\s(.*)$/);
    if (comentario) {
      for (const nota of notasInternas(comentario[1])) notas.push({...nota, lugar: `front matter, campo ${clave}`});
      if (!notasInternas(comentario[1]).length) notas.push({tipo: 'comentario-yaml', resumen: comentario[1].trim(), lugar: `front matter, campo ${clave}`});
      valor = valor.slice(0, comentario.index).trim();
    }
    if (valor === 'null' || valor === '') meta[clave] = null;
    else if (valor === 'true' || valor === 'false') meta[clave] = valor === 'true';
    else if (valor.startsWith('[') && valor.endsWith(']')) {
      meta[clave] = valor.slice(1, -1).split(',').map(item => item.trim()).filter(Boolean);
    } else meta[clave] = valor;
  }
  return {meta, cuerpo: coincidencia[2], notas};
}

const palabras = texto => texto.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

function validar(meta, cuerpo, archivo, dominios) {
  for (const campo of ['titulo', 'slug', 'fecha', 'autor', 'resumen', 'descripcion', 'ruta', 'tipo', 'etiquetas']) {
    if (meta[campo] === undefined || meta[campo] === null) throw new Error(`${archivo}: falta ${campo}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.fecha) || Number.isNaN(partesFecha(meta.fecha).utc.getTime())) {
    throw new Error(`${archivo}: fecha no ISO: ${meta.fecha}`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.slug)) throw new Error(`${archivo}: slug inválido`);
  if (meta.ruta !== `/blog/${meta.slug}/`) throw new Error(`${archivo}: ruta ${meta.ruta} no corresponde al slug`);
  if (!TIPOS[meta.tipo]) throw new Error(`${archivo}: tipo desconocido ${meta.tipo}`);
  if (meta.dominio !== null && !dominios.some(dominio => dominio.id === meta.dominio)) {
    throw new Error(`${archivo}: dominio ${meta.dominio} no existe en destinos.json`);
  }
  for (const etiqueta of meta.etiquetas) {
    if (!ROTULOS_ETIQUETAS[etiqueta]) throw new Error(`${archivo}: etiqueta sin rótulo: ${etiqueta}`);
  }
  for (const dato of meta.datos || []) {
    if (!/^dataset:[a-z0-9_]+$/.test(dato)) throw new Error(`${archivo}: referencia de datos no reconocida: ${dato}`);
  }
  const texto = `${Object.values(meta).flat().join(' ')}\n${cuerpo}`;
  if (/[–—]/.test(texto)) throw new Error(`${archivo}: contiene guiones largos`);
  if (/\bCIS\b/.test(texto)) throw new Error(`${archivo}: contiene la sigla de la compañía operadora`);
  if (meta.borrador === true) return false;
  return true;
}

/* Bloques del cuerpo: `:::cifras` es una lista de cifras con su rótulo y
   `:::aviso` un recuadro de texto. El resto queda para la segunda iteración. */
function bloqueBlog(tipo, lineas) {
  if (tipo === 'cifras') {
    const items = lineas.map(linea => linea.match(/^\s*-\s+(.+)$/)).filter(Boolean).map(([, texto]) => {
      const cifra = texto.match(/^([\d.,]+)\s+(.+)$/);
      return cifra
        ? `<li><strong class="blog-cifra">${escapar(cifra[1])}</strong> <span>${inline(cifra[2])}</span></li>`
        : `<li><span>${inline(texto)}</span></li>`;
    });
    if (!items.length) throw new Error('Bloque :::cifras vacío');
    return `<ul class="blog-cifras">${items.join('')}</ul>`;
  }
  if (tipo === 'aviso') return `<aside class="blog-aviso"><p>${inline(lineas.join(' ').trim())}</p></aside>`;
  throw new Error(`Bloque ::: ${tipo} no soportado en el blog`);
}

/* Lee y valida todas las entradas. Devuelve las publicables ordenadas por
   fecha descendente; a igual fecha, por título, para que el orden no dependa
   del sistema de archivos. */
export function cargarEntradas(directorio, dominios) {
  const archivos = readdirSync(directorio).filter(nombre => nombre.endsWith('.md')).sort();
  const entradas = [], omisiones = [];
  for (const archivo of archivos) {
    const fuente = readFileSync(new URL(archivo, directorio), 'utf8');
    const {meta, cuerpo, notas} = leerFrontmatterBlog(fuente, archivo);
    if (!validar(meta, cuerpo, archivo, dominios)) continue;
    for (const nota of notas) omisiones.push({archivo: `content/blog/${archivo}`, ...nota});
    for (const nota of notasInternas(cuerpo)) omisiones.push({archivo: `content/blog/${archivo}`, lugar: 'cuerpo', ...nota});
    const limpio = depurarMarkdown(cuerpo, meta.ruta);
    if (/\[\[|<!--/.test(limpio)) throw new Error(`${archivo}: quedó una nota interna sin omitir`);
    const html = markdownAHtml(limpio, {}, {bloque: bloqueBlog});
    const minutos = Math.max(1, Math.ceil(palabras(html) / 200));
    const dominio = meta.dominio ? dominios.find(item => item.id === meta.dominio) : null;
    /* v1 no publica imágenes de portada: las declaradas todavía no existen y
       el build no puede referenciar un archivo ausente (ni en og:image). */
    entradas.push({...meta, archivo, html, minutos, dominioEtiqueta: dominio?.etiqueta || null, imagen: null,
      imagenDeclarada: meta.imagen || null});
  }
  entradas.sort((a, b) => b.fecha.localeCompare(a.fecha) || a.titulo.localeCompare(b.titulo, 'es'));
  return {entradas, omisiones};
}

const etiquetasHtml = entrada => entrada.etiquetas
  .map(etiqueta => `<li class="badge">${escapar(ROTULOS_ETIQUETAS[etiqueta])}</li>`).join('');

/* Línea de metadatos común a índice, entrada y novedades. */
export function metaEntrada(entrada, {autor = false} = {}) {
  const partes = [
    `<span class="blog-tipo">${escapar(TIPOS[entrada.tipo])}</span>`,
    `<time datetime="${entrada.fecha}">${fechaLarga(entrada.fecha)}</time>`,
  ];
  if (autor) partes.push(`<span>${escapar(entrada.autor)}</span>`);
  partes.push(`<span>${entrada.minutos} min de lectura</span>`);
  const dominio = entrada.dominioEtiqueta ? `<p class="blog-dominio">Dominio: ${escapar(entrada.dominioEtiqueta)}</p>` : '';
  return `<p class="blog-meta">${partes.join(' ')}</p>${dominio}`;
}

export function indiceBlog(entradas) {
  const tarjetas = entradas.map(entrada => `<li><article class="blog-tarjeta" aria-labelledby="blog-${entrada.slug}">
<h2 class="blog-tarjeta__titulo" id="blog-${entrada.slug}"><a href="${entrada.ruta}">${escapar(entrada.titulo)}</a></h2>
${metaEntrada(entrada)}
<p>${escapar(entrada.resumen)}</p>
<ul class="blog-etiquetas" aria-label="Etiquetas">${etiquetasHtml(entrada)}</ul>
</article></li>`).join('\n');
  return `<p class="blog-rss"><a class="portal-enlace" href="/blog/feed.xml">Suscribirse por RSS</a> · <a class="portal-enlace" href="/novedades/">Ver todas las novedades</a></p>
<ol class="blog-lista">
${tarjetas}
</ol>`;
}

const enlaceEntrada = entrada => `<a href="${entrada.ruta}">${escapar(entrada.titulo)}</a> <span class="blog-fecha">(<time datetime="${entrada.fecha}">${fechaLarga(entrada.fecha)}</time>)</span>`;

export function cuerpoEntrada(entrada, entradas) {
  const indice = entradas.indexOf(entrada);
  const posterior = indice > 0 ? entradas[indice - 1] : null;
  const anterior = indice < entradas.length - 1 ? entradas[indice + 1] : null;
  /* Relacionadas: misma área temática primero; si no hay dominio, las más
     recientes. Siempre excluye la propia entrada y las de anterior/siguiente. */
  const vecinas = new Set([entrada, anterior, posterior]);
  const candidatas = entradas.filter(item => !vecinas.has(item));
  const relacionadas = [
    ...candidatas.filter(item => entrada.dominio && item.dominio === entrada.dominio),
    ...candidatas.filter(item => !(entrada.dominio && item.dominio === entrada.dominio)),
  ].slice(0, 3);
  const datos = (entrada.datos || []).map(dato => dato.replace(/^dataset:/, ''));
  const url = `${SITIO}${entrada.ruta}`;
  return `<ul class="blog-etiquetas" aria-label="Etiquetas">${etiquetasHtml(entrada)}</ul>
<div class="blog-cuerpo">
${entrada.html}
</div>
${datos.length ? `<section class="blog-seccion" aria-labelledby="datos-entrada"><h2 id="datos-entrada">Datos de esta entrada</h2><ul>${datos.map(id => `<li><a href="https://datos.cochid.cl/dataset/${id}"><code>${escapar(id)}</code></a></li>`).join('')}</ul></section>` : ''}
<section class="blog-seccion" aria-labelledby="como-citar"><h2 id="como-citar">Cómo citar esta entrada</h2><p>${escapar(entrada.autor)} (${entrada.fecha.slice(0, 4)}). ${escapar(entrada.titulo)}. Blog de Compañía Chilena de Inteligencia de Datos, ${fechaLarga(entrada.fecha)}. ${url}</p></section>
<nav class="blog-seccion blog-vecinas" aria-label="Entradas anterior y siguiente">
<h2>Más entradas</h2>
<ul>
${anterior ? `<li>Anterior: ${enlaceEntrada(anterior)}</li>` : ''}
${posterior ? `<li>Siguiente: ${enlaceEntrada(posterior)}</li>` : ''}
</ul>
</nav>
${relacionadas.length ? `<section class="blog-seccion" aria-labelledby="relacionadas"><h2 id="relacionadas">Relacionadas</h2><ul>${relacionadas.map(item => `<li>${enlaceEntrada(item)}</li>`).join('')}</ul></section>` : ''}
<p class="blog-rss"><a class="portal-enlace" href="/blog/">Volver al blog</a> · <a class="portal-enlace" href="/blog/feed.xml">Suscribirse por RSS</a></p>`;
}

/* RSS 2.0 con autodescubrimiento atom:link (recomendado por el validador del
   RSS Advisory Board). lastBuildDate es la fecha de la entrada más reciente,
   no la hora del build, para que el feed sea reproducible. */
export function rss(entradas) {
  const reciente = entradas[0].fecha;
  const items = entradas.map(entrada => {
    const url = `${SITIO}${entrada.ruta}`;
    const categorias = [
      ...(entrada.dominioEtiqueta ? [entrada.dominioEtiqueta] : []),
      ...entrada.etiquetas.map(etiqueta => ROTULOS_ETIQUETAS[etiqueta]),
    ];
    return `    <item>
      <title>${escapar(entrada.titulo)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${fechaRfc822(entrada.fecha)}</pubDate>
      <description>${escapar(entrada.resumen)}</description>
${categorias.map(categoria => `      <category>${escapar(categoria)}</category>`).join('\n')}
    </item>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog de Compañía Chilena de Inteligencia de Datos</title>
    <link>${SITIO}/blog/</link>
    <description>Datos nuevos, métodos y cambios de Compañía Chilena de Inteligencia de Datos, Compañía Chilena de Inteligencia de Datos.</description>
    <language>es-cl</language>
    <lastBuildDate>${fechaRfc822(reciente)}</lastBuildDate>
    <atom:link href="${SITIO}/blog/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}
