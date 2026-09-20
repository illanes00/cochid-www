/* Figuras de "Cuándo se concibe en Chile".
   SVG propio, un módulo, sin dependencias ni librerías de gráficos. Los datos
   se leen de ./datos/*.json, que es el recorte publicable de pagina.json.
   Ningún color se escribe como hexadecimal: todo sale de las variables de tema
   declaradas en story.css, para que el cambio de tema no exija volver a
   dibujar. Ninguna figura anima: el único movimiento es el cursor de lectura,
   que aparece sin transición, de modo que prefers-reduced-motion se cumple por
   construcción y no necesita una rama aparte. */

const NS = 'http://www.w3.org/2000/svg';
const $ = s => document.querySelector(s);

/* Formato de número. Intl.NumberFormat('es-CL') emite el signo menos Unicode y
   esta página solo admite el guion ASCII, así que el formateo es propio. */
const f = (v, d = 2) => (v === null || v === undefined || Number.isNaN(v) ? 'sin dato' : Number(v).toFixed(d).replace('.', ','));
const fs = (v, d = 2) => (v >= 0 ? '+' : '') + f(v, d);
const fpct = (v, d = 1) => fs(v, d) + '%';
const miles = v => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const MES_INICIO = [1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
const MES_LARGO = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MES3 = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DOW_KEY = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
const DOW_LARGO = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DOW_CORTO = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MATRIZ_KEY = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];

/* Mapa de código de región a nombre. No viene en los datos; está documentado en
   la sección 2.1 de docs/concepciones-figuras.md. */
const REGION = {1: 'Tarapacá y Arica', 2: 'Antofagasta', 3: 'Atacama', 4: 'Coquimbo', 5: 'Valparaíso', 13: 'Metropolitana', 6: "O'Higgins", 7: 'Maule', 8: 'Biobío', 9: 'Araucanía', 10: 'Los Lagos y Los Ríos', 11: 'Aysén', 12: 'Magallanes'};
const REGION_CORTA = {1: 'TA', 2: 'AN', 3: 'AT', 4: 'CO', 5: 'VA', 13: 'RM', 6: 'OH', 7: 'MA', 8: 'BI', 9: 'AR', 10: 'LL', 11: 'AY', 12: 'MG'};
const ESTRATO_NOMBRE = {
  'depe:pagado': 'Particular pagado', 'depe:subvencionado': 'Part. subvencionado', 'depe:municipal': 'Municipal',
  'rural:rural': 'Rural', 'rural:urbano': 'Urbano', 'zona:norte': 'Zona norte', 'zona:centro': 'Zona centro',
  'zona:sur': 'Zona sur', nacional: 'Nacional (referencia)'
};

/* Piso de ruido de la propia verdad, RMSE de 0,010 a 0,015 entre mitades de
   años. No está en los datos publicados: se cita de la sección 5.2 del informe
   de síntesis del estudio. */
const PISO_RUIDO = 0.015;

const el = (tag, attrs = {}, text) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== null && v !== undefined) e.setAttribute(k, v);
  if (text !== undefined) e.textContent = text;
  return e;
};
const add = (parent, tag, attrs, text) => parent.appendChild(el(tag, attrs, text));
const txt = (p, x, y, s, attrs = {}) => add(p, 'text', {x, y, 'font-size': 11, ...attrs}, s);
const linea = (p, x1, y1, x2, y2, attrs = {}) => add(p, 'line', {x1, y1, x2, y2, ...attrs});
const trazo = (p, d, color, ancho = 2, attrs = {}) => add(p, 'path', {d, fill: 'none', style: `stroke:var(${color})`, 'stroke-width': ancho, 'stroke-linejoin': 'round', ...attrs});
const relleno = (p, d, color, attrs = {}) => add(p, 'path', {d, style: `fill:var(${color})`, stroke: 'none', ...attrs});
const caja = (p, x, y, w, h, color, attrs = {}) => add(p, 'rect', {x, y, width: Math.max(0, w), height: Math.max(0, h), style: `fill:var(${color})`, ...attrs});

/* Bloque de lectura: el relleno tenue no llega al umbral de percepción por sí
   solo, así que cada bloque lleva además un filete arriba y abajo en la línea
   fuerte del tema. Sin eso, la leyenda anuncia marcas que el lector no ve. */
function bloque(p, x, y, w, h, color, attrs = {}) {
  const r = caja(p, x, y, w, h, color, attrs);
  linea(p, x, y, x + w, y, {class: 'limite'});
  linea(p, x, y + h, x + w, y + h, {class: 'limite'});
  return r;
}

const modoDe = w => (w >= 900 ? 'amplio' : w >= 560 ? 'medio' : 'compacto');

/* Lienzo accesible: role de imagen, título, descripción enlazada al pie y un
   solo punto de foco por figura. */
function lienzo(cont, w, h, aria, describe) {
  cont.replaceChildren();
  const svg = add(cont, 'svg', {
    viewBox: `0 0 ${w} ${h}`, width: w, height: h, role: 'img',
    'aria-label': aria, 'aria-describedby': describe, tabindex: '0'
  });
  add(svg, 'title', {}, aria);
  const g = add(svg, 'g', {'aria-hidden': 'true'});
  return {svg, g};
}

/* Interacción común: puntero y teclado mueven un cursor discreto sobre el eje
   mayor, y el valor se anuncia en el párrafo con aria-live.
   Cuando la figura tiene varios paneles, `area.local` traduce la coordenada del
   lienzo a la del panel bajo el cursor, y devuelve null si el cursor está fuera
   de la zona interactiva. Sin esa traducción el puntero solo respondería sobre
   el primer panel y el resto de la superficie devolvería el extremo de la serie.
   La región aria-live solo se reescribe cuando el índice cambia: un barrido de
   puntero sobre 365 puntos encolaría si no cien anuncios idénticos. */
function interactivo({svg, cont, n, area, alMover, inicial = null}) {
  let i = inicial, iniciado = false;
  const fijar = j => {
    const nuevo = j === null ? null : Math.max(0, Math.min(n - 1, j));
    if (iniciado && nuevo === i) return;
    iniciado = true;
    i = nuevo;
    alMover(i);
  };
  const desdeX = ev => {
    const caja = svg.getBoundingClientRect();
    const escala = svg.viewBox.baseVal.width / caja.width;
    const x = (ev.clientX - caja.left) * escala;
    const y = (ev.clientY - caja.top) * escala;
    const local = area.local ? area.local(x, y) : x;
    if (local === null) return null;
    return Math.round(((local - area.x0) / (area.x1 - area.x0)) * (n - 1));
  };
  svg.addEventListener('pointermove', ev => fijar(desdeX(ev)));
  svg.addEventListener('pointerdown', ev => { svg.focus(); fijar(desdeX(ev)); });
  svg.addEventListener('pointerleave', () => { if (document.activeElement !== svg) fijar(null); });
  svg.addEventListener('keydown', ev => {
    const paso = area.bloque || 13;
    const actual = i === null ? 0 : i;
    const mapa = {ArrowLeft: actual - 1, ArrowRight: actual + 1, Home: 0, End: n - 1, PageUp: actual - paso, PageDown: actual + paso};
    if (ev.key === 'Escape') { fijar(null); return; }
    if (!(ev.key in mapa)) return;
    ev.preventDefault();
    fijar(mapa[ev.key]);
  });
  cont.addEventListener('pointerleave', () => { if (document.activeElement !== svg) fijar(null); });
  fijar(i);
}

/* Cada figura se redibuja cuando cambia el ancho útil, porque el diseño cambia
   de forma en cada quiebre en vez de encogerse. */
function montar(id, dibujar) {
  const cont = $(`#${id}-chart`);
  if (!cont) return;
  let ancho = 0;
  const pintar = () => {
    const w = Math.max(240, Math.round(cont.clientWidth));
    if (w === ancho) return;
    ancho = w;
    try {
      dibujar(cont, w, modoDe(w));
    } catch (error) {
      falla(cont, `No se pudo dibujar esta figura: ${error.message}. Los datos completos siguen disponibles en la tabla de más abajo.`);
    }
  };
  pintar();
  new ResizeObserver(pintar).observe(cont);
}

function falla(cont, mensaje) {
  cont.replaceChildren();
  const p = document.createElement('p');
  p.className = 'notice';
  p.textContent = mensaje;
  cont.appendChild(p);
}

function leyenda(id, entradas) {
  const cont = $(`#${id}-leyenda`);
  if (!cont) return;
  cont.replaceChildren();
  for (const [clase, texto] of entradas) {
    const s = document.createElement('span');
    const i = document.createElement('i');
    i.className = clase;
    s.append(i, document.createTextNode(texto));
    cont.appendChild(s);
  }
}

const decir = (id, texto) => { const p = $(`#${id}-lectura`); if (p) p.textContent = texto; };

/* Eje de meses compartido por las figuras de día del año. */
function ejeMeses(g, x, y, modo, alto) {
  for (let m = 0; m < 12; m++) {
    const x0 = x(MES_INICIO[m]);
    linea(g, x0, y, x0, y + 5, {class: 'eje'});
    if (modo === 'compacto' && m % 3 !== 0) continue;
    const centro = x(MES_INICIO[m] + MES_LARGO[m] / 2);
    txt(g, centro, y + 18, MES3[m], {'text-anchor': 'middle', 'font-size': modo === 'compacto' ? 9 : 10});
  }
  if (alto) linea(g, x(1), y, x(365), y, {class: 'eje'});
}

const semanaDeDia = d => Math.min(52, Math.floor((d - 1) / 7) + 1);
const diasDeSemana = s => (s === 52 ? [358, 365] : [(s - 1) * 7 + 1, s * 7]);

