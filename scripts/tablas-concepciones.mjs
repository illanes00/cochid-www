/* Tablas equivalentes de /concepciones/, generadas en build para que la página
   sirva sin JavaScript. Toda cifra sale de concepciones/datos/*.json, que es el
   recorte de data/out/pagina.json del repositorio cochid-concepciones.
   Formato de número propio: Intl.NumberFormat('es-CL') emite el signo menos
   Unicode y la página solo admite el guion ASCII. */
import {readFile} from 'node:fs/promises';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const num = (v, d = 2) => {
  if (v === null || v === undefined || Number.isNaN(v)) return 'sin dato';
  const s = Number(v).toFixed(d);
  return s.replace('.', ',');
};
export const pct = (v, d = 2) => (v === null || v === undefined ? 'sin dato' : num(v, d) + '%');
export const miles = v => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
export const ic = (par, d = 4) => (par ? `${num(par[0], d)} a ${num(par[1], d)}` : 'sin dato');
const si = b => (b ? 'sí' : 'no');

function tabla({caption, head, rows, clase = ''}) {
  const thead = `<thead><tr>${head.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>`;
  const tbody = `<tbody>${rows
    .map(r => `<tr><th scope="row">${esc(r[0])}</th>${r.slice(1).map(c => `<td>${esc(c)}</td>`).join('')}</tr>`)
    .join('')}</tbody>`;
  return `<table${clase ? ` class="${clase}"` : ''}><caption>${esc(caption)}</caption>${thead}${tbody}</table>`;
}

/* Mapa de código de región a nombre. No está en pagina.json; se deriva del orden
   por latitud y de las claves de dia_semana.estratos, y está documentado en la
   sección 2.1 de docs/concepciones-figuras.md. */
export const REGIONES = {
  1: 'Tarapacá y Arica', 2: 'Antofagasta', 3: 'Atacama', 4: 'Coquimbo', 5: 'Valparaíso',
  13: 'Metropolitana', 6: "O'Higgins", 7: 'Maule', 8: 'Biobío', 9: 'Araucanía',
  10: 'Los Lagos y Los Ríos', 11: 'Aysén', 12: 'Magallanes'
};

export const ESTRATOS_NOMBRE = {
  nacional: 'Nacional', 'sexo:hombre': 'Hombres', 'sexo:mujer': 'Mujeres',
  'depe:municipal': 'Municipal', 'depe:subvencionado': 'Particular subvencionado',
  'depe:pagado': 'Particular pagado', 'zona:norte': 'Zona norte', 'zona:centro': 'Zona centro',
  'zona:sur': 'Zona sur', 'zona:austral': 'Zona austral (contiene la región 11)',
  'rural:urbano': 'Urbano', 'rural:rural': 'Rural',
  'cruce:centro_urbano': 'Centro urbano', 'cruce:centro_rural': 'Centro rural',
  'cruce:sur_urbano': 'Sur urbano', 'cruce:sur_rural': 'Sur rural',
  'per:1989-1995': 'Cohortes 1989 a 1995', 'per:1996-2002': 'Cohortes 1996 a 2002',
  'per:2003-2007': 'Cohortes 2003 a 2007'
};

const DOW = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
const DOW_LABEL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MATRIZ_KEYS = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];

export async function cargarDatos(dir) {
  const nombres = ['semanal', 'mensual', 'metodo', 'cumpleanos', 'dia-semana', 'feriados', 'patrias', 'estratos', 'serie-larga', 'validacion', 'meta'];
  const pares = await Promise.all(nombres.map(async n => [n, JSON.parse(await readFile(new URL(`datos/${n}.json`, dir), 'utf8'))]));
  return Object.fromEntries(pares);
}

