# Datos de la página "Cuándo se concibe en Chile"

Once archivos JSON, uno por figura, recortados de `data/out/pagina.json` del repositorio
`cochid-concepciones`. Pesan 177 KB en total. Los genera
`scripts/gen_datos_pagina.py` de ese repositorio, que no calcula nada: recorta, redondea y
renombra. Ninguna cifra de la página puede salir de otro lado.

Regenerar:

```sh
cd /srv/projects/cochid/cochid-concepciones
.venv/bin/python scripts/gen_datos_pagina.py /srv/projects/worktrees/cochid-concepciones-20260919/concepciones
```

## Qué mide cada número

**Índice.** 1 es el día promedio del año, una vez descontadas la tendencia larga y, en las
series limpias, el día de semana y los feriados. Un índice de 1,0871 significa 8,71% sobre el
día promedio. Los índices vienen con 4 decimales y los porcentajes con 2.

**Concepción y parto.** Las series de concepción salen de deconvolucionar los nacimientos
limpios con la distribución de edad gestacional del DEIS, de media 260,3 días y desvío 12,5
días. Ese desvío borra todo rasgo más fino que dos semanas, así que la unidad publicable de
concepción es la semana. Todo rasgo de 1 a 3 días que aparezca en los nacimientos es del lado
del parto, no de la concepción.

**Intervalos.** `_lo` y `_hi` son los percentiles 2,5 y 97,5 de un bootstrap de 400 remuestreos
de los 19 años de nacimiento. Cubren la variación entre años, no el sesgo de regularización ni
el del núcleo gestacional fijo: en la validación contra el DEIS cubren la verdad en 61,5% de
las semanas. `meta.json` lo repite en `advertencias`.

**Semanas.** Son 52 semanas fijas desde el 1 de enero; la 52 tiene ocho días y el 29 de febrero
queda fuera de la grilla de 365.

## Archivos

### `semanal.json` (14,4 KB) · figura principal

Curva semanal de concepción, 52 puntos, más la curva diaria que hace visible la regla de la
semana.

| clave | largo | qué es |
|---|---|---|
| `semana` | 52 | número de semana, 1 a 52 |
| `etiqueta` | 52 | rango de fechas, por ejemplo `01-ene a 07-ene` |
| `indice`, `indice_lo`, `indice_hi` | 52 | índice de concepción con IC95 |
| `desv_pct`, `desv_lo`, `desv_hi` | 52 | desviación sobre la uniforme, en puntos porcentuales |
| `significativo` | 52 | `true` si el IC95 de la desviación excluye cero (47 de 52). No corrige multiplicidad: son 52 pruebas a la vez y con 400 remuestreos no hay resolución para un conteo corregido |
| `amplitud_pp` | 1 | 13,32: máximo menos mínimo semanal. IC95 bootstrap de 11,81 a 15,12; entre lambda 300 y 10.000 recorre de 14,8 a 11,3 |
| `n_semanas_significativas` | 1 | 47 |
| `quincena_pico` | dict | `semanas` [52, 1], `etiqueta`, `p_argmax` (probabilidad bootstrap de que cada semana sea el máximo) y `duelo` (52 contra 1: `dif_pp`, `ic95`, `p_a_mayor_b`) |
| `valle_meseta` | dict | igual para el valle ancho de las semanas 28 a 35 |
| `doy_fecha` | 365 | fecha `dd-mmm` de la grilla diaria |
| `doy_concepcion`, `doy_lo`, `doy_hi` | 365 | índice diario de concepción con IC95 |

La quincena y la meseta se dibujan como bloques, nunca como un punto máximo o mínimo: las
semanas 52 y 1 están empatadas y el mínimo se reparte entre la 34, la 29 y la 30.

`doy_concepcion` está para la figura pedagógica de día contra semana. No sirve para leer un día
concreto: el método devuelve un impulso de un día como una campana de 25 a 26 días de ancho. Ese
ancho es del método y no del embarazo: la distribución de la gestación mide 21,2 días a media
altura, y con una penalización diez veces menor la campana baja a 19 o 20 días.

