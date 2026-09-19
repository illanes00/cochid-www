# Figuras de "Cuándo se concibe en Chile"

Especificación de las nueve figuras de `/concepciones/`, con el detalle que necesita quien
escriba el SVG. No contiene código. Escrita contra
`/srv/projects/cochid/cochid-concepciones/data/out/SINTESIS.md` (900 líneas) y
`/srv/projects/cochid/cochid-concepciones/data/out/pagina.json` (115 series). Cada clave citada
aquí fue verificada contra el JSON: tipo y largo están en la sección 2.

Patrón a copiar: `cambio-de-hora/` de este mismo árbol. Marcadores `<!--KIT_HEAD-->`,
`<!--HEADER-->`, `<!--FOOTER-->` en `index.html`; SVG propio en módulo ES sin dependencias;
`scripts/build.mjs` inyecta el chrome y genera `dist/`.

---

## 0. Bloqueo que hay que resolver antes de dibujar F8

La región 11 está contaminada y el dato lo dice, pero `SINTESIS.md` no lo recoge.

`pagina.json` trae una sola advertencia de tipo NO VALIDO, en
`dia_semana.estratos["region:Aysén"].advertencia`:

> NO VALIDO: region=11 en nac_diario_estratos.csv trae 3627-11338 nacimientos por año en
> 1989-2004 contra 1779-1880 en 2006-2007 (Aysén real ~1.800); el código 11 está contaminado
> con alumnos de otra región. No interpretar.

La contaminación está en el archivo de origen, no en una serie derivada. Verificado:

| Serie | n total | n por año | Aysén real |
|---|---|---|---|
| `estratos.regiones["11"].n` | 105.934 | 5.575 | ~1.800 |
| `estratos.regiones["12"].n` | 44.337 | 2.334 | (Magallanes) |

El estrato `zona:austral` no trae campo `n`. La proporción hay que inferirla sumando las dos
regiones australes: 105.934 de 150.271, o sea alrededor de 70% del estrato, suponiendo que
`zona:austral` sea la unión de las regiones 11 y 12. De ahí se siguen tres consecuencias sobre lo
que F8 puede afirmar:

1. El punto de Aysén del dot plot regional (`escala_vs_nacional` 0,924) sale de la serie
   contaminada. No es publicable como estimación de Aysén.
2. La curva `estratos.curvas["zona:austral"]` (amplitud 0,1537, escala 0,889) es en dos tercios
   la misma serie contaminada.
3. La "reversión austral" de la sección 4.3 de SINTESIS, y con ella el contraste
   `sur menos austral 0,636 (IC95 0,366 a 0,931)` y el término cuadrático, se apoyan en ese
   estrato. La frase de F8 en SINTESIS, "hace visible la joroba (sube hasta la Araucanía, cae
   en Aysén y Magallanes)", no se sostiene tal cual.

**Propuesta para F8 mientras no haya corrección aguas arriba.** Dibujar Aysén como punto hueco,
sin intervalo, con la etiqueta "no interpretable" y una nota al pie que cite la advertencia
textual. Reducir la afirmación a lo que queda en pie: la escala sube de forma monótona desde
Tarapacá y Arica hasta la Araucanía, con Spearman 0,927 sobre las 11 regiones continentales
(p 4,0e-5), y cae en Magallanes. Queda una sola región austral limpia, o sea sin evidencia
suficiente para llamarlo reversión. Retirar de la página el contraste sur menos austral y el
término cuadrático. Retirar también `zona:austral` de los pequeños múltiplos de F8.

**Decisión que corresponde a Martín**, no al autor del SVG: publicar F8 con Aysén marcado y la
reversión retirada, o detener F8 hasta recalcular los estratos regionales con el código 11
saneado. El resto de la página no depende de esto.

---

## 1. Reglas que gobiernan las nueve figuras

**La columna vertebral.** La unidad publicable de concepción es la semana, nunca el día. Todo
rasgo de 1 a 3 días que aparezca en los nacimientos es del lado del parto: cesárea programada,
inducción, registro civil. El núcleo gestacional tiene desvío de 12,5 días y su día más probable
concentra 4,1% de la masa, así que no puede transmitir un rasgo de un día. La página tiene que
enseñar esa distinción, no solo enunciarla: F1 la muestra, y todas las figuras del lado del parto
llevan la marca "lado del parto" en el epígrafe.

**Etiquetado de lado.** Cada figura abre con una palabra en el `overline` que dice de qué lado
está: `CONCEPCIÓN` para F1, F2, F8, F9 y la figura de método; `PARTO` para F3, F4, F5, F6 y F7.
No es decoración: es la única defensa contra que el lector lea el hoyo del 25 de diciembre como
un dato sobre concepciones.

**Tufte.** Sin chartjunk. Sin ejes redundantes: cuando dos codificaciones son la misma cifra
reescalada, se dibuja una sola y la otra se rotula en el eje opuesto. Sin rejilla completa; solo
las líneas de referencia que el lector necesita para leer un valor. Factor de mentira 1: las
escalas de índice arrancan donde el dato lo pide y el cero se declara cuando no aparece. Nada de
área para codificar una magnitud lineal. Nada de tercera dimensión.

**Prohibiciones del canon aplicadas al dibujo.** Nada de librerías de gráficos ni CDN, nada de
bundler, nada de Google Fonts, nada de analítica ni cookies. Sin gradientes, sin sombras con
desplazamiento, sin `border-left` de acento, sin emoji. Sin cejas ni etiquetas mono sobre los
títulos (regla H28). Ningún hexadecimal fijo: el patrón `cambio-de-hora/story.mjs` los tiene
inline (`'#f4be69'`, `'#a7c7f1'`, `'#a44848'`, `'#314459'`) y en esta página no se copian, porque
se rompen en tema oscuro. Ver la sección 3.

**Escala tipográfica dentro del SVG.** IBM Plex Sans para rótulos y JetBrains Mono para cifras
alineadas en columna, ambas del kit. Rótulo de eje 11 px a 1440, 11 px a 768, 10 px a 390.
Etiqueta de anotación 12 px, 12 px, 11 px. Título dentro del SVG: no existe, el título vive en
el `<figcaption>` del HTML.

---

## 2. Contrato de datos verificado

Todo lo que sigue fue leído de `pagina.json` el 19 de septiembre de 2026. La columna "verificado"
dice qué se comprobó.

| Clave | Tipo | Largo | Verificado |
|---|---|---|---|
| `concepcion.semanal.{semana, etiqueta, p, p_uniforme, indice, indice_lo, indice_hi, desv_pct, desv_lo, desv_hi, ee_desv_pct, significativo}` | listas paralelas | 52 cada una | `indice` 0,9539 a 1,0871; `desv_pct` -4,61 a 8,71; `significativo` suma 47 |
| `concepcion.mensual` | lista de objetos | 12 | claves `id, etiqueta, p, p_lo, p_hi, p_uniforme, desv_pct, desv_lo, desv_hi, ee_desv_pct, significativo` |
| `concepcion.ranking.{argmax_observado, argmin_observado, p_argmax, p_argmin, duelo_max, duelo_min}` | objetos | `p_argmax` 2 claves, `p_argmin` 6 | `p_argmax` {"52": 0,892; "1": 0,107}; `duelo_max.dif_pp` 0,24 |
| `concepcion.robustez_lam.{300, 1000, 3000}` | objetos | 3 | `3000.sem_max` = 1, no 52 |
| `concepcion.doy.{fecha, concepcion, lo, hi, partos_limpio, partos_crudo}` | listas paralelas | 365 cada una | `partos_crudo` 0,6716 a 1,2246; `concepcion` 0,9536 a 1,0901 |
| `concepcion.amplitud_semanal_pct` | número | 13,32 | |
| `concepcion.n_semanas_significativas` | entero | 47 | |
| `metodo.variantes.<nombre>.semanal` | 22 variantes | 52 cada una | mínimo global 0,9399; máximo global 1,1027 |
| `metodo.fechas_semana` | lista | 52 | |
| `metodo.boot_sem_pico` | objeto | 2 claves | {"52": 357; "1": 43}, suma 400 |
| `metodo.boot_sem_valle` | objeto | 6 claves | {"34": 235; "29": 90; "30": 69; "35": 4; "28": 1; "33": 1}, suma 400 |
| `metodo.validacion_deis.{verdad_semanal, estimado_semanal, estimado_lo, estimado_hi}` | listas | 52 cada una | verdad 0,9435 a 1,1026; estimado 0,9657 a 1,0733 |
| `cumpleanos.tabla.{fecha, mes, dia, n, uno_en, indice_crudo, indice_crudo_lo, indice_crudo_hi, indice_limpio, indice_limpio_lo, indice_limpio_hi, ventana_feriado, frac_anios_con_coef_feriado}` | listas paralelas | 366 cada una | crudo 0,6757 a 1,2321; limpio 0,8904 a 1,1005 |
| `cumpleanos.n_fechas_sin_coef_feriado` | entero | 178 | 365 fechas no bisiestas menos 187 con coeficiente |
| `cumpleanos.mas_comunes_crudo` y sus tres hermanas | listas de objetos | 10 cada una | |
| `cumpleanos.feb29` | objeto | 23 claves | `uno_en_ciclo_de_4_anios` 1.780,2 |
| `dia_semana.p_dow.<dia>.{p, lo, hi}` | 7 objetos | | martes 0,1594; domingo 0,1015 |
| `dia_semana.anios` | lista | 19 | 1989 a 2007 |
| `dia_semana.f_por_anio.{v, lo, hi, ee}` | listas | 19 cada una | |
| `dia_semana.estratos["depe2:municipal" \| "depe2:part_subvencionado" \| "depe2:part_pagado"]` | objetos | | `f_prog_domingo` presente, 19 valores |
| `dia_semana.estratos["region:*"]` | 13 objetos | | `f_prog_domingo` es `null` en las 13; usar `periodos` |
| `feriados.matriz_B.{lun, mar, mie, jue, vie, sab, dom}` | listas de objetos | 15 cada una | `k` de -7 a +7, claves `k, pct, lo, hi, se_log, n_dias, nac_obs` |
| `feriados.dia0.<fecha>.entre_ocurrencias.{pct, lo, hi, n_ocurrencias}` | objetos | 13 fechas | dic25 -34,30 [-39,0; -29,2]; sep19 -33,01; ene01 -31,91 |
| `feriados.dia0_menores_promedio.entre_ocurrencias` | objeto | | -21,97 [-24,1; -19,78], 121 ocurrencias |
| `feriados.dia0_por_dow.menores_habil_promedio` | objeto | | -28,59 [-29,9; -27,26], 85 ocurrencias |
| `feriados.semana_santa_perfil` | lista de objetos | 21 | `dia_rel` de -10 a +10; `razon` 0,7263 a 1,0605 |
| `feriados.semana_santa_partos` | objeto | **32 claves**, de las cuales 17 son de Semana Santa | las de Semana Santa van `ss_-7` a `ss_-1`, luego **`ss_viernes`, `ss_sabado`, `ss_domingo`** y después `ss_+3` a `ss_+9`. Los días 0, +1 y +2 **no se llaman `ss_0`**. Las otras 15 claves son feriados móviles, elecciones y censo |
| `feriados.semana_santa_balance` | objeto | | `hoyo_vie_sab_dom` -0,4331; `adelanto_lun_jue` 0,1953 |
| `fiestas_patrias.{perfil_rel_dias, perfil_medio, perfil_ee}` | listas | 22 cada una | `perfil_rel_dias` de -7 a +14; `perfil_medio` -0,2910 a 0,0613 |
| `fiestas_patrias.perfil_medio_por_largo.{2,3,4,5}` | listas | 22 cada una | mínimos -0,143 / -0,260 / -0,375 / -0,345 |
| `fiestas_patrias.por_anio` | lista de objetos | 19 | claves `anio, largo, habiles, dow18, deficit_descanso, ...` |
| `fiestas_patrias.reg_deficit_descanso.vs_largo.largo` | objeto | | `b` -0,1753; `ic95` [-0,2545; -0,0960]; `p_t` 0,000248 |
| `estratos.curvas.<estrato>.{semanal, lo, hi, amplitud, amplitud_ic, semana_pico, semana_valle, escala_vs_nacional, escala_ic, nacimientos_semanal}` | 19 estratos | 52 puntos cada serie | mínimo global de `lo` 0,8645; máximo global de `hi` 1,1789 |
| `estratos.regiones` | **dict de 13 claves "1" a "13"**, no lista | | cada una con `lat, n, amplitud, amplitud_ic, escala_vs_nacional, escala_ic, semana_pico, semana_valle`. **Sin nombre de región.** |
| `estratos.comparaciones` | **dict de 17 claves**, no lista | | claves del tipo `"depe:pagado - depe:municipal"` |
| `estratos.latitud` | objeto | | `spearman_11_sin_XI_XII` 0,927; `spearman_13` 0,527 |
| `serie_larga.empalme` | lista de objetos | 16 | `fuente, tramo, amp1_nac_pct, amp1_nac_ic95_boot_anios, fase1_conc` |
| `serie_larga.deis_indice_concepciones` | dict de 5 períodos | 12 meses cada uno | con `indice, lo, hi, mes_max, prob_mes_max` |
| `serie_larga.rampa_mineduc_deis` | lista de objetos | 17 | |
| `meta` | objeto | | `n_nacimientos` 5.073.711; `media_gestacion_dias` 260,3; `lam` 1000; 4 advertencias |

