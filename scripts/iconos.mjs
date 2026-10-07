/* Adaptador de los nombres históricos del registro a los íconos del kit .46.
   La geometría se importa del paquete canónico, con procedencia y licencia. */

import {iconoKit} from './birren.mjs';

const nombresKit = {
    buscar:'search', mapa:'map', archivo:'file', moneda:'landmark', escudo:'shield',
    personas:'users', grafico:'trending-up', urna:'vote', acta:'file-text', balanza:'scale',
    bus:'bus', brujula:'map', ciudad:'building-2', bicicleta:'map-pin', tren:'bus', red:'layers',
    nube:'sun', herramienta:'wand-sparkles', editar:'file-text', pluma:'file-text', libro:'book-open',
    reloj:'clock', calendario:'calendar', pildora:'heart-pulse', tabla:'bar-chart-3', descarga:'download',
    informe:'file-text', base_datos:'database', edificio:'building-2', globo:'globe',
};

/* Sinónimos del registro de destinos y de los textos, sin tildes ni mayúsculas. */
const sinonimos = {
  search: 'buscar', map: 'mapa', file: 'archivo', coins: 'moneda', shield: 'escudo',
  people: 'personas', users: 'personas', chart: 'grafico', balance: 'balanza', scale: 'balanza',
  compass: 'brujula', city: 'ciudad', bike: 'bicicleta', train: 'tren', network: 'red',
  cloud: 'nube', wrench: 'herramienta', edit: 'editar', book: 'libro', clock: 'reloj',
  pill: 'pildora', cross: 'pildora', cruz: 'pildora', database: 'base_datos',
  building: 'edificio', globe: 'globo', 'file-check': 'acta',
};

const normalizar = nombre => String(nombre).normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

export function nombreIcono(nombre) {
  const clave = normalizar(nombre);
  const canonico = nombresKit[clave] ? clave : sinonimos[clave];
  if (!canonico) throw new Error(`Ícono sin SVG en scripts/iconos.mjs: ${nombre}`);
  return canonico;
}

export function iconoSvg(nombre, {tamano = 24, clase = 'portal-icono'} = {}) {
  const canonico = nombreIcono(nombre);

  return iconoKit(nombresKit[canonico], {tamano, clase:`${clase} ui-kit-icon`}).replace('<svg ', `<svg data-icono="${canonico}" `);
}

export const iconosDisponibles = Object.keys(nombresKit);
