/* Nombres públicos en las páginas de temas vendorizadas (vendor/v2/temas, generadas desde la
   taxonomía con los nombres técnicos del catálogo). Se aplica en el build sobre dist/temas:
   - cada conjunto toma su nombre de data/nombres-publicos.v1.json;
   - los que tienen visible=false (incluidos los «en preparación») no se listan;
   - los conteos del tema y del índice se recalculan con lo que queda;
   - la nota sobre «en preparación» se retira porque esos conjuntos ya no aparecen. */

const escapar = valor => String(valor).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const LI = /<li><a href="https:\/\/datos\.cochid\.cl\/dataset\/([^"]+)">[^<]*<\/a>(?:<span class="rel__t">en preparación<\/span>)?<\/li>/g;
const LISTA = /<ul class="conj">((?:(?!<\/ul>).)*)<\/ul>(?:<details class="mas"><summary>Ver los \d+ conjuntos restantes<\/summary><ul class="conj">((?:(?!<\/ul>).)*)<\/ul><\/details>)?/gs;
const VISIBLES = 3;

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

export function temaPublico(html, nombres) {
  let total = 0;
  const salida = html.replace(LISTA, (_, a, b = '') => {
    const ids = [...`${a}${b}`.matchAll(LI)].map(m => m[1]);
    const items = ids.filter(id => nombres[id]?.visible !== false && nombres[id])
      .map(id => `<li><a href="https://datos.cochid.cl/dataset/${escapar(id)}">${escapar(nombres[id].nombre)}</a></li>`);
    total += items.length;
    if (!items.length) return '';
    const resto = items.slice(VISIBLES);
    if (resto.length < 3) return `<ul class="conj">${items.join('')}</ul>`;
    return `<ul class="conj">${items.slice(0, VISIBLES).join('')}</ul><details class="mas"><summary>Ver ${plural(resto.length, 'conjunto más', 'conjuntos más')}</summary><ul class="conj">${resto.join('')}</ul></details>`;
  });
  const resumen = total ? `${plural(total, 'conjunto de datos publicado', 'conjuntos de datos publicados')}` : 'Los conjuntos de este tema todavía se están preparando';
  return {
    total,
    html: salida
      .replace(/(<p class="pt__n">)\d+ conjuntos de datos(, \d+ indicadores)?\.[^<]*/, (_, p, ind = '') => `${p}${resumen}${ind}.`)
      .replace(/(<meta name="description" content="[^"]*?)\s*\d+ conjuntos de datos(, \d+ indicadores)?\.[^"]*"/, (_, m, ind = '') => `${m} ${resumen}${ind}."`)
      .replace(/\s*<p>Un conjunto «en preparación»[^<]*<\/p>/, ''),
  };
}

export function indicePublico(html, totales) {
  let suma = 0;
  const salida = html.replace(/(<a href="\.\.\/temas\/([a-z-]+)\/">[^<]*<\/a><\/h2><p class="tema__f">[^<]*<\/p><p class="tema__n">)\d+ conjuntos de datos/g, (_, antes, id) => {
    const n = totales[id] ?? 0;
    suma += n;
    return `${antes}${plural(n, 'conjunto de datos', 'conjuntos de datos')}`;
  });
  return salida
    .replace(/<p>\d+ conjuntos de datos en (\d+) temas\./, (_, t) => `<p>${plural(suma, 'conjunto de datos publicado', 'conjuntos de datos publicados')} en ${t} temas.`)
    .replace(/El catálogo tiene \d+ registros; \d+ son archivos auxiliares sin tema y no se cuentan\. /, 'Se cuentan solo los conjuntos publicados. ')
    .replace(/\s*<p>«En preparación» significa[^<]*<\/p>/, '')
    .replace(/(<meta name="description" content=")\d+ conjuntos de datos/, (_, m) => `${m}${plural(suma, 'conjunto de datos', 'conjuntos de datos')}`);
}