### 2.1 Correcciones a la sección 6 de SINTESIS

La sección 6 describe mal la forma de seis cosas. Quien escriba el SVG debe usar esta lista, no
la de SINTESIS.

1. **`estratos.regiones` es un diccionario, no una lista de 13, y no trae el nombre de la
   región.** El mapa código a nombre hay que dejarlo escrito en el módulo. Se deriva de las
   claves de `dia_semana.estratos` y del orden por `lat`, y coincide con las escalas de la
   sección 4.3 de SINTESIS:

   | Código | Nombre | `lat` | `escala_vs_nacional` |
   |---|---|---|---|
   | 1 | Tarapacá y Arica | -20,2 | 0,182 |
   | 2 | Antofagasta | -23,6 | 0,425 |
   | 3 | Atacama | -27,4 | 0,909 |
   | 4 | Coquimbo | -29,9 | 1,051 |
   | 5 | Valparaíso | -33,0 | 0,942 |
   | 13 | Metropolitana | -33,5 | 0,781 |
   | 6 | O'Higgins | -34,2 | 1,074 |
   | 7 | Maule | -35,4 | 1,221 |
   | 8 | Biobío | -36,8 | 1,430 |
   | 9 | Araucanía | -38,7 | 1,759 |
   | 10 | Los Lagos y Los Ríos | -41,5 | 1,497 |
   | 11 | Aysén | -45,6 | 0,924 (contaminada, ver sección 0) |
   | 12 | Magallanes | -53,2 | 0,783 |

2. **`estratos.comparaciones` es un diccionario de 17 claves**, no una lista.
3. **`fiestas_patrias.concepcion_deis_perfil_7d` son 99 `null`.** El panel de concepciones de F6
   no se puede construir con esa clave. Lo que sí existe es
   `fiestas_patrias.concepcion_deis_integral` (`b` 1,168662; `ee` 0,162245; `ic95_t4`) y
   `fiestas_patrias.concepcion_semanal_33_43` (11 semanas con `indice`, `lo`, `hi`).
4. **`metodo.validacion_deis.r` es `null`.** La correlación r = 0,877 existe solo en la prosa de
   la sección 5.2 de SINTESIS. Se cita como texto del epígrafe, no se lee del JSON.
5. **Las cifras publicadas del día 0 del feriado salen de
   `feriados.dia0.<fecha>.entre_ocurrencias.pct`, no del `pct` de primer nivel.** Difieren: 1 de
   mayo da -24,20 entre ocurrencias y -24,67 en el GLM. La sección 2.2 de SINTESIS publica el
   primero, con IC de Student entre ocurrencias, porque el IC de Wald subestima la incertidumbre
   unas 2,5 veces.
6. **La máscara de F3 es `frac_anios_con_coef_feriado > 0`, que marca 187 fechas.** No es
   `ventana_feriado`, que marca 45. Comprobado: 366 menos 187 da 179 fechas con coeficiente cero,
   y quitando el 29 de febrero quedan las 178 de `n_fechas_sin_coef_feriado`.

### 2.2 Dos series que nunca se pueden mezclar

`concepcion.semanal` y `estratos.curvas.nacional` salen de pipelines distintos y **no son la
misma curva**:

| | `concepcion.semanal` | `estratos.curvas.nacional` |
|---|---|---|
| Rango | 0,9539 a 1,0871 | 0,9519 a 1,0803 |
| Amplitud | 13,32 puntos (`amplitud_semanal_pct`) | 0,1284 (`amplitud`) |
| Semana pico | 52 | 1 |

La diferencia de semana pico no es un error. El duelo entre las semanas 52 y 1 está a 0,24 puntos
con IC95 de -0,14 a +0,58, así que dos pipelines cercanos caen en lados distintos del empate. Eso
mismo es el argumento de F1. Pero implica dos cosas. La página **no puede escribir "la amplitud
nacional es 12,84%" en ningún lugar donde también diga 13,32**. Y la curva nacional de F8 se
rotula como "referencia del panel de estratos", no como "la curva de F1". El epígrafe de F8 lo
dice de forma explícita.

### 2.3 Discrepancia menor de conteo

La sección 1 de SINTESIS dice "21 variantes del método" y la sección 6 dice 22.
`metodo.variantes` tiene 22 claves. La página usa 22 y no repite el 21.

---

## 3. Color y variables de tema

El tema oscuro de este repo se activa con el atributo `data-theme="dark"` en `<html>`, que pone
el `theme.js` del kit, no con `prefers-color-scheme`. Las variables nuevas se declaran igual que
en `cambio-de-hora/story.css`: bloque `:root{}` y bloque `[data-theme=dark]{}`.

**Regla de implementación.** Ningún color se escribe como atributo de presentación
(`fill="#123456"` ni `fill="var(--x)"`, que además no es válido). Todo color se aplica con clase
CSS o con `style="fill:var(--x)"`, de modo que el cambio de tema no exija volver a renderizar el
SVG. Esto es una desviación deliberada del patrón de `cambio-de-hora/story.mjs`, que sí mete
hexadecimales inline, y hay que anotarla en `KIT-DESVIACIONES.md` como decisión, o mejor, dejar
constancia de que esta página corrige ese defecto del patrón.

### 3.1 Variables del kit que se usan tal cual

`var(--ink)` texto principal · `var(--ink-muted)` rótulos de eje y notas · `var(--line)` líneas
de referencia y bordes · `var(--paper)` fondo · `var(--paper-raised)` fondo de panel y casilla
neutra · `var(--accent)` solo para el foco y para el elemento seleccionado por el usuario.

### 3.2 Variables nuevas

| Variable | Claro | Oscuro | Uso |
|---|---|---|---|
| `--conc` | `#1f5d78` | `#8ecbe4` | curva y puntos de concepción (F1, F2, F8, F9, método) |
| `--conc-banda` | `#c4dde7` | `#22485a` | relleno de la banda IC95 de concepción |
| `--conc-suave` | `#6f9fb3` | `#4f7f93` | curvas de estratos no destacados en F8 |
| `--parto` | `#a8500d` | `#ffd082` | series del lado del parto (F4, F5, F6, F7, panel inferior de F1) |
| `--parto-banda` | `#f0d7b8` | `#4a3418` | relleno de IC del lado del parto |
| `--parto-crudo` | `#d79a5a` | `#a8712f` | serie cruda de nacimientos en el panel inferior de F1 |
| `--bloque` | `#e8eef1` | `#1d2b34` | relleno del valle sombreado y de las bandas de descanso |
| `--empate` | `#2f7d63` | `#83d6c5` | marca de la quincena máxima leída como empate (F1) |
| `--variante` | `#9aa8b2` | `#5d6d78` | las 22 líneas grises del abanico (F2) |
| `--verdad` | `#7a3f6d` | `#dda6cf` | serie de verdad DEIS en la figura de método |
| `--rayado` | `#b8c3ca` | `#3c4b56` | trama de las 187 fechas con coeficiente de feriado (F3) |
| `--nulo` | `#8c96a0` | `#6a757f` | punto hueco de Aysén y de cualquier estimación no interpretable |

### 3.3 Escala divergente de F3

Nueve tramos, centrada en el índice 1,00, discretizada. Se define como nueve variables por tema
y se aplica con clase (`.q-4` a `.q4`), sin interpolación en JavaScript y sin releer el tema.

| Clase | Variable | Claro | Oscuro |
|---|---|---|---|
| `.q-4` | `--div-b4` | `#1b4f66` | `#a8dcef` |
| `.q-3` | `--div-b3` | `#3d7893` | `#7fc2d9` |
| `.q-2` | `--div-b2` | `#79a8bd` | `#5a9cb4` |
| `.q-1` | `--div-b1` | `#b9d3de` | `#3a6d82` |
| `.q0` | `--div-c0` | `var(--paper-raised)` | `var(--paper-raised)` |
| `.q1` | `--div-a1` | `#f0cfa8` | `#7a5220` |
| `.q2` | `--div-a2` | `#dda36a` | `#a87335` |
| `.q3` | `--div-a3` | `#c07636` | `#d3954a` |
| `.q4` | `--div-a4` | `#96470f` | `#f4b878` |

Frío bajo 1, cálido sobre 1. No se usa rojo y verde: fallan en deuteranopía y la página no tiene
una lectura de bueno y malo. Contraste mínimo comprobado con Axe en los dos temas; el texto de
las casillas extremas usa `var(--paper)` sobre `.q-4`, `.q-3`, `.q3` y `.q4`, y `var(--ink)` en
el resto.

### 3.4 Foco

`:focus-visible` sobre cualquier elemento interactivo del SVG: contorno de 2 px en
`var(--accent)` más un contorno interior de 1 px en `var(--paper)` para que se vea sobre marcas
oscuras y claras. Nunca `outline: none`.

---

## 4. Tamaños y puntos de quiebre

