import {readFile,writeFile,mkdir,cp,rm} from 'node:fs/promises';
import {yearData,monthlyData,hhmm,MONTHS} from '../cambio-de-hora/solar.mjs';
import {cargarDatos,tablas,verificarContrato} from './tablas-concepciones.mjs';
const root=new URL('../',import.meta.url), out=new URL('../dist/',import.meta.url);
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
const home=await readFile(new URL('index.html',root),'utf8');
for(const file of ['index.html','robots.txt','sitemap.xml'])await cp(new URL(file,root),new URL(file,out));
const kit=home.match(/^.*(?:<link[^>]+(?:style\.css|rel="icon")|<script[^>]+(?:theme\.js|chrome\.js)).*$/gm).join('\n');
const footer=home.match(/<footer class="gr-footer">[\s\S]*?<\/footer>/)[0];
const baseHeader=home.match(/<header class="gr-nav">[\s\S]*?<\/header>/)[0]
 .replace(/href="#que-es-cochid"/g,'href="/#que-es-cochid"').replace(/href="#productos"/g,'href="/#productos"').replace(/href="#servicios"/g,'href="/#servicios"');
const enlace=(href,texto)=>`<a class="gr-nav__link" href="${href}">${texto}</a>`;
/* El chrome de la portada trae su propio grupo de anclas; cada especial lo
   reemplaza por el suyo. */
const header=anclas=>baseHeader.replace(/<div class="gr-nav__group">[\s\S]*?<\/div>/,
 `<div class="gr-nav__group">${anclas.map(([h,t])=>enlace(h,t)).join('')}</div>`);

/* Un especial es un directorio propio con su index.html marcado. Se copia
   entero, se le inyecta el chrome compartido y se aplican sus reemplazos. */
async function especial({dir,anclas,reemplazos={}}){
 await cp(new URL(dir+'/',root),new URL(dir+'/',out),{recursive:true});
 let page=await readFile(new URL(dir+'/index.html',root),'utf8');
 page=page.replace('<!--KIT_HEAD-->',kit).replace('<!--HEADER-->',header(anclas)).replace('<!--FOOTER-->',footer);
 for(const [marca,html] of Object.entries(reemplazos)){
  if(!page.includes(`<!--${marca}-->`))throw new Error(`${dir}/index.html no tiene el marcador ${marca}`);
  page=page.replaceAll(`<!--${marca}-->`,html);
 }
 const pendiente=page.match(/<!--[A-Z_0-9]+-->/);
 if(pendiente)throw new Error(`${dir}/index.html quedó con el marcador ${pendiente[0]} sin resolver`);
 await writeFile(new URL(dir+'/index.html',out),page);
 return page;
}

/* Cambio de hora: la tabla mensual y los CSV salen del mismo modelo solar. */
const days=yearData(),months=monthlyData(days);
await especial({
 dir:'cambio-de-hora',
 anclas:[['#explorar','Explorar'],['#argumento','El argumento'],['#graficos','El año'],['#metodo','Datos y fuentes']],
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
await especial({
 dir:'concepciones',
 anclas:[['#curva','La curva'],['#semana','Semana o día'],['#parto','El parto'],['#cumpleanos','Cumpleaños'],['#metodo','Método']],
 reemplazos:tablas(datos)
});

console.log(`Sitio estático: ${days.length} días y ${months.length} promedios del especial solar; ${datos.semanal.semana.length} semanas y ${datos.cumpleanos.fecha.length} fechas del especial de concepciones; chrome compartido, tablas y CSV exportados en dist/.`);