export function tablas(d) {
  const t = {};

  /* F1 · curva semanal */
  const s = d.semanal;
  t.T_F1_SEMANAL = tabla({
    caption: 'Índice semanal de concepción, cohortes 1989 a 2007. Desviación porcentual sobre una distribución uniforme del año.',
    head: ['Semana', 'Fechas', 'Índice', 'IC95 del índice', 'Desviación', 'IC95 de la desviación', 'Se distingue del promedio'],
    rows: s.semana.map((sem, i) => [
      sem, s.etiqueta[i], num(s.indice[i], 4), `${num(s.indice_lo[i], 4)} a ${num(s.indice_hi[i], 4)}`,
      pct(s.desv_pct[i]), `${num(s.desv_lo[i])} a ${num(s.desv_hi[i])}`, si(s.significativo[i])
    ])
  });
  t.T_F1_DIARIA = tabla({
    caption: 'Índice diario de concepción con IC95, e índice diario de nacimientos en crudo y descontado el calendario. Las dos últimas columnas vienen del bloque de cumpleaños, que es un pipeline distinto del de la curva de concepción.',
    head: ['Fecha', 'Concepción', 'IC95', 'Nacimientos en crudo', 'Nacimientos descontado el calendario'],
    rows: s.doy_fecha.map((f, i) => {
      const j = d.cumpleanos.fecha.indexOf(f);
      return [f, num(s.doy_concepcion[i], 4), `${num(s.doy_lo[i], 4)} a ${num(s.doy_hi[i], 4)}`,
        num(d.cumpleanos.indice_crudo[j], 4), num(d.cumpleanos.indice_limpio[j], 4)];
    })
  });
  t.T_MENSUAL = tabla({
    caption: 'Índice mensual de concepción, cohortes 1989 a 2007. La desviación ya descuenta los días de cada mes.',
    head: ['Mes', 'Probabilidad', 'IC95', 'Probabilidad uniforme', 'Desviación', 'IC95 de la desviación', 'Se distingue del promedio'],
    rows: d.mensual.meses.map(m => [
      m.etiqueta, num(m.p * 100, 2) + '%', `${num(m.p_lo * 100)} a ${num(m.p_hi * 100)}`,
      num(m.p_uniforme * 100, 2) + '%', pct(m.desv_pct), `${num(m.desv_lo)} a ${num(m.desv_hi)}`, si(m.significativo)
    ])
  });

  /* F2 · variantes y validación */
  const v = d.metodo.variantes;
  t.T_F2_VARIANTES = tabla({
    caption: 'Una fila por variante publicada del método. La serie completa de cada una está en el archivo de datos.',
    head: ['Variante', 'Semana del pico', 'Valor del pico', 'Semana del valle', 'Valor del valle', 'Correlación con la base'],
    rows: Object.entries(v).map(([nombre, x]) => [
      nombre, x.sem_pico, num(x.valor_pico, 4), x.sem_valle, num(x.valor_valle, 4), num(x.r_vs_base, 3)
    ])
  });
  const vd = d.metodo.validacion_deis;
  t.T_F2_DEIS = tabla({
    caption: 'Curva semanal estimada contra la verdad fechada registro a registro en los microdatos de los registros vitales, 1999 a 2003.',
    head: ['Semana', 'Fechas', 'Verdad', 'Estimado', 'IC95 del estimado'],
    rows: vd.verdad_semanal.map((x, i) => [
      i + 1, d.metodo.fechas_semana[i], num(x, 4), num(vd.estimado_semanal[i], 4),
      `${num(vd.estimado_lo[i], 4)} a ${num(vd.estimado_hi[i], 4)}`
    ])
  });

  /* F4 · día de semana y programación */
  const ds = d['dia-semana'];
  t.T_F4_DOW = tabla({
    caption: 'Probabilidad de nacer en cada día de la semana, en semanas sin feriado, 1989 a 2007. El reparto uniforme sería 14,29%.',
    head: ['Día', 'Probabilidad', 'IC95', 'Probabilidad sin ajuste'],
    rows: DOW.map((k, i) => [
      DOW_LABEL[i], num(ds.p_dow[k].p * 100) + '%',
      `${num(ds.p_dow[k].lo * 100)} a ${num(ds.p_dow[k].hi * 100)}`, num(ds.p_dow_crudo[k] * 100) + '%'
    ])
  });
  const periodoDe = anio => (anio <= 1993 ? '1989-1993' : anio <= 1998 ? '1994-1998' : anio <= 2003 ? '1999-2003' : '2004-2007');
  const dep = ds.estratos_depe2;
  t.T_F4_ANIOS = tabla({
    caption: 'Cota inferior de la proporción de partos con fecha elegida. Las tres columnas de dependencia son el valor del quinquenio que contiene ese año, no un valor anual.',
    head: ['Año', 'Nacional', 'IC95', 'Quinquenio', 'Municipal', 'Particular subvencionado', 'Particular pagado'],
    rows: ds.anios.map((a, i) => {
      const p = periodoDe(a);
      const val = k => num(dep[k].periodos[p].f_prog_domingo.v * 100) + '%';
      return [a, num(ds.f_por_anio.v[i] * 100) + '%',
        `${num(ds.f_por_anio.lo[i] * 100)} a ${num(ds.f_por_anio.hi[i] * 100)}`, p,
        val('depe2:municipal'), val('depe2:part_subvencionado'), val('depe2:part_pagado')];
    })
  });

  /* F5 · matriz del feriado y Semana Santa */
  const mb = d.feriados.matriz_B, ss = d.feriados.semana_santa_perfil;
  const ssPorK = new Map(ss.map(p => [p.dia_rel, p]));
  t.T_F5_MATRIZ = tabla({
    caption: 'Cambio porcentual de nacimientos alrededor del feriado, por día de la semana en que cae, con IC95. La última columna es Semana Santa, con el día 0 en el Viernes Santo y la razón de observados sobre esperados convertida a porcentaje.',
    head: ['Día relativo', ...DOW_LABEL, 'Semana Santa'],
    rows: Array.from({length: 15}, (_, i) => {
      const k = i - 7;
      const celdas = MATRIZ_KEYS.map(key => {
        const p = mb[key].find(x => x.k === k);
        return `${num(p.pct)}% [${num(p.lo)}; ${num(p.hi)}]`;
      });
      const p = ssPorK.get(k);
      return [k > 0 ? `+${k}` : String(k), ...celdas, p ? `${num((p.razon - 1) * 100)}%` : 'sin dato'];
    })
  });

  /* F6 · Fiestas Patrias */
  const fp = d.patrias;
  t.T_F6_PERFIL = tabla({
    caption: 'Perfil medio de nacimientos alrededor del 18 de septiembre, en días equivalentes de nacimiento, por largo del descanso.',
    head: ['Día relativo al 18', 'Promedio', 'Error estándar', 'Descanso de 2 días', 'De 3 días', 'De 4 días', 'De 5 días'],
    rows: fp.perfil_rel_dias.map((k, i) => [
      k > 0 ? `+${k}` : String(k), num(fp.perfil_medio[i], 4), num(fp.perfil_ee[i], 4),
      num(fp.perfil_medio_por_largo['2'][i], 4), num(fp.perfil_medio_por_largo['3'][i], 4),
      num(fp.perfil_medio_por_largo['4'][i], 4), num(fp.perfil_medio_por_largo['5'][i], 4)
    ])
  });
  t.T_F6_ANIOS = tabla({
    caption: 'Las 19 Fiestas Patrias de la ventana, con el largo del descanso y el déficit de nacimientos durante el descanso en días equivalentes.',
    head: ['Año', 'Día de semana del 18', 'Largo del descanso', 'Días hábiles liberados', 'Déficit del descanso'],
    rows: fp.por_anio.map(a => [a.anio, a.dow18, `${a.largo} días`, a.habiles, num(a.deficit_descanso, 4)])
  });

  /* F3 · calendario de cumpleaños */
  const c = d.cumpleanos;
  t.T_F3_CALENDARIO = tabla({
    caption: 'Las 366 fechas del calendario, cohortes 1989 a 2007. El índice limpio solo es interpretable en las fechas que nunca reciben coeficiente de feriado.',
    head: ['Fecha', 'Personas', 'Una de cada', 'Índice crudo', 'IC95 del crudo', 'Índice limpio', 'IC95 del limpio', 'Recibe coeficiente de feriado'],
    rows: c.fecha.map((f, i) => [
      f, miles(c.n[i]), num(c.uno_en[i], 1), num(c.indice_crudo[i], 4),
      `${num(c.indice_crudo_lo[i], 4)} a ${num(c.indice_crudo_hi[i], 4)}`, num(c.indice_limpio[i], 4),
      `${num(c.indice_limpio_lo[i], 4)} a ${num(c.indice_limpio_hi[i], 4)}`,
      c.frac_anios_con_coef_feriado[i] > 0 ? `sí, en ${num(c.frac_anios_con_coef_feriado[i] * 100, 0)}% de los años` : 'no'
    ])
  });

  /* F8 · estratos y regiones */
  const cu = d.estratos.curvas;
  t.T_F8_ESTRATOS = tabla({
    caption: 'Amplitud de la curva semanal de concepción por estrato, con IC95. Estas curvas salen del pipeline por estrato, que no es el de la figura 1.',
    head: ['Estrato', 'Amplitud', 'IC95', 'Semana del pico', 'Semana del valle', 'Escala contra la nacional'],
    rows: Object.entries(cu).map(([k, x]) => [
      ESTRATOS_NOMBRE[k] || k, num(x.amplitud, 4), ic(x.amplitud_ic), x.semana_pico, x.semana_valle,
      x.escala_vs_nacional === null ? 'referencia' : `${num(x.escala_vs_nacional, 3)} [${ic(x.escala_ic, 3)}]`
    ])
  });
  const reg = d.estratos.regiones;
  t.T_F8_REGIONES = tabla({
    caption: 'Las 13 regiones de norte a sur. La región 11 no es interpretable: su archivo de origen está contaminado con alumnos de otra región.',
    head: ['Región', 'Latitud', 'Nacimientos', 'Amplitud', 'Escala contra la nacional', 'IC95 de la escala', 'Semana del pico'],
    rows: Object.keys(reg)
      .sort((a, b) => reg[b].lat - reg[a].lat)
      .map(k => [
        REGIONES[k] + (k === '11' ? ' (no interpretable)' : ''), num(reg[k].lat, 1),
        miles(reg[k].n), num(reg[k].amplitud, 4),
        k === '11' ? 'no interpretable' : num(reg[k].escala_vs_nacional, 3),
        k === '11' ? 'no interpretable' : ic(reg[k].escala_ic, 3), reg[k].semana_pico
      ])
  });

  /* F9 · noventa años */
  const sl = d['serie-larga'];
  t.T_F9_EMPALME = tabla({
    caption: 'Semi-amplitud del primer armónico anual de nacimientos, por tramo y por fuente. Las fuentes no son comparables en nivel.',
    head: ['Tramo', 'Fuente', 'Semi-amplitud', 'IC95 bootstrap entre años', 'Fecha del máximo de concepción'],
    rows: sl.empalme.map(e => [
      e.tramo, e.fuente, pct(e.amp1_nac_pct), ic(e.amp1_nac_ic95_boot_anios, 2), e.fase1_conc || 'sin dato'
    ])
  });
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const periodos = Object.keys(sl.deis_indice_concepciones);
  t.T_F9_MENSUAL = tabla({
    caption: 'Índice mensual de concepciones según los registros vitales, base 100, por período. El máximo se corre de enero a mayo o junio después de 2008.',
    head: ['Mes', ...periodos],
    rows: MESES.map((m, i) => [m, ...periodos.map(p => num(sl.deis_indice_concepciones[p].indice[i], 2))])
  });

  return t;
}