`.wrap` mide `min(1160px, 100% - 64px)` y baja a `100% - 36px` bajo 700 px. Anchos útiles del
contenedor de figura, descontando 24 px de padding lateral a 1440 y 14 px bajo 700:

| Viewport | Ancho de `.wrap` | Ancho útil del SVG a figura completa | A dos columnas |
|---|---|---|---|
| 1440 | 1160 | 1112 | 534 |
| 768 | 704 | 656 | 306 |
| 390 | 354 | 326 | una sola columna |
| 320 | 284 | 256 | una sola columna |

Las figuras se miden con `clientWidth` y se vuelven a dibujar con `ResizeObserver`, como en
`cambio-de-hora/story.mjs`. No se escalan con `viewBox`: el diseño cambia de forma en cada
quiebre, no se achica. Tres modos dentro de la función de render:

- `w >= 900`: modo amplio. Paneles lado a lado, todas las anotaciones, rótulo cada 4 semanas.
- `560 <= w < 900`: modo medio. Paneles apilados, anotaciones reducidas al máximo y al valle,
  rótulo cada 8 semanas.
- `w < 560`: modo compacto. Ver el detalle por figura. Rótulo cada 13 semanas, o sea trimestral.

`docs/DEPLOY.md` exige QA real en 1440, 390 y 320 px. Ninguna figura puede producir barra de
desplazamiento horizontal en el documento a 320 px; si una tabla necesita desplazarse, va dentro
de un contenedor con `role="region"`, `aria-label` y `tabindex="0"`, como el `details` de
`cambio-de-hora/index.html`.

---

## 5. Reglas comunes de interacción y accesibilidad

**Estructura HTML de cada figura.**

```
<figure>
  <figcaption>
    <span class="overline">CONCEPCIÓN · 01</span>
    <h3>Título de la figura</h3>
    <p>Bajada de una o dos frases con la cifra primero.</p>
  </figcaption>
  <div class="leyenda">...</div>
  <div class="chart" id="f1"></div>
  <p class="lectura" id="f1-lectura" aria-live="polite">...</p>
  <details class="data-table">
    <summary>Ver los datos de esta figura</summary>
    <div role="region" aria-label="..." tabindex="0"><table>...</table></div>
  </details>
  <p class="footnote">Fuente y clave de pagina.json.</p>
</figure>
```

**`role="img"`, `aria-label` y `aria-describedby`.** El `<svg>` lleva `role="img"` y un
`aria-label` que dice el resultado, no la forma. Ejemplo malo: "gráfico de líneas de 52 puntos".
Ejemplo bueno: el que está escrito en cada figura más abajo. Además lleva un `<title>` como
primer hijo, con el mismo texto, y los hijos del SVG llevan `aria-hidden="true"` salvo los que
reciben foco.

**Tope de 40 palabras para el `aria-label`.** El lector de pantalla lo entrega como un bloque
único que no se puede navegar ni interrumpir, así que un `aria-label` de 90 palabras es peor que
uno de 30. El detalle no se pierde: va al `<figcaption>`, donde además lo ve todo el mundo, y el
`<svg>` lo enlaza con `aria-describedby` al `id` de ese `figcaption`. Entre los tres niveles
(`aria-label` corto, bajada del `figcaption`, tabla completa) el lector de pantalla puede parar
donde quiera.

**De dónde sale el dato, en build y en runtime.** `pagina.json` vive en
`/srv/projects/cochid/cochid-concepciones/data/out/pagina.json`. Queda fuera de este árbol, en
solo lectura desde acá, y pesa 360 KB. `scripts/build.mjs` lo lee en tiempo de build y emite
`concepciones/datos.json`, recortado a las claves que enumera la sección 2 de este documento. Ese
recorte es lo único que el navegador descarga. El SHA256 del `pagina.json` de origen, su `meta.generado` y
la lista de claves copiadas quedan registrados en `docs/provenance/`. Si una clave falta o cambia
de largo, el build aborta: es el mismo contrato que `scripts/h_sintesis.py` aplica aguas arriba.

**Tabla equivalente sin JavaScript.** Cada figura trae una tabla completa, generada por
`scripts/build.mjs` e inyectada en el HTML dentro de un `<details>` cerrado. Como la genera el
build, está presente con JavaScript desactivado, que es el requisito. La tabla trae las mismas
cifras que el gráfico, con el mismo redondeo, y una fila por punto de dato. Nunca "ver los datos
en el CSV" como sustituto.

**`<noscript>`.** Un solo bloque al inicio de la sección de figuras: "Activa JavaScript para ver
los gráficos. Las tablas de datos de cada figura están disponibles más abajo." Copiado del
patrón.

**Puntero.** `pointermove` sobre el área del gráfico mueve un cursor vertical al punto más
cercano en el eje mayor y escribe el texto de lectura en el párrafo `.lectura`. No hay tooltip
flotante en las figuras de serie: el texto va al párrafo fijo bajo el gráfico, que no tapa datos,
no se corta en el borde de la pantalla y lo lee el lector de pantalla por `aria-live="polite"`.
En las figuras de casilla o de punto discreto (F3, F8) sí hay `<title>` por elemento, porque el
navegador lo muestra como tooltip nativo y no cuesta nada.

**Táctil.** `pointerdown` fija el cursor y `pointerup` lo deja fijo, no lo borra. Un segundo toque
fuera de una marca lo libera. Área de toque mínima 44 por 44 px. En F1 se consigue con rectángulos
transparentes de ancho de semana completa sobre la banda. En F3 no se consigue, porque la casilla
mide 7 a 9 px, así que su interacción táctil es por fila de mes y no por casilla. Sin `hover` como
único camino a ninguna información.

**Teclado.** Un solo `tabindex="0"` por figura, en el `<svg>`. Con el foco puesto:

- flecha izquierda y derecha, un paso en el eje mayor;
- `Home` y `End`, a los extremos;
- `RePág` y `AvPág`, un bloque, o sea 13 semanas en F1 y F2, un mes en F3, un estrato en F8;
- `Escape`, libera el cursor.

El atributo `aria-valuetext` no aplica porque no es un `slider`. El estado se comunica por el
párrafo `aria-live`.

**`prefers-reduced-motion`.** Ninguna figura de esta página tiene animación de entrada ni
transición de trazo. El único movimiento es el cursor de lectura, que aparece sin transición. Es
decir, la página cumple la preferencia por construcción y no necesita rama condicional, a
diferencia del patrón, que anima bandas.

**Redondeo.** Índice con cuatro decimales en la tabla y tres en la lectura. Porcentaje con dos
decimales. Coma decimal y punto de millar. Nunca notación científica en superficie pública.

---

## 6. Orden de aparición y figura de portada

**Portada: F1.** Es la única figura que responde el título de la página y la única que lleva
encima la regla semana contra día. La imagen `og:image` se deriva de F1 en modo amplio, exportada
por `scripts/build.mjs`, con los dos paneles y las dos anotaciones.

Orden, que es también el orden narrativo del texto:

| # | Figura | Lado | Papel |
|---|---|---|---|
| 1 | **F1** curva semanal más panel diario | concepción | la respuesta y la regla de lectura |
| 2 | **F2** abanico de 22 variantes, con el panel de validación DEIS fusionado | concepción | por qué creerle al pico y no al valle |
| 3 | **F4** día de semana y programación del parto | parto | el primer paso de "esto es del lado del parto" |
| 4 | **F5** matriz del feriado, con Semana Santa fusionada | parto | el mecanismo completo del feriado |
| 5 | **F6** Fiestas Patrias | parto | el caso chileno con dosis medible |
| 6 | **F3** calendario de cumpleaños, crudo y limpio | parto | lo que la gente vive, y la prueba de que el ranking crudo es calendario |
| 7 | **F8** heterogeneidad por estrato y por región | concepción | quién tiene más estacionalidad |
| 8 | **F9** noventa años de fondo | concepción | el cierre: esto no describe al Chile de hoy |

Ocho posiciones para nueve figuras más la de método, porque hay dos fusiones. Ver la sección 8.

F3 va en sexto lugar y no antes, aunque sea la figura más vistosa, porque solo se puede leer bien
después de F4, F5 y F6. Puesta antes, el lector concluye que el 25 de diciembre es un mal día
para concebir, que es exactamente el error que la página existe para impedir.

---

## 7. Las figuras

### F1. Cuándo se concibe, por semana

**Papel.** Figura principal y portada. Dos paneles apilados que comparten el eje horizontal de
365 días, no el índice de semana.

**Panel superior: índice semanal de concepción.**

- Marca: banda de IC95 (`<path>` cerrado) más línea escalonada del índice. Escalonada, no
  suavizada: cada semana es un tramo horizontal del ancho de sus días. La semana 52 mide 8 días
  (`etiqueta[51]` = "24-dic a 31-dic") y las otras 51 miden 7. Una polilínea de 52 puntos
  equiespaciados sería un factor de mentira sobre la semana 52.
- Escala x: lineal sobre el día del año, dominio 1 a 365, con la semana 52 ocupando los días 358
  a 365. Rótulos en el primer día de cada mes, con el nombre de mes en el centro del tramo.
- Escala y: lineal, dominio **0,940 a 1,100**. Cubre `indice_lo` mínimo 0,9475 y `indice_hi`
  máximo 1,0975 con holgura. No arranca en cero y el epígrafe lo dice: "el eje no parte de cero;
  el día promedio es 1,000". Línea de referencia en 1,000, sólida, `var(--line)`, con el rótulo
  "día promedio" al extremo derecho dentro del área.
- Segundo rotulado del mismo eje: a la derecha, desviación sobre la uniforme, de -6% a +10%. Es
  la misma cifra reescalada (`desv_pct` es `(indice - 1) * 100`), así que se rotula, no se
  dibuja. **Por eso no hay panel inferior de desviación porcentual**, a diferencia de lo que pide
  SINTESIS: dos paneles con la misma información es el eje redundante que la regla de Tufte
  prohíbe.
- Anotación del máximo: **bloque, no punto**. Rectángulo de 15 días sobre las semanas 52 y 1
  (24 de diciembre al 7 de enero), relleno `var(--empate)` al 12% de opacidad, borde superior
  sólido. Etiqueta dentro del bloque, dos líneas: "Máximo: 24-dic a 7-ene" y
  "+8,7% y +8,5%, empate". Debajo, en `var(--ink-muted)`: "diferencia 0,24 puntos, IC95 -0,14 a
  +0,58; la 52 gana en 357 de 400 remuestreos". Fuentes: `concepcion.ranking.duelo_max` y
  `metodo.boot_sem_pico`.
- Anotación del mínimo: **bloque sombreado, nunca un punto**. Rectángulo sobre las semanas 28 a
  35 (9 de julio a 1 de septiembre), relleno `var(--bloque)`, sin borde. Etiqueta: "Mínimo: una
  meseta de casi dos meses" y "entre -4,6% y -4,0%, sin semana identificable". Debajo: "la 34
  gana en 235 de 400 remuestreos, la 29 en 90 y la 30 en 69". Fuente:
  `metodo.boot_sem_valle`.
- Marca de significación: las 5 semanas con `significativo = false` llevan el tramo en trazo
  discontinuo. Las 47 restantes van sólidas. El epígrafe: "47 de 52 semanas se distinguen del
  promedio anual".
