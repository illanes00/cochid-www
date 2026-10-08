import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {cargarEntradas, metaEntrada, rss} from '../scripts/blog.mjs';

const entrada = {
  tipo: 'analisis', fecha: '2026-10-05', actualizado: '2026-10-08',
  titulo: 'Presupuesto 2027', resumen: 'Comparación del proyecto.',
  ruta: '/blog/presupuesto-2027/', etiquetas: ['presupuesto'], minutos: 3,
};

test('una actualización muestra su fecha y refresca el feed conservando la publicación original', () => {
  const html = metaEntrada(entrada);
  assert.match(html, /<time datetime="2026-10-05">5 de octubre de 2026<\/time>/);
  assert.match(html, /Actualizado el <time datetime="2026-10-08">8 de octubre de 2026<\/time>/);
  const feed = rss([entrada]);
  assert.match(feed, /<pubDate>Mon, 05 Oct 2026 00:00:00 -0300<\/pubDate>/);
  assert.match(feed, /<lastBuildDate>Thu, 08 Oct 2026 00:00:00 -0300<\/lastBuildDate>/);
});

test('el blog rechaza una actualización anterior a la publicación o con fecha inválida', () => {
  const dir = mkdtempSync(join(tmpdir(), 'blog-fecha-'));
  try {
    for (const actualizado of ['2026-10-04', 'ayer', '2027-02-30']) {
      writeFileSync(join(dir, 'presupuesto.md'), `---
titulo: Presupuesto 2027
slug: presupuesto-2027
fecha: 2026-10-05
actualizado: ${actualizado}
autor: Equipo editorial
resumen: Comparación del proyecto.
descripcion: Cifras y bases de comparación.
ruta: /blog/presupuesto-2027/
tipo: analisis
dominio: null
etiquetas: [presupuesto]
datos: []
borrador: false
---
El proyecto sigue en tramitación.
`);
      assert.throws(() => cargarEntradas(pathToFileURL(dir + '/'), []), /actualizado/, actualizado);
    }
  } finally {
    rmSync(dir, {recursive: true});
  }
});