/* ---------------------------------------------------------------- F1 */
function figura1(datos) {
  const s = datos.semanal, c = datos.cumpleanos;
  /* Serie diaria de nacimientos alineada a la grilla de 365 días: el 29 de
     febrero no existe en la grilla de concepción y se descarta. */
  const crudo = [], limpio = [];
  for (let i = 0; i < c.fecha.length; i++) {
    if (c.fecha[i] === '29-feb') continue;
    crudo.push(c.indice_crudo[i]);
    limpio.push(c.indice_limpio[i]);
  }
  const iFecha = fecha => s.doy_fecha.indexOf(fecha);

  leyenda('f1', [
    ['sw-conc', 'Índice de concepción'], ['sw-conc-banda', 'IC95 entre años'],
    ['sw-empate', 'Quincena máxima, empate'], ['sw-bloque', 'Meseta mínima'],
    ['sw-parto-crudo', 'Nacimientos en crudo'], ['sw-parto', 'Nacimientos sin calendario']
  ]);

  montar('f1', (cont, w, modo) => {
    const izq = modo === 'compacto' ? 40 : 52, der = modo === 'amplio' ? 74 : 16;
    const hSup = modo === 'amplio' ? 380 : modo === 'medio' ? 330 : 290;
    const hInf = modo === 'amplio' ? 200 : modo === 'medio' ? 190 : 170;
    const topSup = 16, topInf = topSup + hSup + 46, alto = topInf + hInf + 34;
    const x = d => izq + ((d - 1) / 364) * (w - izq - der);
    const ySup = v => topSup + ((1.1 - v) / (1.1 - 0.94)) * hSup;
    const yInf = v => topInf + ((1.25 - v) / (1.25 - 0.66)) * hInf;

    const aria = 'Índice semanal de concepciones en Chile, cohortes 1989 a 2007. El máximo es la quincena del 24 de diciembre al 7 de enero y el mínimo es una meseta de casi dos meses entre julio y septiembre.';
    const {svg, g} = lienzo(cont, w, alto, aria, 'f1-cap');

    /* Bloques de lectura: la quincena máxima cruza el fin de año, así que son
       dos rectángulos, y el valle es uno solo. */
    for (const [a, b] of [[358, 365], [1, 7]]) bloque(g, x(a), topSup, x(b) - x(a), hSup, '--empate', {opacity: 0.2});
    bloque(g, x(190), topSup, x(245) - x(190), hSup, '--bloque');

    /* Banda de IC95 y línea escalonada del índice semanal. */
    let arriba = '', abajo = '';
    for (let k = 0; k < 52; k++) {
      const [a, b] = diasDeSemana(s.semana[k]);
      arriba += `${k ? 'L' : 'M'}${x(a)},${ySup(s.indice_hi[k])}L${x(b)},${ySup(s.indice_hi[k])}`;
      abajo = `L${x(b)},${ySup(s.indice_lo[k])}L${x(a)},${ySup(s.indice_lo[k])}` + abajo;
    }
    relleno(g, arriba + abajo + 'Z', '--conc-banda', {opacity: 0.75});
    for (let k = 0; k < 52; k++) {
      const [a, b] = diasDeSemana(s.semana[k]);
      trazo(g, `M${x(a)},${ySup(s.indice[k])}L${x(b)},${ySup(s.indice[k])}`, '--conc', 2.4,
        s.significativo[k] ? {} : {'stroke-dasharray': '3 3'});
      if (k) {
        const previo = diasDeSemana(s.semana[k - 1])[1];
        trazo(g, `M${x(previo)},${ySup(s.indice[k - 1])}L${x(a)},${ySup(s.indice[k])}`, '--conc', 1);
      }
    }
    linea(g, x(1), ySup(1), x(365), ySup(1), {class: 'ref'});
    txt(g, x(365), ySup(1) - 6, 'día promedio', {'text-anchor': 'end', 'font-size': 10});

    /* Eje vertical: índice a la izquierda, la misma cifra rotulada como
       desviación a la derecha. No se dibuja dos veces. */
    for (let v = 0.96; v <= 1.081; v += 0.04) {
      txt(g, izq - 8, ySup(v) + 4, f(v, 2), {'text-anchor': 'end', class: 'cifra', 'font-size': 10});
      if (modo === 'amplio') txt(g, w - der + 8, ySup(v) + 4, fs((v - 1) * 100, 0) + '%', {class: 'cifra', 'font-size': 10});
    }
    txt(g, izq - 8, topSup - 4, 'índice', {'text-anchor': 'end', 'font-size': 10});
    if (modo === 'amplio') txt(g, w - der + 8, topSup - 4, 'desviación', {'font-size': 10});

    /* Anotaciones de bloque. Nunca un punto: el dato no identifica una semana.
       Las probabilidades del duelo se leen de semanal.json y no se escriben a
       mano: el número de remuestreos del bloque de concepción cambió de 400 a
       2.000 y un conteo fijo queda mintiendo sobre el denominador. */
    const compacto = modo === 'compacto';
    const gana = o => Object.entries(o || {}).sort((a, b) => b[1] - a[1]);
    const gMax = gana(s.quincena_pico && s.quincena_pico.p_argmax);
    const gMin = gana(s.valle_meseta && s.valle_meseta.p_argmin).slice(0, 3);
    const notaMax = compacto ? ['Máximo: 24-dic a 7-ene'] : ['Máximo: 24-dic a 7-ene', '+8,7% y +8,4%, empate', 'diferencia 0,32 puntos, IC95 -0,06 a +0,67;'];
    if (modo === 'amplio' && gMax.length) notaMax.push(`la ${gMax[0][0]} gana en ${f(gMax[0][1], 2)} de los remuestreos`);
    notaMax.forEach((t, k) => txt(g, x(358) - 10, topSup + 16 + k * 14, t, {
      'text-anchor': 'end', class: k ? '' : 'anota', 'font-size': k ? 10 : compacto ? 11 : 12, 'font-weight': k ? 400 : 600
    }));
    const notaMin = compacto ? ['Mínimo: meseta de 9-jul a 1-sep'] : ['Mínimo: una meseta de casi dos meses', 'entre -4,7% y -3,9%, sin semana identificable'];
    if (modo === 'amplio' && gMin.length === 3) notaMin.push(`la ${gMin[0][0]} gana en ${f(gMin[0][1], 2)} de los remuestreos, la ${gMin[1][0]} en ${f(gMin[1][1], 2)} y la ${gMin[2][0]} en ${f(gMin[2][1], 2)}`);
    notaMin.forEach((t, k) => txt(g, x(217), topSup + (compacto ? 36 : 16) + k * 14, t, {
      'text-anchor': 'middle', class: k ? '' : 'anota', 'font-size': k ? 10 : compacto ? 11 : 12, 'font-weight': k ? 400 : 600
    }));

    /* Panel inferior: el mismo eje de días, del lado del parto. */
    const poli = (serie, acceso = v => v) => serie.map((v, k) => `${k ? 'L' : 'M'}${x(k + 1)},${yInf(acceso(v))}`).join('');
    let bandaArriba = '', bandaAbajo = '';
    for (let k = 0; k < 365; k++) {
      bandaArriba += `${k ? 'L' : 'M'}${x(k + 1)},${yInf(s.doy_hi[k])}`;
      bandaAbajo = `L${x(k + 1)},${yInf(s.doy_lo[k])}` + bandaAbajo;
    }
    linea(g, x(1), yInf(1), x(365), yInf(1), {class: 'ref'});
    trazo(g, poli(crudo), '--parto-crudo', 1);
    trazo(g, poli(limpio), '--parto', 1.4);
    relleno(g, bandaArriba + bandaAbajo + 'Z', '--conc-banda');
    trazo(g, poli(s.doy_concepcion), '--conc', 2);
    for (let v = 0.7; v <= 1.21; v += 0.1) txt(g, izq - 8, yInf(v) + 4, f(v, 1), {'text-anchor': 'end', class: 'cifra', 'font-size': 10});

    /* Las etiquetas del panel inferior se llevan a bandas libres y se unen a su
       punto con una guía corta, para no escribir encima de las series. */
    const anotaciones = [
      {fecha: '25-dic', texto: modo === 'compacto'
        ? `25-dic: ${fpct((crudo[iFecha('25-dic')] - 1) * 100, 0)} en crudo, ${f(limpio[iFecha('25-dic')], 3)} limpio`
        : `25-dic: ${fpct((crudo[iFecha('25-dic')] - 1) * 100, 0)} de nacimientos en crudo. Descontado el feriado, ${f(limpio[iFecha('25-dic')], 3)}, o sea normal.`, ty: 0.695, ancla: 'end'},
      {fecha: '27-dic', texto: `27-dic: ${fpct((crudo[iFecha('27-dic')] - 1) * 100, 0)}, el rebote.`, ty: 1.235, ancla: 'end'},
      {fecha: '18-sep', texto: `18-sep: ${fpct((crudo[iFecha('18-sep')] - 1) * 100, 0)} en crudo y ${f(limpio[iFecha('18-sep')], 3)} descontado el feriado.`, ty: 0.745, ancla: 'middle'}
    ];
    const visibles = modo === 'amplio' ? anotaciones : modo === 'medio' ? anotaciones.slice(0, 2) : anotaciones.slice(0, 1);
    for (const a of visibles) {
      const i = iFecha(a.fecha), d = i + 1;
      add(g, 'circle', {cx: x(d), cy: yInf(crudo[i]), r: 3, style: 'fill:var(--parto-crudo)'});
      linea(g, x(d), yInf(crudo[i]), x(d), yInf(a.ty) + (a.ty > crudo[i] ? 4 : -10), {class: 'eje'});
      txt(g, x(d) + (a.ancla === 'end' ? -5 : 0), yInf(a.ty), a.texto,
        {'text-anchor': a.ancla, 'font-size': modo === 'compacto' ? 9 : 10, class: 'anota'});
    }
    if (modo === 'amplio') {
      txt(g, x(34), yInf(1.215), 'La curva de concepción no tiene ningún rasgo de un día: el núcleo', {'font-size': 10, class: 'anota'});
      txt(g, x(34), yInf(1.215) + 13, 'gestacional, con desvío de 12,5 días, no puede transmitirlo.', {'font-size': 10, class: 'anota'});
    }

    ejeMeses(g, x, topInf + hInf + 6, modo, true);
    txt(g, 0, topInf - 4, 'nacimientos', {'font-size': 10});

    const cursor = add(g, 'line', {x1: 0, y1: topSup, x2: 0, y2: topInf + hInf, class: 'cursor', opacity: 0});
    interactivo({
      svg, cont, n: 365, area: {x0: x(1), x1: x(365), bloque: 7},
      alMover: i => {
        if (i === null) {
          cursor.setAttribute('opacity', 0);
          decir('f1', 'Mueve el puntero sobre la figura, o usa las flechas con el foco puesto en ella, para leer un día concreto.');
          return;
        }
        cursor.setAttribute('opacity', 1);
        cursor.setAttribute('x1', x(i + 1));
        cursor.setAttribute('x2', x(i + 1));
        const sem = semanaDeDia(i + 1), k = sem - 1;
        let texto = `${s.doy_fecha[i]}. Semana ${sem} (${s.etiqueta[k]}). Concepción ${f(s.doy_concepcion[i], 3)}, IC95 ${f(s.doy_lo[i], 3)} a ${f(s.doy_hi[i], 3)}, o sea ${fpct((s.doy_concepcion[i] - 1) * 100)} bajo o sobre el día promedio. Ese día nacieron en índice ${f(crudo[i], 3)} en crudo y ${f(limpio[i], 3)} descontado el calendario.`;
        if (sem === 52 || sem === 1) texto += ' Dentro de la quincena máxima del año, que el dato no separa en dos semanas.';
        else if (sem >= 28 && sem <= 35) texto += ' Dentro de la meseta mínima, donde no hay una semana más baja que las otras.';
        decir('f1', texto);
      }
    });
  });
}

