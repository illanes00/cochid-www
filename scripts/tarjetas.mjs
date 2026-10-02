import {iconoSvg, nombreIcono} from './iconos.mjs';
import {inline} from './markdown.mjs';

/* Tarjetas del portal: un bloque `::: tarjetas` o `::: dominios` de un
   Markdown editorial se convierte en una grilla. Cada tarjeta empieza con un
   encabezado y admite estas líneas:
     [host](url)            dirección del producto (destino de la tarjeta)
     [a](url) · [b](url)    acciones; la primera es el destino si no hay dirección
     Ícono: nombre          metadato para iconos.mjs; nunca se imprime
     Tipo: Estudio · resto  etiqueta y línea de contexto
     Temas: … / Vistas: …   enlaces secundarios
   y cualquier otra línea forma el resumen. */

const escapar = valor => String(valor).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const enlaceMd = /^\[([^\]]+)\]\(([^)\s]+)\)$/;
const normalizar = texto => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const hrefDestino = destino => destino.host === 'cochid.cl' ? destino.ruta : `https://${destino.host}${destino.ruta}`;

function segmentos(linea) {
  const partes = linea.split(/\s+·\s+/).map(parte => parte.trim()).filter(Boolean);
  const enlaces = [], textos = [];
  for (const parte of partes) {
    const enlace = parte.match(enlaceMd);
    if (enlace) enlaces.push({texto: enlace[1], href: enlace[2]});
    else textos.push(parte);
  }
  return {enlaces, textos, soloEnlaces: enlaces.length > 0 && textos.length <= 1 && partes[0].match(enlaceMd)};
}

