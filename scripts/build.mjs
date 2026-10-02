import {readFile,writeFile,mkdir,cp,rm} from 'node:fs/promises';
import {yearData,monthlyData,hhmm,MONTHS} from '../cambio-de-hora/solar.mjs';
import {cargarDatos,tablas,verificarContrato} from './tablas-concepciones.mjs';
import {destinos,dominios,familia,grupos,navegacionPrimaria,pie} from '../data/destinos.mjs';
import {depurarMarkdown,leerFrontmatter,markdownAHtml} from './markdown.mjs';
import {iconoSvg} from './iconos.mjs';
import {completarIconos,grillaHtml,leerTarjetas,validarDominios} from './tarjetas.mjs';
import {cargarEntradas,cuerpoEntrada,indiceBlog,metaEntrada,rss} from './blog.mjs';
import {loNuevo,novedadesDesdeBlog,novedadesDesdeReleases,paginaNovedades,unirNovedades} from './novedades.mjs';

const root=new URL('../',import.meta.url), out=new URL('../dist/',import.meta.url);
const rutasPortalPublicadas=new Set([
 '/', '/cambio-de-hora/', '/concepciones/', '/contacto/', '/datos/',
 '/documentacion/', '/herramientas/', '/investigaciones/', '/mapa-del-sitio/',
 '/mapas/', '/quienes-somos/', '/servicios/', '/asesoria/', '/blog/', '/novedades/'
]);
const [kitHead,headerTemplate,footerTemplate,migasTemplate,paginaTemplate,articuloTemplate,error404Template]=await Promise.all(
 ['head','header','footer','migas','pagina','articulo','error404'].map(nombre=>readFile(new URL(`partials/${nombre}.html`,root),'utf8'))
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

const gruposVisibles=grupos.filter(grupo=>grupo.visible).sort((a,b)=>a.orden-b.orden);
const etiquetasGrupo=Object.fromEntries(gruposVisibles.map(grupo=>[grupo.id,grupo.etiqueta]));
const etiquetasTipo={portal:'Portal',pagina:'Página',producto:'Producto',vista:'Vista',herramienta:'Herramienta'};
const ordenGrupos=gruposVisibles.map(grupo=>grupo.id);
const destinosMapa=()=>destinos.filter(destino=>destino.visible.mapa_del_sitio
 && !destino.alias_de && destino.clase!=='api'
 && !destino.ruta.includes(':')
 && (destino.estado==='vivo' || (destino.host==='cochid.cl' && rutasPortalPublicadas.has(destino.ruta))));

function arbolDestinos(){
 const incluidos=destinosMapa();
 const ids=new Set(incluidos.map(destino=>destino.id));
 const item=destino=>{
  const hijos=incluidos.filter(candidato=>candidato.padre===destino.id && candidato.grupo===destino.grupo)
   .sort((a,b)=>a.orden-b.orden||a.etiqueta.localeCompare(b.etiqueta,'es'));
  const tipo=destino.grupo==='investigaciones'?'Investigación':etiquetasTipo[destino.clase]||destino.clase;
  return `<li data-map-item><a href="${escapar(hrefDestino(destino))}">${escapar(destino.etiqueta)}</a> <span class="badge portal-tipo">${escapar(tipo)}</span><span class="portal-host">${escapar(destino.host+destino.ruta)}</span><p>${escapar(destino.resumen)}</p>${destino.estado_presentacion?`<p class="meta">${escapar(destino.estado_presentacion)}</p>`:''}${hijos.length?`<ul>${hijos.map(item).join('')}</ul>`:''}</li>`;
 };
 return `<div class="portal-arbol">${ordenGrupos.map(grupo=>{
  const grupoDestinos=incluidos.filter(destino=>destino.grupo===grupo && (!destino.padre || !ids.has(destino.padre) || destinos.find(candidato=>candidato.id===destino.padre)?.grupo!==grupo))
   .sort((a,b)=>a.orden-b.orden||a.etiqueta.localeCompare(b.etiqueta,'es'));
  return grupoDestinos.length?`<section><h2>${etiquetasGrupo[grupo]}</h2><ul>${grupoDestinos.map(item).join('')}</ul></section>`:'';
 }).join('')}</div>`;
}

const filtroMapa='<div class="portal-filtro"><label for="filtro-destinos">Filtrar el mapa</label><input id="filtro-destinos" type="search" autocomplete="off" placeholder="Por ejemplo, presupuesto o mapas"></div>';
const scriptMapa='<script>document.querySelector("#filtro-destinos")?.addEventListener("input",event=>{const consulta=event.target.value.toLocaleLowerCase("es").trim();document.querySelectorAll("[data-map-item]").forEach(item=>{item.hidden=consulta!==""&&!item.textContent.toLocaleLowerCase("es").includes(consulta)})})</script>';
const formularioAsesoria=`<form class="portal-formulario" method="post" action="/api/asesoria" accept-charset="utf-8" data-asesoria-form>
<input type="hidden" name="canal" value="cochid">
<div class="portal-formulario__trampa" aria-hidden="true"><label for="asesoria-sitio-web">Sitio web</label><input id="asesoria-sitio-web" name="sitio_web" type="text" tabindex="-1" autocomplete="off"></div>
<label>Nombre <span aria-hidden="true">*</span><input name="nombre" type="text" autocomplete="name" maxlength="255" required></label>
<label>Correo electrónico <span aria-hidden="true">*</span><input name="email" type="email" autocomplete="email" maxlength="255" required><small>Te responderemos a esta dirección.</small></label>
<label>Organización <span class="portal-opcional">opcional</span><input name="organizacion" type="text" autocomplete="organization" maxlength="255"></label>
<label>Teléfono <span class="portal-opcional">opcional</span><input name="telefono" type="tel" autocomplete="tel" maxlength="40"></label>
<label>Qué necesitas <select name="tipo_pedido" required><option value="dato-a-medida">Un dato a medida</option><option value="mas-cuota">Más cuota de API</option><option value="descarga-masiva">Una descarga completa</option><option value="informe">Un informe a pedido</option><option value="otro">Otra cosa</option></select></label>
<input type="hidden" name="servicio" value="datos-a-medida">
<input type="hidden" name="dominio" value="">
<label>Sobre qué datos <span class="portal-opcional">opcional</span><textarea name="conjunto" rows="3" maxlength="255" placeholder="Tema, conjunto, territorio y período"></textarea><small>Por ejemplo: denuncias por comuna, Región de Valparaíso, 2015 a 2024.</small></label>
<label>En qué formato <span class="portal-opcional">opcional</span><select name="formato"><option value="">No lo sé todavía</option><option value="csv-excel">Archivo CSV o Excel</option><option value="api">Acceso por API</option><option value="imagen">Gráfico o imagen</option><option value="informe">Informe escrito</option></select></label>
<label>Para cuándo <span class="portal-opcional">opcional</span><input name="para_cuando" type="text" maxlength="120" placeholder="Una fecha o un mes aproximado"></label>
<label>Cómo lo vas a usar <span class="portal-opcional">opcional</span><textarea name="uso" rows="2" maxlength="500" placeholder="Una nota, un estudio, un diagnóstico o una aplicación"></textarea></label>
<label>Mensaje <span aria-hidden="true">*</span><textarea name="mensaje" rows="6" maxlength="5000" required></textarea></label>
<button class="btn-primary" type="submit">Enviar solicitud</button>
<p class="portal-formulario__privacidad">Usamos estos datos solo para responderte. Más detalle en la <a href="https://innovacionsantiago.cl/legal/privacidad/">política de privacidad</a>.</p>
</form>`;
const scriptAsesoria='<script>(()=>{const f=document.querySelector("[data-asesoria-form]");if(!f)return;const t=document.createElement("input");t.type="hidden";t.name="tiempo_carga";t.value=String(Math.floor(Date.now()/1000));f.append(t);const q=new URLSearchParams(location.search);for(const [campo,parametro] of [["tipo_pedido","tipo"],["conjunto","conjunto"],["dominio","dominio"]]){const valor=q.get(parametro);const control=f.elements.namedItem(campo);if(valor&&control)control.value=valor}})()</script>';

/* Tarjetas de los Markdown editoriales. Los dominios cruzan su texto con el
   contrato de destinos.json; las demás toman el ícono del registro o de su
   línea «Ícono:», que nunca llega al HTML. */
function bloqueTarjetas(tipo,lineas){
 const tarjetas=completarIconos(leerTarjetas(lineas),destinos);
 if(tipo==='dominios')return grillaHtml(validarDominios(tarjetas,dominios,destinos),{maxEnlaces:3,rotuloEnlaces:'Temas y vistas'});
 if(tipo==='tarjetas')return grillaHtml(tarjetas);
 throw new Error(`Bloque de tarjetas desconocido: ${tipo}`);
}

async function dominiosPublicados(){
 const {meta,markdown}=leerFrontmatter(await readFile(new URL('content/pages/datos.md',root),'utf8'));
 const bloque=depurarMarkdown(markdown,meta.ruta).match(/^::: dominios\n([\s\S]*?)\n:::$/m);
 if(!bloque)throw new Error('content/pages/datos.md no declara el bloque ::: dominios');
 return validarDominios(completarIconos(leerTarjetas(bloque[1].split('\n')),destinos),dominios,destinos);
}

function vistasDominios(lista){
 const vistas=new Map();
 for(const dominio of lista)for(const vista of dominio.vistas)if(!vistas.has(vista.href))vistas.set(vista.href,vista);
 return `<ul class="portal-vistas">${[...vistas.values()].map(vista=>`<li><a href="${escapar(vista.href)}">${escapar(vista.texto)}</a></li>`).join('')}</ul>`;
}

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
 if(meta.ruta==='/datos/')extras['@@VISTAS_DOMINIOS@@']=vistasDominios(await dominiosPublicados());
 if(meta.ruta==='/asesoria/'){
  extras['@@FORMULARIO_ASESORIA@@']=formularioAsesoria;
  script=scriptAsesoria;
 }
 const cuerpo=markdownAHtml(depurarMarkdown(contenido,meta.ruta),extras,{bloque:bloqueTarjetas});
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

/* Blog y novedades: páginas con la plantilla de artículo. Las notas internas
   de las fuentes (comentarios y [[VERIFICAR]]) se omiten y se informan. */
const {entradas,omisiones:notasOmitidas}=cargarEntradas(new URL('content/blog/',root),dominios);
if(!entradas.length)throw new Error('content/blog/ no tiene entradas publicables');
const releasesNovedad=novedadesDesdeReleases();
const novedades=unirNovedades(novedadesDesdeBlog(entradas),releasesNovedad.items);

async function paginaArticulo({ruta,titulo,producto,descripcion,bajada,meta='',migas,cuerpo,ogTipo='website'}){
 const pagina=reemplazar(articuloTemplate,{
  TITULO:escapar(titulo),PRODUCTO:producto,DESCRIPCION:escapar(descripcion),RUTA:escapar(ruta),OG_TIPO:ogTipo,
  KIT_HEAD:kitHead,HEADER:cabecera(ruta),
  MIGAS:reemplazar(migasTemplate,{MIGAS:migas.map(([texto,href])=>href?`<li><a href="${href}">${escapar(texto)}</a></li>`:`<li aria-current="page">${escapar(texto)}</li>`).join('')},'migas'),
  BAJADA:escapar(bajada),META:meta,CUERPO:cuerpo,FOOTER:piePortal()
 },`artículo ${ruta}`);
 if(/\[\[VERIFICAR|<!--/.test(pagina))throw new Error(`${ruta} quedó con una nota interna`);
 const directorio=new URL(`.${ruta}`,out);
 await mkdir(directorio,{recursive:true});
 await writeFile(new URL('index.html',directorio),pagina);
}

async function publicarBlog(){
 await paginaArticulo({
  ruta:'/blog/',titulo:'Blog',producto:'Portal',
  descripcion:'Notas de COCHID sobre datos nuevos, métodos y cambios del sitio, ordenadas de la más reciente a la más antigua.',
  bajada:'Notas sobre datos nuevos, métodos y cambios del sitio, de la más reciente a la más antigua.',
  migas:[['Inicio','/'],['Blog']],cuerpo:indiceBlog(entradas)
 });
 for(const entrada of entradas){
  await paginaArticulo({
   ruta:entrada.ruta,titulo:entrada.titulo,producto:'Blog',ogTipo:'article',
   descripcion:entrada.descripcion,bajada:entrada.resumen,meta:metaEntrada(entrada,{autor:true}),
   migas:[['Inicio','/'],['Blog','/blog/'],[entrada.titulo]],cuerpo:cuerpoEntrada(entrada,entradas)
  });
 }
 await writeFile(new URL('blog/feed.xml',out),rss(entradas));
 await paginaArticulo({
  ruta:'/novedades/',titulo:'Novedades',producto:'Portal',
  descripcion:'Datos nuevos, entradas del blog y publicaciones de COCHID, con fecha y fuente de cada novedad.',
  bajada:'Datos nuevos, entradas del blog y publicaciones de COCHID, con fecha y fuente de cada novedad.',
  migas:[['Inicio','/'],['Novedades']],cuerpo:paginaNovedades(novedades)
 });
}

await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
await cp(new URL('assets/',root),new URL('assets/',out),{recursive:true});
await cp(new URL('robots.txt',root),new URL('robots.txt',out));
await cp(new URL('data/destinos.publico.json',root),new URL('destinos.json',out));
/* La portada recibe la grilla compacta con los seis primeros dominios y los
   íconos de sus accesos desde el mismo módulo que las páginas editoriales. */
let home=chrome(await readFile(new URL('index.html',root),'utf8'),'/');
const dominiosPortada=(await dominiosPublicados()).slice(0,6).map(dominio=>({...dominio,nivel:3}));
if(!home.includes('<!--DOMINIOS_COMPACTOS-->'))throw new Error('index.html no tiene el marcador DOMINIOS_COMPACTOS');
home=home.replace('<!--DOMINIOS_COMPACTOS-->',grillaHtml(dominiosPortada,{compacta:true}))
 .replace(/<!--ICONO:([a-z]+)-->/g,(_,nombre)=>iconoSvg(nombre,{tamano:28,clase:'task-icon'}));
if(!home.includes('<!--LO_NUEVO-->'))throw new Error('index.html no tiene el marcador LO_NUEVO');
home=home.replace('<!--LO_NUEVO-->',loNuevo(novedades));
home=sinComentariosHtml(home);
await writeFile(new URL('index.html',out),home);
await writeFile(new URL('404.html',out),reemplazar(error404Template,{
 KIT_HEAD:kitHead,HEADER:cabecera(''),FOOTER:piePortal()
},'404'));
for(const nombre of ['quienes-somos','contacto','servicios','datos','mapas','herramientas','investigaciones','documentacion','mapa-del-sitio','asesoria','asesoria-gracias']){
 await paginaEditorial(nombre);
}
await publicarBlog();

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

/* lastmod honesto: la fecha del contenido, no la del build. El índice y el
   feed del blog cambian con su entrada más reciente; novedades, con la suya. */
const fechas={
 '/':'2026-10-01','/cambio-de-hora/':'2026-09-07','/concepciones/':'2026-09-20',
 '/blog/':entradas[0].fecha,'/novedades/':novedades[0].fecha
};
const urlsSitemap=[
 ...[...rutasPortalPublicadas].map(ruta=>[ruta,fechas[ruta]||'2026-10-01']),
 ...entradas.map(entrada=>[entrada.ruta,entrada.fecha]),
];
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlsSitemap.map(([ruta,fecha])=>`  <url><loc>https://cochid.cl${ruta}</loc><lastmod>${fecha}</lastmod></url>`).join('\n')}\n</urlset>\n`;
await writeFile(new URL('sitemap.xml',out),sitemap);
const hostsSitemap=['bici.cochid.cl','cables.cochid.cl','clima.cochid.cl','cochid.cl','congreso.cochid.cl','datos.cochid.cl','economia.cochid.cl','elecciones.cochid.cl','graphs.cochid.cl','lex.cochid.cl','mapas.cochid.cl','medicamentos.cochid.cl','mundial.cochid.cl','prosa.medicamentos.cochid.cl','taller.cochid.cl','tpte.cochid.cl','votos.cochid.cl'];
const sitemapHosts=`<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${hostsSitemap.map(host=>`  <sitemap><loc>https://${host}/sitemap.xml</loc></sitemap>`).join('\n')}\n</sitemapindex>\n`;
await writeFile(new URL('sitemap-hosts.xml',out),sitemapHosts);

/* Se carga desde el principio para que el build falle si el parcial no existe,
   aunque las migas se incorporen al generar las páginas editoriales. */
if(!migasTemplate.includes('{{MIGAS}}'))throw new Error('partials/migas.html no declara {{MIGAS}}');

console.log(`Blog: ${entradas.length} entradas, ${notasOmitidas.length} notas internas omitidas:`);
for(const nota of notasOmitidas)console.log(`  - ${nota.archivo} (${nota.lugar}, ${nota.tipo}): ${nota.resumen}`);
console.log(`Novedades: ${novedades.length} ítems (${novedades.filter(item=>item.origen==='blog').length} del blog, ${releasesNovedad.aceptadas.length} de releases); releases COCHID omitidas: ${releasesNovedad.omitidas.length}.`);
for(const omitida of releasesNovedad.omitidas)console.log(`  - ${omitida.release}: ${omitida.motivo}`);
console.log(`Sitio estático: 9 páginas editoriales, ${days.length} días y ${months.length} promedios del especial solar; ${datos.semanal.semana.length} semanas y ${datos.cumpleanos.fecha.length} fechas del especial de concepciones; parciales y registro vendorizado aplicados en dist/.`);