/* ---------------------------------------------------------------- F2 */
function figura2(datos) {
  const m = datos.metodo, s = datos.semanal;
  const variantes = Object.entries(m.variantes);
  const vd = m.validacion_deis;

  leyenda('f2', [
    ['sw-variante', 'Variantes del método'], ['sw-conc', 'Especificación base'],
    ['sw-verdad', 'Verdad de los registros vitales'], ['sw-conc-banda', 'IC95 del estimado'],
    ['sw-empate', 'Quincena máxima'], ['sw-bloque', 'Meseta mínima o piso de ruido']
  ]);

  montar('f2', (cont, w, modo) => {
    const lado = modo === 'amplio';
    const pw = lado ? (w - 26) / 2 : w;
    const ph = modo === 'amplio' ? 340 : modo === 'medio' ? 300 : 250;
    /* En apilado el segundo panel arranca en ph + 96, así que su eje inferior
       necesita los mismos 32 px de margen que el modo lado a lado. */
    const alto = lado ? ph + 54 : ph * 2 + 128;
    const gapX = 26;
    const aria = 'Izquierda: las variantes del método sobre la curva semanal de concepción. Todas ponen el máximo en la semana 52 o en la 1, y reparten el mínimo entre las semanas 29, 31, 33, 34 y 36. Derecha: comparación con la verdad medida en microdatos de registros vitales de 1999 a 2003. El método acierta la quincena del máximo y recupera 72% de su altura.';
    const {svg, g} = lienzo(cont, w, alto, aria, 'f2-cap');
    const izq = 44;
    const panel = (ox, oy, titulo) => {
      const x = k => ox + izq + (k / 51) * (pw - izq - 12);
      /* El dominio cubre la banda del piso de ruido, que es verdad +- 0,015 y
         llega a 1,1176 en la semana 1 y baja a 0,9285 en la 42. */
      const y = v => oy + ((1.12 - v) / (1.12 - 0.925)) * ph;
      txt(g, ox + izq, oy - 8, titulo, {'font-size': 11, class: 'anota'});
      linea(g, ox + izq, y(1), ox + pw - 12, y(1), {class: 'ref'});
      for (let v = 0.96; v <= 1.121; v += 0.04) txt(g, ox + izq - 8, y(v) + 4, f(v, 2), {'text-anchor': 'end', class: 'cifra', 'font-size': 10});
      const paso = modo === 'compacto' ? 13 : modo === 'medio' ? 8 : 4;
      for (let k = 0; k < 52; k += paso) {
        linea(g, x(k), oy + ph, x(k), oy + ph + 4, {class: 'eje'});
        txt(g, x(k), oy + ph + 17, m.fechas_semana[k], {'text-anchor': 'middle', 'font-size': modo === 'compacto' ? 9 : 10});
      }
      linea(g, ox + izq, oy + ph, ox + pw - 12, oy + ph, {class: 'eje'});
      return {x, y};
    };

    const a = panel(0, 22, 'Las variantes del método');
    if (modo !== 'compacto') {
      bloque(g, a.x(51), 22, a.x(1) - a.x(0), ph, '--empate', {opacity: 0.2});
      bloque(g, a.x(0), 22, a.x(0.4) - a.x(0), ph, '--empate', {opacity: 0.2});
      bloque(g, a.x(27), 22, a.x(34) - a.x(27), ph, '--bloque');
    }
    for (const [, v] of variantes) trazo(g, v.semanal.map((y, k) => `${k ? 'L' : 'M'}${a.x(k)},${a.y(y)}`).join(''), '--variante', modo === 'compacto' ? 0.8 : 1, {opacity: modo === 'compacto' ? 0.45 : 0.55});
    trazo(g, s.indice.map((y, k) => `${k ? 'L' : 'M'}${a.x(k)},${a.y(y)}`).join(''), '--conc', 2.5);
    const notaA = modo === 'compacto'
      ? ['El pico cae en la semana 52 o en la 1', 'en todas las variantes. El valle se', 'reparte entre la 29, la 31, la 33, la 34 y la 36.']
      : ['El pico cae en la semana 52 o en la 1 en todas las variantes.', 'El valle se reparte entre la 29, la 31, la 33, la 34 y la 36.'];
    notaA.forEach((t, k) => txt(g, a.x(2), a.y(0.945) + k * 13, t, {'font-size': 10, class: k ? '' : 'anota'}));

    const b = panel(lado ? pw + gapX : 0, lado ? 22 : ph + 96, 'Contra la verdad conocida');
    let sube = '', baja = '';
    for (let k = 0; k < 52; k++) {
      sube += `${k ? 'L' : 'M'}${b.x(k)},${b.y(vd.estimado_hi[k])}`;
      baja = `L${b.x(k)},${b.y(vd.estimado_lo[k])}` + baja;
    }
    let ruidoArriba = '', ruidoAbajo = '';
    for (let k = 0; k < 52; k++) {
      ruidoArriba += `${k ? 'L' : 'M'}${b.x(k)},${b.y(vd.verdad_semanal[k] + PISO_RUIDO)}`;
      ruidoAbajo = `L${b.x(k)},${b.y(vd.verdad_semanal[k] - PISO_RUIDO)}` + ruidoAbajo;
    }
    relleno(g, ruidoArriba + ruidoAbajo + 'Z', '--bloque');
    relleno(g, sube + baja + 'Z', '--conc-banda', {opacity: 0.75});
    trazo(g, vd.verdad_semanal.map((y, k) => `${k ? 'L' : 'M'}${b.x(k)},${b.y(y)}`).join(''), '--verdad', 2);
    trazo(g, vd.estimado_semanal.map((y, k) => `${k ? 'L' : 'M'}${b.x(k)},${b.y(y)}`).join(''), '--conc', 2);
    linea(g, b.x(51), b.y(vd.estimado_semanal[51]), b.x(51), b.y(vd.verdad_semanal[51]), {class: 'ref'});
    txt(g, b.x(49), b.y(1.1), 'acierta la quincena y atenúa el exceso:', {'text-anchor': 'end', 'font-size': 10, class: 'anota'});
    txt(g, b.x(49), b.y(1.1) + 13, 'recupera 71,9% del pico de la 52 y 65,2% del de la 1', {'text-anchor': 'end', 'font-size': 10});
    if (modo !== 'compacto') txt(g, b.x(2), b.y(0.945), 'La zona sombreada es el piso de ruido de la propia verdad.', {'font-size': 10});

    const cursorA = add(g, 'line', {y1: 22, y2: 22 + ph, class: 'cursor', opacity: 0});
    const cursorB = add(g, 'line', {y1: lado ? 22 : ph + 96, y2: (lado ? 22 : ph + 96) + ph, class: 'cursor', opacity: 0});
    interactivo({
      svg, cont, n: 52,
      /* En lado a lado el panel derecho arranca en pw + gapX; sin restar ese
         desplazamiento, media figura devolvería siempre la semana 52. */
      area: {x0: a.x(0), x1: a.x(51), bloque: 13, local: x => (lado && x > pw + gapX / 2 ? x - (pw + gapX) : x)},
      alMover: i => {
        if (i === null) {
          cursorA.setAttribute('opacity', 0); cursorB.setAttribute('opacity', 0);
          decir('f2', 'Mueve el puntero sobre la figura, o usa las flechas con el foco puesto en ella, para leer una semana concreta.');
          return;
        }
        cursorA.setAttribute('opacity', 1); cursorB.setAttribute('opacity', 1);
        cursorA.setAttribute('x1', a.x(i)); cursorA.setAttribute('x2', a.x(i));
        cursorB.setAttribute('x1', b.x(i)); cursorB.setAttribute('x2', b.x(i));
        const valores = variantes.map(([, v]) => v.semanal[i]);
        decir('f2', `Semana ${i + 1} (${s.etiqueta[i]}). Base ${f(s.indice[i], 3)}. Entre las variantes, de ${f(Math.min(...valores), 3)} a ${f(Math.max(...valores), 3)}. En la validación contra los registros vitales, verdad ${f(vd.verdad_semanal[i], 3)} y estimado ${f(vd.estimado_semanal[i], 3)}.`);
      }
    });
  });
}

