import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const raiz = new URL('../', import.meta.url);
const leer = ruta => readFileSync(new URL(ruta, raiz), 'utf8');
const json = nombre => JSON.parse(leer(`concepciones/datos/${nombre}.json`));

const semanal = json('semanal');
const mensual = json('mensual');
const metodo = json('metodo');
const cumpleanos = json('cumpleanos');
const diaSemana = json('dia-semana');
const feriados = json('feriados');
const patrias = json('patrias');
const estratos = json('estratos');
const serieLarga = json('serie-larga');
const validacion = json('validacion');
const meta = json('meta');

test('la curva semanal tiene 52 puntos en todas sus columnas', () => {
  for (const clave of ['semana', 'etiqueta', 'indice', 'indice_lo', 'indice_hi', 'desv_pct', 'desv_lo', 'desv_hi', 'significativo']) {
    assert.equal(semanal[clave].length, 52, `semanal.${clave}`);
  }
  assert.equal(semanal.semana[0], 1);
  assert.equal(semanal.semana[51], 52);
});

test('el máximo semanal cae en la quincena de fin de año, semana 52 o 1', () => {
  const max = semanal.indice.indexOf(Math.max(...semanal.indice));
  const semana = semanal.semana[max];
  assert.ok(semana === 52 || semana === 1, `el máximo cayó en la semana ${semana}`);
  assert.deepEqual(semanal.quincena_pico.semanas, [52, 1]);
  assert.equal(semanal.quincena_pico.etiqueta, '24-dic a 07-ene');
  assert.equal(Math.max(...semanal.desv_pct).toFixed(2), '8.71');
});

test('el mínimo es una meseta y no una semana identificable', () => {
  assert.deepEqual(semanal.valle_meseta.semanas, [28, 35]);
  const p = semanal.valle_meseta.p_argmin;
  assert.ok(p['34'] < 0.7, 'ninguna semana concentra el mínimo');
  const suma = Object.values(p).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(suma - 1) < 0.02, `las probabilidades del valle suman ${suma}`);
});

test('la amplitud publicada coincide con la curva', () => {
  const calculada = Math.max(...semanal.desv_pct) - Math.min(...semanal.desv_pct);
  assert.ok(Math.abs(calculada - semanal.amplitud_pp) < 0.02, `${calculada} contra ${semanal.amplitud_pp}`);
  assert.equal(semanal.n_semanas_significativas, semanal.significativo.filter(Boolean).length);
  assert.equal(semanal.n_semanas_significativas, 47);
});

test('la grilla diaria de concepción tiene 365 días, sin 29 de febrero', () => {
  for (const clave of ['doy_fecha', 'doy_concepcion', 'doy_lo', 'doy_hi']) {
    assert.equal(semanal[clave].length, 365, `semanal.${clave}`);
  }
  assert.ok(!semanal.doy_fecha.includes('29-feb'));
  assert.equal(semanal.doy_fecha[0], '01-ene');
  assert.equal(semanal.doy_fecha[364], '31-dic');
});