### `mensual.json` (2,0 KB)

`meses`, 12 entradas con `id` (1 a 12), `etiqueta` (`ene` a `dic`), `p`, `p_lo`, `p_hi`
(probabilidad de concebir en ese mes), `p_uniforme` (la proporción de días del mes),
`desv_pct`, `desv_lo`, `desv_hi` (desviación sobre la uniforme, ya ajustada por días del mes),
`ee_desv_pct` y `significativo`.

### `metodo.json` (13,2 KB) · abanico de variantes y validación

| clave | largo | qué es |
|---|---|---|
| `fechas_semana` | 52 | fecha de inicio de cada semana |
| `variantes` | 22 | una por especificación alternativa. Cada una trae `semanal` (52), `r_vs_base`, `sem_pico`, `sem_valle`, `valor_pico`, `valor_valle` |
| `boot_sem_pico` | 2 | conteo de remuestreos en que cada semana fue el máximo, sobre 400 |
| `boot_sem_valle` | 6 | lo mismo para el mínimo |
| `validacion_deis` | 4 | `verdad_semanal`, `estimado_semanal`, `estimado_lo`, `estimado_hi`, 52 cada una, sobre el DEIS 1999 a 2003. El máximo de `verdad_semanal` cae en la semana 1 y el de `estimado_semanal` en la 52: el método acierta la quincena, no la semana exacta |
| `cobertura_ic95` | dict | `media` 0,608, `por_sim` (5 simulaciones) y `n_sims`. Son 5 corridas con rango 0,481 a 0,750: leer "cerca de 60%", no tres cifras |
| `se_boot_semanal_medio` | 1 | error estándar bootstrap medio de la curva semanal. Cubre la verdad en 61,5% de las semanas y no en 95%, así que todo umbral de detección calculado con él es optimista |
| `robustez_lam` | 3 | curva con penalización 300, 1000 y 3000. La amplitud del pico va de +9,71% a +7,63% entre los extremos: un recorrido tan ancho como el IC95 de la semana 52 y no contenido en él |

El nombre de la variante es la clave del diccionario. El abanico sostiene que el pico es robusto
y el valle no: en las 22 variantes el pico cae dentro de la quincena y el valle salta entre las
semanas 28 y 36.

### `cumpleanos.json` (39,6 KB) · calendario de 366 casillas

Columnas paralelas de 366 valores, en orden del 1 de enero al 31 de diciembre con el 29 de
febrero incluido: `fecha`, `mes`, `dia`, `n` (nacimientos en 19 años), `uno_en` (1 de cada
cuántas personas), `indice_crudo` con `_lo` y `_hi`, `indice_limpio` con `_lo` y `_hi`,
`ventana_feriado` y `frac_anios_con_coef_feriado`.

`indice_crudo` es lo que vive la gente: el 27 de diciembre arriba, los feriados abajo.
`indice_limpio` quita día de semana y feriado.

Las dos banderas no son la misma cosa y la distinción importa:

- `ventana_feriado` marca las 45 fechas que caen dentro de una ventana de feriado declarada.
- `frac_anios_con_coef_feriado` es la fracción de los 19 años en que algún regresor de feriado
  tocó esa fecha. Vale 0 en 179 fechas y es positiva en 186. El ranking limpio solo es
  interpretable sobre esas 179, y esa es la cifra de `n_fechas_sin_coef_feriado`.

Las listas `mas_comunes_crudo`, `menos_comunes_crudo`, `mas_comunes_limpio_sin_feriado` y
`menos_comunes_limpio_sin_feriado` traen 10 fechas cada una, con `fecha`, `n`, `p_cruda`,
`uno_en`, `indice_crudo`, `ic_crudo`, `indice_limpio` e `ic_limpio`. El conjunto de los extremos
es estable; el orden interno no lo es y no se publica como ranking.