/* ---------------------------------------------------------------- F4 */
function figura4(datos) {
  const ds = datos['dia-semana'];
  const deps = [['depe2:municipal', 'Municipal'], ['depe2:part_subvencionado', 'Subvencionado'], ['depe2:part_pagado', 'Part. pagado']];
  const PERIODOS = ['1989-1993', '1994-1998', '1999-2003', '2004-2007'];
  const periodoDe = anio => (anio <= 1993 ? 0 : anio <= 1998 ? 1 : anio <= 2003 ? 2 : 3);
  const retrocesos = [1999, 2000, 2001, 2007];

  leyenda('f4', [
    ['sw-parto', 'Días hábiles y serie nacional'], ['sw-parto-crudo', 'Sábado y domingo'],
    ['sw-parto-banda', 'IC95'], ['sw-nulo', 'Años de retroceso']
  ]);

  montar('f4', (cont, w, modo) => {
    const lado = modo === 'amplio';
    const pw = lado ? (w - 26) / 2 : w;
    const hA = modo === 'amplio' ? 300 : modo === 'medio' ? 240 : 230;
    const hB = modo === 'amplio' ? 300 : modo === 'medio' ? 280 : 250;
    const alto = lado ? Math.max(hA, hB) + 54 : hA + hB + 128;
    const aria = 'Izquierda: probabilidad de nacer en cada día de la semana, en semana sin feriados, 1989 a 2007. El martes es el máximo con 15,94% y el domingo el mínimo con 10,15%. Si todos los días fueran iguales, cada uno tendría 14,29%. Derecha: cota inferior de partos con día elegido. Sube de 22,2% en 1989 a 34,6% en 2007, con cuatro años de retroceso. Por dependencia del colegio va de 23,1% en municipal a 50,1% en particular pagado.';
    const {svg, g} = lienzo(cont, w, alto, aria, 'f4-cap');

    /* Panel izquierdo: un punto por día de la semana, en orden de calendario.
       La escala está expandida y no parte de cero, así que la marca no puede
       ser una barra: el largo de una barra codifica el valor y sobre un eje
       cortado multiplicaría por casi cuatro la separación real entre días. Un
       punto no codifica largo, de modo que la escala expandida se conserva sin
       exagerar nada. */
    const izqA = modo === 'compacto' ? 38 : 62, oyA = 22;
    const anchoA = pw - izqA - 46;
    const xA = p => izqA + ((p - 0.09) / (0.17 - 0.09)) * anchoA;
    const ejeA = oyA + hA - 44;
    const altoBarra = (ejeA - oyA - 8) / 7;
    txt(g, izqA, oyA - 8, 'Probabilidad de nacer por día de la semana', {'font-size': 11, class: 'anota'});
    DOW_KEY.forEach((k, i) => {
      const d = ds.p_dow[k], y = oyA + 4 + i * altoBarra + altoBarra / 2;
      linea(g, izqA, y, xA(d.p), y, {class: 'eje'});
      linea(g, xA(d.lo), y - 5, xA(d.lo), y + 5, {class: 'ref'});
      linea(g, xA(d.hi), y - 5, xA(d.hi), y + 5, {class: 'ref'});
      const punto = add(g, 'circle', {cx: xA(d.p), cy: y, r: 4.5, style: `fill:var(${i < 5 ? '--parto' : '--parto-crudo'})`});
      add(punto, 'title', {}, `${DOW_LARGO[i]}: ${f(d.p * 100)}% de los nacimientos, IC95 ${f(d.lo * 100)} a ${f(d.hi * 100)}.`);
      txt(g, izqA - 8, y + 4, modo === 'compacto' ? DOW_CORTO[i] : DOW_LARGO[i], {'text-anchor': 'end', 'font-size': 11});
      txt(g, xA(d.p) + 9, y + 4, f(d.p * 100) + '%', {class: 'cifra', 'font-size': 10});
    });
    linea(g, xA(1 / 7), oyA, xA(1 / 7), ejeA, {class: 'ref'});
    linea(g, izqA, ejeA, izqA + anchoA, ejeA, {class: 'eje'});
    for (const p of [0.10, 0.12, 0.14, 0.16]) {
      linea(g, xA(p), ejeA, xA(p), ejeA + 4, {class: 'eje'});
      txt(g, xA(p), ejeA + 16, f(p * 100, 0) + '%', {'text-anchor': 'middle', class: 'cifra', 'font-size': 10});
    }
    txt(g, xA(1 / 7), ejeA + 32, 'si todos los días fueran iguales, 14,29%', {'text-anchor': 'middle', 'font-size': 10});

    /* Panel derecho: la cota anual y los escalones por quinquenio. */
    const ox = lado ? pw + 26 : 0, oyB = lado ? 22 : hA + 76;
    const izqB = 44;
    const xB = i => ox + izqB + (i / 18) * (pw - izqB - (modo === 'amplio' ? 96 : 14));
    const yB = v => oyB + ((0.62 - v) / (0.62 - 0.18)) * hB;
    txt(g, ox + izqB, oyB - 8, 'Piso de partos con fecha elegida, por año', {'font-size': 11, class: 'anota'});
    for (let v = 0.2; v <= 0.61; v += 0.1) {
      txt(g, ox + izqB - 8, yB(v) + 4, f(v * 100, 0) + '%', {'text-anchor': 'end', class: 'cifra', 'font-size': 10});
    }
    let arriba = '', abajo = '';
    ds.anios.forEach((_, i) => {
      arriba += `${i ? 'L' : 'M'}${xB(i)},${yB(ds.f_por_anio.hi[i])}`;
      abajo = `L${xB(i)},${yB(ds.f_por_anio.lo[i])}` + abajo;
    });
    relleno(g, arriba + abajo + 'Z', '--parto-banda', {opacity: 0.8});
    trazo(g, ds.f_por_anio.v.map((v, i) => `${i ? 'L' : 'M'}${xB(i)},${yB(v)}`).join(''), '--parto', 2.4);
    deps.forEach(([clave, nombre], n) => {
      const per = ds.estratos_depe2[clave].periodos;
      let d = '';
      PERIODOS.forEach((p, k) => {
        const v = per[p].f_prog_domingo.v;
        const i0 = ds.anios.findIndex(a => periodoDe(a) === k);
        const i1 = ds.anios.length - 1 - [...ds.anios].reverse().findIndex(a => periodoDe(a) === k);
        d += `${k ? 'L' : 'M'}${xB(i0)},${yB(v)}L${xB(i1)},${yB(v)}`;
      });
      trazo(g, d, '--parto', 1.2, {'stroke-dasharray': '4 3', opacity: 0.55 + n * 0.2});
      const ultimo = per[PERIODOS[3]].f_prog_domingo.v;
      if (modo === 'amplio') txt(g, xB(18) + 6, yB(ultimo) + 4, nombre, {'font-size': 10});
    });
    if (modo !== 'amplio') {
      txt(g, ox + izqB, oyB + hB + 34, 'Escalones por quinquenio: municipal, subvencionado', {'font-size': 10});
      txt(g, ox + izqB, oyB + hB + 47, 'y particular pagado, de menor a mayor.', {'font-size': 10});
    }
    retrocesos.forEach(anio => {
      const i = ds.anios.indexOf(anio);
      add(g, 'circle', {cx: xB(i), cy: yB(ds.f_por_anio.v[i]), r: 4, fill: 'none', style: 'stroke:var(--nulo)', 'stroke-width': 1.5});
    });
    const notaRet = modo === 'compacto'
      ? ['cuatro años de retroceso;', 'el mayor es de 1,4 errores estándar']
      : ['cuatro años de retroceso; el mayor es de 1,4 errores estándar'];
    notaRet.forEach((t, k) => txt(g, xB(9), yB(0.205) + k * 13, t, {'text-anchor': 'middle', 'font-size': 10}));
    if (modo === 'amplio') txt(g, xB(9), yB(0.58), '+0,62 puntos por año, IC95 0,58 a 0,67', {'text-anchor': 'middle', 'font-size': 10, class: 'anota'});
    for (let i = 0; i < 19; i += modo === 'compacto' ? 6 : 3) {
      linea(g, xB(i), oyB + hB, xB(i), oyB + hB + 4, {class: 'eje'});
      txt(g, xB(i), oyB + hB + 17, String(ds.anios[i]), {'text-anchor': 'middle', 'font-size': 10});
    }
    linea(g, ox + izqB, oyB + hB, xB(18), oyB + hB, {class: 'eje'});

    const cursor = add(g, 'line', {y1: oyB, y2: oyB + hB, class: 'cursor', opacity: 0});
    interactivo({
      svg, cont, n: 19,
      /* Los dos paneles no comparten unidad, así que solo el derecho captura el
         puntero. Fuera de él la lectura vuelve a la instrucción en vez de
         devolver un año que el cursor no está señalando. */
      area: {
        x0: xB(0), x1: xB(18), bloque: 5,
        local: (x, y) => (lado ? (x >= pw + 13 ? x : null) : (y >= oyB - 12 ? x : null))
      },
      alMover: i => {
        if (i === null) {
          cursor.setAttribute('opacity', 0);
          decir('f4', 'Mueve el puntero sobre el panel derecho, o usa las flechas con el foco puesto en la figura, para leer un año concreto.');
          return;
        }
        cursor.setAttribute('opacity', 1);
        cursor.setAttribute('x1', xB(i)); cursor.setAttribute('x2', xB(i));
        const anio = ds.anios[i], p = PERIODOS[periodoDe(anio)];
        const val = c => f(ds.estratos_depe2[c].periodos[p].f_prog_domingo.v * 100) + '%';
        decir('f4', `${anio}. Nacional ${f(ds.f_por_anio.v[i] * 100)}%, IC95 ${f(ds.f_por_anio.lo[i] * 100)} a ${f(ds.f_por_anio.hi[i] * 100)}.${retrocesos.includes(anio) ? ' Año de retroceso respecto del anterior.' : ''} Por dependencia, quinquenio ${p}: municipal ${val('depe2:municipal')}, subvencionado ${val('depe2:part_subvencionado')}, particular pagado ${val('depe2:part_pagado')}.`);
      }
    });
  });
}

