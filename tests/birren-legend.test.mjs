import {test} from 'node:test';
import assert from 'node:assert/strict';
import {leyendaDePared} from '../scripts/birren.mjs';

test('la leyenda desplazable admite teclado y tiene nombre accesible', () => {
  const html = leyendaDePared();
  assert.match(html, /class="ui-wall-legend"[^>]*tabindex="0"/);
  assert.match(html, /aria-label="Ambientes del portal"/);
});

for (const ambiente of ['lectura', 'trabajo', 'datos', 'acogida', 'servicio']) {
  test(`la leyenda de ${ambiente} explica el muro de esa plantilla`, () => {
    const html = leyendaDePared(ambiente);
    assert.deepEqual([...html.matchAll(/data-environment="([^"]+)"/g)].map(m => m[1]), [ambiente]);
    assert.match(html, /<li>.*[^>]\.<\/li>/);
  });
}