`septiembre_vs_bloque` compara el 18 y el 19 de septiembre contra la meseta del 4 de septiembre
al 1 de octubre: `bloque_04sep_01oct` y una entrada por fecha con `indice_limpio`,
`dif_vs_bloque`, `ee_dif`, `t`, `n_anios` y `en_ventana_feriado`.

`feb29` trae el 29 de febrero aparte, con `uno_en_ciclo_de_4_anios` 1.790,8 y su IC95. El valor se
corrigió el 2026-09-19: el denominador anterior, 1.461, suponía que la media del índice de los 365
días es exactamente 1, y mide 1,0060934. El IC95 sigue construido sobre el denominador anterior y
no se recalculó; el campo `nota_correccion` del propio archivo lo declara.

`ranking_semanal_limpio` agrega el índice limpio de nacimientos a 52 semanas: `semana`,
`fecha_inicio`, `idx_limpio`, `se_entre_anios`, `top5` y `bottom5`. Es la escala a la que el
índice limpio se puede leer.

### `dia-semana.json` (8,1 KB) · programación del parto

| clave | qué es |
|---|---|
| `p_dow` | probabilidad de nacer cada día de semana, con `p`, `lo`, `hi`, en semana sin feriados |
| `p_dow_crudo` | la misma probabilidad sin ajuste |
| `anios` | 19 años, 1989 a 2007 |
| `f_por_anio` | `f = 1 - 7 p_domingo`, cota inferior de la fracción de partos con día elegido, con `v`, `lo`, `hi` |
| `razon_domingo_habil_por_anio` | razón domingo sobre día hábil, con `v`, `lo`, `hi` |
| `f_por_quinquenio` | cuatro valores: 0,2447, 0,2882, 0,3053, 0,3387 |
| `periodos` | resumen por tramo, incluido `1989-2007` |
| `estratos_depe2` | tres dependencias del colegio (municipal, particular subvencionado, particular pagado), cada una con `periodos` |

La dependencia del colegio es un proxy socioeconómico del alumno, no el prestador que atendió el
parto. En las regiones el `f` anual es nulo por falta de datos; para regiones se usa
`periodos`.

### `feriados.json` (22,4 KB) · matriz del feriado y Semana Santa

| clave | qué es |
|---|---|
| `matriz_B` | siete listas, una por día de semana del feriado, con 15 días relativos de -7 a +7. Cada punto trae `k`, `pct`, `lo`, `hi`, `se_log`, `n_dias`, `nac_obs` |
| `dia0` | 13 fechas fijas con su déficit del día 0 y su IC entre ocurrencias |
| `dia0_menores_promedio` | promedio de los siete feriados menores, cerca de -22% |
| `dia0_por_dow` | el mismo promedio separado en día hábil, sábado y domingo |
| `evolucion_dia0_por_periodo` | tres tramos y sus tres diferencias |
| `no_feriados` | 18 fechas que no son feriado legal y se evitan igual, o que sirven de control: 24 y 31 de diciembre, 11 y 12 de septiembre, 29 de junio y 12 de octubre sin feriado, día 31 genérico, día 13 y sus variantes de martes y viernes |
| `semana_santa_perfil` | 21 puntos con `dia_rel`, `razon`, `n`, alrededor del Viernes Santo |
| `semana_santa_partos` | 24 coeficientes con IC: el hoyo de viernes a domingo y el adelanto de lunes a jueves |
| `semana_santa_balance` | `neto_dias_equiv`, `hoyo_vie_sab_dom`, `adelanto_lun_jue` y su nota |

El déficit del feriado depende casi por completo del día de semana en que cae: -34,4% en lunes y
-0,8% en domingo.

### `patrias.json` (7,3 KB) · Fiestas Patrias

`perfil_rel_dias`, `perfil_medio` y `perfil_ee` son 22 valores del día -7 al +14 respecto del 18
de septiembre.

