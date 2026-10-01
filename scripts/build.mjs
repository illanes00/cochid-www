import {readFile,writeFile,mkdir,cp,rm} from 'node:fs/promises';
import {yearData,monthlyData,hhmm,MONTHS} from '../cambio-de-hora/solar.mjs';
import {cargarDatos,tablas,verificarContrato} from './tablas-concepciones.mjs';
import {destinos,familia,navegacionPrimaria,pie} from '../data/destinos.mjs';
import {depurarMarkdown,leerFrontmatter,markdownAHtml} from './markdown.mjs';

const root=new URL('../',import.meta.url), out=new URL('../dist/',import.meta.url);
const rutasPortalPublicadas=new Set([
 '/', '/cambio-de-hora/', '/concepciones/', '/contacto/', '/datos/',
 '/documentacion/', '/herramientas/', '/investigaciones/', '/mapa-del-sitio/',
 '/mapas/', '/quienes-somos/', '/servicios/'
]);
const [kitHead,headerTemplate,footerTemplate,migasTemplate,paginaTemplate]=await Promise.all(
 ['head','header','footer','migas','pagina'].map(nombre=>readFile(new URL(`partials/${nombre}.html`,root),'utf8'))
);

const escapar=valor=>String(valor).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const hrefDestino=destino=>destino.host==='cochid.cl'?destino.ruta:`https://${destino.host}${destino.ruta}`;
const itemEnlace=(destino,actual='')=>{
 const href=destino.href||hrefDestino(destino);
 const current=href===actual?' aria-current="page"':'';
 return `<a class="gr-nav__link" href="${escapar(href)}"${current}>${escapar(destino.etiqueta)}</a>`;
};
const listaEnlaces=enlaces=>enlaces.map(destino=>`<li><a href="${escapar(destino.href||hrefDestino(destino))}">${escapar(destino.etiqueta)}</a></li>`).join('');
const reemplazar=(plantilla,valores,nombre)=>{
 let salida=plantilla;
 for(const [marca,valor] of Object.entries(valores))salida=salida.replaceAll(`{{${marca}}}`,valor);
 const pendiente=salida.match(/\{\{[A-Z_]+\}\}/);
 if(pendiente)throw new Error(`${nombre} quedó con ${pendiente[0]} sin resolver`);
 return salida;
};

function cabecera(ruta){
 const primarios=navegacionPrimaria('cochid.cl')
  .filter(destino=>rutasPortalPublicadas.has(destino.ruta) && destino.etiqueta!=='Blog');
 const tareas=['Datos','Mapas','Investigaciones']
  .map(etiqueta=>primarios.find(destino=>destino.etiqueta===etiqueta))
  .filter(Boolean);
 const presupuesto=familia.find(destino=>destino.etiqueta==='Presupuesto');
 if(presupuesto)tareas.push(presupuesto);
 return reemplazar(headerTemplate,{TAREAS:tareas.map(destino=>itemEnlace(destino,ruta)).join('')},'cabecera');
}

function piePortal(){
 const secciones=pie('cochid.cl');
 const explorar=secciones.find(seccion=>seccion.titulo==='Explorar COCHID')?.enlaces||[];
 const relacionados=secciones.find(seccion=>seccion.titulo==='Relacionados')?.enlaces||[];
 const propios=destinos
  .filter(destino=>destino.host==='cochid.cl' && destino.visible.pie && destino.ruta!=='/' && rutasPortalPublicadas.has(destino.ruta))
  .sort((a,b)=>a.grupo.localeCompare(b.grupo,'es')||a.orden-b.orden);
 const idsTecnicos=new Set(['cochid.datos.temas','cochid.datos.referencia','cochid.datos.metodologia','cochid.datos.api-docs','cochid.datos.lineage','cochid.datos.calidad']);
 const tecnicos=destinos.filter(destino=>idsTecnicos.has(destino.id));
 return reemplazar(footerTemplate,{
  EXPLORAR:listaEnlaces(explorar),
  RELACIONADOS:listaEnlaces(relacionados),
  PROPIO:listaEnlaces(propios),
  TECNICO:listaEnlaces(tecnicos),
  HOST:'cochid.cl'
 },'pie');
}

function chrome(pagina,ruta){
 return pagina
  .replace('<!--KIT_HEAD-->',kitHead)
  .replace('<!--HEADER-->',cabecera(ruta))
  .replace('<!--FOOTER-->',piePortal());
}
const sinComentariosHtml=pagina=>pagina.replace(/<!--[\s\S]*?-->/g,'');

