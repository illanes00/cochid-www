import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

const raiz = new URL('../', import.meta.url);
const leer = ruta => readFileSync(new URL(ruta, raiz), 'utf8');

test('compone la portada con los parciales canónicos de la familia', () => {
  const build = spawnSync(process.execPath, ['scripts/build.mjs'], {
    cwd: new URL('.', raiz),
    encoding: 'utf8',
  });
  assert.equal(build.status, 0, build.stderr || build.stdout);

  const pagina = leer('dist/index.html');
  for (const parcial of ['partials/head.html', 'partials/header.html', 'partials/footer.html', 'partials/migas.html']) {
    assert.doesNotThrow(() => leer(parcial), `falta ${parcial}`);
  }
  assert.match(pagina, /class="cochid-producto"[^>]*>Portal<\/a>/);
  for (const rotulo of ['Datos', 'Mapas', 'Investigaciones', 'Presupuesto']) {
    assert.match(pagina, new RegExp(`>${rotulo}<\\/a>`));
  }
  const posiciones = ['>Datos<', '>Mapas<', '>Investigaciones<', '>Presupuesto<']
    .map(rotulo => pagina.indexOf(rotulo));
  assert.deepEqual(posiciones, [...posiciones].sort((a, b) => a - b));
  assert.match(pagina, /data-footer-owner="cochid"/);
  assert.doesNotMatch(leer('scripts/build.mjs'), /match\(\/<(?:header|footer)/);
});