/* ---------------------------------------------------------------- F5 */
function figura5(datos) {
  const fer = datos.feriados;
  const ss = new Map(fer.semana_santa_perfil.map(p => [p.dia_rel, p]));
  const paneles = MATRIZ_KEY.map((k, i) => ({
    clave: k, nombre: DOW_LARGO[i],
    puntos: fer.matriz_B[k].map(p => ({k: p.k, pct: p.pct, lo: p.lo, hi: p.hi, n: p.n_dias}))
  }));
  paneles.push({
    clave: 'ss', nombre: 'Semana Santa',
    puntos: Array.from({length: 15}, (_, i) => {
      const p = ss.get(i - 7);
      return {k: i - 7, pct: (p.razon - 1) * 100, lo: null, hi: null, n: p.n};
    })
  });
  const lunes = paneles[0].puntos;

  leyenda('f5', [['sw-parto', 'Nacimientos alrededor del feriado'], ['sw-parto-banda', 'IC95'], ['sw-bloque', 'Perfil del feriado en lunes, de referencia']]);

  montar('f5', (cont, w, modo) => {
    const cols = modo === 'amplio' ? 4 : modo === 'medio' ? 2 : 1;
    const elegidos = modo === 'compacto' ? [paneles[0], paneles[2], paneles[6], paneles[7]] : paneles;
    const filas = Math.ceil(elegidos.length / cols);
    const gapX = 12, gapY = 30;
    const pw = (w - gapX * (cols - 1)) / cols;
    const ph = modo === 'amplio' ? 175 : modo === 'medio' ? 165 : 130;
    const alto = filas * ph + (filas - 1) * gapY + 42;
    const aria = 'Ocho perfiles de nacimientos alrededor del feriado, de siete días antes a siete días después, en la misma escala. El déficit del día del feriado depende casi por completo del día de semana en que cae: 34,4% menos si es lunes, 27% si es miércoles, 6,6% si es sábado y 0,8% si es domingo. La víspera hábil sube 6,6%. El octavo panel es Semana Santa, con el Viernes Santo 27,4% abajo y el adelanto de lunes a jueves santo.';
    const {svg, g} = lienzo(cont, w, alto, aria, 'f5-cap');
    const izq = 30;
    const cursores = [];
    elegidos.forEach((p, n) => {
      const ox = (n % cols) * (pw + gapX), oy = 22 + Math.floor(n / cols) * (ph + gapY);
      const x = k => ox + izq + ((k + 7) / 14) * (pw - izq - 8);
      const y = v => oy + ((11 - v) / (11 + 38)) * ph;
      linea(g, ox + izq, y(0), ox + pw - 8, y(0), {class: 'ref'});
      if (p.clave !== 'lun') trazo(g, lunes.map((q, i) => `${i ? 'L' : 'M'}${x(q.k)},${y(q.pct)}`).join(''), '--line', 1, {opacity: 0.35});
      if (p.puntos[0].lo !== null) {
        let sube = '', baja = '';
        p.puntos.forEach((q, i) => {
          sube += `${i ? 'L' : 'M'}${x(q.k)},${y(q.hi)}`;
          baja = `L${x(q.k)},${y(q.lo)}` + baja;
        });
        relleno(g, sube + baja + 'Z', '--parto-banda', {opacity: 0.7});
      }
      trazo(g, p.puntos.map((q, i) => `${i ? 'L' : 'M'}${x(q.k)},${y(q.pct)}`).join(''), '--parto', 1.8);
      const cero = p.puntos.find(q => q.k === 0);
      add(g, 'circle', {cx: x(0), cy: y(cero.pct), r: 3.5, style: 'fill:var(--parto)'});
      txt(g, ox + izq + 4, oy + 13, p.nombre, {'font-size': 11, class: 'anota', 'font-weight': 600});
      txt(g, ox + izq + 4, oy + ph - 6, `día 0: ${fpct(cero.pct)}`, {'font-size': 10, class: 'cifra'});
      for (const k of [-7, 0, 7]) {
        linea(g, x(k), oy + ph, x(k), oy + ph + 4, {class: 'eje'});
        txt(g, x(k), oy + ph + 16, k === 0 ? (p.clave === 'ss' ? 'viernes' : 'feriado') : String(k), {'text-anchor': 'middle', 'font-size': 10});
      }
      if (n % cols === 0) for (const v of [0, -20]) txt(g, ox + izq - 6, y(v) + 4, `${f(v, 0)}%`, {'text-anchor': 'end', class: 'cifra', 'font-size': 10});
      cursores.push(add(g, 'line', {y1: oy, y2: oy + ph, class: 'cursor', opacity: 0}));
    });
    const primero = k => izq + ((k + 7) / 14) * (pw - izq - 8);
    /* Los ocho paneles están en columnas: el puntero se traduce al panel que
       tiene debajo antes de normalizar, si no solo respondería el primero. */
    const columna = x => Math.max(0, Math.min(cols - 1, Math.floor(x / (pw + gapX))));
    interactivo({
      svg, cont, n: 15,
      area: {x0: primero(-7), x1: primero(7), bloque: 3, local: x => x - columna(x) * (pw + gapX)},
      alMover: i => {
        if (i === null) {
          cursores.forEach(c => c.setAttribute('opacity', 0));
          decir('f5', 'Mueve el puntero sobre cualquiera de los paneles, o usa las flechas con el foco puesto en la figura, para leer un día relativo.');
          return;
        }
        const k = i - 7;
        cursores.forEach((c, n) => {
          const ox = (n % cols) * (pw + gapX);
          c.setAttribute('opacity', 1);
          c.setAttribute('x1', ox + primero(k)); c.setAttribute('x2', ox + primero(k));
        });
        const partes = elegidos.map(p => {
          const q = p.puntos[i];
          return `${p.nombre}: ${fpct(q.pct)}${q.lo === null ? '' : `, IC95 ${f(q.lo)} a ${f(q.hi)}`}`;
        });
        decir('f5', `Día ${k > 0 ? '+' + k : k}${k === 0 ? ', el feriado' : k === -1 ? ', la víspera' : ''}. ${partes.join('. ')}.`);
      }
    });
  });
}

/* ---------------------------------------------------------------- F6 */
function figura6(datos) {
  const fp = datos.patrias;
  const largos = ['2', '3', '4', '5'];
  const anios = fp.por_anio;
  const reg = fp.reg_deficit_descanso.vs_largo.largo;

  leyenda('f6', [['sw-parto', 'Perfil por largo del descanso'], ['sw-parto-banda', 'Error estándar del promedio'], ['sw-bloque', 'El 18 y el 19 de septiembre']]);

  montar('f6', (cont, w, modo) => {
    const izq = 46;
    const hA = modo === 'amplio' ? 300 : modo === 'medio' ? 280 : 250;
    const hB = modo === 'amplio' ? 180 : modo === 'medio' ? 160 : 150;
    /* Los rótulos de largo del descanso del eje inferior se escriben 16 px bajo
       el borde del panel: el lienzo los tiene que contener. */
    const alto = hA + hB + 112;
    const aria = 'Arriba: perfil de nacimientos alrededor del 18 de septiembre, de siete días antes a catorce después, separado por el largo del descanso. El 18 y el 19 caen 28,0% y 29,1%. Abajo: el déficit total crece con el largo del descanso porque hay más días libres, no porque cada día libre cueste más: el déficit por día no crece con el largo.';
    const {svg, g} = lienzo(cont, w, alto, aria, 'f6-cap');

    const oyA = 22;
    const xA = k => izq + ((k + 7) / 21) * (w - izq - (modo === 'amplio' ? 96 : 14));
    const yA = v => oyA + ((0.1 - v) / (0.1 + 0.4)) * hA;
    txt(g, izq, oyA - 8, modo === 'amplio'
      ? 'Perfil de nacimientos alrededor del 18 de septiembre, en días equivalentes'
      : 'Perfil de nacimientos alrededor del 18', {'font-size': 11, class: 'anota'});
    caja(g, xA(0), oyA, xA(2) - xA(0), hA, '--bloque');
    txt(g, xA(1), oyA + 14, '18 y 19 de septiembre', {'text-anchor': 'middle', 'font-size': 10});
    linea(g, xA(-7), yA(0), xA(14), yA(0), {class: 'ref'});
    for (let v = -0.3; v <= 0.101; v += 0.1) txt(g, izq - 8, yA(v) + 4, f(v, 1), {'text-anchor': 'end', class: 'cifra', 'font-size': 10});
    let sube = '', baja = '';
    fp.perfil_rel_dias.forEach((k, i) => {
      sube += `${i ? 'L' : 'M'}${xA(k)},${yA(fp.perfil_medio[i] + fp.perfil_ee[i])}`;
      baja = `L${xA(k)},${yA(fp.perfil_medio[i] - fp.perfil_ee[i])}` + baja;
    });
    relleno(g, sube + baja + 'Z', '--parto-banda', {opacity: 0.75});
    largos.forEach((L, n) => {
      const serie = fp.perfil_medio_por_largo[L];
      trazo(g, serie.map((v, i) => `${i ? 'L' : 'M'}${xA(fp.perfil_rel_dias[i])},${yA(v)}`).join(''), '--parto', 1.2 + n * 0.4, {opacity: 0.85});
    });
    if (modo === 'amplio') {
      const rotulos = largos
        .map(L => {
          const grupo = fp.por_largo.find(x => x.largo === Number(L));
          const serie = fp.perfil_medio_por_largo[L];
          return {t: `${L} días (${grupo ? grupo.n_anios : 0} años)`, y: yA(serie[serie.length - 1])};
        })
        .sort((a, b) => a.y - b.y);
      rotulos.forEach((r, n) => { if (n) r.y = Math.max(r.y, rotulos[n - 1].y + 13); });
      for (const r of rotulos) txt(g, xA(14) + 6, r.y + 4, r.t, {'font-size': 10});
    }
    trazo(g, fp.perfil_medio.map((v, i) => `${i ? 'L' : 'M'}${xA(fp.perfil_rel_dias[i])},${yA(v)}`).join(''), '--ink', 2.5);
    if (modo !== 'amplio') {
      txt(g, izq, oyA + hA + 32, 'Líneas de grosor creciente: descansos de 2,', {'font-size': 10});
      txt(g, izq, oyA + hA + 45, '3, 4 y 5 días. La gruesa es el promedio.', {'font-size': 10});
    }
    txt(g, modo === 'amplio' ? xA(2) + 6 : izq, yA(-0.29), 'El 18 y el 19 quedan en -28,0% y -29,1%.', {'font-size': 10, class: 'anota'});
    for (let k = -7; k <= 14; k += modo === 'compacto' ? 7 : 3) {
      linea(g, xA(k), oyA + hA, xA(k), oyA + hA + 4, {class: 'eje'});
      txt(g, xA(k), oyA + hA + 16, k > 0 ? '+' + k : String(k), {'text-anchor': 'middle', 'font-size': 10});
    }
    linea(g, xA(-7), oyA + hA, xA(14), oyA + hA, {class: 'eje'});

    /* Panel inferior: un punto por año contra el largo del descanso. */
    const oyB = oyA + hA + 66;
    const xB = v => izq + ((v - 1.6) / (5.6 - 1.6)) * (w - izq - 14);
    const yB = v => oyB + ((0 - v) / 1.35) * hB;
    txt(g, izq, oyB - 8, modo === 'compacto' ? 'Déficit contra el largo del descanso' : 'Déficit del descanso contra su largo, año por año', {'font-size': 11, class: 'anota'});
    for (let v = 0; v >= -1.21; v -= 0.4) txt(g, izq - 8, yB(v) + 4, f(v, 1), {'text-anchor': 'end', class: 'cifra', 'font-size': 10});
    linea(g, xB(1.6), yB(0), xB(5.6), yB(0), {class: 'ref'});
    const media = fp.reg_deficit_descanso.media ? fp.reg_deficit_descanso.media[0] : -0.642;
    const recta = L => media + reg.b * (L - 3.6);
    trazo(g, `M${xB(2)},${yB(recta(2))}L${xB(5)},${yB(recta(5))}`, '--parto', 1.6, {'stroke-dasharray': '5 4'});
    /* Dispersión horizontal acotada: los puntos de un mismo largo se separan
       para no taparse, sin alejarse de su posición real. */
    const dispersion = modo === 'compacto' ? 0.08 : 0.12;
    for (const a of anios) {
      const mismos = anios.filter(x => x.largo === a.largo);
      const centro = (mismos.length - 1) / 2;
      const pos = centro === 0 ? 0 : (mismos.indexOf(a) - centro) / centro;
      const punto = add(g, 'circle', {cx: xB(a.largo + pos * dispersion), cy: yB(a.deficit_descanso), r: 4, style: 'fill:var(--parto)', opacity: 0.85});
      add(punto, 'title', {}, `${a.anio}. El 18 cayó ${a.dow18}, descanso de ${a.largo} días, ${a.habiles} hábiles liberados. Déficit del descanso: ${f(a.deficit_descanso, 3)} días equivalentes.`);
    }
    for (const L of [2, 3, 4, 5]) {
      linea(g, xB(L), oyB + hB, xB(L), oyB + hB + 4, {class: 'eje'});
      txt(g, xB(L), oyB + hB + 16, `${L} días`, {'text-anchor': 'middle', 'font-size': 10});
    }
    linea(g, xB(1.6), oyB + hB, xB(5.6), oyB + hB, {class: 'eje'});
    const notaReg = modo === 'amplio'
      ? [`La recta cae ${f(-reg.b, 3)} días equivalentes por cada día adicional y pasa por el origen:`,
        'es la suma de más días libres, no un costo mayor por día. El déficit por día no crece con el largo.']
      : [`La recta cae ${f(-reg.b, 3)} días equivalentes por`, 'cada día adicional y pasa por el origen:',
        'es la suma de más días libres, no un costo', 'mayor por día.'];
    notaReg.forEach((t, k) => txt(g, xB(1.7), yB(-1.15) + k * 13, t, {'font-size': 10, class: k ? '' : 'anota'}));

    const cursor = add(g, 'line', {y1: oyA, y2: oyA + hA, class: 'cursor', opacity: 0});
    interactivo({
      svg, cont, n: 22, area: {x0: xA(-7), x1: xA(14), bloque: 7},
      alMover: i => {
        if (i === null) {
          cursor.setAttribute('opacity', 0);
          decir('f6', 'Mueve el puntero sobre el panel superior, o usa las flechas con el foco puesto en la figura, para leer un día relativo al 18.');
          return;
        }
        const k = fp.perfil_rel_dias[i];
        cursor.setAttribute('opacity', 1);
        cursor.setAttribute('x1', xA(k)); cursor.setAttribute('x2', xA(k));
        const porLargo = largos.map(L => `${L} días ${f(fp.perfil_medio_por_largo[L][i], 3)}`).join(', ');
        decir('f6', `Día ${k > 0 ? '+' + k : k} respecto del 18 de septiembre. Promedio ${f(fp.perfil_medio[i], 3)} días equivalentes, error estándar ${f(fp.perfil_ee[i], 3)}. Por largo del descanso: ${porLargo}.`);
      }
    });
  });
}