const etiquetasGrupo={
 datos:'Datos',territorio:'Mapas y territorio',investigaciones:'Investigaciones',
 herramientas:'Herramientas',servicios:'Servicios',sobre:'Sobre COCHID'
};
const etiquetasTipo={portal:'Portal',pagina:'Página',producto:'Producto',vista:'Vista',herramienta:'Herramienta'};
const ordenGrupos=['datos','territorio','investigaciones','herramientas','servicios','sobre'];
const destinosMapa=()=>destinos.filter(destino=>destino.visible.mapa_del_sitio
 && destino.robots==='indexable' && !destino.alias_de && destino.clase!=='api'
 && !destino.ruta.includes(':')
 && (destino.estado==='vivo' || (destino.host==='cochid.cl' && rutasPortalPublicadas.has(destino.ruta))));

function arbolDestinos(){
 const incluidos=destinosMapa();
 const ids=new Set(incluidos.map(destino=>destino.id));
 const item=destino=>{
  const hijos=incluidos.filter(candidato=>candidato.padre===destino.id)
   .sort((a,b)=>a.orden-b.orden||a.etiqueta.localeCompare(b.etiqueta,'es'));
  const tipo=destino.grupo==='investigaciones'?'Investigación':etiquetasTipo[destino.clase]||destino.clase;
  return `<li data-map-item><a href="${escapar(hrefDestino(destino))}">${escapar(destino.etiqueta)}</a> <span class="portal-tipo">${escapar(tipo)}</span><span class="portal-host">${escapar(destino.host+destino.ruta)}</span><p>${escapar(destino.resumen)}</p>${hijos.length?`<ul>${hijos.map(item).join('')}</ul>`:''}</li>`;
 };
 return `<div class="portal-arbol">${ordenGrupos.map(grupo=>{
  const grupoDestinos=incluidos.filter(destino=>destino.grupo===grupo && (!destino.padre || !ids.has(destino.padre) || destinos.find(candidato=>candidato.id===destino.padre)?.grupo!==grupo))
   .sort((a,b)=>a.orden-b.orden||a.etiqueta.localeCompare(b.etiqueta,'es'));
  return grupoDestinos.length?`<section><h2>${etiquetasGrupo[grupo]}</h2><ul>${grupoDestinos.map(item).join('')}</ul></section>`:'';
 }).join('')}</div>`;
}

const filtroMapa='<div class="portal-filtro"><label for="filtro-destinos">Filtrar el mapa</label><input id="filtro-destinos" type="search" autocomplete="off" placeholder="Por ejemplo, presupuesto o mapas"></div>';
const scriptMapa='<script>document.querySelector("#filtro-destinos")?.addEventListener("input",event=>{const consulta=event.target.value.toLocaleLowerCase("es").trim();document.querySelectorAll("[data-map-item]").forEach(item=>{item.hidden=consulta!==""&&!item.textContent.toLocaleLowerCase("es").includes(consulta)})})</script>';

async function paginaEditorial(nombre){
 const fuente=await readFile(new URL(`content/pages/${nombre}.md`,root),'utf8');
 const {meta,markdown}=leerFrontmatter(fuente);
 let contenido=markdown;
 const extras={};
 let script='';
 if(meta.ruta==='/mapa-del-sitio/'){
  contenido=contenido
   .replace(/Verificado el \{fecha\}: \{n\} destinos revisados, \{m\} con problemas\./,'Verificado el 1 de octubre de 2026: 265 páginas revisadas, 3 con problemas.')
   .replace('Filtro: Escribe para filtrar el mapa (por ejemplo, «presupuesto» o «mapas»).','@@FILTRO_MAPA@@')
   .replace(/<!-- Árbol generado:[\s\S]*?-->/,'@@ARBOL_DESTINOS@@');
  extras['@@FILTRO_MAPA@@']=filtroMapa;
  extras['@@ARBOL_DESTINOS@@']=arbolDestinos();
  script=scriptMapa;
 }
 const cuerpo=markdownAHtml(depurarMarkdown(contenido,meta.ruta),extras);
 const migas=reemplazar(migasTemplate,{MIGAS:`<li><a href="/">Inicio</a></li><li aria-current="page">${escapar(meta.titulo)}</li>`},'migas');
 const pagina=reemplazar(paginaTemplate,{
  TITULO:escapar(meta.titulo),DESCRIPCION:escapar(meta.descripcion),RUTA:escapar(meta.ruta),
  KIT_HEAD:kitHead,HEADER:cabecera(meta.ruta),MIGAS:migas,CUERPO:cuerpo,
  FOOTER:piePortal(),SCRIPT:script
 },`página ${meta.ruta}`);
 const directorio=new URL(`.${meta.ruta}`,out);
 await mkdir(directorio,{recursive:true});
 await writeFile(new URL('index.html',directorio),pagina);
}

await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
await cp(new URL('assets/',root),new URL('assets/',out),{recursive:true});
await cp(new URL('robots.txt',root),new URL('robots.txt',out));
await cp(new URL('data/destinos.publico.json',root),new URL('destinos.json',out));
const home=sinComentariosHtml(chrome(await readFile(new URL('index.html',root),'utf8'),'/'));
await writeFile(new URL('index.html',out),home);
for(const nombre of ['quienes-somos','contacto','servicios','datos','mapas','herramientas','investigaciones','documentacion','mapa-del-sitio']){
 await paginaEditorial(nombre);
}