`perfil_medio_por_largo` repite el perfil para descansos de 2, 3, 4 y 5 días.

`por_anio` son las 19 Fiestas Patrias con `anio`, `largo`, `habiles`, `dow18`,
`deficit_descanso`, `deficit_total_vs_dia_promedio`, `rebote_fuera` y `neto_ventana`.
`por_largo` agrupa esos 19 años en los cuatro largos.

`reg_deficit_descanso` trae la regresión del déficit contra el largo, con sus dos pruebas de
permutación. **Su pendiente no es una dosis-respuesta.** El déficit del descanso es la suma sobre
una ventana cuyo largo es la variable explicativa, así que bajo un déficit por día constante la
pendiente iguala ese déficit por día y no puede ser cero; el intercepto de +0,031 con p 0,84
confirma que la recta pasa por el origen. El contraste que sí separa dosis de aritmética es el
déficit por día contra el largo, y da -0,0123 con p 0,24. Las dos pruebas de permutación del
archivo son además la misma prueba: `habiles` es igual a `largo - 2` en los 19 años.

`concepcion_semanal_33_43` son 11 semanas alrededor de septiembre con `indice`, `lo` y `hi`, y
`concepcion_deis_integral` es la integral del bulto de concepciones medida por datación directa
en microdatos DEIS, 1,169 días equivalentes. Su IC95 solo cubre la dispersión entre los cinco años
medidos: con otras ventanas de integración razonables la cifra va de 0,87 a 1,78.

El déficit total del descanso crece con el largo porque hay más días libres, no porque cada día
libre cueste más; y el bulto de concepciones no escala con el largo de forma detectable.

### `estratos.json` (37,7 KB) · heterogeneidad

`curvas` tiene 19 estratos: nacional, sexo, dependencia, zona, ruralidad, cuatro cruces de zona
por ruralidad y tres períodos. Cada uno trae `semanal`, `lo`, `hi` (52 cada una), `amplitud`,
`amplitud_ic`, `semana_pico`, `semana_valle`, `escala_vs_nacional` y `escala_ic`. Las dos
últimas son `null` en `nacional`, porque la curva nacional es la referencia contra la que se
calcula la escala.

**Aviso sobre `escala_ic` de los tres estratos de período.** En `per:1989-1995`, `per:1996-2002` y
`per:2003-2007` ese intervalo se construyó contra la curva nacional puntual y no contra el arreglo
de remuestreos, de modo que ignora la incertidumbre de la referencia y es sistemáticamente más
angosto que el `escala_ic` de los otros dieciséis estratos, pese a llamarse igual. No son
comparables entre sí. Las `amplitud` y `amplitud_ic` de esos tres estratos no tienen el problema.

`regiones` tiene las 13 regiones, con `lat` (latitud de la capital regional), `n`, `amplitud`,
`amplitud_ic`, `escala_vs_nacional`, `escala_ic`, `semana_pico` y `semana_valle`. El orden de
norte a sur se arma con `lat`. La escala sube hasta la Araucanía y cae en Aysén y Magallanes:
es una joroba, no una recta, y no se debe citar una pendiente lineal sobre las 13.

**La región 11 no es interpretable.** El archivo de origen la marca como no válida, y la
advertencia se reproduce acá textual, tal como viene en `pagina.json`, en
`dia_semana.estratos["region:Aysén"].advertencia`:

> NO VALIDO: region=11 en nac_diario_estratos.csv trae 3627-11338 nacimientos por año en
> 1989-2004 contra 1779-1880 en 2006-2007 (Aysén real ~1.800); el código 11 está contaminado
> con alumnos de otra región. No interpretar.

El defecto alcanza al estrato `zona:austral`, porque la región 11 aporta 105.934 de los 150.271
nacimientos de las dos regiones australes, o sea cerca de dos tercios. Por eso la página dibuja
Aysén hueco y marca las dos filas como no interpretables. El contraste `zona:sur - zona:austral`
de `comparaciones` descansa en la misma serie y tampoco se publica.