/* ---------------------------------------------------------------- F3 */
function figura3(datos) {
  const c = datos.cumpleanos;
  const CORTES = [0.80, 0.88, 0.96, 1.00, 1.005, 1.04, 1.12, 1.20];
  const clase = v => {
    if (v < CORTES[0]) return 'q-4';
    if (v < CORTES[1]) return 'q-3';
    if (v < CORTES[2]) return 'q-2';
    if (v < CORTES[3]) return 'q-1';
    if (v <= CORTES[4]) return 'q0';
    if (v < CORTES[5]) return 'q1';
    if (v < CORTES[6]) return 'q2';
    if (v < CORTES[7]) return 'q3';
    return 'q4';
  };
  const indiceDe = fecha => c.fecha.indexOf(fecha);

  leyenda('f3', [
    ['q-4', 'menos de 0,80'], ['q-3', '0,80 a 0,88'], ['q-2', '0,88 a 0,96'], ['q-1', '0,96 a 1,00'],
    ['q0', 'el promedio'], ['q1', '1,00 a 1,04'], ['q2', '1,04 a 1,12'], ['q3', '1,12 a 1,20'], ['q4', 'más de 1,20']
  ]);

  montar('f3', (cont, w, modo) => {
    const lado = w >= 900;
    const pw = lado ? (w - 24) / 2 : w;
    const rotulo = w >= 900 ? 60 : w >= 560 ? 60 : w >= 340 ? 42 : 36;
    const celda = Math.max(5, Math.floor((pw - rotulo) / 31) - 1);
    const gridW = 31 * (celda + 1), gridH = 12 * (celda + 1);
    /* El pie de cada panel lleva sus notas partidas en líneas: el lienzo
       reserva el alto que esas líneas ocupan en cada modo. */
    const alto = lado ? gridH + 124 : gridH * 2 + (modo === 'compacto' ? 128 : 164);
    const aria = 'Calendario de 366 casillas con la frecuencia de cada fecha de cumpleaños, cohortes 1989 a 2007. A la izquierda en crudo, a la derecha descontado el día de semana y el feriado, donde el calendario casi desaparece.';
    const {svg, g} = lienzo(cont, w, alto, aria, 'f3-cap');

    const defs = add(g, 'defs', {});
    const pat = add(defs, 'pattern', {id: 'rayado-feriado', width: 4, height: 4, patternTransform: 'rotate(45)', patternUnits: 'userSpaceOnUse'});
    add(pat, 'line', {x1: 0, y1: 0, x2: 0, y2: 4, style: 'stroke:var(--rayado)', 'stroke-width': 1.2});

    const casillas = [[], []];
    const panel = (n, ox, oy, titulo, serie, trama) => {
      txt(g, ox, oy - 10, titulo, {'font-size': 11, class: 'anota'});
      for (let m = 0; m < 12; m++) {
        txt(g, ox + rotulo - 6, oy + m * (celda + 1) + celda / 2 + 3,
          celda < 8 ? MES3[m][0].toUpperCase() : MES3[m], {'text-anchor': 'end', 'font-size': celda < 9 ? 9 : 10});
      }
      const dias = w >= 900 ? [1, 5, 10, 15, 20, 25, 31] : w >= 280 ? [1, 10, 20, 31] : [1, 31];
      for (const d of dias) txt(g, ox + rotulo + (d - 1) * (celda + 1) + celda / 2, oy - 2, String(d), {'text-anchor': 'middle', 'font-size': 9});
      /* Zona de toque por fila de mes: la casilla de 7 a 9 px no alcanza el
         área mínima táctil, así que el toque fuera de una casilla se resuelve
         por mes. Van antes que las casillas para quedar debajo: si van después
         tapan las 732 casillas y el puntero nunca llega a una fecha. */
      for (let m = 0; m < 12; m++) {
        const zona = add(g, 'rect', {x: ox + rotulo, y: oy + m * (celda + 1), width: gridW, height: celda + 1, fill: 'none', 'pointer-events': 'all'});
        zona.addEventListener('pointerenter', () => decirMes(m));
      }
      for (let i = 0; i < c.fecha.length; i++) {
        const m = c.mes[i] - 1, d = c.dia[i];
        const x = ox + rotulo + (d - 1) * (celda + 1), y = oy + m * (celda + 1);
        const v = serie[i];
        const r = add(g, 'rect', {x, y, width: celda, height: celda, class: clase(v)});
        add(r, 'title', {}, textoCasilla(i));
        r.addEventListener('pointerenter', () => decir('f3', textoCasilla(i)));
        if (trama && c.frac_anios_con_coef_feriado[i] > 0) {
          const t = add(g, 'rect', {x, y, width: celda, height: celda, fill: 'url(#rayado-feriado)'});
          add(t, 'title', {}, textoCasilla(i));
          t.addEventListener('pointerenter', () => decir('f3', textoCasilla(i)));
        }
        if (c.fecha[i] === '29-feb') add(g, 'circle', {cx: x + celda / 2, cy: y + celda / 2, r: 1.6, style: 'fill:var(--paper)'});
        casillas[n][i] = {x, y};
      }
    };
    const textoCasilla = i => {
      const base = `${c.dia[i]} de ${MES3[c.mes[i] - 1]}. ${miles(c.n[i])} personas, 1 de cada ${f(c.uno_en[i], 1)}. Índice crudo ${f(c.indice_crudo[i], 3)}, IC95 ${f(c.indice_crudo_lo[i], 3)} a ${f(c.indice_crudo_hi[i], 3)}. Índice limpio ${f(c.indice_limpio[i], 3)}.`;
      return c.frac_anios_con_coef_feriado[i] > 0
        ? `${base} Fecha con coeficiente de feriado en ${f(c.frac_anios_con_coef_feriado[i] * 100, 0)}% de los 19 años: el índice limpio no es interpretable.`
        : `${base} Fecha sin coeficiente de feriado.`;
    };
    const decirMes = m => {
      const idx = c.mes.map((x, i) => [x, i]).filter(([x]) => x === m + 1).map(([, i]) => i);
      const alta = idx.reduce((a, b) => (c.indice_crudo[b] > c.indice_crudo[a] ? b : a));
      const baja = idx.reduce((a, b) => (c.indice_crudo[b] < c.indice_crudo[a] ? b : a));
      decir('f3', `Mes de ${MES3[m]}. La fecha más común es el ${c.fecha[alta]}, con índice crudo ${f(c.indice_crudo[alta], 3)}, y la menos común el ${c.fecha[baja]}, con ${f(c.indice_crudo[baja], 3)}.`);
    };

    panel(0, 0, 32, 'Crudo, tal como se vive', c.indice_crudo, false);
    panel(1, lado ? pw + 24 : 0, lado ? 32 : gridH + 86, 'Descontado el día de semana y el feriado', c.indice_limpio, true);

    /* Las anotaciones no se escriben sobre la cuadrícula: la casilla marcada
       lleva un contorno y el texto va bajo el panel que le corresponde. */
    const marcar = (n, fechas) => {
      for (const fecha of fechas) {
        const p = casillas[n][indiceDe(fecha)];
        if (p) add(g, 'rect', {x: p.x - 1, y: p.y - 1, width: celda + 2, height: celda + 2, class: 'marco', 'stroke-width': 1.5});
      }
    };
    marcar(0, ['27-dic', '25-dic', '18-sep', '19-sep']);
    marcar(1, ['27-dic', '18-sep', '19-sep']);
    /* Las notas se parten a mano: el texto de un SVG no reflows, así que cada
       modo lleva su propio corte de línea. */
    const notas = modo === 'amplio' && lado
      ? [['27-dic, la más común: 1 de cada 300,5 personas,', 'el rebote de Navidad. 25-dic, la menos común:', '1 de cada 543,8. El 18 y el 19 de septiembre', 'están entre las diez menos comunes.'],
        ['27-dic limpio 1,007, o sea el promedio. El 18 y el 19', 'de septiembre limpios quedan en 1,100 y 1,096, dentro', 'del máximo estacional. 186 fechas reciben coeficiente', 'de feriado en al menos un año, con trama: el ranking', 'limpio solo es interpretable sobre las otras 179.']]
      : [['27-dic, la más común: 1 de cada 300,5 personas, el rebote de Navidad.', '25-dic, la menos común: 1 de cada 543,8. El 18 y el 19 de septiembre', 'están entre las diez menos comunes.'],
        ['27-dic limpio 1,007, o sea el promedio. El 18 y el 19 de septiembre', 'limpios quedan en 1,100 y 1,096, dentro del máximo estacional.', '186 fechas reciben coeficiente de feriado en al menos un año, con', 'trama: el ranking limpio solo es interpretable sobre las otras 179.']];
    if (modo !== 'compacto') {
      const bases = [
        {x: 0, y: (lado ? 32 : 32) + gridH + 18},
        {x: lado ? pw + 24 : 0, y: (lado ? 32 : gridH + 86) + gridH + 18}
      ];
      notas.forEach((lineas, n) => {
        lineas.forEach((t, k) => txt(g, bases[n].x, bases[n].y + k * 14, t, {'font-size': 10}));
      });
    }

    const marco = [add(g, 'rect', {class: 'marco', opacity: 0, width: celda, height: celda, 'stroke-width': 2}),
      add(g, 'rect', {class: 'marco', opacity: 0, width: celda, height: celda, 'stroke-width': 2})];
    svg.addEventListener('keydown', ev => {
      const mapa = {ArrowLeft: -1, ArrowRight: 1, ArrowUp: -31, ArrowDown: 31, PageUp: -31, PageDown: 31, Home: -999, End: 999};
      if (!(ev.key in mapa)) return;
      ev.preventDefault();
      const salto = mapa[ev.key];
      const actual = svg.dataset.i === undefined ? 0 : Number(svg.dataset.i);
      const destino = salto === -999 ? 0 : salto === 999 ? c.fecha.length - 1 : actual + salto;
      const i = Math.max(0, Math.min(c.fecha.length - 1, destino));
      svg.dataset.i = i;
      marco.forEach((r, n) => {
        r.setAttribute('opacity', 1);
        r.setAttribute('x', casillas[n][i].x);
        r.setAttribute('y', casillas[n][i].y);
      });
      decir('f3', textoCasilla(i));
    });
    decir('f3', 'Mueve el puntero sobre una casilla, o usa las flechas con el foco puesto en la figura, para leer una fecha concreta.');
  });
}

