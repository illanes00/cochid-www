import {readFile,readdir} from 'node:fs/promises';

/* Páginas de gráficos para redes: /g/<slug>/ por ficha y /g/ como índice.

   Cada ficha (content/graficos/<slug>.json, generada por scripts/graficos/presupuesto.py)
   trae el gráfico ya dibujado, su tabla, la guía de lectura, las fuentes y el texto del post.
   La página es el destino del enlace del post: muestra el gráfico, explica cómo leerlo,
   permite descargar los datos y la imagen, y lleva al visor completo.
   Metadatos: Open Graph y tarjeta grande de X con la imagen de 1200×630, y JSON-LD con
   WebPage, Dataset (con sus descargas), ImageObject y BreadcrumbList. */

const ORIGEN='https://cochid.cl';
const ORG={'@type':'Organization','@id':`${ORIGEN}/#organizacion`,name:'Compañía Chilena de Inteligencia de Datos',url:`${ORIGEN}/`};
const escapar=valor=>String(valor).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const jsonLd=objeto=>`<script type="application/ld+json">${JSON.stringify(objeto).replaceAll('<','\\u003c')}</script>`;

export async function cargarGraficos(directorio){
 let nombres=[];
 try{nombres=(await readdir(directorio)).filter(nombre=>nombre.endsWith('.json')).sort()}catch{return []}
 const fichas=[];
 for(const nombre of nombres){
  const ficha=JSON.parse(await readFile(new URL(nombre,directorio),'utf8'));
  for(const campo of ['slug','titulo','bajada','descripcion','alt','tabla','fuentes','imagenes','descargas','lectura','corte'])
   if(ficha[campo]===undefined)throw new Error(`content/graficos/${nombre} no trae ${campo}`);
  if(`${ficha.slug}.json`!==nombre)throw new Error(`content/graficos/${nombre}: el slug no coincide con el archivo`);
  fichas.push(ficha);
 }
 return fichas;
}

export const rutaGrafico=ficha=>`/g/${ficha.slug}/`;

/* Etiquetas head propias de la ficha: imagen para redes y datos estructurados. */
export function headGrafico(ficha){
 const url=`${ORIGEN}${rutaGrafico(ficha)}`;
 const og=`${ORIGEN}${ficha.imagenes.og}`, x=`${ORIGEN}${ficha.imagenes.x}`;
 const migas=[['Inicio',`${ORIGEN}/`],['Gráficos',`${ORIGEN}/g/`],[ficha.titulo,url]];
 const grafo={'@context':'https://schema.org','@graph':[
  {'@type':'WebPage','@id':url,url,name:ficha.titulo,description:ficha.descripcion,inLanguage:'es-CL',
   isPartOf:{'@type':'WebSite','@id':`${ORIGEN}/#sitio`,name:'Compañía Chilena de Inteligencia de Datos',url:`${ORIGEN}/`},
   primaryImageOfPage:{'@id':`${url}#imagen`},breadcrumb:{'@id':`${url}#migas`},publisher:ORG,
   datePublished:ficha.corte,dateModified:ficha.corte,mainEntity:{'@id':`${url}#datos`}},
  {'@type':'ImageObject','@id':`${url}#imagen`,contentUrl:x,url:x,width:1200,height:675,caption:ficha.alt,
   creditText:'Compañía Chilena de Inteligencia de Datos',creator:ORG,copyrightNotice:'Cita a la Compañía Chilena de Inteligencia de Datos y a la fuente original.'},
  {'@type':'Dataset','@id':`${url}#datos`,name:ficha.titulo,description:ficha.descripcion,url,inLanguage:'es-CL',
   creator:ORG,publisher:ORG,dateModified:ficha.corte,spatialCoverage:{'@type':'Place',name:'Chile'},
   temporalCoverage:'2026/2027',isAccessibleForFree:true,
   keywords:['presupuesto público','Chile','Ley de Presupuestos 2027','aporte fiscal'],
   isBasedOn:ficha.fuentes.map(fuente=>fuente.url),
   distribution:[
    {'@type':'DataDownload',encodingFormat:'text/csv',contentUrl:`${ORIGEN}${ficha.descargas.csv}`},
    {'@type':'DataDownload',encodingFormat:'image/jpeg',contentUrl:x}
   ],
   measurementTechnique:ficha.metodo||undefined},
  {'@type':'BreadcrumbList','@id':`${url}#migas`,itemListElement:migas.map(([name,item],i)=>({'@type':'ListItem',position:i+1,name,item}))}
 ]};
 return [
  `<meta property="og:image" content="${escapar(og)}">`,
  '<meta property="og:image:width" content="1200">','<meta property="og:image:height" content="630">',
  `<meta property="og:image:alt" content="${escapar(ficha.alt)}">`,
  '<meta property="og:locale" content="es_CL">',
  '<meta name="twitter:card" content="summary_large_image">',
  `<meta name="twitter:title" content="${escapar(ficha.titulo)}">`,
  `<meta name="twitter:description" content="${escapar(ficha.descripcion)}">`,
  `<meta name="twitter:image" content="${escapar(x)}">`,
  `<meta name="twitter:image:alt" content="${escapar(ficha.alt)}">`,
  jsonLd(grafo)
 ].join('\n');
}

