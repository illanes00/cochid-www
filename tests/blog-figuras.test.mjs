import test from 'node:test';
import assert from 'node:assert/strict';
import {figuraBlog} from '../scripts/blog.mjs';

const figura = {src: '/assets/presupuesto-2027/aportes.png', alt: 'Educación y Salud: cambio nominal y real', pie: 'Escenario de inflación de 3%, no IPC observado.', ancho: '1440', alto: '1080'};

test('una figura conserva texto alternativo, proporción y leyenda accesibles', () => {
  const html = figuraBlog(figura);
  assert.match(html, /<figure class="blog-figura">/);
  assert.match(html, /alt="Educación y Salud: cambio nominal y real"/);
  assert.match(html, /width="1440" height="1080"/);
  assert.match(html, /<figcaption>Escenario de inflación de 3%, no IPC observado\.<\/figcaption>/);
});

test('rechaza destinos externos, rutas de escape y datos incompletos', () => {
  for (const src of ['javascript:alert(1)', '//otro.cl/img.png', 'https://otro.cl/img.png', '/assets/../archivo.svg', '/assets/img.png" onerror="alert(1)']) {
    assert.throws(() => figuraBlog({...figura, src}), /Figura/);
  }
  for (const atributo of ['alt', 'pie', 'ancho', 'alto']) assert.throws(() => figuraBlog({...figura, [atributo]: ''}), /Figura/);
  assert.throws(() => figuraBlog({...figura, ancho: '1440px'}), /Figura/);
});

test('escapa leyenda y texto alternativo sin permitir HTML ejecutable', () => {
  const html = figuraBlog({...figura, alt: '" <img onerror=x>', pie: '<script>alert(1)</script>'});
  assert.doesNotMatch(html, /<script>|<img onerror/);
  assert.match(html, /&quot; &lt;img onerror=x&gt;/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});