test('el índice mensual trae los doce meses', () => {
  assert.equal(mensual.meses.length, 12);
  assert.deepEqual(mensual.meses.map(m => m.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
});

test('las variantes del método son 22, con 52 puntos cada una, y ninguna mueve el pico fuera de la quincena', () => {
  const variantes = Object.entries(metodo.variantes);
  assert.equal(variantes.length, 22);
  for (const [nombre, v] of variantes) {
    assert.equal(v.semanal.length, 52, `variante ${nombre}`);
    assert.ok(v.sem_pico === 52 || v.sem_pico === 1, `la variante ${nombre} pone el pico en la semana ${v.sem_pico}`);
  }
  assert.equal(metodo.fechas_semana.length, 52);
});

test('los remuestreos del pico y del valle suman 400', () => {
  const suma = o => Object.values(o).reduce((a, b) => a + b, 0);
  assert.equal(suma(metodo.boot_sem_pico), 400);
  assert.equal(suma(metodo.boot_sem_valle), 400);
  assert.deepEqual(Object.keys(metodo.boot_sem_pico).sort(), ['1', '52']);
});

test('la validación contra los registros vitales trae 52 semanas en sus cuatro series', () => {
  for (const clave of ['verdad_semanal', 'estimado_semanal', 'estimado_lo', 'estimado_hi']) {
    assert.equal(metodo.validacion_deis[clave].length, 52, `validacion_deis.${clave}`);
  }
});

test('el calendario de cumpleaños tiene 366 fechas en todas sus columnas', () => {
  for (const clave of ['fecha', 'mes', 'dia', 'n', 'uno_en', 'indice_crudo', 'indice_crudo_lo', 'indice_crudo_hi', 'indice_limpio', 'indice_limpio_lo', 'indice_limpio_hi', 'ventana_feriado', 'frac_anios_con_coef_feriado']) {
    assert.equal(cumpleanos[clave].length, 366, `cumpleanos.${clave}`);
  }
  assert.ok(cumpleanos.fecha.includes('29-feb'));
});

/* La página afirma 186 fechas tocadas y 179 limpias. Son cifras de la versión
   v3 del modelo y no las de la síntesis editorial, que quedó en v2. */
test('la máscara de feriados deja 179 fechas limpias y toca 186', () => {
  assert.equal(cumpleanos.n_fechas_sin_coef_feriado, 179);
  const tocadas = cumpleanos.frac_anios_con_coef_feriado.filter(v => v > 0).length;
  assert.equal(tocadas, 186);
});

test('el 27 de diciembre es la fecha más común del calendario crudo', () => {
  const i = cumpleanos.indice_crudo.indexOf(Math.max(...cumpleanos.indice_crudo));
  assert.equal(cumpleanos.fecha[i], '27-dic');
  assert.equal(cumpleanos.n[i], 16886);
  assert.equal(cumpleanos.uno_en[i], 300.5);
  const j = cumpleanos.indice_crudo.indexOf(Math.min(...cumpleanos.indice_crudo));
  assert.equal(cumpleanos.fecha[j], '25-dic');
  assert.equal(cumpleanos.uno_en[j], 543.8);
});

test('el día de la semana trae 7 días y 19 años', () => {
  assert.equal(Object.keys(diaSemana.p_dow).length, 7);
  assert.equal(diaSemana.anios.length, 19);
  assert.equal(diaSemana.anios[0], 1989);
  assert.equal(diaSemana.anios[18], 2007);
  for (const clave of ['v', 'lo', 'hi']) assert.equal(diaSemana.f_por_anio[clave].length, 19);
  const suma = Object.values(diaSemana.p_dow).reduce((a, d) => a + d.p, 0);
  assert.ok(Math.abs(suma - 1) < 0.002, `las siete probabilidades suman ${suma}`);
  for (const dep of Object.values(diaSemana.estratos_depe2)) {
    assert.equal(Object.keys(dep.periodos).length, 5);
  }
});

test('la matriz del feriado trae 15 días por cada día de la semana', () => {
  for (const clave of ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom']) {
    const serie = feriados.matriz_B[clave];
    assert.equal(serie.length, 15, `matriz_B.${clave}`);
    assert.deepEqual(serie.map(p => p.k), Array.from({length: 15}, (_, i) => i - 7));
  }
  assert.equal(feriados.semana_santa_perfil.length, 21);
  const lunes = feriados.matriz_B.lun.find(p => p.k === 0).pct;
  const domingo = feriados.matriz_B.dom.find(p => p.k === 0).pct;
  assert.ok(lunes < -30 && domingo > -5, 'el hoyo del feriado depende del día de la semana');
});

test('Fiestas Patrias trae 22 días de perfil y 19 años', () => {
  assert.equal(patrias.perfil_rel_dias.length, 22);
  assert.equal(patrias.perfil_medio.length, 22);
  assert.equal(patrias.perfil_ee.length, 22);
  assert.equal(patrias.perfil_rel_dias[0], -7);
  assert.equal(patrias.perfil_rel_dias[21], 14);
  for (const largo of ['2', '3', '4', '5']) assert.equal(patrias.perfil_medio_por_largo[largo].length, 22);
  assert.equal(patrias.por_anio.length, 19);
  assert.equal(patrias.por_largo.length, 4);
  assert.ok(patrias.por_anio.every(a => a.deficit_descanso < 0), 'los 19 años tienen déficit');
  assert.ok(patrias.reg_deficit_descanso.vs_largo.largo.b < 0, 'el déficit crece con el largo del descanso');
});

test('los estratos son 19 curvas de 52 puntos y 13 regiones', () => {
  const curvas = Object.entries(estratos.curvas);
  assert.equal(curvas.length, 19);
  for (const [nombre, c] of curvas) {
    for (const clave of ['semanal', 'lo', 'hi']) assert.equal(c[clave].length, 52, `${nombre}.${clave}`);
    assert.ok(c.semana_pico === 52 || c.semana_pico === 1 || nombre.startsWith('per:'), `${nombre} pone el pico en la semana ${c.semana_pico}`);
  }
  assert.equal(Object.keys(estratos.regiones).length, 13);
  assert.equal(Object.keys(estratos.comparaciones).length, 17);
  assert.equal(estratos.curvas.nacional.escala_vs_nacional, null);
});

/* El archivo de origen marca el código de región 11 como NO VALIDO. La
   advertencia vive en pagina.json, en dia_semana.estratos["region:Aysén"], y el
   recorte publicado la reproduce textualmente en datos/README.md para que quien
   descargue los datos pueda verificar las cifras que la página cita. */
test('la advertencia textual de la región 11 viaja con los datos publicados', () => {
  const dicc = leer('concepciones/datos/README.md');
  assert.match(dicc, /NO VALIDO/);
  for (const cifra of ['3627', '11338', '1779', '1880']) {
    assert.ok(dicc.includes(cifra), `falta ${cifra} en la advertencia publicada`);
  }
  const aysen = estratos.regiones['11'];
  assert.ok(aysen.n / 19 > 3000, 'la región 11 trae más nacimientos por año que el Aysén real');
});

test('la serie larga trae 16 tramos y cinco períodos de doce meses', () => {
  assert.equal(serieLarga.empalme.length, 16);
  assert.equal(Object.keys(serieLarga.deis_indice_concepciones).length, 5);
  for (const [nombre, p] of Object.entries(serieLarga.deis_indice_concepciones)) {
    assert.equal(p.indice.length, 12, `deis_indice_concepciones.${nombre}`);
  }
  assert.equal(serieLarga.rampa_mineduc_deis.length, 17);
});

test('la validación externa cubre 204 meses y 17 años', () => {
  assert.equal(validacion.mensual_serie.length, 204);
  assert.equal(validacion.por_anio.length, 17);
  assert.equal(validacion.corr_1992_2007.r, 0.9431);
});

test('el metadato declara la población y la unidad publicable', () => {
  assert.equal(meta.n_nacimientos, 5073711);
  assert.equal(meta.n_anios, 19);
  assert.equal(meta.media_gestacion_dias, 260.3);
  assert.equal(meta.advertencias.length, 4);
  assert.match(meta.unidad_concepcion, /semana/);
});

/* Los CSV descargables son la superficie pública del dato; su número de filas
   está escrito en datos/README.md y en la propia página. */
const filas = ruta => leer(ruta).trim().split('\n');

test('los CSV descargables traen las filas que declaran', () => {
  const casos = [
    ['concepciones/concepciones-semanal.csv', 52],
    ['concepciones/concepciones-mensual.csv', 12],
    ['concepciones/cumpleanos-diario.csv', 366],
    ['concepciones/nacimientos-dia-semana.csv', 7]
  ];
  for (const [ruta, n] of casos) {
    const lineas = filas(ruta);
    assert.equal(lineas.length - 1, n, `${ruta} trae ${lineas.length - 1} filas de datos`);
    const columnas = lineas[0].split(',').length;
    for (const linea of lineas.slice(1)) {
      assert.equal(linea.split(',').length, columnas, `${ruta}: fila con distinto número de columnas`);
    }
  }
});

test('los encabezados de los CSV van sin tildes', () => {
  for (const ruta of ['concepciones/concepciones-semanal.csv', 'concepciones/concepciones-mensual.csv', 'concepciones/cumpleanos-diario.csv', 'concepciones/nacimientos-dia-semana.csv']) {
    assert.doesNotMatch(filas(ruta)[0], /[áéíóúñÁÉÍÓÚÑ]/, ruta);
  }
});

/* Contrato de la página: marcadores del chrome, tablas inyectadas en build y
   signos permitidos. */
const pagina = leer('concepciones/index.html');

test('la página trae los marcadores del chrome compartido', () => {
  for (const marca of ['<!--KIT_HEAD-->', '<!--HEADER-->', '<!--FOOTER-->']) {
    assert.ok(pagina.includes(marca), `falta ${marca}`);
  }
  assert.ok(pagina.includes('<html lang="es" data-brand="cochid"'));
  assert.ok(pagina.includes('class="skip-link"'));
  assert.ok(pagina.includes('<link rel="canonical" href="https://cochid.cl/concepciones/">'));
  assert.ok(pagina.includes('property="og:image"'));
  assert.ok(pagina.includes('name="twitter:card"'));
  assert.ok(pagina.includes('<noscript>'));
});

test('la página deja un hueco por cada tabla que genera el build', () => {
  const marcas = ['T_F1_SEMANAL', 'T_F1_DIARIA', 'T_MENSUAL', 'T_F2_VARIANTES', 'T_F2_DEIS', 'T_F4_DOW', 'T_F4_ANIOS', 'T_F5_MATRIZ', 'T_F6_PERFIL', 'T_F6_ANIOS', 'T_F3_CALENDARIO', 'T_F8_ESTRATOS', 'T_F8_REGIONES', 'T_F9_EMPALME', 'T_F9_MENSUAL'];
  for (const marca of marcas) assert.ok(pagina.includes(`<!--${marca}-->`), `falta el marcador ${marca}`);
});

test('ni la página ni el módulo usan guiones largos ni el signo menos Unicode', () => {
  for (const ruta of ['concepciones/index.html', 'concepciones/story.mjs', 'concepciones/story.css']) {
    assert.doesNotMatch(leer(ruta), /[—–−]/, `${ruta} trae un guion largo o un signo menos Unicode`);
  }
});

test('el módulo de figuras no escribe hexadecimales de color', () => {
  const codigo = leer('concepciones/story.mjs');
  assert.doesNotMatch(codigo, /#[0-9a-fA-F]{6}\b/, 'story.mjs trae un color hexadecimal inline');
});

test('la hoja de estilo declara los dos temas y no usa hexadecimales fuera de ellos', () => {
  const css = leer('concepciones/story.css');
  assert.ok(css.includes('[data-theme=dark]'));
  const cuerpo = css.slice(css.indexOf('[data-theme=dark]'));
  const fin = cuerpo.indexOf('}');
  const resto = cuerpo.slice(fin + 1);
  assert.doesNotMatch(resto, /#[0-9a-fA-F]{3,8}\b/, 'hay un hexadecimal fuera del bloque de variables de tema');
});
