const escapar = valor => String(valor)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

export function leerFrontmatter(fuente) {
  const coincidencia = fuente.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!coincidencia) throw new Error('Markdown sin frontmatter');
  const meta = Object.fromEntries(coincidencia[1].split('\n').map(linea => {
    const indice = linea.indexOf(':');
    return [linea.slice(0, indice).trim(), linea.slice(indice + 1).trim()];
  }));
  for (const campo of ['titulo', 'descripcion', 'ruta']) {
    if (!meta[campo]) throw new Error(`Frontmatter sin ${campo}`);
  }
  return {meta, markdown: coincidencia[2]};
}

export function reescribirAsesoria(texto) {
  return texto.replace(/\/asesoria\/(?:\?([^\s)"']*))?/g, (_, consulta = '') => {
    const tipo = new URLSearchParams(consulta).get('tipo');
    return tipo
      ? `https://innovacionsantiago.cl/contacto?servicio=${encodeURIComponent(tipo)}`
      : 'https://innovacionsantiago.cl/contacto';
  });
}

export function depurarMarkdown(markdown, ruta) {
  let limpio = markdown;
  if (ruta === '/documentacion/') {
    limpio = limpio.replace(/\n## API con llave y créditos[\s\S]*?(?=\n## Cómo citar)/, '');
  }
  limpio = limpio
    .replace(/<!--([\s\S]*?)-->/g, '')
    .replace(/\s*\[\[VERIFICAR:[\s\S]*?\]\]/g, '')
    .replace(/\n{3,}/g, '\n\n');
  return reescribirAsesoria(limpio).trim();
}

const slug = texto => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function inline(texto) {
  const codigos = [];
  let salida = texto.replace(/`([^`]+)`/g, (_, codigo) => {
    const token = `@@CODIGO${codigos.length}@@`;
    codigos.push(`<code>${escapar(codigo)}</code>`);
    return token;
  });
  salida = escapar(salida)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  codigos.forEach((codigo, indice) => { salida = salida.replace(`@@CODIGO${indice}@@`, codigo); });
  return salida;
}

const esSeparadorTabla = linea => /^\|?\s*:?-{3,}/.test(linea);
const celdas = linea => linea.replace(/^\||\|$/g, '').split('|').map(celda => celda.trim());

export function markdownAHtml(markdown, extras = {}) {
  const lineas = markdown.split('\n');
  const salida = [];
  let indice = 0;
  while (indice < lineas.length) {
    const linea = lineas[indice];
    if (!linea.trim()) { indice += 1; continue; }
    if (extras[linea.trim()]) { salida.push(extras[linea.trim()]); indice += 1; continue; }
    if (linea.startsWith('```')) {
      const codigo = [];
      indice += 1;
      while (indice < lineas.length && !lineas[indice].startsWith('```')) codigo.push(lineas[indice++]);
      indice += 1;
      salida.push(`<pre><code>${escapar(codigo.join('\n'))}</code></pre>`);
      continue;
    }
    const encabezado = linea.match(/^(#{1,6})\s+(.+)$/);
    if (encabezado) {
      const nivel = encabezado[1].length;
      if (nivel > 1) salida.push(`<h${nivel} id="${slug(encabezado[2])}">${inline(encabezado[2])}</h${nivel}>`);
      indice += 1;
      continue;
    }
    if (linea.trim().startsWith('|') && indice + 1 < lineas.length && esSeparadorTabla(lineas[indice + 1])) {
      const cabeceras = celdas(linea);
      indice += 2;
      const filas = [];
      while (indice < lineas.length && lineas[indice].trim().startsWith('|')) filas.push(celdas(lineas[indice++]));
      salida.push(`<div class="portal-tabla"><table><thead><tr>${cabeceras.map(celda => `<th scope="col">${inline(celda)}</th>`).join('')}</tr></thead><tbody>${filas.map(fila => `<tr>${fila.map(celda => `<td>${inline(celda)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    const lista = linea.match(/^\s*(-|\d+\.)\s+(.+)$/);
    if (lista) {
      const ordenada = /\d+\./.test(lista[1]);
      const etiqueta = ordenada ? 'ol' : 'ul';
      const items = [];
      while (indice < lineas.length) {
        const item = lineas[indice].match(/^\s*(-|\d+\.)\s+(.+)$/);
        if (!item || /\d+\./.test(item[1]) !== ordenada) break;
        items.push(`<li>${inline(item[2])}</li>`);
        indice += 1;
      }
      salida.push(`<${etiqueta}>${items.join('')}</${etiqueta}>`);
      continue;
    }
    if (linea.startsWith('> ')) {
      salida.push(`<blockquote><p>${inline(linea.slice(2))}</p></blockquote>`);
      indice += 1;
      continue;
    }
    const parrafo = [linea.trim()];
    indice += 1;
    while (indice < lineas.length && lineas[indice].trim()
      && !/^(#{1,6})\s|^```|^\s*(-|\d+\.)\s+|^>\s|^\|/.test(lineas[indice])
      && !extras[lineas[indice].trim()]) {
      parrafo.push(lineas[indice].trim());
      indice += 1;
    }
    salida.push(`<p>${inline(parrafo.join(' '))}</p>`);
  }
  return salida.join('\n');
}
