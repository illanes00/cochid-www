import test from 'node:test';
import assert from 'node:assert/strict';
import { solarDay, yearData, monthlyData, monthsAtHour } from '../cambio-de-hora/solar.mjs';

test('cubre los 365 días de Santiago 2026, sin duplicar fechas', () => {
 const days=yearData(); assert.equal(days.length,365); assert.equal(new Set(days.map(d=>d.date)).size,365);
 assert.equal(days[0].date,'2026-01-01'); assert.equal(days.at(-1).date,'2026-12-31');
});
test('el cambio de septiembre mueve ambos extremos 60 minutos y conserva la luz', () => {
 const d=solarDay('2026-09-06');
 assert.ok(Math.abs(d.riseLegal-d.riseFixed-60)<1e-8);
 assert.ok(Math.abs(d.setLegal-d.setFixed-60)<1e-8);
 assert.ok(Math.abs(d.setLegal-d.riseLegal-d.daylight)<1e-8);
});
test('las fechas de transición afectan el amanecer correcto', () => {
 for(const [date,offset] of [['2026-04-04',-3],['2026-04-05',-4],['2026-09-05',-4],['2026-09-06',-3]])
 assert.equal(solarDay(date).offset,offset);
});
test('contrasta el 6 septiembre con efeméride independiente de timeanddate: 07:53 y 19:28, tolerancia 3 min', () => {
 const d=solarDay('2026-09-06'); assert.ok(Math.abs(d.riseLegal-473)<3); assert.ok(Math.abs(d.setLegal-1168)<3);
});
test('invierno, verano y crepúsculo son físicamente coherentes en todos los días', () => {
 const days=yearData();
 for(const d of days){ assert.ok(d.dawnFixed<d.riseFixed); assert.ok(d.duskFixed>d.setFixed); assert.ok(d.riseFixed<d.setFixed); assert.ok(d.daylight>590 && d.daylight<870); }
 assert.ok(solarDay('2026-12-21').daylight-solarDay('2026-06-21').daylight>260);
});
test('en primavera la puesta se retrasa también sin cambiar el reloj', () => {
 assert.ok(solarDay('2026-12-21').setFixed-solarDay('2026-09-06').setFixed>80);
 assert.ok(solarDay('2026-09-06').setLegal-solarDay('2026-09-05').setLegal>60);
});
test('promedios ponderados por días conservan el total anual; abril y septiembre mezclan husos', () => {
 const days=yearData(), months=monthlyData(days);
 assert.equal(months.length,12);
 assert.ok(Math.abs(months.reduce((s,m)=>s+m.daylight*m.days,0)-days.reduce((s,d)=>s+d.daylight,0))<1e-7);
 for(const i of [3,8]){const m=months[i];assert.ok(m.riseLegal-m.riseFixed>0 && m.riseLegal-m.riseFixed<60);}
});
test('meses con luz usa punto medio de la hora y devuelve conteos enteros de cero a doce', () => {
 const m=monthlyData(yearData());
 assert.deepEqual(monthsAtHour(m,0),{legal:0,fixed:0});
 assert.deepEqual(monthsAtHour(m,12),{legal:12,fixed:12});
 for(let h=0;h<24;h++)for(const n of Object.values(monthsAtHour(m,h)))assert.ok(Number.isInteger(n)&&n>=0&&n<=12);
});
test('rechaza fechas inexistentes y fuera del alcance 2026', () => {
 for(const d of ['2026-02-30','2025-12-31','invalid','2026-13-01'])assert.throws(()=>solarDay(d));
});