- Prohibido: marcar la semana 38, que está en +0,01%, como si fuera un rasgo. Si se rotula, se
  rotula como ausencia: "Fiestas Patrias cae exactamente en el promedio anual". Eso se dice en el
  texto y no en la figura.

**Panel inferior: nacimientos crudos, nacimientos limpios y concepciones, por día del año.**

Este panel reemplaza el panel de desviación porcentual que pedía SINTESIS y es el que hace
visible la columna vertebral del estudio.

- Tres series de 365 puntos desde `concepcion.doy`: `partos_crudo` en `var(--parto-crudo)`,
  `partos_limpio` en `var(--parto)`, `concepcion` en `var(--conc)`, esta última con su banda
  `lo` y `hi` en `var(--conc-banda)`.
- Escala y: lineal, dominio **0,66 a 1,25**, que cubre `partos_crudo` de 0,6716 a 1,2246.
  Referencia en 1,000.
- Mismo eje x que el panel superior, alineado al píxel. Sin repetir los rótulos de mes: se
  dibujan una sola vez, bajo el panel inferior, y sirven a los dos.
- Anotaciones fijas, tres, que son el argumento entero:
  - 25 de diciembre: `partos_crudo` 0,6716 y `partos_limpio` 1,0082. Etiqueta: "25-dic: -33% de
    nacimientos en crudo. Descontado el feriado, 1,008, o sea normal."
  - 27 de diciembre: `partos_crudo` 1,2246. Etiqueta: "27-dic: +22%, el rebote."
  - Sobre la curva de concepción en el mismo tramo: `concepcion` 1,0836 el 25 de diciembre.
    Etiqueta: "La curva de concepción no tiene ningún rasgo de un día: el núcleo gestacional, con
    desvío de 12,5 días, no puede transmitirlo."
- El 18 de septiembre se rotula igual, con `partos_crudo` 0,7921 y `partos_limpio` 1,0930, porque
  es la anotación que prepara F6.

**Interacción.** `pointermove` y flechas mueven un cursor vertical de un día, común a los dos
paneles. El párrafo de lectura, para un día `d`:

> 14 de julio. Semana 28 (09-jul a 15-jul). Concepción 0,959, IC95 0,953 a 0,966, o sea -4,1%
> bajo el día promedio. Ese día nacieron en índice 0,981 en crudo y 0,987 descontado el
> calendario.

Para un día dentro de un bloque anotado, la lectura agrega la frase del bloque.

**`aria-label` del SVG.**

> Índice semanal de concepciones en Chile, cohortes 1989 a 2007. El máximo es la quincena del 24
> de diciembre al 7 de enero y el mínimo es una meseta de casi dos meses entre julio y
> septiembre.

Más `aria-describedby` apuntando al `<figcaption>`, cuya bajada lleva el detalle: "La quincena
del 24 de diciembre al 7 de enero es el máximo del año, con 8,7% y 8,5% sobre el día promedio,
dos semanas empatadas. El mínimo, entre 4,6% y 4,0% bajo el promedio, no es una semana sino una
meseta que va del 9 de julio al 1 de septiembre. La amplitud entre máximo y mínimo es 13,3
puntos. El panel de abajo usa la misma escala de días y muestra por qué. Los nacimientos crudos
tienen caídas de un solo día, como el 33% del 25 de diciembre. Esas caídas desaparecen al
descontar el feriado y nunca llegan a la curva de concepción."

**Tabla equivalente.** 52 filas: semana, etiqueta de fechas, índice, IC95, desviación porcentual,
IC95 de la desviación, y una columna "se distingue del promedio" con sí o no. Más una segunda
tabla plegada de 365 filas con las tres series del panel inferior, dentro de un `details`
anidado, porque 365 filas no se ponen abiertas.

**Tamaños.** A 1440: 1112 por 620, panel superior 380 y panel inferior 200, con 40 de separación.
A 768: 656 por 560, paneles 330 y 190. A 390: 326 por 520, paneles 300 y 180; las anotaciones de
bloque pasan a una sola línea y el detalle de bootstrap se mueve al epígrafe. A 320: 256 por 500;
solo quedan las etiquetas "Máximo" y "Mínimo" dentro de los bloques, y las tres anotaciones del
panel inferior se reducen a una, la del 25 de diciembre.

**Claves.** `concepcion.semanal.*` (52), `concepcion.ranking.duelo_max`,
`concepcion.ranking.duelo_min`, `metodo.boot_sem_pico`, `metodo.boot_sem_valle`,
`concepcion.doy.*` (365), `concepcion.amplitud_semanal_pct`,
`concepcion.n_semanas_significativas`.

---

### F2. Las 22 variantes del método, y qué recupera el método

**Papel.** Sostener que el pico es robusto y el valle no. Dos paneles lado a lado a 1440 y
apilados bajo 900. El segundo panel es la figura de método de SINTESIS, fusionada aquí (ver
sección 8).

**Panel izquierdo: abanico.**

- Marca: 22 polilíneas de 52 puntos en `var(--variante)`, ancho 1, opacidad 0,55, más la curva
  base de `concepcion.semanal.indice` en `var(--conc)`, ancho 2,5, encima.
- Escala x: índice de semana 1 a 52. Aquí sí es aceptable el paso equiespaciado, porque la
  comparación es entre variantes en la misma semana y ninguna anotación es de fecha. Rótulos
  trimestrales con la fecha de inicio (`metodo.fechas_semana`).
- Escala y: lineal, dominio **0,935 a 1,105**, que cubre el mínimo global 0,9399 y el máximo
  global 1,1027 de las 22 variantes. Referencia en 1,000.
- Sombreado de fondo: la banda vertical de las semanas 52 y 1 en `var(--empate)` al 8%, y la de
  las 28 a 35 en `var(--bloque)`. Repite las zonas de F1 para que el lector las reconozca.
- Anotación al pie, dentro del área: "La semana del pico cae en la 52 o en la 1 en las 22
  variantes. La semana del valle se reparte entre la 28, la 29, la 34 y la 36." Verificado contra
  el JSON: `sem_pico` toma valores {1, 52} y `sem_valle` toma {28, 29, 34, 36}. Nótese que este
  conjunto es más chico que el "28 a 36" que dice SINTESIS y que el de los remuestreos
  (`boot_sem_valle`, que suma la 30, la 33 y la 35). La anotación usa el conjunto real de las
  variantes.
- La variante `alterno literal (razon +-3 sem, pasa-alto) + desplazamiento` tiene `r_vs_base`
  0,3002 y un rango achatado de 0,9602 a 1,0455. **Se incluye**, porque excluir la variante que
  peor se porta convierte el abanico en propaganda. Se dibuja igual que las otras 21 y se nombra
  en el epígrafe: "una de las 22 es un estimador local sin deconvolución. Apenas correlaciona con
  la base, r 0,30, y aplana la curva. Aun así su máximo cae en la semana 52". No va destacada con
  color propio: destacarla sería darle un peso que no tiene.

**Panel derecho: contra la verdad conocida.**

- Marca: `metodo.validacion_deis.verdad_semanal` en `var(--verdad)`, línea sólida de 2;
  `estimado_semanal` en `var(--conc)` con banda `estimado_lo` y `estimado_hi` en
  `var(--conc-banda)`.
- Escala y: lineal, dominio **0,940 a 1,105**, que cubre verdad 0,9435 a 1,1026 y banda 0,9444 a
  1,0918. Mismo dominio visual que el panel izquierdo para que la comparación sea directa. Es la
  razón por la que los dos paneles van lado a lado y no en secciones distintas.
- Piso de ruido: banda horizontal de más o menos 0,015 alrededor de la verdad, en `var(--bloque)`,
  rotulada "piso de ruido de la propia verdad (RMSE 0,010 a 0,015)". Fuente: sección 5.2 de
  SINTESIS. No está en `pagina.json`, así que se escribe como constante en el módulo con un
  comentario que cite el origen.
- Anotación: flecha corta desde el máximo del estimado hasta el máximo de la verdad en la semana
  52. Texto: "acierta la semana y atenúa el exceso. Recupera 71,7% del pico de la semana 52 y
  65,3% del de la 1". Cifras de la sección 5.2.
- Epígrafe: "r = 0,877 entre estimado y verdad, RMSE 0,0156, cuatro años de microdatos DEIS 1999
  a 2003". El r se escribe a mano: `metodo.validacion_deis.r` es `null`.

**Interacción.** Un solo cursor de semana, común a los dos paneles. La lectura dice, para la
semana `s`: el valor base, el rango entre las 22 variantes en esa semana, y el par verdad contra
estimado si `s` existe en el panel derecho.

> Semana 34 (20-ago a 26-ago). Base 0,954. Entre las 22 variantes, de 0,940 a 0,966. En la
> validación DEIS, verdad 0,951 y estimado 0,966.

**`aria-label`.**

> Izquierda: 22 variantes del método sobre la curva semanal de concepción. Las 22 ponen el máximo
> en la semana 52 o en la 1, y reparten el mínimo entre las semanas 28, 29, 34 y 36. Derecha:
> comparación con la verdad medida en microdatos DEIS 1999 a 2003. El método acierta la semana
> del máximo y recupera 72% de su altura.

**Tabla equivalente.** Una tabla de 22 filas con nombre de variante, semana del pico, valor del
pico, semana del valle, valor del valle y correlación con la base, que son las claves
`sem_pico`, `valor_pico`, `sem_valle`, `valor_valle` y `r_vs_base`. No se tabulan los 22 por 52
valores: la tabla equivalente debe ser legible, y el resumen por variante es la información que
la figura transmite. La serie completa va en el CSV descargable.

**Tamaños.** 1440: dos paneles de 534 por 340. 768: apilados, 656 por 300 cada uno. 390: apilados,
326 por 260; el abanico baja a opacidad 0,45 y ancho 0,8 para que no se empaste. 320: 256 por 240,
sin el sombreado de bloques, que a ese ancho solo ensucia.

**Claves.** `metodo.variantes.<nombre>.{semanal, sem_pico, sem_valle, valor_pico, valor_valle,
r_vs_base}` (22), `metodo.fechas_semana` (52), `metodo.validacion_deis.{verdad_semanal,
estimado_semanal, estimado_lo, estimado_hi}` (52), `concepcion.semanal.indice` (52).

---

### F3. El calendario de cumpleaños, crudo y limpio

**Papel.** Mostrar lo que la gente vive y, en el mismo golpe de vista, demostrar que el ranking
crudo es calendario y no biología.

**Forma.** Dos cuadrículas de 12 filas por 31 columnas. Fila = mes, columna = día del mes. Las
casillas inexistentes (31 de abril y siguientes) quedan vacías, sin borde: el borde derecho
irregular informa y no cuesta tinta. **No es una cuadrícula por día de semana**: la tabla está
indexada por `fecha` sin año (`01-ene` a `31-dic`), así que no existe un día de semana asociado y
una rejilla semanal sería una invención.

- Panel A, crudo: `indice_crudo`.
- Panel B, limpio: `indice_limpio`.
- Disposición: lado a lado a 1440 y a 768; apilados bajo 560, panel A arriba.

