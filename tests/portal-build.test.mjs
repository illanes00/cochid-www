import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const raiz = new URL('../', import.meta.url);
const leer = ruta => readFileSync(new URL(ruta, raiz), 'utf8');

test('compone la portada con el chrome v2 canónico', () => {
  // Lee el dist/ que construye `node scripts/build.mjs` antes de las pruebas.
  // Reconstruirlo aquí competía con las otras pruebas, que lo leen en paralelo.
  const pagina = leer('dist/index.html');
  for (const parcial of ['vendor/chrome-v2/header.html', 'vendor/chrome-v2/footer.html', 'vendor/chrome-v2/manifest.json']) {
    assert.doesNotThrow(() => leer(parcial), `falta ${parcial}`);
  }
  assert.doesNotMatch(pagina, /cochid-producto/);
  for (const rotulo of ['Sobre nosotros', 'Datos', 'Mapas', 'Investigaciones', 'Blog', 'Proyectos', 'Contacto']) {
    assert.match(pagina, new RegExp(`>${rotulo}<\\/a>`));
  }
  const posiciones = ['>Sobre nosotros<', '>Datos<', '>Mapas<', '>Investigaciones<', '>Blog<', '>Proyectos<', '>Contacto<']
    .map(rotulo => pagina.indexOf(rotulo));
  assert.deepEqual(posiciones, [...posiciones].sort((a, b) => a - b));
  assert.match(pagina, /data-footer-owner="cochid"/);
  assert.match(pagina, /class="cx-sub"/);
});