/* ---------------------------------------------------------------- F8 */
function figura8(datos) {
  const e = datos.estratos;
  const orden = ['depe:pagado', 'depe:subvencionado', 'depe:municipal', 'rural:rural', 'rural:urbano', 'zona:norte', 'zona:centro', 'zona:sur', 'nacional'];
  const nacional = e.curvas.nacional;
  const regiones = Object.keys(e.regiones).sort((a, b) => e.regiones[b].lat - e.regiones[a].lat);

  leyenda('f8', [
    ['sw-conc', 'Curva del estrato'], ['sw-conc-banda', 'IC95'],
    ['sw-conc-suave', 'Curva nacional de referencia'], ['sw-nulo', 'Dato no interpretable']
  ]);

  montar('f8', (cont, w, modo) => {
    const cols = modo === 'amplio' ? 3 : modo === 'medio' ? 2 : 1;
    const elegidos = modo === 'compacto' ? ['depe:pagado', 'depe:municipal', 'rural:rural', 'zona:sur'] : orden;
    const filas = Math.ceil(elegidos.length / cols);
    const gapX = 12, gapY = 34;
    const pw = (w - gapX * (cols - 1)) / cols;
    const ph = modo === 'amplio' ? 175 : modo === 'medio' ? 160 : 140;
    const altoA = filas * ph + (filas - 1) * gapY + 40;
    const altoB = modo === 'amplio' ? 420 : modo === 'medio' ? 380 : 360;
    const alto = altoA + altoB + 116;
    const aria = 'Arriba: curvas semanales de concepción por estrato, en la misma escala, con la curva nacional de fondo en cada panel. El pico de fin de año aparece en todos y lo que cambia es la amplitud. Abajo: la escala de cada región contra la curva nacional, ordenada por latitud. Sube de norte a sur con tres inversiones en la zona central hasta la Araucanía. Aysén se muestra sin valor porque su dato de origen está contaminado.';
    const {svg, g} = lienzo(cont, w, alto, aria, 'f8-cap');
    const izq = 34;
    const cursores = [];
    elegidos.forEach((clave, n) => {
      const cur = e.curvas[clave];
      const ox = (n % cols) * (pw + gapX), oy = 26 + Math.floor(n / cols) * (ph + gapY);
      const x = k => ox + izq + (k / 51) * (pw - izq - 8);
      const y = v => oy + ((1.14 - v) / (1.14 - 0.88)) * ph;
      linea(g, ox + izq, y(1), ox + pw - 8, y(1), {class: 'ref'});
      trazo(g, nacional.semanal.map((v, k) => `${k ? 'L' : 'M'}${x(k)},${y(v)}`).join(''), '--conc-suave', 1, {'stroke-dasharray': '4 3'});
      let sube = '', baja = '';
      cur.semanal.forEach((_, k) => {
        sube += `${k ? 'L' : 'M'}${x(k)},${y(cur.hi[k])}`;
        baja = `L${x(k)},${y(cur.lo[k])}` + baja;
      });
      relleno(g, sube + baja + 'Z', '--conc-banda', {opacity: 0.7});
      trazo(g, cur.semanal.map((v, k) => `${k ? 'L' : 'M'}${x(k)},${y(v)}`).join(''), '--conc', 1.8);
      txt(g, ox + izq + 4, oy + 12, ESTRATO_NOMBRE[clave] || clave, {'font-size': 11, class: 'anota', 'font-weight': 600});
      txt(g, ox + izq + 4, oy + 25, `amplitud ${f(cur.amplitud, 3)} [${f(cur.amplitud_ic[0], 3)}; ${f(cur.amplitud_ic[1], 3)}]`, {'font-size': 10, class: 'cifra'});
      if (clave === 'depe:pagado') {
        const dif = e.comparaciones['depe:pagado - depe:municipal'].max_dif;
        linea(g, x(dif.semana - 1), oy + 34, x(dif.semana - 1), oy + ph, {class: 'ref', 'stroke-dasharray': '3 3'});
        if (modo !== 'compacto') txt(g, x(dif.semana - 1) + 4, oy + ph - 8, `valle de fines de mayo: ${f(dif.dif, 3)} contra municipal`, {'font-size': 10});
      }
      if (n % cols === 0) for (const v of [0.92, 1.0, 1.08]) txt(g, ox + izq - 6, y(v) + 4, f(v, 2), {'text-anchor': 'end', class: 'cifra', 'font-size': 10});
      if (Math.floor(n / cols) === filas - 1) {
        for (let k = 0; k < 52; k += 13) txt(g, x(k), oy + ph + 16, MES3[Math.floor(k / 4.34)], {'text-anchor': 'middle', 'font-size': 10});
      }
      cursores.push(add(g, 'line', {y1: oy, y2: oy + ph, class: 'cursor', opacity: 0}));
    });

    /* Bloque B: escala regional contra latitud, sin recta ajustada. */
    const oyB = altoA + 62;
    const izqB = modo === 'compacto' ? 34 : 130;
    const xB = v => izqB + (v / 2) * (w - izqB - 16);
    const yB = lat => oyB + ((-19 - lat) / (-19 + 55)) * (altoB - 40);
    txt(g, izqB, oyB - 20, modo === 'compacto' ? 'Escala de cada región, de norte a sur' : 'Escala de cada región contra la curva nacional, de norte a sur', {'font-size': 11, class: 'anota'});
    linea(g, xB(1), oyB, xB(1), oyB + altoB - 40, {class: 'ref'});
    txt(g, xB(1), oyB + altoB - 24, 'igual que la curva nacional', {'text-anchor': 'middle', 'font-size': 10});
    for (const v of [0, 0.5, 1, 1.5, 2]) txt(g, xB(v), oyB - 6, f(v, 1), {'text-anchor': 'middle', 'font-size': 10, class: 'cifra'});
    /* Las latitudes de la zona central casi coinciden: los rótulos se separan
       lo justo para leerse y una guía los une con su punto. */
    const alturas = regiones.map(k => yB(e.regiones[k].lat));
    for (let i = 1; i < alturas.length; i++) alturas[i] = Math.max(alturas[i], alturas[i - 1] + 13);
    for (let i = alturas.length - 2; i >= 0; i--) alturas[i] = Math.min(alturas[i], alturas[i + 1] - 13);
    regiones.forEach((k, i) => {
      const r = e.regiones[k], y = yB(r.lat), yr = alturas[i], nulo = k === '11';
      txt(g, izqB - 12, yr + 4, modo === 'compacto' ? REGION_CORTA[k] : REGION[k], {'text-anchor': 'end', 'font-size': 10});
      if (Math.abs(yr - y) > 1) linea(g, izqB - 9, yr, izqB - 3, y, {class: 'eje'});
      if (!nulo) {
        linea(g, xB(r.escala_ic[0]), y, xB(r.escala_ic[1]), y, {class: 'ref'});
        const p = add(g, 'circle', {cx: xB(r.escala_vs_nacional), cy: y, r: 4.5, style: 'fill:var(--conc)'});
        add(p, 'title', {}, `${REGION[k]}. Latitud ${f(-r.lat, 1)} sur. Escala contra la curva nacional ${f(r.escala_vs_nacional, 3)}, IC95 ${f(r.escala_ic[0], 3)} a ${f(r.escala_ic[1], 3)}. Amplitud ${f(r.amplitud, 3)}. ${miles(r.n)} nacimientos.`);
      } else {
        const p = add(g, 'circle', {cx: xB(r.escala_vs_nacional), cy: y, r: 4.5, fill: 'none', style: 'stroke:var(--nulo)', 'stroke-width': 1.5, 'stroke-dasharray': '2 2'});
        add(p, 'title', {}, 'Aysén: el código de región 11 del archivo de estratos está contaminado con alumnos de otra región. No interpretable.');
        txt(g, xB(r.escala_vs_nacional) + 10, y + 4, 'no interpretable', {'font-size': 10, class: 'sinDato'});
      }
    });
    if (modo !== 'compacto') {
      const pie = modo === 'amplio'
        ? ['Sobre las doce regiones publicables la escala sube de norte a sur con tres inversiones en la zona central: la correlación de rango es 0,671.',
          'No se dibuja ninguna recta ajustada: una recta sobre una joroba entrega un número que cambia según cómo se ponderen las regiones.']
        : ['Sobre las doce regiones publicables la escala sube de norte a sur',
          'con tres inversiones en la zona central: la correlación de rango es 0,671.',
          'No se dibuja ninguna recta ajustada: una recta sobre una joroba',
          'entrega un número que cambia según cómo se ponderen las regiones.'];
      pie.forEach((t, k) => txt(g, 0, oyB + altoB - 8 + k * 13, t, {'font-size': 10, class: k ? '' : 'anota'}));
    }

    const x0 = izq, x1 = izq + (51 / 51) * (pw - izq - 8);
    /* Igual que en la figura 4 del feriado: el cursor se traduce a la columna
       que tiene debajo. Bajo los paneles superiores vive el bloque regional,
       que no se lee por semana, así que ahí la lectura vuelve a su instrucción. */
    const columna = x => Math.max(0, Math.min(cols - 1, Math.floor(x / (pw + gapX))));
    interactivo({
      svg, cont, n: 52,
      area: {x0, x1, bloque: 13, local: (x, y) => (y > altoA + 20 ? null : x - columna(x) * (pw + gapX))},
      alMover: i => {
        if (i === null) {
          cursores.forEach(c => c.setAttribute('opacity', 0));
          decir('f8', 'Mueve el puntero sobre los paneles superiores, o usa las flechas con el foco puesto en la figura, para leer una semana concreta.');
          return;
        }
        cursores.forEach((c, n) => {
          const ox = (n % cols) * (pw + gapX);
          const x = ox + izq + (i / 51) * (pw - izq - 8);
          c.setAttribute('opacity', 1);
          c.setAttribute('x1', x); c.setAttribute('x2', x);
        });
        const partes = elegidos
          .map(k => ({k, v: e.curvas[k].semanal[i]}))
          .sort((a, b) => b.v - a.v)
          .map(o => `${ESTRATO_NOMBRE[o.k] || o.k} ${f(o.v, 3)}`);
        decir('f8', `Semana ${i + 1}. De mayor a menor: ${partes.join(', ')}.`);
      }
    });
  });
}