**Escala de color.** Una sola escala divergente compartida por los dos paneles, simétrica
alrededor de 1,00 y fijada por los extremos del panel crudo. Nueve tramos, con los cortes en
0,72 / 0,80 / 0,88 / 0,96 / 1,04 / 1,12 / 1,20, más los dos extremos abiertos:

| Clase | Rango de índice |
|---|---|
| `.q-4` | menos de 0,80 |
| `.q-3` | 0,80 a 0,88 |
| `.q-2` | 0,88 a 0,96 |
| `.q-1` | 0,96 a 1,00 |
| `.q0` | exactamente 1,00 más o menos 0,005 |
| `.q1` | 1,00 a 1,04 |
| `.q2` | 1,04 a 1,12 |
| `.q3` | 1,12 a 1,20 |
| `.q4` | más de 1,20 |

Verificado: crudo va de 0,6757 a 1,2321 y limpio de 0,8904 a 1,1005. El panel limpio ocupa solo
los cuatro tramos centrales y **se ve lavado a propósito**. Esa palidez es el hallazgo, y se
anota dentro del panel B: "Descontado el día de semana y el feriado, ninguna fecha del año se
aleja más de 11% del promedio. La cima es una meseta." Volver a escalar el panel B a su propio
rango sería un factor de mentira: haría parecer que el 27 de diciembre limpio (1,0074) es tan
extremo como el crudo (1,2321).

**Máscara de las 187 fechas.** Predicado literal: `frac_anios_con_coef_feriado > 0`. Marca 187
fechas. Se dibuja **solo sobre el panel B**, como trama diagonal de 45 grados, trazo de 0,8 px en
`var(--rayado)`, encima del color de la casilla, definida una sola vez como `<pattern>` en
`<defs>`. Nota dentro del panel B: "187 fechas reciben coeficiente de feriado en al menos un año.
El ranking limpio solo es interpretable sobre las otras 178." No usar `ventana_feriado`, que
marca 45 y es otra cosa.

**El 29 de febrero.** Ocupa la casilla (febrero, 31) desplazada a (febrero, 29), que existe. Su
índice crudo es 0,8207 sobre una base de 4 ocurrencias, así que lleva un punto blanco de 2 px al
centro y su `<title>` empieza con "solo 4 ocurrencias en la ventana". No entra en la escala como
un dato más.

**Anotaciones fijas.** Cuatro en el panel A, con línea guía corta de 1 px hasta su casilla:

- 27 de diciembre, la más común: "1 de cada 300,5 personas. Es el rebote de Navidad."
- 25 de diciembre, la menos común: "1 de cada 543,8."
- 18 y 19 de septiembre, con un solo rótulo para las dos casillas contiguas: "entre las diez
  menos comunes."

Y dos en el panel B, a las mismas casillas. Primera: "27-dic limpio 1,007, o sea promedio".
Segunda: "18 y 19-sep limpios 1,100 y 1,097, dentro del máximo estacional, pero indistinguibles
de sus vecinos de septiembre, +0,024 con EE 0,014". Esas dos anotaciones son el contraste
publicable de la sección 2.5 de SINTESIS: el déficit del dieciocho es programación de partos, no
falta de embarazos.

**Prohibido publicar el orden interno del top 10 y del bottom 10.** SINTESIS lo dice: el conjunto
es estable, el orden no, con IC de más o menos 0,09 en índice. La figura anota cuatro fechas
concretas y nada más. Si la página incluye una lista, va sin números de posición y con la frase
"el conjunto es estable, el orden dentro del conjunto no lo es".

**Tamaño de casilla y móvil.** Casilla cuadrada con 1 px de separación:

| Viewport | Ancho útil por panel | Casilla | Alto de la cuadrícula |
|---|---|---|---|
| 1440, dos paneles | 534 | 15 px (31 por 15 = 465, más 60 de rótulo de mes) | 12 por 15 = 180 |
| 768, **apilados** | 656 | 19 px (31 por 19 = 589, más 60) | 228 |
| 390, apilados | 326 | 9 px (31 por 9 = 279, más 42) | 108 |
| 320, apilados | 256 | 7 px (31 por 7 = 217, más 36) | 84 |

A 768 los paneles se apilan y no se ponen lado a lado. Dos columnas a ese ancho dan casillas de
8 px, o sea más chicas que las de 9 px del teléfono: la tableta leería peor que el móvil. El
quiebre de F3 es 900 px, no 560 como en el resto de la página, y se documenta acá porque es la
única figura que se sale de la regla general de la sección 4.

A 390 el panel completo mide 326 por 150 incluida la fila de rótulos de día, y los dos paneles
apilados más leyenda y anotaciones caben en 420 px de alto. Rótulo de mes con tres letras a 1440
y 390, con una letra a 320. Rótulo de día del mes: 1, 5, 10, 15, 20, 25, 31 a 1440; 1, 10, 20, 31
a 768 y 390; solo 1 y 31 a 320.

**Interacción.** Cada casilla lleva `<title>` nativo, que cubre el puntero en escritorio sin
código. En táctil la casilla de 7 a 9 px no alcanza el área mínima de 44 px, así que la
interacción es **por fila de mes**. Un rectángulo transparente del ancho de la fila y 44 px de
alto captura el toque, y el párrafo de lectura muestra el mes completo con su fecha más alta y su
fecha más baja. Con el teclado, las flechas mueven casilla a casilla y `RePág` y `AvPág` saltan
de mes.

Texto del `<title>` de casilla y del párrafo de lectura:

> 27 de diciembre. 16.886 personas, 1 de cada 300,5. Índice crudo 1,232, IC95 1,213 a 1,251.
> Índice limpio 1,007. Fecha sin coeficiente de feriado.

Para una fecha con coeficiente, la última frase cambia a: "Fecha con coeficiente de feriado en
X% de los 19 años: el índice limpio no es interpretable."

**`aria-label`.**

> Calendario de 366 casillas con la frecuencia de cada fecha de cumpleaños, cohortes 1989 a 2007.
> A la izquierda en crudo, a la derecha descontado el día de semana y el feriado, donde el
> calendario casi desaparece.

Más `aria-describedby` al `<figcaption>`, cuya bajada lleva el detalle: "En crudo, el 27 de
diciembre es la fecha más común, con 1 de cada 300,5 personas, y el 25 de diciembre la menos
común, con 1 de cada 543,8. Descontado el día de semana y el feriado, ninguna fecha se aleja más
de 11% del promedio. Las 187 fechas que reciben coeficiente de feriado en al menos un año están
marcadas con trama: sobre ellas el índice limpio no es interpretable."

**Tabla equivalente.** 366 filas: fecha, personas, uno de cada, índice crudo con IC95, índice
limpio con IC95, y "recibe coeficiente de feriado" sí o no. Dentro de `details` cerrado, con
contenedor de desplazamiento y encabezados fijos (`position: sticky` en `thead th`). 366 filas es
aceptable porque es la tabla que hace descargable el dato.

**Claves.** `cumpleanos.tabla.*` (366 cada columna), `cumpleanos.n_fechas_sin_coef_feriado`,
`cumpleanos.feb29`, `cumpleanos.septiembre_vs_bloque`.

---

### F4. El día de la semana y la programación del parto

**Papel.** Primer paso de la explicación del lado del parto. Dos paneles.

**Panel izquierdo: probabilidad por día de semana.**

- Marca: siete barras horizontales, una por día, con el IC95 como segmento fino superpuesto. El
  IC mide 0,04 puntos, o sea 0,4 px a esta escala: se dibuja igual y se declara en el epígrafe
  que es más angosto que el trazo. No se infla.
- Escala x: lineal, dominio **0,09 a 0,17**. Línea vertical sólida en 1/7 = 0,142857, rotulada
  "si todos los días fueran iguales". Esa línea es la única rejilla del panel.
- Orden: lunes a domingo, el orden del calendario, no por magnitud. La forma del calendario es el
  hallazgo.
- Color: los cinco días hábiles en `var(--parto)`, sábado y domingo en `var(--parto-crudo)`. El
  contraste hábil contra fin de semana es lo que se quiere ver.
- Valor al final de cada barra, en JetBrains Mono, a 1440 y 768. A 390 y 320 el valor va dentro
  de la barra si cabe, y si no, se omite y queda en la tabla.
- Anotación: "El martes es el máximo con 15,94%. El domingo tiene 0,65 veces los partos de un día
  hábil." Fuente: `dia_semana.p_dow` y la sección 2.1 de SINTESIS.

**Panel derecho: `f` por año, 1989 a 2007.**

- Marca: línea de `dia_semana.f_por_anio.v` en `var(--parto)` con banda `lo` y `hi` en
  `var(--parto-banda)`, más tres líneas de estrato por dependencia. Las tres de estrato son
  **escalones por quinquenio**, no líneas anuales: `dia_semana.estratos["depe2:*"].periodos` da
  cuatro períodos (1989-1993, 1994-1998, 1999-2003, 2004-2007) más el total. Dibujar un escalón
  por período es honesto; interpolar entre períodos sería inventar.
- Escala x: años 1989 a 2007, 19 posiciones.
- Escala y: lineal, dominio **0,18 a 0,62**, que cubre la serie nacional de 22,20% a 34,56% y los
  estratos, que llegan a 50,13% en particular pagado. Verificado: la serie por año de
  `depe2:part_pagado` va de 0,4088 a 0,5566.
- Marca de los cuatro retrocesos: 1999, 2000, 2001 y 2007. Círculo hueco de 4 px sobre el punto,
  con un solo rótulo: "cuatro años de retroceso; el mayor es de 1,4 errores estándar". No cuatro
  rótulos.
- Anotación de la pendiente: segmento de tendencia punteado, con "+0,62 puntos por año, IC95 0,58
  a 0,67". Fuente: sección 2.1 de SINTESIS.
- Etiquetas de las tres líneas de estrato al final del trazo, a la derecha, sin leyenda aparte, a
  1440 y 768. A 390 y menos se usa leyenda sobre el gráfico, en una línea.
- **Nada de regiones en este panel.** `f_prog_domingo` es `null` en las 13 entradas `region:*`,
  porque en regiones chicas el año a año es ruido. Si alguna vez se quiere lo regional, se usa
  `periodos` y se dibuja por quinquenio, nunca por año.

**Epígrafe.** "Cota inferior de partos con día elegido: `f = 1 - 7 p_domingo`. Supone que ningún
parto programado cae en domingo y que los espontáneos se reparten parejo. El orden por
dependencia del colegio calza con la cesárea de la literatura, pero la cesárea no se puede medir
con estos datos: DEIS no trae vía de parto."

**Interacción.** Panel izquierdo: `<title>` por barra. Panel derecho: cursor de año común, con
lectura:

> 1999. Nacional 44,3%, IC95 42,3 a 46,3. Retroceso respecto de 1998. Por dependencia, quinquenio
> 1999-2003: municipal 36,7%, subvencionado 45,2%, particular pagado 52,4%.

(Las cifras de la lectura se leen del JSON en tiempo de render; las de este ejemplo son
ilustrativas del formato.)

**`aria-label`.**