export function leerTarjetas(lineas) {
  const tarjetas = [];
  let actual = null;
  for (const cruda of lineas) {
    const linea = cruda.trim();
    if (!linea) continue;
    const encabezado = linea.match(/^(#{2,4})\s+(.+)$/);
    if (encabezado) {
      actual = {nivel: encabezado[1].length, titulo: encabezado[2], resumen: [], etiquetas: [], temas: [], vistas: [], acciones: []};
      tarjetas.push(actual);
      continue;
    }
    if (!actual) throw new Error(`Línea de tarjeta sin encabezado: ${linea}`);
    const campo = linea.match(/^(Ícono|Tipo|Temas|Vistas):\s*(.+)$/);
    if (campo) {
      const [, nombre, valor] = campo;
      if (nombre === 'Ícono') actual.icono = nombreIcono(valor);
      if (nombre === 'Tipo') {
        const [tipo, ...resto] = valor.split(/\s+·\s+/);
        actual.etiquetas.push(tipo);
        if (resto.length) actual.meta = resto.join(' · ');
      }
      if (nombre === 'Temas') actual.temas = segmentos(valor).enlaces;
      if (nombre === 'Vistas') actual.vistas = segmentos(valor).enlaces;
      continue;
    }
    const partes = segmentos(linea);
    if (partes.soloEnlaces) {
      const [primero] = partes.enlaces;
      const esDireccion = partes.enlaces.length === 1 && !/\s/.test(primero.texto) && primero.texto.includes('.');
      if (esDireccion && !actual.href) {
        actual.href = primero.href;
        actual.host = primero.texto;
      } else {
        actual.acciones.push(...partes.enlaces);
      }
      actual.etiquetas.push(...partes.textos);
      continue;
    }
    actual.resumen.push(linea);
  }
  for (const tarjeta of tarjetas) {
    tarjeta.href ||= tarjeta.acciones[0]?.href || tarjeta.temas[0]?.href || tarjeta.vistas[0]?.href;
    if (!tarjeta.href) throw new Error(`La tarjeta «${tarjeta.titulo}» no tiene destino`);
    tarjeta.resumen = tarjeta.resumen.join(' ');
  }
  return tarjetas;
}

/* Ícono por destino del registro: coincide el host y el prefijo de ruta más largo. */
export function iconoPorRegistro(href, destinos) {
  const url = new URL(href, 'https://cochid.cl');
  const candidatos = destinos
    .filter(destino => destino.host === url.host && destino.icono && !destino.ruta.includes(':')
      && (url.pathname === destino.ruta || url.pathname.startsWith(destino.ruta.endsWith('/') ? destino.ruta : `${destino.ruta}/`)))
    .sort((a, b) => b.ruta.length - a.ruta.length);
  return candidatos[0]?.icono;
}

function enlacesTarjeta(tarjeta, maximo) {
  /* Un mismo rótulo no se repite aunque apunte a otro host: «Economía» tema
     y «Economía» vista se leerían como un enlace duplicado. */
  const vistos = new Set();
  return [...tarjeta.temas, ...tarjeta.vistas, ...tarjeta.acciones]
    .filter(enlace => {
      const claves = [enlace.href, `texto:${normalizar(enlace.texto)}`];
      if (claves.some(clave => vistos.has(clave))) return false;
      claves.forEach(clave => vistos.add(clave));
      return true;
    })
    .slice(0, maximo);
}

export function tarjetaHtml(tarjeta, {compacta = false, maxEnlaces = Infinity, rotuloEnlaces = 'Enlaces'} = {}) {
  const nivel = tarjeta.nivel;
  const enlaces = compacta ? [] : enlacesTarjeta(tarjeta, maxEnlaces);
  const etiquetas = tarjeta.etiquetas.map(etiqueta => `<span class="badge">${escapar(etiqueta)}</span>`).join('');
  return `<li class="portal-tarjeta">`
    + `<span class="portal-tarjeta__icono">${iconoSvg(tarjeta.icono, {tamano: compacta ? 20 : 24})}</span>`
    + `<h${nivel} class="portal-tarjeta__titulo"><a class="portal-tarjeta__enlace" href="${escapar(tarjeta.href)}">${inline(tarjeta.titulo)}</a></h${nivel}>`
    + (etiquetas ? `<p class="portal-tarjeta__etiquetas">${etiquetas}</p>` : '')
    + (tarjeta.host ? `<p class="portal-host">${escapar(tarjeta.host)}</p>` : '')
    + (tarjeta.meta ? `<p class="portal-tarjeta__meta">${inline(tarjeta.meta)}</p>` : '')
    + (tarjeta.resumen ? `<p class="portal-tarjeta__resumen">${inline(tarjeta.resumen)}</p>` : '')
    + (enlaces.length ? `<ul class="portal-tarjeta__enlaces" aria-label="${escapar(`${rotuloEnlaces} de ${tarjeta.titulo}`)}">${enlaces.map(enlace => `<li><a href="${escapar(enlace.href)}">${inline(enlace.texto)}</a></li>`).join('')}</ul>` : '')
    + (!compacta && tarjeta.relacionados?.length ? `<p class="portal-tarjeta__relacionados"><strong>Ver también:</strong> ${tarjeta.relacionados.map(enlace => `<a href="${escapar(enlace.href)}">${escapar(enlace.texto)}</a>`).join(' · ')}</p>` : '')
    + `</li>`;
}

export function grillaHtml(tarjetas, opciones = {}) {
  const clase = opciones.compacta ? 'portal-tarjetas portal-tarjetas--compacta' : 'portal-tarjetas';
  return `<ul class="${clase}">${tarjetas.map(tarjeta => tarjetaHtml(tarjeta, opciones)).join('')}</ul>`;
}

/* Dominios de /datos/: el texto viene del Markdown y el contrato del registro.
   Solo se aceptan dominios publicables y con el mismo ícono declarado. */
export function validarDominios(tarjetas, dominiosRegistro, destinosRegistro = []) {
  const publicables = dominiosRegistro;
  for (const tarjeta of tarjetas) {
    const dominio = publicables.find(candidato => normalizar(candidato.etiqueta) === normalizar(tarjeta.titulo));
    if (!dominio) throw new Error(`El dominio «${tarjeta.titulo}» no está publicado en destinos.json`);
    if (nombreIcono(dominio.icono) !== tarjeta.icono) {
      throw new Error(`El dominio «${tarjeta.titulo}» declara ${tarjeta.icono} y el registro ${dominio.icono}`);
    }
    tarjeta.id = dominio.id;
    tarjeta.orden = dominio.orden;
    tarjeta.relacionados = dominio.sitios.map(id => {
      const destino = destinosRegistro.find(candidato => candidato.id === id);
      if (!destino) throw new Error(`El dominio «${tarjeta.titulo}» referencia el sitio desconocido ${id}`);
      return {texto: destino.etiqueta, href: hrefDestino(destino)};
    });
  }
  if (tarjetas.length !== publicables.length) {
    throw new Error(`/datos/ publica ${tarjetas.length} dominios y el registro ${publicables.length}`);
  }
  return [...tarjetas].sort((a, b) => a.orden - b.orden);
}

export function completarIconos(tarjetas, destinos) {
  for (const tarjeta of tarjetas) {
    if (tarjeta.icono) continue;
    const icono = iconoPorRegistro(tarjeta.href, destinos);
    if (!icono) throw new Error(`La tarjeta «${tarjeta.titulo}» no declara Ícono ni tiene destino con ícono`);
    tarjeta.icono = nombreIcono(icono);
  }
  return tarjetas;
}