/* ---------------------------------------------------------------- F9 */
function figura9(datos) {
  const sl = datos['serie-larga'];
  /* Los tramos MINEDUC 2000-2008 y 2000-2007 se solapan: se dibuja el de la
     ventana del estudio y el otro queda en la tabla. */
  const tramos = sl.empalme.filter(t => t.tramo !== '2000-2008');
  const familia = fuente => (fuente.includes('DEIS') ? '--verdad' : fuente.includes('MINEDUC') ? '--conc' : '--conc-suave');
  const periodos = Object.keys(sl.deis_indice_concepciones);

  leyenda('f9', [
    ['sw-conc-suave', 'Fuentes escolares antiguas'], ['sw-conc', 'Registros de matrícula'],
    ['sw-verdad', 'Registros vitales'], ['sw-bloque', 'Error sistemático entre fuentes']
  ]);

  montar('f9', (cont, w, modo) => {
    const izq = 44;
    const hA = modo === 'amplio' ? 320 : modo === 'medio' ? 300 : 270;
    const hB = modo === 'amplio' ? 200 : modo === 'medio' ? 180 : 170;
    const alto = hA + hB + 116;
    const aria = 'Arriba: la semi-amplitud estacional de los nacimientos cae de 10,8% en los nacidos en los años treinta a 1,7% en los nacidos entre 2010 y 2019, medida en fuentes distintas cuyo error sistemático está marcado. Abajo: el índice mensual de concepciones según registros vitales, por período. El máximo se mantuvo en enero durante setenta años y después de 2008 se corre a mayo o junio.';
    const {svg, g} = lienzo(cont, w, alto, aria, 'f9-cap');

    const oyA = 22;
    const xA = anio => izq + ((anio - 1928) / (2025 - 1928)) * (w - izq - 14);
    const yA = v => oyA + ((15 - v) / 15) * hA;
    txt(g, izq, oyA - 8, modo === 'compacto' ? 'Semi-amplitud anual de nacimientos' : 'Semi-amplitud del primer armónico anual de nacimientos', {'font-size': 11, class: 'anota'});
    for (let v = 0; v <= 15; v += 5) {
      linea(g, izq, yA(v), w - 14, yA(v), {class: v === 0 ? 'eje' : 'ref', opacity: v === 0 ? 1 : 0.3});
      txt(g, izq - 8, yA(v) + 4, f(v, 0) + '%', {'text-anchor': 'end', class: 'cifra', 'font-size': 10});
    }
    caja(g, xA(1928), yA(15), xA(1980) - xA(1928), yA(3) - yA(15), '--bloque', {opacity: 0.7});
    txt(g, xA(1930), yA(14.2), 'antes de 1980 el nivel queda acotado, no fijado:', {'font-size': 10, class: 'anota'});
    if (modo === 'amplio') txt(g, xA(1930), yA(14.2) + 13, 'la cota baja son docentes y asistentes y la alta educación de adultos, 5,1% contra 11,4% en los sesenta', {'font-size': 10});
    else if (modo === 'medio') {
      txt(g, xA(1930), yA(14.2) + 13, 'la cota baja son docentes y asistentes y la alta', {'font-size': 10});
      txt(g, xA(1930), yA(14.2) + 26, 'educación de adultos, 5,1% contra 11,4% en los sesenta', {'font-size': 10});
    }
    if (modo !== 'compacto') {
      caja(g, xA(1989), yA(4.5), xA(2000) - xA(1989), yA(2.5) - yA(4.5), '--bloque', {opacity: 0.7});
      txt(g, xA(1989), yA(5.2), 'rampa de cobertura', {'font-size': 10});
    }
    for (const t of tramos) {
      const x = xA(t.centro), color = familia(t.fuente);
      if (t.amp1_nac_ic95_boot_anios) linea(g, x, yA(t.amp1_nac_ic95_boot_anios[0]), x, yA(t.amp1_nac_ic95_boot_anios[1]), {class: 'ref'});
      const p = add(g, 'circle', {cx: x, cy: yA(t.amp1_nac_pct), r: 4, style: `fill:var(${color})`});
      add(p, 'title', {}, `${t.tramo}, fuente ${t.fuente}: semi-amplitud ${f(t.amp1_nac_pct)}%${t.amp1_nac_ic95_boot_anios ? `, IC95 ${f(t.amp1_nac_ic95_boot_anios[0])} a ${f(t.amp1_nac_ic95_boot_anios[1])}` : ''}. Máximo de concepción en ${t.fase1_conc || 'sin dato'}.`);
    }
    for (let anio = 1930; anio <= 2020; anio += modo === 'compacto' ? 30 : 10) {
      linea(g, xA(anio), oyA + hA, xA(anio), oyA + hA + 4, {class: 'eje'});
      txt(g, xA(anio), oyA + hA + 17, String(anio), {'text-anchor': 'middle', 'font-size': 10});
    }
    if (modo === 'amplio') txt(g, w - 14, yA(8.5), 'era 1,68 veces mayor en 1930 a 1959 que en 1960 a 1989, IC95 1,40 a 2,04', {'text-anchor': 'end', 'font-size': 10, class: 'anota'});

    const oyB = oyA + hA + 74;
    const dibujados = modo === 'compacto' ? ['1992-1999', '2000-2009', '2010-2019'] : periodos;
    const xB = m => izq + (m / 11) * (w - izq - (modo === 'amplio' ? 96 : 14));
    const yB = v => oyB + ((108 - v) / (108 - 95)) * hB;
    txt(g, izq, oyB - 8, modo === 'amplio' ? 'Índice mensual de concepciones en registros vitales, base 100' : 'Índice mensual de concepciones, base 100', {'font-size': 11, class: 'anota'});
    linea(g, xB(0), yB(100), xB(11), yB(100), {class: 'ref'});
    for (const v of [96, 100, 104, 108]) txt(g, izq - 8, yB(v) + 4, String(v), {'text-anchor': 'end', class: 'cifra', 'font-size': 10});
    dibujados.forEach((p, n) => {
      const d = sl.deis_indice_concepciones[p];
      const color = n === dibujados.length - 1 ? '--conc' : '--conc-suave';
      if (n === 0 || n === dibujados.length - 1) {
        let sube = '', baja = '';
        d.indice.forEach((_, m) => {
          sube += `${m ? 'L' : 'M'}${xB(m)},${yB(d.hi[m])}`;
          baja = `L${xB(m)},${yB(d.lo[m])}` + baja;
        });
        relleno(g, sube + baja + 'Z', '--conc-banda', {opacity: 0.45});
      }
      trazo(g, d.indice.map((v, m) => `${m ? 'L' : 'M'}${xB(m)},${yB(v)}`).join(''), color, 1 + n * 0.4, {opacity: 0.55 + n * 0.1});
    });
    /* Rótulos del extremo derecho, separados lo justo para que se lean. */
    if (modo === 'amplio') {
      const yFin = dibujados.map(p => yB(sl.deis_indice_concepciones[p].indice[11]));
      const orden = dibujados.map((p, n) => ({p, y: yFin[n]})).sort((a, b) => a.y - b.y);
      orden.forEach((o, n) => { if (n) o.y = Math.max(o.y, orden[n - 1].y + 13); });
      for (const o of orden) txt(g, xB(11) + 8, o.y + 4, o.p, {'font-size': 10});
    }
    for (let m = 0; m < 12; m++) txt(g, xB(m), oyB + hB + 16, MES3[m], {'text-anchor': 'middle', 'font-size': 10});
    linea(g, xB(0), oyB + hB, xB(11), oyB + hB, {class: 'eje'});
    txt(g, xB(0.2), yB(96.4), 'el máximo de enero se mantuvo setenta años;', {'font-size': 10, class: 'anota'});
    txt(g, xB(0.2), yB(96.4) + 13, 'después de 2008 se corre a mayo o junio', {'font-size': 10, class: 'anota'});

    const cursor = add(g, 'line', {y1: oyB, y2: oyB + hB, class: 'cursor', opacity: 0});
    interactivo({
      svg, cont, n: 12, area: {x0: xB(0), x1: xB(11), bloque: 3},
      alMover: i => {
        if (i === null) {
          cursor.setAttribute('opacity', 0);
          decir('f9', 'Mueve el puntero sobre el panel inferior, o usa las flechas con el foco puesto en la figura, para leer un mes concreto.');
          return;
        }
        cursor.setAttribute('opacity', 1);
        cursor.setAttribute('x1', xB(i)); cursor.setAttribute('x2', xB(i));
        const partes = dibujados.map(p => `${p}: ${f(sl.deis_indice_concepciones[p].indice[i], 2)}`);
        decir('f9', `Mes de ${MES3[i]}. ${partes.join('. ')}.`);
      }
    });
  });
}

/* ---------------------------------------------------------------- carga */
const ARCHIVOS = ['semanal', 'metodo', 'cumpleanos', 'dia-semana', 'feriados', 'patrias', 'estratos', 'serie-larga'];

async function cargar() {
  const partes = await Promise.all(ARCHIVOS.map(async nombre => {
    const r = await fetch(`./datos/${nombre}.json`);
    if (!r.ok) throw new Error(`no se pudo leer datos/${nombre}.json (${r.status})`);
    return [nombre, await r.json()];
  }));
  return Object.fromEntries(partes);
}

cargar().then(datos => {
  figura1(datos);
  figura2(datos);
  figura4(datos);
  figura5(datos);
  figura6(datos);
  figura3(datos);
  figura8(datos);
  figura9(datos);
}).catch(error => {
  /* Degradación visible: la página ya sirvió el texto y las tablas completas. */
  for (const cont of document.querySelectorAll('.chart')) {
    falla(cont, `No se pudieron cargar los datos de las figuras: ${error.message}. El texto y las tablas completas de cada figura siguen disponibles en esta misma página.`);
  }
});