> Izquierda: probabilidad de nacer en cada día de la semana, en semana sin feriados, 1989 a 2007.
> El martes es el máximo con 15,94% y el domingo el mínimo con 10,15%. Si todos los días fueran
> iguales, cada uno tendría 14,29%. Derecha: cota inferior de partos con día elegido. Sube de
> 22,2% en 1989 a 34,6% en 2007, con cuatro años de retroceso. Por dependencia del colegio va de
> 23,1% en municipal a 50,1% en particular pagado.

**Tabla equivalente.** Dos tablas: una de 7 filas con día, probabilidad e IC95; otra de 19 filas
con año, `f` nacional con IC95, y tres columnas de dependencia con el valor del quinquenio que
corresponde a ese año, marcado como tal.

**Tamaños.** 1440: 534 por 300 cada panel. 768: apilados, 656 por 240 el izquierdo y 656 por 280
el derecho. 390: apilados, 326 por 230 y 326 por 250; el panel izquierdo pasa a rótulos de tres
letras. 320: 256, mismos altos, sin valores dentro de las barras.

**Claves.** `dia_semana.p_dow` (7), `dia_semana.anios` (19), `dia_semana.f_por_anio.{v, lo, hi}`
(19), `dia_semana.estratos["depe2:municipal"|"depe2:part_subvencionado"|"depe2:part_pagado"].periodos`
(5 períodos cada uno), `dia_semana.f_por_quinquenio` (4).

---

### F5. La matriz del feriado, y Semana Santa

**Papel.** Mostrar de un vistazo que el déficit del feriado depende casi por completo del día de
semana en que cae, y que hay anticipación en la víspera. Ocho pequeños múltiplos en una sola
rejilla (fusión de F5 y F7, ver sección 8).

**Forma.** Rejilla de 4 por 2 a 1440, 2 por 4 a 768, 1 por 8 bajo 560. Los siete primeros paneles
son los días de la semana en que cae el feriado; el octavo es Semana Santa.

- Paneles 1 a 7: `feriados.matriz_B.{lun, mar, mie, jue, vie, sab, dom}`, 15 puntos cada uno,
  `k` de -7 a +7.
  - Marca: línea con banda de IC (`lo`, `hi`) en `var(--parto)` y `var(--parto-banda)`. Punto
    lleno de 3,5 px en `k = 0`, el resto sin punto.
  - Escala x: -7 a +7, con marcas en -7, 0 y +7 y el 0 rotulado "feriado".
  - Escala y: **compartida por los ocho paneles**, lineal, dominio **-38% a +11%**. Verificado
    sobre los 7 por 15 puntos de `matriz_B` incluidas las bandas: `pct` va de -34,37 a +7,85,
    `lo` baja hasta -36,43 (lunes en `k` 0) y `hi` sube hasta +10,29 (jueves). Compartir el eje
    es lo que convierte ocho gráficos en un pequeño múltiplo; si cada panel tuviera su escala, la
    figura mentiría. Línea de referencia en 0%, sólida.
  - Rótulo del panel: el día en mayúscula corta y el valor del día 0, en dos líneas, dentro del
    panel arriba a la izquierda. Lunes -34,4%, martes -32,0%, miércoles -27,0%, jueves -27,7%,
    viernes -27,9%, sábado -6,6%, domingo -0,8%.
  - Sombra de continuidad: los siete paneles llevan al fondo, en `var(--line)` al 30%, la curva
    del panel de lunes, para que el ojo compare contra la más profunda sin mover la vista. Es el
    recurso clásico de pequeños múltiplos y no agrega tinta apreciable.
- Panel 8: `feriados.semana_santa_perfil`, 21 puntos, `dia_rel` de -10 a +10.
  - Marca: la misma línea, con la razón observados sobre esperados convertida a porcentaje
    (`(razon - 1) * 100`), para que comparta el eje con los otros siete. Verificado: `razon` va
    de 0,7263 a 1,0605, o sea de -27,37% a +6,05%, dentro del dominio compartido. El recorte a
    -7..+7 no cambia esos extremos: los dos caen dentro de la ventana que se conserva.
  - Se recorta a -7 a +7 para igualar el eje x de los otros siete. Los cuatro puntos perdidos
    (-10 a -8 y +8 a +10) están en la tabla. El recorte se declara en el epígrafe.
  - Rótulo: "Viernes Santo, -27,4%" y, con una segunda marca sobre `dia_rel` +1 y +2, "Sábado
    -12,2%, Domingo -3,2%".
  - Anotación del adelanto: barra corta bajo los días -4 a -1, con "+6,1%, +5,0%, +4,2%, +2,2%
    entre lunes y jueves santo".

**Anotación transversal, una sola, bajo la rejilla.** "La víspera hábil de un feriado que cae
miércoles, jueves o viernes tiene +6,6% de partos, IC95 +5,2 a +8,1. El día hábil posterior no
rebota: +0,8%, p 0,25. Promedio de los siete feriados menores en el día 0: -22,0%, IC95 -24,1 a
-19,8, sobre 121 ocurrencias." Fuentes: sección 2.2 de SINTESIS,
`feriados.dia0_menores_promedio.entre_ocurrencias` y
`feriados.dia0_por_dow.menores_habil_promedio`.

**Nota de fuente obligatoria.** Las cifras de día 0 por fecha que la página publique salen de
`feriados.dia0.<fecha>.entre_ocurrencias.pct`, con IC de Student entre ocurrencias, no del `pct`
de primer nivel. El epígrafe lo dice en una línea: "los intervalos son entre ocurrencias; el
intervalo de Wald condiciona en la mezcla de días de semana y subestima la incertidumbre unas
2,5 veces".

**Interacción.** Un cursor de `k` común a los ocho paneles, movido por puntero sobre cualquiera
de ellos y por flechas. Lectura:

> Día -1, la víspera. Feriado en lunes: +2,1%, IC95 -0,4 a +4,7, 18 ocurrencias. Feriado en
> miércoles: +6,8%. Feriado en domingo: +0,3%.

(Cifras ilustrativas del formato; se leen del JSON.)

**`aria-label`.**

> Ocho perfiles de nacimientos alrededor del feriado, de siete días antes a siete días después,
> en la misma escala. El déficit del día del feriado depende casi por completo del día de semana
> en que cae: 34,4% menos si es lunes, 27% si es miércoles, 6,6% si es sábado y 0,8% si es
> domingo. La víspera hábil sube 6,6%. El octavo panel es Semana Santa, con el Viernes Santo 27,4%
> abajo y el adelanto de lunes a jueves santo.

**Tabla equivalente.** Una tabla de 15 filas por 8 columnas, con el día relativo en la primera
columna y el porcentaje con IC95 en cada una de las ocho. Más una fila de `n_dias` al pie.

**Tamaños.** 1440: rejilla 4 por 2, cada panel 262 por 175, total 1112 por 400. 768: 2 por 4,
cada panel 316 por 165, total 656 por 720. 390: 1 por 8 daría 326 por 1120, que es demasiado. A
este ancho **los siete paneles de día de semana se reducen a tres**: lunes, miércoles y domingo,
o sea los extremos y el centro del gradiente, más Semana Santa. Los cuatro restantes quedan tras
un enlace al `details` y la anotación transversal pasa a ser el texto principal. Cada panel mide
326 por 130. 320: igual que 390 con cada panel en 256 por 120.

**Claves.** `feriados.matriz_B.*` (15 objetos por día), `feriados.dia0_menores_promedio`,
`feriados.dia0_por_dow.menores_habil_promedio`, `feriados.dia0.<fecha>.entre_ocurrencias`,
`feriados.semana_santa_perfil` (21), `feriados.semana_santa_partos` (17 claves `ss_*` de las 32
del objeto; ojo con `ss_viernes`, `ss_sabado` y `ss_domingo`, que ocupan el lugar de `ss_0`,
`ss_+1` y `ss_+2`), `feriados.semana_santa_balance`.

---

### F6. Fiestas Patrias y el largo del descanso

**Papel.** El único feriado chileno con una dosis medible, y el que mejor muestra cuánto se mueve
un parto cuando hay varios días libres seguidos. Dos paneles apilados.

**Panel superior: perfil por día relativo al 18 de septiembre.**

- Marca: cuatro líneas, una por grupo de largo del descanso, desde
  `fiestas_patrias.perfil_medio_por_largo.{2,3,4,5}`, 22 puntos cada una (`perfil_rel_dias` de -7
  a +14). Grosor creciente con el largo (1,2 / 1,6 / 2,0 / 2,4) y opacidad constante: la
  codificación por grosor ordena sin gastar un segundo canal de color. Todas en `var(--parto)`.
- Encima, el perfil medio `fiestas_patrias.perfil_medio` en `var(--ink)`, trazo 2,5, con banda de
  error estándar `perfil_ee` en `var(--parto-banda)`. Verificado: `perfil_medio` va de -0,2910 a
  +0,0613 y `perfil_ee` llega a 0,0302.
- Escala y: lineal, dominio **-0,40 a +0,10** en días equivalentes de nacimiento. Cubre el mínimo
  del grupo de largo 4 (-0,375). Referencia en 0.
- Escala x: -7 a +14. Banda vertical en `var(--bloque)` sobre el descanso. El descanso empieza en
  distinta fecha según el año, así que se sombrea solo el tramo del 18 al 19, común a los cuatro
  grupos, rotulado "18 y 19 de septiembre".
- Etiqueta al final de cada línea: "2 días", "3", "4", "5", con el número de años entre
  paréntesis: 2, 5, 6 y 6. Fuente: `fiestas_patrias.por_largo`.
- Anotación: "El 18 y el 19 quedan en -28,0% y -29,1%."

**Panel inferior: déficit del descanso contra el largo.**

- Marca: 19 puntos, uno por año, desde `fiestas_patrias.por_anio`, con `largo` en el eje x
  (valores 2, 3, 4 y 5, con dispersión horizontal de más o menos 0,12 para que no se tapen) y
  `deficit_descanso` en el eje y. Color `var(--parto)`.
- Recta de la regresión controlada por tendencia, desde
  `fiestas_patrias.reg_deficit_descanso.vs_largo.largo`: pendiente -0,1753, IC95 -0,2545 a
  -0,0960. Banda de IC alrededor de la recta en `var(--parto-banda)`.
- Escala y: lineal, dominio **-1,35 a 0,00** en días equivalentes. Verificado sobre los 19 años
  de `por_anio`: `deficit_descanso` va de -1,2746 a -0,0807, o sea los 19 valores son negativos.
  Un dominio que empiece en -1,0 recorta el año más extremo, así que no sirve.
- Anotación: "-0,175 días equivalentes de nacimiento por cada día adicional de descanso, IC95
  -0,255 a -0,096, p de permutación 0,00015. Se satura entre 4 y 5 días: el día sándwich se
  trabaja en parte." Cifras de `reg_deficit_descanso` y de la sección 2.4 de SINTESIS.
- Los años se rotulan solo en los puntos extremos de cada grupo, no en los 19.

