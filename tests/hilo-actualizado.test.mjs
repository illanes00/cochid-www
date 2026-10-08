import test from 'node:test';
import assert from 'node:assert/strict';
import {paginaHilo} from '../scripts/presupuesto-hilo.mjs';

test('el hilo actualizado usa su alcance y la fuente de cada figura',()=>{
 const html=paginaHilo({analisis:'/blog/presupuesto/',resumen:'Gasto total y oferta programática del IFP.',tweets:[{
  texto:'El gasto crece 1,5% real frente al cierre proyectado.',
  titulo:'Gasto del Gobierno Central',grafico:'gasto-gobierno-central.png',
  alt:'Gasto total a precios de 2027.',fuente:'DIPRES, IFP 3T2026. Cierre 2026 frente al proyecto 2027.'
 }]});
 assert.match(html,/Gasto total y oferta programática del IFP\./);
 assert.match(html,/1\. Gasto del Gobierno Central/);
 assert.match(html,/DIPRES, IFP 3T2026\. Cierre 2026 frente al proyecto 2027\./);
 assert.doesNotMatch(html,/Los ajustes reales usan inflación hipotética de 3%/);
 assert.doesNotMatch(html,/Corte: 5 de octubre de 2026/);
});