`comparaciones` son 17 contrastes pareados entre estratos, con los mismos remuestreos de años en
ambos lados. Dos avisos. Su `max_dif` elige la semana donde la diferencia es mayor y reporta el
percentil puntual del bootstrap en esa misma semana, sin corregir por esa búsqueda: el intervalo
honesto es una banda simultánea sobre las 52 semanas, que para el par pagado menos municipal va de
-0,0899 a -0,0355 en vez de -0,0826 a -0,0475. Y el archivo trae catorce comparaciones de
amplitud, así que citar tres sin corregir por multiplicidad las presenta más firmes de lo que son.

`latitud` trae `escala_vs_nacional` y `arm1_amp` por región. Su `spearman_11_sin_XI_XII` de 0,927
es la correlación de rango de la ESCALA (y del semi-armónico anual, que coincide por rangos), no
de la columna `amplitud`: sobre esas mismas 11 regiones la de la amplitud es 0,791. Y esas 11
regiones dejan fuera a Magallanes, que no tiene defecto de datos. Sobre las 12 regiones
publicables, es decir todas menos la 11, la correlación es 0,797 en amplitud y 0,671 en escala. `febrero_crudo` es el
valle de febrero del particular pagado medido sin modelo. `parto_domingo` da el déficit de
domingo y sábado por estrato.

El pico cae en la semana 52 o en la 1 en los 19 estratos, y en 11 de las 13 regiones:
O'Higgins marca semana 16 y Antofagasta 51, dos excepciones que el bootstrap deja sin
resolver. Lo que varía es la amplitud.

### `serie-larga.json` (11,5 KB) · noventa años de fondo

`empalme` son 16 tramos con `fuente`, `tramo`, `centro`, `n`, `amp1_nac_pct`,
`amp1_nac_ic95_boot_anios`, `amp1_conc_pct`, `fase1_conc`, `fase1_conc_doy` y `nota`. Las
fuentes son tres y no son comparables en nivel: docentes y asistentes antes de 1989, MINEDUC
entre 1989 y 2007, DEIS desde 1992.

`deis_indice_concepciones` y `deis_indice_nacimientos` son cinco períodos con 12 meses cada uno.
Muestran que el máximo se corrió de enero a mayo o junio después de 2008: la respuesta de la
página vale para las cohortes 1989 a 2007 y no describe al Chile de 2020.

`rampa_mineduc_deis` son 17 años con la cobertura de MINEDUC sobre DEIS dentro del año, que es
lo que infla la amplitud de las cohortes viejas.

### `validacion.json` (19,7 KB) · MINEDUC contra los registros vitales

| clave | qué es |
|---|---|
| `corr_1992_2007` | `r` 0,9431 entre el índice mensual de MINEDUC y el del DEIS, con IC95 de Fisher y bootstrap |
| `cobertura_total_1992_2007` | 1,0357: MINEDUC tiene más personas que los nacidos vivos del DEIS |
| `por_anio` | 17 años con `r`, `mae_pct`, `cobertura`, `mineduc` y `deis` |
| `mensual_serie` | 204 meses con `ano`, `mes`, `i_mineduc`, `i_deis` |
| `razon_por_mes_1992_2006` | 12 meses con `dif_pct` y `ee_pct` |
| `diario_perfil_doy` | perfil diario limpio de las dos fuentes, 365 valores cada una |
| `dedup_concepcion_semanal` | efecto del criterio de deduplicación sobre la curva semanal |
| `borde_final` | cobertura de las cohortes 2006 a 2010, que es por qué la ventana termina en 2007 |

### `meta.json` (1,5 KB)