**Lo que este panel no puede decir.** El lector va a extrapolar al lado de la concepción. Por eso
el epígrafe cierra con esta frase: "Del lado de las concepciones hay un bulto alrededor del 18 de
septiembre. Vale 1,17 días equivalentes, IC95 0,72 a 1,62, medido por datación directa en
microdatos DEIS 1998 a 2002. No escala de forma detectable con el largo del descanso: la
pendiente es -3,1% por día con IC95 de -25,0 a +18,9. Y la semana 38 del índice de concepción
está en +0,01%, o sea en el promedio anual: es un levantamiento local desde el fondo del valle de
invierno, no un segundo máximo del año."

**Advertencia de datos.** `fiestas_patrias.concepcion_deis_perfil_7d` son 99 `null`, así que **no
hay panel de concepciones**. Las cifras del párrafo anterior salen de
`fiestas_patrias.concepcion_deis_integral` (`b` 1,168662, `ee` 0,162245, `ic95_t4`) y de
`fiestas_patrias.concepcion_semanal_33_43`, que sí tiene 11 semanas con `indice`, `lo` y `hi`. Si
se quiere una tercera marca visual, es una franja pequeña con esas 11 semanas junto al epígrafe,
no un panel: 11 semanas alrededor del promedio no sostienen un panel propio.

**Interacción.** Panel superior: cursor de día relativo, lectura con los cuatro grupos y el
promedio. Panel inferior: `<title>` por año, con año, largo, día de semana del 18 (`dow18`),
días hábiles liberados (`habiles`) y déficit.

> 1989. El 18 cayó lunes, descanso de 4 días, 2 hábiles liberados. Déficit del descanso: -0,469
> días equivalentes.

**`aria-label`.**

> Arriba: perfil de nacimientos alrededor del 18 de septiembre, de siete días antes a catorce
> después, separado por el largo del descanso. El 18 y el 19 caen 28,0% y 29,1%. Abajo: el
> déficit crece con el largo del descanso, 0,175 días equivalentes menos por cada día adicional,
> intervalo de 0,255 a 0,096, y se satura entre cuatro y cinco días.

**Tabla equivalente.** Dos tablas: 22 filas de día relativo por cuatro grupos más el promedio con
su error estándar; y 19 filas de año, día de semana del 18, largo, hábiles liberados y déficit.

**Tamaños.** 1440: 1112 por 520, paneles 300 y 180. 768: 656 por 480, paneles 280 y 160. 390: 326
por 440, paneles 260 y 150; las cuatro etiquetas de grupo pasan a leyenda en una línea sobre el
panel. 320: 256 por 420, con la dispersión horizontal del panel inferior reducida a 0,08.

**Claves.** `fiestas_patrias.{perfil_rel_dias, perfil_medio, perfil_ee}` (22),
`fiestas_patrias.perfil_medio_por_largo.{2,3,4,5}` (22 cada una), `fiestas_patrias.por_anio` (19),
`fiestas_patrias.por_largo` (4), `fiestas_patrias.reg_deficit_descanso`,
`fiestas_patrias.concepcion_deis_integral`, `fiestas_patrias.concepcion_semanal_33_43` (11).

---

### F7. Semana Santa

**Fusionada en F5** como octavo pequeño múltiplo. Ver la sección 8 para el fundamento y la
sección 5 (F5, panel 8) para la especificación.

---

### F8. Quién tiene más estacionalidad

**Papel.** Mostrar que el pico es universal y que lo que varía es la amplitud. Dos bloques.

**Bloque A: pequeños múltiplos por estrato.**

Nueve paneles en 3 por 3 a 1440, 2 por 5 a 768 (con una celda vacía), 1 por 9 bajo 560. Orden
fijo, que es el de SINTESIS:

1. `depe:pagado` 2. `depe:subvencionado` 3. `depe:municipal`
4. `rural:rural` 5. `rural:urbano`
6. `zona:norte` 7. `zona:centro` 8. `zona:sur`
9. `nacional`, siempre en la última celda, rotulada "referencia"

`zona:austral` queda fuera mientras no se resuelva la sección 0.

- Marca por panel: curva `semanal` en `var(--conc)` con banda `lo` y `hi` en `var(--conc-banda)`,
  más la curva nacional al fondo en `var(--conc-suave)`, trazo 1, discontinua. Comparar contra la
  nacional dentro del panel es lo que hace legible la diferencia de amplitud.
- Escala y: **compartida por los nueve**, lineal, dominio **0,88 a 1,14**. Verificado sobre los
  nueve estratos que se dibujan, no sobre los 19: el mínimo de `lo` es 0,8937 y el máximo de `hi`
  es 1,1316, ambos en `rural:rural`. El piso de 0,8662 y el techo de 1,1753 del conjunto completo
  vienen de `cruce:sur_rural`, que no está en la rejilla, así que usar el dominio de los 19
  desperdiciaría un tercio del alto. Referencia en 1,000.
- Escala x: semana 1 a 52, sin rótulos por panel; una sola fila de rótulos trimestrales bajo la
  rejilla.
- Rótulo por panel: nombre del estrato y amplitud con IC95, en dos líneas. Pagado 0,178 [0,1488;
  0,2058]; subvencionado 0,139; municipal 0,114 [0,1039; 0,1400]; rural 0,182; urbano 0,122;
  norte 0,102; centro 0,114; sur 0,190; nacional 0,128.
- Anotación única, en el panel de `depe:pagado`: marca vertical en la semana 22 (28 de mayo) con
  "el valle de fines de mayo, propio del particular pagado: -0,063 contra municipal, y aparece
  igual en el índice mensual crudo, sin modelo". Fuente: `estratos.comparaciones["depe:pagado -
  depe:municipal"].max_dif`, que da semana 22, fecha 28-may, diferencia -0,0627, IC [-0,08;
  -0,0477]. Verificado.
- Nota obligatoria en el epígrafe, por la sección 2.2 de este documento: "Estas curvas salen del
  pipeline por estrato, que no es el mismo de la figura 1. La curva nacional de aquí sirve de
  referencia interna del panel y no se debe leer junto a las cifras de la figura 1."

**Bloque B: dot plot regional contra latitud.**

- Marca: 13 puntos, `escala_vs_nacional` contra `lat`, con el IC95 (`escala_ic`) como segmento
  horizontal. Eje x = escala, eje y = latitud, con el sur abajo. Latitud **continua**, no
  categórica: el punto de la sección 4.3 de SINTESIS es que una recta ajustada a una joroba
  miente, y eso solo se ve si la latitud está a escala. La Metropolitana (-33,5) queda entre
  Valparaíso (-33,0) y O'Higgins (-34,2), que es donde corresponde.
- Escala x: lineal, dominio **0,00 a 2,00**. Cubre Tarapacá y Arica con IC hasta 0,0313 y
  Araucanía con IC hasta 1,900. Referencia vertical en 1,000, rotulada "igual que la curva
  nacional".
- Escala y: latitud de -19 a -55, lineal. Rótulos de nombre de región a la izquierda de cada
  punto, del mapa de la sección 2.1.
- **Aysén se dibuja hueco**, en `var(--nulo)`, sin IC y con la etiqueta "no interpretable". Al pie,
  la llamada: "el código de región 11 del archivo de estratos está contaminado con alumnos de
  otra región: 5.575 nacimientos por año contra unos 1.800 reales". Ver la sección 0.
- Anotación: "Entre las 11 regiones continentales la escala sube de forma monótona con la latitud
  (Spearman 0,927, p 4,0e-5). No se publica una pendiente lineal sobre las 13: no es robusta al
  esquema de ponderación y ajusta una recta a una joroba." Fuente: `estratos.latitud` y la
  sección 4.3.
- **No se dibuja ninguna recta ajustada.** Dibujarla y después decir que no vale sería regalarle
  al ojo la conclusión equivocada.

**Interacción.** Bloque A: cursor de semana común a los nueve paneles, con lectura que da el valor
de los nueve en esa semana, ordenados de mayor a menor. Bloque B: `<title>` por región y flechas
que recorren de norte a sur.

> Araucanía. Latitud 38,7 sur. Escala contra la curva nacional 1,759, IC95 1,579 a 1,900.
> Amplitud 0,222. 286.443 nacimientos.

**`aria-label`.**

> Arriba: nueve curvas semanales de concepción por estrato, en la misma escala, con la curva
> nacional de fondo en cada panel. El pico de fin de año aparece en todos. Lo que cambia es la
> amplitud: 0,178 en particular pagado contra 0,114 en municipal, 0,182 en rural contra 0,122 en
> urbano, 0,190 en la zona sur contra 0,102 en la norte. Abajo: la escala de cada región contra
> la curva nacional, ordenada por latitud. Sube de forma monótona desde Tarapacá y Arica hasta la
> Araucanía. Aysén se muestra sin valor porque su dato de origen está contaminado.

**Tabla equivalente.** Dos tablas: 19 estratos con amplitud, IC95, semana pico, semana valle y
escala contra la nacional; y 13 regiones con latitud, nacimientos, amplitud, escala e IC95, con
Aysén marcada.

**Tamaños.** 1440: bloque A 3 por 3 de 356 por 175, total 1112 por 560; bloque B 1112 por 420.
768: bloque A 2 por 5 de 316 por 160, total 656 por 840; bloque B 656 por 380. 390: bloque A
reducido a **cuatro paneles** (pagado, municipal, rural, sur) de 326 por 140 más un enlace al
`details` con los cinco restantes, y bloque B 326 por 400 con los nombres de región en dos
letras. 320: igual con 256 de ancho.

**Claves.** `estratos.curvas.<estrato>.{semanal, lo, hi, amplitud, amplitud_ic, semana_pico,
semana_valle, escala_vs_nacional, escala_ic}` (19 estratos, 52 puntos por serie),
`estratos.regiones` (dict de 13), `estratos.comparaciones` (dict de 17), `estratos.latitud`,
`dia_semana.estratos["region:Aysén"].advertencia`.

---

### F9. Noventa años de fondo

**Papel.** Cierre de la página. Dice dos cosas: la estacionalidad se apagó a lo largo del siglo, y
el Chile de 2020 ya no es el de estas cohortes.

**Panel superior: semi-amplitud por tramo, 1930 a 2023.**

- Marca: 16 puntos con barra de IC95 vertical, desde `serie_larga.empalme`, usando
  `amp1_nac_pct` y `amp1_nac_ic95_boot_anios`. Eje x = centro del tramo, continuo, de 1930 a
  2023. Eje y = semi-amplitud en porcentaje.
- Escala y: lineal, dominio **0 a 15**. Verificado: el máximo con IC es 14,22 (tramo 1930s) y el
  mínimo 0,49 (DEIS 2020-2023). Aquí el cero **sí** va, porque la cantidad es una amplitud y el
  cero significa "sin estacionalidad", que es un valor con sentido físico.
- Color por fuente, cuatro grupos: `docentes+asistentes` (6 tramos), `adultos nac_diario` (2),
  `nac_diario cohortes casi completas` (1), `MINEDUC cohortes completas` (3), `DEIS` (4). Eso es
  cinco, no cuatro: la fuente `nac_diario cohortes casi completas 1985-1988` es propia. Cinco
  colores es demasiado, así que se codifican en tres: fuentes escolares antiguas
  (`var(--conc-suave)`), MINEDUC (`var(--conc)`) y DEIS (`var(--verdad)`), con la distinción
  interna en el `<title>` y en la tabla.
