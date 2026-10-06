import test from 'node:test';
import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import {cargarGraficos,headGrafico,cuerpoGrafico,rutaGrafico} from '../scripts/graficos.mjs';

const raiz=new URL('../',import.meta.url);
const fichas=await cargarGraficos(new URL('content/graficos/',raiz));

test('cada ficha trae sus archivos y un texto para X que cabe con el enlace',async()=>{
 assert.ok(fichas.length>=30);
 for(const f of fichas){
  for(const ruta of [f.imagenes.x,f.imagenes.og,f.imagenes.vertical,f.descargas.csv])await access(new URL(`.${ruta}`,raiz));
  assert.ok([...`${f.texto_x}\n\n`].length+23<=280,`${f.slug}: texto para X demasiado largo`);
  assert.doesNotMatch(JSON.stringify(f),/[—–]/,`${f.slug} tiene raya`);
  assert.doesNotMatch(JSON.stringify(f),/COCHID|bronze|silver|gold\./,`${f.slug} expone sigla o tablas internas`);
 }
});

test('el head lleva imagen para redes y JSON-LD válido',()=>{
 const f=fichas[0];
 const head=headGrafico(f);
 for(const etiqueta of ['og:image','og:image:alt','twitter:card','twitter:image'])assert.match(head,new RegExp(`"${etiqueta}"`));
 const ld=JSON.parse(head.match(/<script type="application\/ld\+json">(.*)<\/script>/s)[1].replaceAll('\\u003c','<'));
 const tipos=ld['@graph'].map(nodo=>nodo['@type']);
 assert.deepEqual(tipos,['WebPage','ImageObject','Dataset','BreadcrumbList']);
 const dataset=ld['@graph'][2];
 assert.ok(dataset.distribution.some(d=>d.encodingFormat==='text/csv'));
 assert.ok(dataset.isBasedOn.every(url=>url.startsWith('https://')));
});

test('la página explica, ofrece descargas y no repite la ficha que se está viendo',()=>{
 const f=fichas.find(x=>x.partida==='16');
 const html=cuerpoGrafico(f,fichas);
 for(const ancla of ['como-leer','cifras','descargar','fuentes','explorar'])assert.match(html,new RegExp(`id="${ancla}"`));
 assert.doesNotMatch(html.split('Otros gráficos')[1]||'',new RegExp(`href="${rutaGrafico(f)}"`));
});

test('Seguridad Pública sólo se publica con perímetro constante',()=>{
 assert.equal(fichas.filter(f=>f.partida==='32').length,0);
 assert.ok(fichas.some(f=>f.slug==='presupuesto-2027-seguridad'));
});