Población, período, `n_nacimientos` 5.073.711, `n_anios` 19, `n_dias` 6.939, `dispersion_glm`,
`media_gestacion_dias`, `de_gestacion_dias`, `lam`, `unidad_concepcion`, las cuatro
`advertencias` que la página debe declarar, `generado`, `base` (la versión de `base.py` que
produjo las cifras), `bloques_regenerados_v3`, `fuente` y `archivos` con el tamaño en bytes de
los otros diez archivos JSON de este directorio.

## CSV descargables

Están un nivel más arriba, en `concepciones/`. Los encabezados van sin tildes.

| archivo | filas | columnas |
|---|---|---|
| `concepciones-semanal.csv` | 52 | `semana`, `fecha_inicio`, `fecha_fin`, `indice`, `indice_ic95_inf`, `indice_ic95_sup`, `desviacion_pct`, `desviacion_ic95_inf`, `desviacion_ic95_sup`, `significativo` |
| `concepciones-mensual.csv` | 12 | `mes`, `nombre`, `probabilidad`, `probabilidad_ic95_inf`, `probabilidad_ic95_sup`, `probabilidad_uniforme`, `desviacion_pct`, `desviacion_ic95_inf`, `desviacion_ic95_sup`, `significativo` |
| `cumpleanos-diario.csv` | 366 | `fecha`, `nacimientos`, `uno_en`, `indice_crudo`, `indice_limpio`, `recibe_coeficiente_feriado`, `fraccion_anios_con_coeficiente_feriado` |
| `nacimientos-dia-semana.csv` | 7 | `dia`, `probabilidad_pct`, `probabilidad_ic95_inf_pct`, `probabilidad_ic95_sup_pct`, `probabilidad_cruda_pct` |

`significativo` y `recibe_coeficiente_feriado` valen 1 o 0. `recibe_coeficiente_feriado` es 1
cuando `fraccion_anios_con_coeficiente_feriado` es mayor que cero: 186 fechas, contra 179 que
nunca reciben coeficiente.

## Qué quedó fuera de este directorio

`pagina.json` trae 115 series y acá se publican las que alimentan una figura. Quedaron fuera,
entre otras:

- `concepcion.doy.partos_limpio` y `concepcion.doy.partos_crudo`, porque `cumpleanos.json` ya
  trae el índice diario de nacimientos en crudo y en limpio.
- `feriados.por_depe2`, `feriados.sensibilidad_neto` y `feriados.neto_linea_base_local`, porque
  el balance neto de un feriado quedó no concluyente y no se publica.
- `estratos.escala_por_mitad`, `estratos.tendencia_anual`, `estratos.externo_deis` y
  `estratos.sens_lam`, que son diagnóstico de método y no figura.

Si la página necesita una de esas series, se agrega en `gen_datos_pagina.py` y se regenera. No
se copia a mano.

## Una advertencia sobre la versión del modelo

Los bloques `cumpleanos` y `estratos` se recalcularon con `base.py` v3, que sacó el regresor del
día 31 del grupo de conservación de feriados. El resto de `pagina.json` viene de v2, porque se
mueve menos de 0,3 puntos de índice. `meta.json` lo registra en `base`, `parcheado_v3` y
`bloques_regenerados_v3`, y `pagina.json` guarda el detalle en `meta.regenerado_v3`, incluidas
las siete cifras de la síntesis editorial que quedaron desactualizadas.

`meta.generado` es la fecha de la consolidación original; `meta.parcheado_v3` es la del
recálculo.

Eso deja dos versiones del día 31 conviviendo acá.

`feriados.json` trae el coeficiente del GLM v2, que descuenta 3,87% al día 31.
`cumpleanos.json` trae el índice limpio v3, donde ese descuento ya llega a la serie: el 31 de
enero pasa de 0,9941 a 1,0337.

Las dos cifras miden cosas distintas y no se contradicen. Bajo v2 el descuento quedaba anulado
por la reescala de conservación, y ese es justamente el defecto que v3 corrige. Conviene no
ponerlas en la misma frase de la página.