- **Banda de error sistemático entre fuentes.** Rectángulo de fondo en `var(--bloque)` sobre el
  tramo anterior a 1980, con altura de más o menos 6 puntos alrededor de los valores de las
  fuentes escolares. Rótulo: "antes de 1980 el nivel queda acotado, no fijado: docentes y
  asistentes son la cota baja y educación de adultos la cota alta, 5,1% contra 11,4% en los
  sesenta". Y una banda más angosta, de más o menos 1 punto, sobre los noventa, rotulada "rampa
  de cobertura de MINEDUC sobre DEIS". Fuentes: sección 4.5 de SINTESIS y
  `serie_larga.rampa_mineduc_deis`.
- Los tramos `MINEDUC 2000-2008` (2,85) y `MINEDUC 2000-2007` (3,05) se solapan. Se dibuja solo
  el de 2000-2007, que es la ventana del estudio, y el otro queda en la tabla. Dibujar los dos
  sugiere dos mediciones independientes donde hay una con dos cortes.
- Anotación: "La estacionalidad era 1,68 veces mayor en 1930 a 1959 que en 1960 a 1989, IC95 1,40
  a 2,04. La caída ocurre entre los nacidos en los cincuenta y los de los sesenta."
- **Sin eje derecho.** Una versión anterior de esta especificación ponía `fase1_conc`, la fecha
  del máximo de concepción por tramo, en un segundo eje de enero a diciembre. Se descarta por dos
  razones. Primera, la escala: 14 de los 16 valores caen entre el 13 de enero y el 25 de febrero,
  y solo `17-jun` y `02-jul` se salen, de modo que 14 puntos se apilarían en la sexta parte
  inferior del eje. Segunda, la redundancia: que la fase se corra a junio en DEIS 2010-2019 es
  exactamente el hecho que anota el panel inferior. `fase1_conc` va en la tabla de la figura y no
  en el dibujo.

**Panel inferior: índice mensual DEIS de concepciones por período.**

- Marca: cinco líneas de 12 puntos, una por período, desde `serie_larga.deis_indice_concepciones`,
  con la banda `lo` y `hi` solo en el período más reciente y en el más antiguo, para no empastar.
- Escala x: los doce meses.
- Escala y: lineal, dominio **95 a 108**, en base 100. Referencia en 100.
- Color: degradado de un solo tono, de `var(--conc-suave)` a `var(--conc)`, del período más
  antiguo al más reciente. Es un orden, no categorías.
- Anotación: "El máximo de enero se mantuvo setenta años. En 2010 a 2019 la probabilidad de que
  septiembre sea el mes máximo de nacimientos cae de 1,00 a 0,08. El máximo de diciembre y enero
  baja de 104,97 a 100,44 y el máximo anual se corre a mayo o junio. El orden entre esos dos
  meses no es robusto." Fuente: sección 4.5 de SINTESIS y `prob_mes_max` de cada período.
- Cierre, en el epígrafe y en negrita: **"La respuesta de esta página vale para las cohortes 1989
  a 2007 y no describe al Chile de 2020."**

**Interacción.** Panel superior: `<title>` por tramo. Panel inferior: cursor de mes con los cinco
períodos.

> Septiembre. 1992-1999: 98,56. 2000-2009: 98,66. 2010-2019: valor del JSON.

**`aria-label`.**

> Arriba: la semi-amplitud estacional de los nacimientos cae de 10,8% en los nacidos en los años
> treinta a 1,7% en los nacidos entre 2010 y 2019, medida en cinco fuentes distintas cuyo error
> sistemático está marcado. Abajo: el índice mensual de concepciones según registros vitales, por
> período. El máximo se mantuvo en enero durante setenta años y después de 2008 se corre a mayo o
> junio.

**Tabla equivalente.** 16 filas de tramo, fuente, semi-amplitud, IC95 y fecha del máximo de
concepción; más 5 por 12 filas del índice mensual por período.

**Tamaños.** 1440: 1112 por 560, paneles 320 y 200. 768: 656 por 520, paneles 300 y 180. 390: 326
por 480, paneles 280 y 170. A 390 las dos bandas de error sistemático se reducen a una, la de
antes de 1980, y los rótulos de tramo pasan a leyenda. 320: 256 por 460, con las cinco líneas del
panel inferior reducidas a tres: el primer período, el último y el de 2000 a 2009.

**Claves.** `serie_larga.empalme` (16), `serie_larga.deis_indice_concepciones` (5 períodos por 12
meses), `serie_larga.deis_indice_nacimientos` (5), `serie_larga.rampa_mineduc_deis` (17).

---

### Figura de método

**Fusionada en F2** como panel derecho. Ver la sección 8.

---

## 8. Fusiones y figuras que no aportan

**Fusión 1: la figura de método entra en F2.** Las dos responden la misma pregunta, "¿le puedo
creer a esta curva?", comparten el eje de 52 semanas y comparten la escala de índice. Puestas
lado a lado, el lector ve en un solo movimiento que las 22 variantes coinciden en el pico y que
contra la verdad conocida el método acierta la semana y atenúa la altura. Separadas, la de método
queda de nota al pie y nadie la mira. La fusión ahorra un contenedor, una leyenda y un epígrafe,
y no pierde nada: la única información que se sacrifica es el título propio, que pasa a ser el
rótulo del panel.

**Fusión 2: F7 entra en F5 como octavo pequeño múltiplo.** F7 pedía un panel propio para 21
puntos alrededor del Viernes Santo. Pero es exactamente la misma marca que los siete paneles de
F5, con el mismo eje x de días relativos. Y su escala de porcentaje cabe en el dominio compartido
de F5, comprobado: la razón de Semana Santa va de 0,7263 a 1,0605, o sea -27,4% a +6,0%, dentro
del dominio -40% a +12%. El costo de la fusión es recortar el eje de -10..+10 a -7..+7. Se
pierden cuatro puntos por panel, todos fuera de la ventana donde pasa algo: la razón en `dia_rel`
-10 es 0,9803 y en +10 es cercana a 1. La ganancia es que Semana Santa queda comparable de un
vistazo con el feriado en viernes, que es la comparación que el lector quiere hacer y que hoy
exige recordar dos figuras. Los cuatro puntos recortados quedan en la tabla.

**Nada que fundir en F3, F6 y F9.** Las tres tienen una marca propia que no comparte eje con
ninguna otra.

**Panel eliminado: el panel inferior de F1 que pedía SINTESIS.** "Panel inferior con el mismo eje
en desviación porcentual sobre la uniforme" es la misma cifra que el panel superior reescalada:
`desv_pct` es `(indice - 1) * 100`, punto por punto. Dibujarla dos veces es el eje redundante que
la regla de Tufte prohíbe y duplica la altura de la figura de portada. Se sustituye por el
rotulado del eje derecho. El espacio liberado se usa para el panel de `concepcion.doy`, la única
figura de la página donde se ve, en vez de leerse, que un rasgo de un día vive del lado del parto
y no llega nunca a la concepción.

**Candidato a promoción, decisión abierta.** El panel inferior de F9 carga el hecho más citable de
la página para un lector de 2026: el máximo anual de concepciones se corrió de enero a mayo o
junio después de 2008. Hoy está sepultado en el último panel de la última figura. Si el texto de
la página quiere cerrar con eso, conviene sacarlo de F9 y ponerlo como figura propia de cierre.
No lo decido acá porque depende de cómo quede escrito el último capítulo.

---

## 9. Lo que ninguna figura puede hacer

Recogido de las secciones 5.3 y 7 de SINTESIS. Es la lista de errores que un gráfico bonito puede
introducir sin que nadie lo note.

1. **Ningún rasgo de concepción de un solo día.** El método devuelve un impulso de un día como una
   campana de 25 a 26 días de ancho a media altura. Dos picos de una semana se separan solo si
   distan 35 días o más. Si una figura marca un día en la curva de concepción, está mintiendo.
2. **Ningún ranking de fechas de cumpleaños con número de posición.** El conjunto de los diez
   extremos es estable; el orden interno no, con IC de más o menos 0,09 en índice.
3. **Ninguna semana única como mínimo del año.** El mínimo es un bloque. F1 lo dibuja como bloque
   y ninguna otra figura lo contradice.
4. **Ninguna recta de gradiente latitudinal.** F8 la omite a propósito.
5. **Ninguna atribución a la cesárea presentada como medición.** DEIS no trae vía de parto en los
   agregados disponibles. La palabra "cesárea" solo aparece precedida de "plausible" o
   "atribución".
6. **Ningún rebote de Fiestas Patrias.** Depende de la especificación y no se publica. El rebote
   de Navidad, +13% y +18% el 26 y 27 de diciembre, sí es real y está en F1 y en F3.
7. **Ninguna cifra del pulso estrecho de fin de año.** El tamaño va de 2,39 a 0,39 días
   equivalentes según cuántos armónicos tenga el fondo. El signo es robusto, el tamaño no. La
   página publica la quincena y no publica el pulso.
8. **Ningún "el martes 13" ni "el viernes 13" chileno.** El déficit genérico del 13 existe
   (-1,8%) pero no es chileno: aparece idéntico en Estados Unidos. Si F3 lo anota, lo anota así.
9. **Ninguna barra de IC95 presentada como cobertura nominal.** El IC95 bootstrap por año cubre la
   verdad en 61,5% de las semanas, no en 95%. La leyenda de banda de cada figura de concepción
   dice "IC95 bootstrap entre años; no incluye el sesgo de regularización ni el del núcleo fijo".
   Es la advertencia número 2 de `meta.advertencias` y no es opcional.
10. **La sigla de la sociedad tecnológica no aparece suelta en ninguna parte**, según la regla del
    canon. Ni en epígrafes, ni en pies de figura, ni en `aria-label`. La atribución de la página
    es COCHID.

---

## 10. Verificaciones antes de declarar la página lista

Del `docs/DEPLOY.md` de este árbol, adaptado:

```sh
python3 -m unittest discover -s tests -p 'test_*.py' -v
node --check concepciones/story.mjs
node --test tests/concepciones.test.mjs
prosa-lint concepciones/index.html
prosa-lint docs/concepciones-figuras.md
cis-build node scripts/build.mjs
```

Más, en navegador real, a 1440, 768, 390 y 320 px, en tema claro y oscuro:

- Las diez figuras dibujan y se vuelven a dibujar al cambiar el ancho.
- El cambio de tema no exige recargar: ninguna marca queda con color del tema anterior. Es la
  prueba de que no quedó ningún hexadecimal inline.
- Foco visible recorriendo con `Tab` las diez figuras y sus `details`.
- Las diez tablas equivalentes están presentes con JavaScript desactivado.
- Axe sin violaciones de contraste en los dos temas, incluidos los nueve tramos de la escala
  divergente de F3.
- Sin barra de desplazamiento horizontal del documento a 320 px.

Y una prueba propia que conviene escribir como `tests/concepciones.test.mjs`: cargar
`pagina.json`, y para cada clave citada en la sección 2 de este documento, comprobar tipo y
largo. Es barata y es la que impide que un recálculo aguas arriba rompa la página en silencio.