function tabla(ficha){
 const {columnas,filas}=ficha.tabla;
 return `<div class="portal-tabla" role="region" tabindex="0" aria-label="Cifras del gráfico"><table><thead><tr>${columnas.map(c=>`<th scope="col">${escapar(c)}</th>`).join('')}</tr></thead><tbody>${filas.map(fila=>`<tr>${fila.map((celda,i)=>i===0?`<th scope="row">${escapar(celda)}</th>`:`<td>${escapar(celda)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function compartir(ficha){
 const url=`${ORIGEN}${rutaGrafico(ficha)}`;
 const texto=encodeURIComponent(ficha.titulo);
 const enlaces=[
  ['X',`https://x.com/intent/post?text=${texto}&url=${encodeURIComponent(url)}`],
  ['WhatsApp',`https://wa.me/?text=${encodeURIComponent(`${ficha.titulo} ${url}`)}`],
  ['LinkedIn',`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`],
  ['Facebook',`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`]
 ];
 return `<ul class="g-compartir">${enlaces.map(([red,href])=>`<li><a href="${escapar(href)}" rel="noopener" target="_blank">Compartir en ${red}</a></li>`).join('')}<li><button type="button" class="btn" data-copiar-enlace="${escapar(url)}">Copiar enlace</button></li></ul><p class="g-estado" role="status" aria-live="polite"></p>`;
}

export function cuerpoGrafico(ficha,todas){
 const relacionadas=todas.filter(otra=>otra.slug!==ficha.slug&&otra.serie===ficha.serie)
  .sort((a,b)=>(b.partida?0:1)-(a.partida?0:1)).slice(0,4);
 const cita=`Compañía Chilena de Inteligencia de Datos (${ficha.corte.slice(0,4)}). ${ficha.titulo}. ${ORIGEN}${rutaGrafico(ficha)}. Con datos de ${ficha.fuentes.map(f=>f.etiqueta.split(' (')[0]).join(' y ')}.`;
 return [
  `<figure class="g-figura"><picture><source media="(max-width: 40rem)" srcset="${escapar(ficha.imagenes.vertical)}" width="1080" height="1350"><img src="${escapar(ficha.imagenes.x)}" alt="${escapar(ficha.alt)}" width="1200" height="675" decoding="async" fetchpriority="high"></picture><figcaption>${escapar(ficha.fuente_corta)}.</figcaption></figure>`,
  compartir(ficha),
  '<h2 id="como-leer">Cómo leer este gráfico</h2>',
  `<ul>${ficha.lectura.map(texto=>`<li>${escapar(texto)}</li>`).join('')}</ul>`,
  '<h2 id="cifras">Las cifras</h2>',
  tabla(ficha),
  '<h2 id="descargar">Descargar</h2>',
  `<ul class="g-descargas"><li><a href="${escapar(ficha.descargas.csv)}" download>Datos del gráfico (CSV)</a></li><li><a href="${escapar(ficha.imagenes.x)}" download="${escapar(ficha.slug)}.jpg">Imagen horizontal (JPG, 1200×675)</a></li><li><a href="${escapar(ficha.imagenes.vertical)}" download="${escapar(ficha.slug)}-vertical.jpg">Imagen vertical para Instagram (JPG, 1080×1350)</a></li></ul>`,
  `<p>Puedes usar estos datos y gráficos citando así:</p><blockquote class="g-cita"><p>${escapar(cita)}</p></blockquote>`,
  '<h2 id="fuentes">De dónde salen los datos</h2>',
  `<ul>${ficha.fuentes.map(f=>`<li><a href="${escapar(f.url)}">${escapar(f.etiqueta)}</a></li>`).join('')}</ul>`,
  ficha.metodo?`<p>${escapar(ficha.metodo)} Corte: <time datetime="${escapar(ficha.corte)}">${escapar(ficha.corte_texto)}</time>.</p>`:'',
  '<h2 id="explorar">Sigue explorando</h2>',
  `<ul>${ficha.explorar.map(e=>`<li><a href="${escapar(e.url)}">${escapar(e.etiqueta)}</a></li>`).join('')}</ul>`,
  relacionadas.length?`<h3>Otros gráficos del presupuesto 2027</h3><ul class="g-relacionados">${relacionadas.map(r=>`<li><a href="${rutaGrafico(r)}"><img src="${escapar(r.imagenes.x)}" alt="" width="1200" height="675" loading="lazy" decoding="async"><span>${escapar(r.titulo)}</span></a></li>`).join('')}</ul><p><a href="/g/">Ver todos los gráficos</a></p>`:'',
  scriptCopiar
 ].join('\n');
}

export function indiceGraficos(fichas){
 const generales=fichas.filter(f=>!f.partida), porInstitucion=fichas.filter(f=>f.partida);
 const tarjeta=f=>`<li><a href="${rutaGrafico(f)}"><img src="${escapar(f.imagenes.x)}" alt="" width="1200" height="675" loading="lazy" decoding="async"><span>${escapar(f.titulo)}</span></a></li>`;
 return [
  '<p>Cada gráfico explica una cifra del presupuesto público con su fuente, sus datos descargables y una guía para leerlo. Puedes compartirlo o usarlo citando la fuente.</p>',
  '<h2 id="presupuesto-2027">Proyecto de presupuesto 2027</h2>',
  `<ul class="g-relacionados">${generales.map(tarjeta).join('')}</ul>`,
  porInstitucion.length?`<h2 id="por-institucion">Por institución</h2><p>Qué recibiría cada ministerio o institución del Tesoro Público en el proyecto 2027, frente a la ley 2026.</p><ul class="g-lista">${porInstitucion.map(f=>`<li><a href="${rutaGrafico(f)}">${escapar(f.institucion)}</a> <span>${escapar(f.titulo.split(': ').slice(1).join(': '))}</span></li>`).join('')}</ul>`:''
 ].join('\n');
}

const scriptCopiar='<script>document.querySelectorAll("[data-copiar-enlace]").forEach(b=>b.addEventListener("click",async()=>{const e=document.querySelector(".g-estado");try{await navigator.clipboard.writeText(b.dataset.copiarEnlace);e.textContent="Enlace copiado."}catch{e.textContent="No se pudo copiar. Selecciona la dirección en la barra del navegador."}}))</script>';