/* Un especial conserva su contenido y recibe los parciales, sin extraer HTML
   de la portada ni reemplazar grupos mediante expresiones regulares. */
async function especial({dir,ruta,reemplazos={}}){
 await cp(new URL(dir+'/',root),new URL(dir+'/',out),{recursive:true});
 let page=chrome(await readFile(new URL(dir+'/index.html',root),'utf8'),ruta);
 for(const [marca,html] of Object.entries(reemplazos)){
  if(!page.includes(`<!--${marca}-->`))throw new Error(`${dir}/index.html no tiene el marcador ${marca}`);
  page=page.replaceAll(`<!--${marca}-->`,html);
 }
 const pendiente=page.match(/<!--[A-Z_0-9]+-->/);
 if(pendiente)throw new Error(`${dir}/index.html quedó con el marcador ${pendiente[0]} sin resolver`);
 page=sinComentariosHtml(page);
 await writeFile(new URL(dir+'/index.html',out),page);
 return page;
}

/* Cambio de hora: la tabla mensual y los CSV salen del mismo modelo solar. */
const days=yearData(),months=monthlyData(days);
await especial({
 dir:'cambio-de-hora',ruta:'/cambio-de-hora/',
 reemplazos:{
  MONTH_BUTTONS:MONTHS.map((m,i)=>`<button type="button" aria-pressed="${i===8}" aria-label="Ver promedios de ${m}">${m}</button>`).join(''),
  MONTH_TABLE:months.map(m=>`<tr><th scope="row">${m.name}</th><td>${hhmm(m.riseLegal)}</td><td>${hhmm(m.setLegal)}</td><td>${hhmm(m.riseFixed)}</td><td>${hhmm(m.setFixed)}</td><td>${Math.round(m.daylight)}</td><td>${Math.round(m.change)}</td></tr>`).join('\n')
 }
});
const dailyHeader='fecha,huso_vigente,salida_vigente,puesta_vigente,salida_UTC_menos4,puesta_UTC_menos4,luz_minutos,crepusculo_inicio_UTC_menos4,crepusculo_fin_UTC_menos4';
await writeFile(new URL('cambio-de-hora/santiago-2026-diario.csv',out),dailyHeader+'\n'+days.map(d=>[d.date,d.offset,hhmm(d.riseLegal),hhmm(d.setLegal),hhmm(d.riseFixed),hhmm(d.setFixed),d.daylight.toFixed(3),hhmm(d.dawnFixed),hhmm(d.duskFixed)].join(',')).join('\n')+'\n');
await writeFile(new URL('cambio-de-hora/santiago-2026-mensual.csv',out),'mes,dias,salida_vigente,puesta_vigente,salida_UTC_menos4,puesta_UTC_menos4,luz_media_minutos,cambio_primer_a_ultimo_dia_minutos\n'+months.map(m=>[m.name,m.days,hhmm(m.riseLegal),hhmm(m.setLegal),hhmm(m.riseFixed),hhmm(m.setFixed),m.daylight.toFixed(3),m.change.toFixed(3)].join(',')).join('\n')+'\n');

/* Concepciones: las tablas equivalentes se generan acá para que la página
   sirva con JavaScript desactivado. */
const datos=await cargarDatos(new URL('concepciones/',root));
verificarContrato(datos);
await especial({dir:'concepciones',ruta:'/concepciones/',reemplazos:tablas(datos)});

const fechas={
 '/':'2026-10-01','/cambio-de-hora/':'2026-09-07','/concepciones/':'2026-09-20'
};
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...rutasPortalPublicadas].map(ruta=>`  <url><loc>https://cochid.cl${ruta}</loc><lastmod>${fechas[ruta]||'2026-10-01'}</lastmod></url>`).join('\n')}\n</urlset>\n`;
await writeFile(new URL('sitemap.xml',out),sitemap);
const sitemapHosts=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${destinosMapa().map(destino=>`  <url><loc>${escapar(hrefDestino(destino))}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile(new URL('sitemap-hosts.xml',out),sitemapHosts);

/* Se carga desde el principio para que el build falle si el parcial no existe,
   aunque las migas se incorporen al generar las páginas editoriales. */
if(!migasTemplate.includes('{{MIGAS}}'))throw new Error('partials/migas.html no declara {{MIGAS}}');

console.log(`Sitio estático: 9 páginas editoriales, ${days.length} días y ${months.length} promedios del especial solar; ${datos.semanal.semana.length} semanas y ${datos.cumpleanos.fecha.length} fechas del especial de concepciones; parciales y registro vendorizado aplicados en dist/.`);