/* Contrato mínimo: si una serie cambia de largo aguas arriba, el build aborta. */
export function verificarContrato(d) {
  const problemas = [];
  const chequear = (cond, msg) => { if (!cond) problemas.push(msg); };
  chequear(d.semanal.semana.length === 52, 'semanal.semana no tiene 52 puntos');
  chequear(d.semanal.doy_fecha.length === 365, 'semanal.doy_fecha no tiene 365 puntos');
  chequear(d.mensual.meses.length === 12, 'mensual.meses no tiene 12 entradas');
  chequear(Object.keys(d.metodo.variantes).length === 22, 'metodo.variantes no tiene 22 variantes');
  chequear(d.metodo.validacion_deis.verdad_semanal.length === 52, 'validacion_deis no tiene 52 semanas');
  chequear(d.cumpleanos.fecha.length === 366, 'cumpleanos.fecha no tiene 366 fechas');
  chequear(d.cumpleanos.n_fechas_sin_coef_feriado === 179, 'cumpleanos.n_fechas_sin_coef_feriado dejó de ser 179');
  chequear(d['dia-semana'].anios.length === 19, 'dia_semana.anios no tiene 19 años');
  chequear(MATRIZ_KEYS.every(k => d.feriados.matriz_B[k].length === 15), 'feriados.matriz_B no tiene 15 puntos por día');
  chequear(d.feriados.semana_santa_perfil.length === 21, 'semana_santa_perfil no tiene 21 puntos');
  chequear(d.patrias.perfil_rel_dias.length === 22, 'patrias.perfil_rel_dias no tiene 22 puntos');
  chequear(d.patrias.por_anio.length === 19, 'patrias.por_anio no tiene 19 años');
  chequear(Object.keys(d.estratos.curvas).length === 19, 'estratos.curvas no tiene 19 estratos');
  chequear(Object.keys(d.estratos.regiones).length === 13, 'estratos.regiones no tiene 13 regiones');
  chequear(d['serie-larga'].empalme.length === 16, 'serie_larga.empalme no tiene 16 tramos');
  chequear(d.meta.n_nacimientos === 5073711, 'meta.n_nacimientos dejó de ser 5.073.711');
  if (problemas.length) throw new Error('Contrato de datos de /concepciones/ roto:\n  ' + problemas.join('\n  '));
}
