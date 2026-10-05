import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {paginaHilo} from '../scripts/presupuesto-hilo.mjs';
const hilo=JSON.parse(readFileSync(new URL('../assets/presupuesto-2027/hilo.json',import.meta.url)));

test('cada texto cabe en 280 caracteres e identifica el carácter hipotético del ajuste real',()=>{
  assert.equal(hilo.tweets.length,6);
  for(const t of hilo.tweets)assert.ok([...t.texto].length<=280);
  assert.match(hilo.tweets[1].texto,/inflación hipotética/);
  assert.match(hilo.tweets[3].texto,/ambos años/);
});

test('cada fila ofrece texto seleccionable, Copiar y PNG descargable con texto alternativo',()=>{
  const html=paginaHilo(hilo);
  assert.equal((html.match(/<textarea\b/g)||[]).length,6);
  assert.equal((html.match(/data-copiar-tweet="/g)||[]).length,6);
  assert.equal((html.match(/download="presupuesto-2027-[^"]+\.png"/g)||[]).length,6);
  assert.match(html,/data-copiar-hilo/);
  assert.match(html,/role="status"/);
  assert.match(html,/No se envía a X/);
});

test('rechaza gráficos externos, textos demasiado largos y HTML ejecutable',()=>{
  assert.throws(()=>paginaHilo({...hilo,tweets:[{...hilo.tweets[0],texto:'a'.repeat(281)}]}),/280/);
  assert.throws(()=>paginaHilo({...hilo,tweets:[{...hilo.tweets[0],grafico:'../x.png'}]}),/gráfico/);
  const html=paginaHilo({...hilo,tweets:[{...hilo.tweets[0],texto:'</textarea><script>alert(1)</script>'}]});
  assert.doesNotMatch(html,/<script>alert/);
});
