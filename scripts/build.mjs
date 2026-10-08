import {readFile,writeFile,mkdir,cp,rm,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {yearData,monthlyData,hhmm,MONTHS} from '../cambio-de-hora/solar.mjs';
import {cargarDatos,tablas,verificarContrato} from './tablas-concepciones.mjs';
import {destinos,dominios,familia,grupos,navegacionPrimaria,pie} from '../data/destinos.mjs';
import {depurarMarkdown,leerFrontmatter,markdownAHtml} from './markdown.mjs';
import {iconoSvg} from './iconos.mjs';
import {completarIconos,grillaHtml,leerTarjetas,validarDominios} from './tarjetas.mjs';
import {cargarEntradas,cuerpoEntrada,fechaContenido,indiceBlog,metaEntrada,rss} from './blog.mjs';
import {loNuevo,novedadesDesdeBlog,novedadesDesdeReleases,paginaNovedades,unirNovedades} from './novedades.mjs';
import {paginaHilo} from './presupuesto-hilo.mjs';
import {indicePublico,temaPublico} from './temas-publicos.mjs';
import {cargarGraficos,cuerpoGrafico,headGrafico,indiceGraficos,paginaParaX,rutaGrafico} from './graficos.mjs';
import {aplicarBirren,leyendaDePared,iconoKit,seccionDeEnlace,familiaDeSeccion} from './birren.mjs';

const root=new URL('../',import.meta.url), out=new URL('../dist/',import.meta.url);
const contratoPublico=JSON.parse(await readFile(new URL('../data/destinos.publico.json',import.meta.url),'utf8'));
const idsDirectorioProyectos=new Set(contratoPublico.directorio_proyectos||[]);
const rutasPortalPublicadas=new Set([
 '/', '/cambio-de-hora/', '/concepciones/', '/contacto/',
 '/documentacion/', '/herramientas/', '/investigaciones/', '/mapa-del-sitio/',
 '/mapas/', '/proyectos/', '/sobre-nosotros/', '/servicios/', '/asesoria/', '/blog/', '/novedades/',
 '/buscar/', '/temas/', '/blog/presupuesto-2027-aportes-cambios-nominal-real/hilo/'
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
 const explorar=secciones.find(seccion=>seccion.titulo==='Explorar Compañía Chilena de Inteligencia de Datos')?.enlaces||[];
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

function directorioProyectos(){
 const gruposDirectorio=gruposVisibles;
 const incluidos=[...idsDirectorioProyectos].map(id=>destinos.find(destino=>destino.id===id));
 if(incluidos.some(destino=>!destino))throw new Error('/proyectos/ referencia un destino ausente del contrato público');
 /* 19 desde el 6-oct-2026: graphs, elecciones y prosa quedan solo para Martín. */
 if(incluidos.length!==19)throw new Error(`/proyectos/ esperaba 19 sitios públicos y recibió ${incluidos.length}`);
 const tarjeta=destino=>{
  const seccion=seccionDeEnlace(hrefDestino(destino)), familia=familiaDeSeccion(seccion);
  return `<li class="portal-proyecto"><span class="portal-proyecto__icono"${familia?` data-family="${familia}"`:''}>${iconoKit(seccion.icono,{tamano:24})}</span><div><h3><a href="${escapar(hrefDestino(destino))}">${escapar(destino.etiqueta)}</a></h3><p>${escapar(destino.resumen)}</p></div></li>`;
 };
 return `<div class="portal-directorio" data-project-directory>${gruposDirectorio.map(grupo=>{
  const elementos=incluidos.filter(destino=>destino.grupo===grupo.id);
  return `<section><h2>${escapar(grupo.etiqueta)}</h2><ul class="portal-proyectos">${elementos.map(tarjeta).join('')}</ul></section>`;
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
 if(meta.ruta==='/proyectos/')extras['@@DIRECTORIO_PROYECTOS@@']=directorioProyectos();
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

async function paginaArticulo({ruta,titulo,producto,descripcion,bajada,meta='',migas,cuerpo,ogTipo='website',headExtra=''}){
 const pagina=reemplazar(articuloTemplate,{
  TITULO:escapar(titulo),PRODUCTO:producto,DESCRIPCION:escapar(descripcion),RUTA:escapar(ruta),OG_TIPO:ogTipo,HEAD_EXTRA:headExtra,
  KIT_HEAD:kitHead,HEADER:cabecera(ruta),
  MIGAS:reemplazar(migasTemplate,{MIGAS:migas.map(([texto,href])=>href?`<li><a href="${href}">${escapar(texto)}</a></li>`:`<li aria-current="page">${escapar(texto)}</li>`).join('')},'migas'),
  BAJADA:escapar(bajada),META:meta,CUERPO:cuerpo,FOOTER:piePortal()
 },`artículo ${ruta}`);
 if(/\[\[VERIFICAR|<!--/.test(pagina))throw new Error(`${ruta} quedó con una nota interna`);
 const directorio=new URL(`.${ruta}`,out);
 await mkdir(directorio,{recursive:true});
 await writeFile(new URL('index.html',directorio),pagina);
}

const hiloPresupuesto=JSON.parse(await readFile(new URL('assets/presupuesto-2027/hilo.json',root),'utf8'));
async function publicarBlog(){
 await paginaArticulo({
  ruta:'/blog/',titulo:'Blog',producto:'Portal',
  descripcion:'Notas de la Compañía Chilena de Inteligencia de Datos sobre datos nuevos, métodos y cambios del sitio, ordenadas de la más reciente a la más antigua.',
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
 const hilo=hiloPresupuesto;
 await paginaArticulo({ruta:'/blog/presupuesto-2027-aportes-cambios-nominal-real/hilo/',titulo:'Presupuesto 2027: hilo y gráficos descargables',producto:'Blog',descripcion:'Seis tweets listos para copiar con PNG descargables, fuentes, cifras nominales y escenarios de inflación.',bajada:'Copia los textos y descarga sus gráficos para compartir la comparación.',migas:[['Inicio','/'],['Blog','/blog/'],['Presupuesto 2027',hilo.analisis],['Hilo y gráficos']],cuerpo:paginaHilo(hilo)});
 await writeFile(new URL('assets/presupuesto-2027/hilo.txt',out),hilo.tweets.map(t=>t.texto).join('\n\n')+'\n');
 await paginaArticulo({
  ruta:'/novedades/',titulo:'Novedades',producto:'Portal',
  descripcion:'Datos nuevos, entradas del blog y publicaciones de la Compañía Chilena de Inteligencia de Datos, con fecha y fuente de cada novedad.',
  bajada:'Datos nuevos, entradas del blog y publicaciones de la Compañía Chilena de Inteligencia de Datos, con fecha y fuente de cada novedad.',
  migas:[['Inicio','/'],['Novedades']],cuerpo:paginaNovedades(novedades)
 });
}

await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
await cp(new URL('assets/',root),new URL('assets/',out),{recursive:true});
await cp(new URL('robots.txt',root),new URL('robots.txt',out));
await cp(new URL('data/destinos.publico.json',root),new URL('destinos.json',out));
/* La portada v2 aprobada se incorpora al final junto con las páginas de tema. */
await cp(new URL('vendor/v2/portada/index.html',root),new URL('index.html',out));
await writeFile(new URL('404.html',out),reemplazar(error404Template,{
 KIT_HEAD:kitHead,HEADER:cabecera(''),FOOTER:piePortal()
},'404'));
for(const nombre of ['quienes-somos','contacto','servicios','mapas','herramientas','investigaciones','proyectos','documentacion','mapa-del-sitio','asesoria','asesoria-gracias']){
 await paginaEditorial(nombre);
}
await publicarBlog();

/* Gráficos para redes: una página por ficha de content/graficos/ y el índice /g/. */
const graficos=await cargarGraficos(new URL('content/graficos/',root));
async function publicarGraficos(){
 if(!graficos.length)return;
 await paginaArticulo({ruta:'/g/',titulo:'Gráficos',producto:'Portal',
  descripcion:'Gráficos del presupuesto público de Chile con su fuente, datos descargables y una guía para leerlos.',
  bajada:'Cifras del presupuesto público explicadas en un gráfico, con su fuente y sus datos.',
  migas:[['Inicio','/'],['Gráficos']],cuerpo:indiceGraficos(graficos)});
 await paginaArticulo({ruta:'/g/para-x/',titulo:'Posts para X',producto:'Gráficos',
  descripcion:'Textos e imágenes listos para publicar a mano en X.',bajada:'Copia el texto, descarga la imagen y pega el texto alternativo.',
  headExtra:'<meta name="robots" content="noindex, nofollow">',migas:[['Inicio','/'],['Gráficos','/g/'],['Posts para X']],cuerpo:paginaParaX(graficos)});
 for(const ficha of graficos){
  await paginaArticulo({ruta:rutaGrafico(ficha),titulo:ficha.titulo,producto:'Gráficos',ogTipo:'article',
   descripcion:ficha.descripcion,bajada:ficha.bajada,headExtra:headGrafico(ficha),
   meta:`<p class="blog-fecha">Datos al <time datetime="${escapar(ficha.corte)}">${escapar(ficha.corte_texto)}</time></p>`,
   migas:[['Inicio','/'],['Gráficos','/g/'],[ficha.titulo]],cuerpo:cuerpoGrafico(ficha,graficos)});
 }
}
await publicarGraficos();

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
const fechaBlog=entradas.map(fechaContenido).sort().at(-1);
const fechas={
 '/':'2026-10-01','/cambio-de-hora/':'2026-09-07','/concepciones/':'2026-09-20',
 '/blog/':fechaBlog,'/novedades/':[fechaBlog,novedades[0].fecha].sort().at(-1),
 '/blog/presupuesto-2027-aportes-cambios-nominal-real/hilo/':hiloPresupuesto.fecha
};
const temasV2=['salud','educacion','economia-trabajo','empresas-innovacion','finanzas-publicas','seguridad-justicia','poblacion-sociedad','territorio-vivienda','transporte-infraestructura','medio-ambiente-energia','politica-instituciones'];
const urlsSitemap=[
 ...[...rutasPortalPublicadas].map(ruta=>[ruta,fechas[ruta]||'2026-10-01']),
 ...temasV2.map(tema=>[`/temas/${tema}/`,'2026-10-02']),
 ...entradas.map(entrada=>[entrada.ruta,fechaContenido(entrada)]),
 ...(graficos.length?[['/g/',graficos.map(f=>f.corte).sort().at(-1)],...graficos.map(f=>[rutaGrafico(f),f.corte])]:[]),
];
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlsSitemap.map(([ruta,fecha])=>`  <url><loc>https://cochid.cl${ruta}</loc><lastmod>${fecha}</lastmod></url>`).join('\n')}\n</urlset>\n`;
await writeFile(new URL('sitemap.xml',out),sitemap);
const hostsSitemap=['bici.cochid.cl','cables.cochid.cl','clima.cochid.cl','cochid.cl','congreso.cochid.cl','datos.cochid.cl','economia.cochid.cl','elecciones.cochid.cl','graphs.cochid.cl','lex.cochid.cl','mapas.cochid.cl','medicamentos.cochid.cl','mundial.cochid.cl','prosa.medicamentos.cochid.cl','taller.cochid.cl','tpte.cochid.cl','votos.cochid.cl'];
const sitemapHosts=`<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${hostsSitemap.map(host=>`  <sitemap><loc>https://${host}/sitemap.xml</loc></sitemap>`).join('\n')}\n</sitemapindex>\n`;
await writeFile(new URL('sitemap-hosts.xml',out),sitemapHosts);

/* Esqueleto v2: la portada y las doce páginas de temas vienen de la maqueta
   aprobada. El chrome se aplica al final a toda página, incluidos los dos
   especiales heredados, para que la barra principal sea idéntica por bytes. */
const bundle=new URL('../vendor/chrome-v2/',import.meta.url);
const bundleHeader=await readFile(new URL('header.html',bundle),'utf8');
const bundleFooter=await readFile(new URL('footer.html',bundle),'utf8');
const subnav=`<section class="cx-sub" data-subnav aria-label="Barra del portal">
  <div class="cx-sub__in">
    <a class="cx-sub__nombre" href="https://cochid.cl/">Portal</a>
    <nav class="cx-sub__tareas" aria-label="Secciones del portal">
      <a href="https://cochid.cl/">Inicio</a><a href="https://cochid.cl/temas/">Temas</a><a href="https://cochid.cl/investigaciones/">Investigaciones</a><a href="https://cochid.cl/novedades/">Novedades</a><a href="https://cochid.cl/servicios/">Servicios</a><a href="https://cochid.cl/documentacion/">Documentación</a>
    </nav>
    <details class="cx-sub__movil"><summary>Secciones<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><div class="cx-mas__lista"><a href="https://cochid.cl/">Inicio</a><a href="https://cochid.cl/temas/">Temas</a><a href="https://cochid.cl/investigaciones/">Investigaciones</a><a href="https://cochid.cl/novedades/">Novedades</a><a href="https://cochid.cl/servicios/">Servicios</a><a href="https://cochid.cl/documentacion/">Documentación</a></div></details>
  </div>
</section>${leyendaDePared()}`;

await cp(new URL('../vendor/v2/portada/index.html',import.meta.url),new URL('index.html',out));
await cp(new URL('../vendor/v2/portada/portada.css',import.meta.url),new URL('assets/portal-v2-portada.css',out));
await cp(new URL('../vendor/v2/portada/portada.js',import.meta.url),new URL('assets/portal-v2-portada.js',out));
await cp(new URL('../vendor/v2/temas/',import.meta.url),new URL('temas/',out),{recursive:true});
/* Nombres públicos y solo conjuntos publicados en /temas (pedido de Martín, 6-oct-2026). */
{
 const nombresPublicos=JSON.parse(await readFile(new URL('../data/nombres-publicos.v1.json',import.meta.url),'utf8')).conjuntos;
 const totalesTema={};
 for(const entrada of await readdir(new URL('temas/',out),{withFileTypes:true})){
  if(!entrada.isDirectory())continue;
  const archivo=new URL(`temas/${entrada.name}/index.html`,out);
  const {html,total}=temaPublico(await readFile(archivo,'utf8'),nombresPublicos);
  totalesTema[entrada.name]=total;
  await writeFile(archivo,html);
 }
 const indiceTemas=new URL('temas/index.html',out);
 await writeFile(indiceTemas,indicePublico(await readFile(indiceTemas,'utf8'),totalesTema));
 const portada=new URL('index.html',out);
 await writeFile(portada,indicePublico(await readFile(portada,'utf8'),totalesTema));
}
await cp(bundle,new URL('assets/chrome-v2/',out),{recursive:true});
execFileSync('python3',['buscador/generar_indice.py','--refrescar','--blog-local',new URL('blog/feed.xml',out).pathname],{cwd:new URL('../',import.meta.url),stdio:'inherit',env:{...process.env,DESTINOS_JSON:'data/destinos.v1.json',TAXONOMIA_JSON:'data/taxonomia.json'}});
await mkdir(new URL('buscar/',out),{recursive:true});
await cp(new URL('../buscador/indice.json',import.meta.url),new URL('buscar/indice.json',out));
const buscar=`<!doctype html><html lang="es-CL" data-brand="cochid" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Buscar · Compañía Chilena de Inteligencia de Datos</title><meta name="description" content="Busca datos, mapas, investigaciones, herramientas y entradas del blog.">${kitHead}</head><body>${bundleHeader}${subnav}<main id="contenido" class="portal-contenido" tabindex="-1"><header><h1>Buscar</h1><p>Busca datos, mapas, investigaciones, herramientas y entradas del blog.</p></header><p><button class="btn-primary" type="button" data-buscar-abrir>Abrir el buscador</button></p></main>${bundleFooter}<script>addEventListener('load',()=>{document.querySelector('[data-buscar-abrir]')?.click();const q=new URLSearchParams(location.search).get('q');if(q)setTimeout(()=>{const i=document.querySelector('.bq__in');if(i){i.value=q;i.dispatchEvent(new Event('input',{bubbles:true}))}},50)})</script></body></html>`;
await writeFile(new URL('buscar/index.html',out),buscar);
const redireccion=`<!doctype html><html lang="es-CL"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/sobre-nosotros/"><link rel="canonical" href="https://cochid.cl/sobre-nosotros/"><title>Sobre nosotros · Compañía Chilena de Inteligencia de Datos</title></head><body><main id="contenido" tabindex="-1"><h1>Sobre nosotros</h1><p>Esta página se trasladó a <a href="/sobre-nosotros/">Sobre nosotros</a>.</p></main></body></html>`;
await mkdir(new URL('quienes-somos/',out),{recursive:true});
await writeFile(new URL('quienes-somos/index.html',out),redireccion);
const redireccionTemas=`<!doctype html><html lang="es-CL"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/temas/"><link rel="canonical" href="https://cochid.cl/temas/"><title>Temas · Compañía Chilena de Inteligencia de Datos</title></head><body><main id="contenido" tabindex="-1"><h1>Temas</h1><p>Esta página se trasladó a <a href="/temas/">Temas</a>.</p></main></body></html>`;
await mkdir(new URL('datos/',out),{recursive:true});
await writeFile(new URL('datos/index.html',out),redireccionTemas);

async function htmlFiles(directory){
 const found=[];
 for(const entry of await readdir(directory,{withFileTypes:true})){
  const item=new URL(entry.name+(entry.isDirectory()?'/':''),directory);
  if(entry.isDirectory())found.push(...await htmlFiles(item));
  else if(entry.name.endsWith('.html'))found.push(item);
 }
 return found;
}

function aplicarChromeV2(html){
 html=html.replace(/<a class="skip-link"[\s\S]*?<\/a>\s*/g,'');
 html=html.replace(/<section class="cx-sub"[\s\S]*?<\/section>\s*/g,'');
 html=html.replace(/<header\b[^>]*data-site-header[^>]*>[\s\S]*?<\/header>/,bundleHeader.trim());
 if(!html.includes('data-site-header'))html=html.replace(/<body[^>]*>/,m=>m+'\n'+bundleHeader.trim());
 html=html.replace(/<header class="cx-nav"[\s\S]*?<\/header>/,m=>m+'\n'+subnav);
 html=html.replace(/<footer\b[^>]*data-site-footer[^>]*>[\s\S]*?<\/footer>/,bundleFooter.trim());
 if(!html.includes('data-site-footer'))html=html.replace(/<\/body>/,bundleFooter+'\n</body>');
 html=html.replace(/<(?:link|script)\b[^>]*(?:comun\/(?:chrome|componentes)\.(?:css|js)|buscador\/(?:buscador(?:\.min)?\.(?:css|js)|indice\.json))[^>]*>(?:<\/script>)?\s*/g,'');
 html=html.replace(/<link rel="stylesheet" href="[^\"]*(?:portada\/)?portada\.css">/g,'<link rel="stylesheet" href="/assets/portal-v2-portada.css">');
 html=html.replace(/<script defer src="[^\"]*(?:portada\/)?portada\.js"><\/script>/g,'<script defer src="/assets/portal-v2-portada.js"></script>');
 html=html.replace(/<link rel="stylesheet" href="[^\"]*(?:temas\/)?temas\.css">/g,'<link rel="stylesheet" href="/temas/temas.css">');
 if(!html.includes('/assets/chrome-v2/chrome.css'))html=html.replace('</head>','<link rel="stylesheet" href="/assets/chrome-v2/chrome.css">\n<script defer src="/assets/chrome-v2/chrome.js" data-indice="https://cochid.cl/buscar/indice.json" data-raiz="https://cochid.cl/"></script>\n</head>');
 if(!html.includes('type="application/rss+xml"'))html=html.replace('</head>','<link rel="alternate" type="application/rss+xml" title="Blog de la Compañía Chilena de Inteligencia de Datos" href="https://cochid.cl/blog/feed.xml">\n</head>');
 if(!html.includes('/assets/cuenta-panel.0a66d3c77722.js'))html=html.replace('</head>','<script defer src="/assets/cuenta-panel.0a66d3c77722.js" integrity="sha384-LDo8wtGWz2+G/IdHNzh0yaJHW7OioCRqTbf2Er6apvkqMeD0N9KfVruY8kDWEzbZ"></script>\n</head>');
 return sinComentariosHtml(html).replace(/\b(?:COCHID|Cochid)\b/g,'Compañía Chilena de Inteligencia de Datos').replace(/\b(?:overline|eyebrow)\b/g,'meta');
}
for(const path of await htmlFiles(out)) {
 const relativo=path.pathname.slice(out.pathname.length);
 const ruta=relativo.endsWith('index.html')?'/'+relativo.slice(0,-'index.html'.length):'/'+relativo;
 await writeFile(path,aplicarBirren(aplicarChromeV2(await readFile(path,'utf8')),ruta,kitHead));
}

/* Metadatos para redes y buscadores en todas las páginas (6-oct-2026): canonical, Open Graph con imagen,
   tarjeta grande de X; Organization y WebSite en la portada; BlogPosting en cada entrada del blog. */
{
 const ORIGEN='https://cochid.cl', IMAGEN=`${ORIGEN}/assets/social/cochid-og.jpg`;
 const ORG={'@type':'Organization','@id':`${ORIGEN}/#organizacion`,name:'Compañía Chilena de Inteligencia de Datos',legalName:'Compañía Chilena de Inteligencia de Datos SpA',taxID:'78.374.391-4',url:`${ORIGEN}/`,logo:IMAGEN,address:{'@type':'PostalAddress',addressLocality:'Santiago',addressCountry:'CL'}};
 const atributo=(html,re)=>(html.match(re)||[])[1];
 const ld=objeto=>`<script type="application/ld+json">${JSON.stringify(objeto).replaceAll('<','\\u003c')}</script>`;
 const porRuta=Object.fromEntries(entradas.map(entrada=>[entrada.ruta,entrada]));
 for(const archivo of await htmlFiles(out)){
  const relativo=archivo.pathname.slice(out.pathname.length);
  if(!relativo.endsWith('index.html'))continue;
  const ruta='/'+relativo.slice(0,-'index.html'.length);
  let html=await readFile(archivo,'utf8');
  if(/http-equiv="refresh"/i.test(html))continue;
  const titulo=atributo(html,/<title>([^<]*)<\/title>/)||'Compañía Chilena de Inteligencia de Datos';
  const descripcion=atributo(html,/<meta name="description" content="([^"]*)"/)||'';
  const extra=[];
  if(!/rel="canonical"/.test(html))extra.push(`<link rel="canonical" href="${ORIGEN}${ruta}">`);
  if(!/property="og:title"/.test(html))extra.push(`<meta property="og:title" content="${titulo}">`,`<meta property="og:description" content="${descripcion}">`,`<meta property="og:url" content="${ORIGEN}${ruta}">`,'<meta property="og:type" content="website">','<meta property="og:site_name" content="Compañía Chilena de Inteligencia de Datos">');
  if(!/property="og:image"/.test(html))extra.push(`<meta property="og:image" content="${IMAGEN}">`,'<meta property="og:image:width" content="1200">','<meta property="og:image:height" content="630">');
  if(!/property="og:locale"/.test(html))extra.push('<meta property="og:locale" content="es_CL">');
  if(!/name="twitter:card"/.test(html))extra.push('<meta name="twitter:card" content="summary_large_image">');
  if(ruta==='/')extra.push(ld({'@context':'https://schema.org','@graph':[ORG,{'@type':'WebSite','@id':`${ORIGEN}/#sitio`,name:'Compañía Chilena de Inteligencia de Datos',url:`${ORIGEN}/`,inLanguage:'es-CL',publisher:{'@id':ORG['@id']},potentialAction:{'@type':'SearchAction',target:`${ORIGEN}/buscar/?q={search_term_string}`,'query-input':'required name=search_term_string'}}]}));
  const entrada=porRuta[ruta];
  if(entrada)extra.push(ld({'@context':'https://schema.org','@type':'BlogPosting',headline:entrada.titulo,description:entrada.descripcion,datePublished:entrada.fecha,dateModified:fechaContenido(entrada),inLanguage:'es-CL',url:`${ORIGEN}${ruta}`,mainEntityOfPage:`${ORIGEN}${ruta}`,image:IMAGEN,author:ORG,publisher:ORG}));
  if(extra.length)await writeFile(archivo,html.replace('</head>',extra.join('\n')+'\n</head>'));
 }
}

/* Se carga desde el principio para que el build falle si el parcial no existe,
   aunque las migas se incorporen al generar las páginas editoriales. */
if(!migasTemplate.includes('{{MIGAS}}'))throw new Error('partials/migas.html no declara {{MIGAS}}');

console.log(`Blog: ${entradas.length} entradas, ${notasOmitidas.length} notas internas omitidas:`);
for(const nota of notasOmitidas)console.log(`  - ${nota.archivo} (${nota.lugar}, ${nota.tipo}): ${nota.resumen}`);
console.log(`Novedades: ${novedades.length} ítems (${novedades.filter(item=>item.origen==='blog').length} del blog, ${releasesNovedad.aceptadas.length} de releases); releases Compañía Chilena de Inteligencia de Datos omitidas: ${releasesNovedad.omitidas.length}.`);
for(const omitida of releasesNovedad.omitidas)console.log(`  - ${omitida.release}: ${omitida.motivo}`);
console.log(`Sitio estático: 9 páginas editoriales, ${days.length} días y ${months.length} promedios del especial solar; ${datos.semanal.semana.length} semanas y ${datos.cumpleanos.fecha.length} fechas del especial de concepciones; parciales y registro vendorizado aplicados en dist/.`);
