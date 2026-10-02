# Texto de la página "Cuándo se concibe en Chile"

Destino: `https://cochid.cl/concepciones/`. Este documento es el texto listo para
pegar en el HTML. No contiene HTML. Quien arme la página toma de acá los títulos,
los párrafos, las notas al pie, el texto alternativo de cada figura y la versión
sin JavaScript.

Fuentes de toda cifra: `cochid-concepciones/data/out/SINTESIS.md` y
`cochid-concepciones/data/out/pagina.json`. El mapa cifra por cifra está en la
sección final, "Procedencia". Ninguna cifra sale de otro lado.

## Reglas para quien arme el HTML

1. **Regla H28.** Los números de sección van dentro del propio `<h2>`, como parte
   del texto del título ("01 · La curva del año"). No crear un elemento separado
   de ceja, `overline`, `eyebrow` ni etiqueta mono sobre el título. El patrón de
   `cambio-de-hora/index.html` usa `<p class="overline">` sobre cada `h2`: no se
   replica acá.
2. **Signos.** Los negativos van con guion ASCII. No usar el signo menos Unicode,
   em-dash ni en-dash en ninguna parte del texto.
3. **Cifras.** Coma decimal y punto de miles, como están escritas acá. No
   reformatear.
4. **Intervalos.** Todo intervalo escrito como "[a; b]" es IC95. Si una cifra
   aparece sin intervalo es porque `SINTESIS.md` no lo da; no inventar uno ni
   tomarlo de otra serie.
5. **Marcadores de figura.** `[F1]` a `[F9]` indican dónde va cada figura, y
   `[FM]` marca la figura de método, que es opcional. El texto alternativo y la
   tabla sin JavaScript de cada una están junto al marcador.
6. **Conteo de variantes.** El texto dice "21 variantes" solo donde `SINTESIS.md`
   sostiene con ese número la afirmación del pico. `pagina.json` trae 22 entradas
   en `metodo.variantes`. El pie de F2 se escribió sin contar variantes para que
   la figura no contradiga al texto. Dejar así.

---

## Metadatos

**Title.** Cuándo se concibe en Chile · Compañía Chilena de Inteligencia de Datos

**Meta description.** Cinco millones de nacimientos con fecha exacta, cohortes
1989 a 2007. El máximo de concepciones cae entre el 24 de diciembre y el 7 de
enero. El mínimo es una meseta de dos meses en pleno invierno.

**og:title.** Cuándo se concibe en Chile

**og:description.** La semana 52 concentra 8,71% más concepciones que el promedio
del año. El invierno pierde 4,6%. La unidad que el dato permite leer es la
semana, nunca el día.

**og:image:alt.** Curva semanal del índice de concepción en Chile, con el máximo
de fin de año y la meseta baja de invierno.

---

## Título y bajada

**H1.** En Chile se concibe más entre Navidad y Año Nuevo

**Bajada.** La semana del 24 al 31 de diciembre concentra 8,71% más concepciones
que una semana promedio [+7,74; +9,75]. La medición cubre 5.073.711 nacimientos
con fecha exacta, de personas nacidas en Chile entre 1989 y 2007.

---

## Tres cifras de portada

**Cifra 1.** +8,71%
Rótulo: la semana del año con más concepciones, del 24 al 31 de diciembre.<sup>1</sup>

**Cifra 2.** -4,61%
Rótulo: el punto más bajo de una meseta de dos meses, entre el 9 de julio y el 1
de septiembre.<sup>2</sup>

**Cifra 3.** 13,3 puntos
Rótulo: la distancia entre la semana más alta y la más baja del año.<sup>3</sup>

**Notas al pie de la portada.**

¹ Semana 52, del 24 al 31 de diciembre, IC95 de +7,74 a +9,75 sobre una
distribución uniforme. La semana 1, del 1 al 7 de enero, queda en +8,47%
[+7,44; +9,69] y no se distingue de ella: la diferencia es 0,24 puntos con IC95
de -0,14 a +0,58. Lo identificado es la quincena del 24 de diciembre al 7 de
enero.

² Semana 34, del 20 al 26 de agosto, IC95 de -5,25 a -3,97. El bootstrap no
identifica una semana mínima: reparte el mínimo entre la 34 (0,588), la 29
(0,225) y la 30 (0,172). La lectura correcta es un valle ancho entre las semanas
28 y 35.

³ Diferencia entre la semana 52 y la semana 34 del índice semanal de concepción,
cohortes 1989 a 2007. De las 52 semanas, 47 se distinguen de la uniforme.

---

## 01 · La curva del año

**Título de sección.** 01 · La curva del año

**Bajada de sección.** El año tiene una cima de fin de año y un piso de invierno.
La cima es una quincena y el piso es una meseta de dos meses. Ninguna de las dos
es una fecha.

**Cuerpo.**

El máximo cae en la semana del 24 al 31 de diciembre, con 8,71% más concepciones
que una semana promedio [+7,74; +9,75]. La semana siguiente, del 1 al 7 de enero,
queda en +8,47% [+7,44; +9,69]. La diferencia entre las dos es 0,24 puntos con
IC95 de -0,14 a +0,58, y la probabilidad bootstrap de que gane la semana 52 es
0,892 contra 0,107 de la semana 1. Con una penalización más fuerte en el mismo
método gana la semana 1. Lo que el dato identifica es la quincena del 24 de
diciembre al 7 de enero, y lo identifica con solidez: en las 21 variantes del
método el pico cae dentro de esa quincena, y en 400 de 400 remuestreos bootstrap
también.

Las dos semanas vecinas sostienen la misma cima. La semana 51, del 17 al 23 de
diciembre, queda en +6,59% [+5,84; +7,33] y la semana 2, del 8 al 14 de enero, en
+6,52% [+5,44; +7,77].

El mínimo no es una semana. La curva queda entre 0,954 y 1,000 desde la semana 20
hasta la 47, y el bootstrap reparte el mínimo entre la semana 34 con probabilidad
0,588, la 29 con 0,225 y la 30 con 0,172. Entre las variantes del método el
mínimo cae en la 34 en 15 de 21 casos, en la 29 en 4, y en la 28 y la 36 en uno
cada una. Lo que hay es un valle ancho entre las semanas 28 y 35, es decir entre
el 9 de julio y el 1 de septiembre, sin semana identificable dentro de él. El
punto más bajo medido es la semana 34, del 20 al 26 de agosto, con -4,61%
[-5,25; -3,97].

La distancia entre la semana más alta y la más baja es de 13,32 puntos
porcentuales. De las 52 semanas del año, 47 se distinguen de la uniforme.

Por mes de concepción, de mayor a menor: enero +5,27%, diciembre +4,42%, febrero
+3,64%, marzo +1,97%, abril +1,20%, mayo -0,16%, septiembre -1,27%, junio -2,02%,
octubre -2,17%, noviembre -2,30%, julio -4,00% y agosto -4,35%. Enero supera a diciembre
con 95% de confianza; julio y agosto están empatados en el último lugar; mayo no
se distingue de cero. El resultado mensual no depende del método de
deconvolución: correr los nacimientos limpios 260 días y agregar por mes da lo
mismo dentro de 0,8 puntos en los doce meses.

Fiestas Patrias no aparece en este ranking. La semana del 17 al 23 de septiembre
queda en +0,01% con IC95 de -0,67 a +0,63, es decir exactamente en el promedio
anual. El feriado sí mueve algo, pero lo que mueve es levantar una semana desde
el fondo del valle de invierno hasta el promedio, no crear un segundo máximo. La
sección 03 lo separa del efecto sobre los partos.

**Advertencia de banda que debe ir visible junto a la figura.** La banda de IC95
que aparece en esta curva cubre la verdad en 61,5% de las semanas al contrastarla
con DEIS 1999 a 2003, y en 60,8% en simulación nula, no en 95%. Captura la
variación entre años y no el sesgo de regularización ni el del tratamiento de
feriados. Leerla como banda de variación entre años, no como intervalo de
cobertura nominal.

### [F1] Curva semanal de concepción

Ubicación: inmediatamente después de la bajada de sección, antes del cuerpo.

**Texto alternativo.** Curva del índice semanal de concepción en Chile para las
cohortes 1989 a 2007. El índice sube desde octubre y alcanza su máximo en la
quincena del 24 de diciembre al 7 de enero, con 8,7% sobre el promedio anual.
Después baja de forma sostenida hasta una meseta baja que se extiende desde julio
hasta comienzos de septiembre, alrededor de 4,5% bajo el promedio. La quincena máxima
está marcada como empate entre dos semanas y la meseta mínima está sombreada como
bloque, sin punto mínimo señalado.

**Pie de figura.** Las 52 semanas del año, con banda de IC95. La quincena del 24
de diciembre al 7 de enero está marcada como empate: el dato no separa las dos
semanas. El valle está sombreado como bloque entre las semanas 28 y 35 porque
tampoco hay una semana mínima identificable. Cohortes 1989 a 2007.

**Versión sin JavaScript.** Tabla con las 52 semanas. Columnas: semana, fechas,
desviación sobre la uniforme, IC95 bajo, IC95 alto, y una columna final que diga
"sí" o "no" según la columna `significativo`. Encabezado de la tabla: "Índice
semanal de concepción, cohortes 1989 a 2007. Desviación porcentual sobre una
distribución uniforme del año." Antes de la tabla, este párrafo:

> El máximo está en la semana 52, del 24 al 31 de diciembre, con +8,71%. La
> semana 1, del 1 al 7 de enero, queda en +8,47% y no se distingue de ella. El
> mínimo medido está en la semana 34, del 20 al 26 de agosto, con -4,61%, dentro
> de una meseta que va de la semana 28 a la 35 y en la que el dato no identifica
> una semana más baja que las otras.

---

## 02 · Por qué esto no se puede contar por día

**Título de sección.** 02 · Por qué esto no se puede contar por día

**Bajada de sección.** Entre la concepción y el parto pasan 260,3 días en
promedio, con un desvío de 12,5 días. Ese desvío es el que decide qué se puede
leer en los datos y qué no.

**Cuerpo.**

El dato de partida son fechas de nacimiento. Para llegar a la concepción hay que
deshacer la gestación, y la gestación no dura lo mismo en todos los embarazos:
dura 260,3 días en promedio con un desvío de 12,5 días, medido en los microdatos
de DEIS. El día más probable de esa distribución concentra apenas 4,1% de la
masa.

De ahí sale la regla que gobierna toda la página. Si un día concreto de un año
concreto tuviera un exceso de concepciones, esos nacimientos llegarían repartidos
en más de un mes y con la altura reducida a un cuarto. Por lo tanto, cualquier
rasgo abrupto de uno a tres días que se vea en los nacimientos viene del lado del
parto: una cesárea programada, una inducción, un feriado que vacía el pabellón, o
el propio registro. No puede venir de la concepción.

La regla se lee en los dos sentidos. Un pico de nacimientos de un solo día no
informa nada sobre concepciones. Y un pico de concepciones de un solo día es
invisible en estos datos, salvo que sea enorme.

Cuánto de enorme es medible. Un impulso de concepciones de un día o de una
semana vuelve a aparecer en los nacimientos como una campana de 25 a 26 días de
ancho a media altura, que retiene entre 79% y 84% de la masa. Dos picos de una
semana se separan solo si están a 35 días o más uno del otro. Con 19 años de
datos, el método detecta un pico semanal de concepciones desde +3,4% en una zona
del calendario sin feriados y desde +4,1% si sus nacimientos caen sobre Fiestas
Patrias. Un pico de un solo día necesita entre +25% y +29% para ser detectado.

Lo que el método sí recupera es la forma del año a escala de semana, y lo
recupera con un sesgo conocido: atenúa. Contra la verdad medida en DEIS 1999 a
2003, donde la concepción se puede fechar registro a registro, la deconvolución
acierta la semana del pico y recupera 71,7% del exceso de la semana 52 y 65,3%
del de la semana 1. La curva publicada es entonces una versión aplanada de la
verdadera, no una versión exagerada.

Por eso la unidad publicable de concepción en esta página es la semana. Ningún
número de concepciones de esta página está referido a un día.

### [F2] Abanico de variantes del método

Ubicación: después del segundo párrafo del cuerpo, junto a la regla de lectura.

**Texto alternativo.** Superposición de las curvas semanales de concepción
obtenidas con distintas variantes del método, en gris, sobre la curva base en
negro. Todas las variantes coinciden en situar el máximo en la quincena de fin de
año. En el valle de invierno las variantes se separan entre sí y sitúan el mínimo
en semanas distintas, entre julio y comienzos de septiembre.

**Pie de figura.** Cada línea gris es la curva obtenida con una variante del
método: distinto número de armónicos, distinta ventana de años, distinto núcleo
gestacional, distinto tratamiento de feriados. La línea negra es la
especificación base. El pico cae dentro de la quincena del 24 de diciembre al 7
de enero en todas las variantes. El mínimo se mueve entre las semanas 28 y 36, y
esa dispersión es la razón por la que el valle se publica como bloque.

**Versión sin JavaScript.** Dos frases y una lista breve:

> El pico cae dentro de la quincena del 24 de diciembre al 7 de enero en las 21
> variantes del método y en 400 de 400 remuestreos bootstrap. El mínimo no se
> estabiliza. Cae en la semana 34 en 15 variantes, en la 29 en 4, y en la 28 y la
> 36 en una cada una. En bootstrap, la probabilidad de que el mínimo sea la
> semana 34 es 0,588; la 29, 0,225; la 30, 0,172.

### [FM] Figura de método, opcional

Ubicación: al cierre de esta sección o en la sección 07, a criterio de
maquetación. Se numera como figura de método, fuera de la serie F1 a F9.

**Texto alternativo.** Comparación entre la curva semanal de concepción estimada
por el método y la curva verdadera calculada directamente de los microdatos de
DEIS entre 1999 y 2003. Las dos curvas tienen la misma forma y el mismo máximo de
fin de año. La curva estimada es más baja en el pico que la verdadera.

**Pie de figura.** Única validación con verdad conocida. En DEIS 1999 a 2003 la
concepción se puede fechar registro a registro. El método acierta la semana del
pico y lo atenúa: recupera 71,7% del exceso de la semana 52 y 65,3% del de la
semana 1. La zona sombreada es el piso de ruido de la propia verdad.

**Versión sin JavaScript.**

> Contra la verdad de DEIS 1999 a 2003, la curva estimada correlaciona 0,877 y
> tiene un RMSE de 0,0156. El piso de ruido de la propia verdad es un RMSE de
> 0,021 entre mitades de dos años, o de 0,010 a 0,015 para los cuatro años. El
> error del método no se distingue de ese piso.

---

## 03 · El calendario del parto

**Título de sección.** 03 · El calendario del parto

**Bajada de sección.** Acá nada habla de concepciones. Todo lo de esta sección
ocurre en la fecha de nacimiento, y casi todo apunta a que en Chile la fecha del
parto se elige.

**Cuerpo.**

**El día de la semana.** En una semana sin feriados, la probabilidad de nacer es
15,94% un martes y 10,15% un domingo. El reparto completo es lunes 15,38%, martes
15,94%, miércoles 15,45%, jueves 15,49%, viernes 15,56%, sábado 12,04% y domingo
10,15%, con un IC95 de 0,04 puntos en cada uno. La uniforme sería 14,29%. Un
domingo tiene 0,6525 veces los partos de un día hábil [0,6501; 0,6548] y un
sábado 0,7734 [0,7707; 0,7761].

**Cuánto parto tiene fecha elegida.** El déficit de domingo permite construir una
cota inferior de la proporción de partos con fecha elegida. La fórmula supone que
ningún parto programado cae en domingo y que los espontáneos se reparten parejo,
y por eso entrega un piso, no una estimación. Ese piso es 28,92% para el conjunto
1989 a 2007 [28,70; 29,15]. Sube de 22,20% en 1989 a 34,56% en 2007, con una
pendiente de +0,62 puntos por año [+0,58; +0,67]. Crece en los cuatro
quinquenios, con valores de 0,2447, 0,2882, 0,3053 y 0,3387, pero no crece año a
año: hay cuatro retrocesos, en 1999, 2000, 2001 y 2007, el mayor de ellos de 1,4
errores estándar.

**Qué semana de gestación carga la programación.** En los microdatos de DEIS 1999
a 2003, la razón entre partos de domingo y de día hábil es 0,481 en la semana 38
de gestación, 0,645 en la 39, 0,713 en la 40 y 0,791 entre las semanas 24 y 33.
La semana 38 es 23% de los partos y explica 32,8% del déficit de domingo
[32,25; 33,31]; las semanas 37 a 39 juntas son 59% de los partos y 67% del
déficit. No todo el déficit es de término temprano: la semana 41 también lo
tiene, con 0,619, lo que apunta a inducción por embarazo prolongado.

**El gradiente socioeconómico.** El piso de partos con fecha elegida es 50,13% en
particular pagado [49,35; 50,77], 29,57% en particular subvencionado
[29,22; 29,92] y 23,07% en municipal [22,70; 23,44]. En zona rural es 21,73% y en
urbana 29,08%. La dependencia del colegio del alumno es un proxy del nivel
socioeconómico, no el prestador que atendió el parto. El mismo cálculo sobre sexo
del nacido, que no debería mostrar nada, no muestra nada: hombres menos mujeres
da -0,37 puntos con IC95 de -0,85 a +0,09.

**Los feriados.** El tamaño del hoyo de un feriado depende casi por completo del
día de la semana en que cae. Un feriado en lunes tiene -34,4% de nacimientos
[-36,4; -32,3]; en martes -32,0%; en miércoles -27,0%; en jueves -27,7%; en
viernes -27,9%; en sábado -6,6%; y en domingo -0,8% [-3,5; +1,9]. El feriado en
domingo no es nulo, es pequeño, del orden de -1% a -4%: el GLM no lo distingue de
cero, un estimador local independiente da -3,7% [-6,3; -1,0] y el fin de semana
agrupado da -3,8% [-5,6; -1,9]. La muestra son 121 feriados-año, 36 de ellos en
fin de semana.

Feriado por feriado, promediando los días de semana en que cayó cada fecha, hay
cuatro con el hoyo más profundo, todos entre -32% y -35%, y sus intervalos se
solapan casi por completo. Son el 25 de diciembre con -34,3% [-39,0; -29,2], el
19 de septiembre con -33,0% [-38,3; -27,2], el 18 de septiembre con -32,1%
[-37,1; -26,7] y el 1 de enero con -31,9% [-37,6; -25,7]. Detrás vienen el 1 de
noviembre -26,1%, el 1 de mayo -24,2%, el 15 de agosto -23,5% y el 8 de diciembre
-21,8%. Cierran el 21 de mayo -20,2%, el 12 de octubre -17,8% y el 29 de junio
-16,9%. El promedio de los siete feriados menores es -22,0% [-24,1; -19,8] sobre
121 ocurrencias.

**Adónde van los partos que el feriado no recibe.** La víspera hábil de un
feriado que cae miércoles, jueves o viernes tiene +6,6% de partos [+5,2; +8,1].
El día hábil siguiente no rebota, con +0,8% y p de 0,25; el exceso se reparte
entre los días +2 a +4. Cuando el feriado cae en martes, el lunes sándwich no
baja bajo un lunes normal, pero pierde toda la anticipación de víspera: la
diferencia es -5,6 puntos [-7,9; -3,2]. El sábado que sigue a un feriado en
viernes cae -6,1%.

**Dos fechas que no son feriado legal y se evitan igual.** El 24 de diciembre
tiene -16,4% de nacimientos [-20,0; -12,6] y el 31 de diciembre -17,2%
[-20,7; -13,6]. El rebote se concentra el 26 y 27 de diciembre, con +13,3% y
+17,7%, y del 3 al 5 de enero, con +10,6%, +7,8% y +8,2%.

**Lo que se evita es el feriado, no la fecha.** Cuando el 29 de junio y el 12 de
octubre se trasladaron a lunes, la fecha original quedó normal: +0,2% y +2,1%, en
seis años cada una. La excepción es el 11 de septiembre, que se siguió evitando
después de dejar de ser feriado en 1999, con -8,1% [-10,3; -6,0] en nueve días,
contra +1,7% del 12 de septiembre. Ese dato no distingue evitación de la fecha de
menor actividad programada por disturbios.

**Semana Santa.** El Viernes Santo tiene -27,4% de nacimientos respecto de un
viernes normal [-29,1; -25,6], sobre 19 ocurrencias y 10.657 nacimientos. El
Sábado Santo tiene -12,2% [-14,4; -9,9] y el Domingo de Pascua -3,2%
[-5,7; -0,6]. Los partos se adelantan a la semana: lunes +6,1%, martes +5,0%,
miércoles +4,2% y jueves santo +2,2%, y casi no rebotan después.

**Fiestas Patrias.** Durante el descanso faltan 0,642 días-equivalentes de
nacimientos por sobre el efecto normal de fin de semana, con error estándar de
0,069, lo que equivale a unos 507 nacimientos por año. Frente a un día promedio
la falta es de 0,928 días-equivalentes. El 18 y el 19 de septiembre quedan en
-28,0% y -29,1%, con errores estándar de 2,9 y 3,0. El déficit crece con el largo
del descanso: -0,175 días-equivalentes por cada día adicional, con error estándar
de 0,037, IC95 de -0,255 a -0,096 y p de permutación de 0,00015, controlando
tendencia. Por grupo, un descanso de 2 días pierde 0,15 días-equivalentes, uno de
3 pierde 0,50, uno de 4 pierde 0,80 y uno de 5 pierde 0,76, lo que se satura
entre 4 y 5 días. El déficit además crece -0,032 días-equivalentes por año.

**El déficit del feriado creció, y el salto está en los noventa.** Un feriado
menor en día hábil tenía -24,1% en 1989 a 1995, -30,0% en 1996 a 2001 y -32,0% en
2002 a 2007. El paso del primer al segundo período es una caída de 7,8% relativo
con p menor a 0,001; el paso del segundo al tercero es de 2,9% con p de 0,079, y
no alcanza significación. Atribuir ese cambio a la cesárea programada es
plausible y no está probado: los agregados de DEIS disponibles no traen vía de
parto.

**Nota de límite que debe ir en esta sección, no solo en el método.** Ninguna
cifra de esta sección mide cesáreas. La vía de parto no está en los datos
disponibles. El respaldo de la interpretación por programación es el gradiente
por dependencia del colegio y la literatura clínica, no una medición.

### [F4] Día de semana y programación del parto

Ubicación: después del bloque "Cuánto parto tiene fecha elegida".

**Texto alternativo.** Dos paneles. El de la izquierda muestra la probabilidad de
nacer en cada día de la semana en barras horizontales con intervalo de confianza.
Los cinco días hábiles quedan entre 15,4% y 15,9%, el sábado en 12,0% y el
domingo en 10,2%. Una línea vertical en 14,3% marca el reparto uniforme. El panel
de la derecha muestra el piso de partos con fecha elegida por año entre 1989 y
2007, que sube de 22,2% a 34,6% con cuatro años de retroceso. Tres líneas
separadas por dependencia del colegio dejan al particular pagado muy por encima
del subvencionado y del municipal.

**Pie de figura.** Izquierda: probabilidad de nacer por día de la semana en
semanas sin feriado, 1989 a 2007. Derecha: piso de la proporción de partos con
fecha elegida, año a año, con las tres dependencias del colegio. Es un piso, no
una estimación: supone que ningún parto programado cae en domingo.

**Versión sin JavaScript.** Dos tablas. La primera, de siete filas, con día de la
semana y probabilidad, con el IC95 de 0,04 puntos declarado en el encabezado. La
segunda, de 19 filas, con año, piso y su IC95. Antes de las tablas:

> El martes es el día con más nacimientos, con 15,94%, y el domingo el que menos,
> con 10,15%. El piso de partos con fecha elegida pasa de 22,20% en 1989 a 34,56%
> en 2007, con retrocesos en 1999, 2000, 2001 y 2007. Por dependencia del colegio
> el piso es 50,13% en particular pagado, 29,57% en particular subvencionado y
> 23,07% en municipal.

### [F5] Matriz del feriado

Ubicación: después del bloque "Los feriados".

**Texto alternativo.** Siete paneles pequeños, uno por cada día de la semana en
que puede caer un feriado. Cada panel muestra el cambio porcentual de
nacimientos desde siete días antes hasta siete días después del feriado. El hoyo
del día del feriado es profundo cuando cae en lunes, alrededor de 34% bajo lo
normal, y se va haciendo menos profundo hacia el fin de semana hasta casi
desaparecer cuando el feriado cae en domingo. En los paneles de miércoles, jueves
y viernes se ve un alza en el día anterior.

**Pie de figura.** Cada panel es un día de la semana en que cayó el feriado. El
eje horizontal va de siete días antes a siete días después. El día 0 pasa de
-34,4% cuando el feriado cae en lunes a -0,8% cuando cae en domingo. La víspera
hábil de un feriado de miércoles a viernes sube +6,6%.

**Versión sin JavaScript.** Tabla de siete filas con el día 0 por día de semana
del feriado y su IC95 cuando existe, más este párrafo:

> El tamaño del hoyo depende del día de la semana en que cae el feriado: -34,4%
> en lunes y -0,8% en domingo. El feriado en domingo es pequeño, del orden de -1%
> a -4%, no nulo. La víspera hábil de un feriado de miércoles, jueves o viernes
> tiene +6,6% de partos y el día siguiente no rebota.

### [F6] Fiestas Patrias

Ubicación: después del bloque "Fiestas Patrias".

**Texto alternativo.** Panel superior: el perfil medio de nacimientos desde siete
días antes hasta catorce días después del 18 de septiembre, con una línea por
cada largo del descanso. Los cuatro perfiles caen durante el descanso y la caída
es más profunda cuanto más largo el descanso. Panel inferior: el déficit del
descanso año por año contra el largo del descanso, con una recta ajustada que
baja.

**Pie de figura.** Panel superior: perfil medio de nacimientos alrededor del 18
de septiembre, separado por largo del descanso. Panel inferior: déficit del
descanso contra su largo, año por año, con la recta controlada por tendencia.
Cada día adicional de descanso quita 0,175 días-equivalentes de nacimientos.

**Versión sin JavaScript.** Tabla de cuatro filas con largo del descanso, número
de años y déficit medio, más este párrafo:

> Durante el descanso faltan 0,642 días-equivalentes de nacimientos por sobre el
> efecto normal de fin de semana, unos 507 nacimientos por año. El déficit crece
> 0,175 días-equivalentes por cada día adicional de descanso, con p de
> permutación de 0,00015, y se satura entre los 4 y los 5 días. El 18 y el 19 de
> septiembre quedan en -28,0% y -29,1%.

### [F7] Semana Santa

Ubicación: después del bloque "Semana Santa".

**Texto alternativo.** Curva de nacimientos observados sobre esperados desde diez
días antes hasta diez días después del Viernes Santo. La curva sube por sobre la
línea de referencia durante el lunes a jueves santo, cae de forma brusca el
Viernes Santo, sigue baja el sábado, vuelve casi a la línea el domingo de Pascua
y no muestra rebote después.

**Pie de figura.** Nacimientos observados sobre esperados alrededor del Viernes
Santo, 19 ocurrencias. El Viernes Santo tiene -27,4% respecto de un viernes
normal, el Sábado Santo -12,2% y el Domingo de Pascua -3,2%. El adelanto ocurre
de lunes a jueves santo y no hay rebote posterior.

**Versión sin JavaScript.** Tabla de 21 filas con día relativo y razón observado
sobre esperado, más este párrafo:

> El Viernes Santo tiene -27,4% de nacimientos respecto de un viernes normal
> [-29,1; -25,6]. Los partos se adelantan a los días previos: lunes +6,1%, martes
> +5,0%, miércoles +4,2% y jueves santo +2,2%.

---

## 04 · Tu cumpleaños

**Título de sección.** 04 · Tu cumpleaños

**Bajada de sección.** El calendario de cumpleaños de Chile es, en buena medida,
el calendario de los feriados. Cuando se le quita esa capa, algunas fechas cambian
de lugar por completo.

**Cuerpo.**

El cumpleaños más común de las cohortes 1989 a 2007 es el 27 de diciembre:
16.886 personas, una de cada 300,5. Es el rebote de Navidad. Detrás viene un
bloque de septiembre, con el 21, el 14, el 22 y el 12, todos entre una de cada
308 y una de cada 314 personas.

Los menos comunes son feriados. El 25 de diciembre es el último, con una de cada
543,8 personas, seguido del 1 de enero con una de cada 537 y del 1 de mayo con
una de cada 498. Completan el piso el 21 de mayo, el 15 de agosto, el 19 de
septiembre, el 1 de noviembre, el 18 de septiembre, el 8 de diciembre y el 31 de
diciembre. Entre el día más común y el menos común hay una razón de 1,823. El 29
de febrero le toca a una de cada 1.780 personas en un ciclo de cuatro años
[1.498; 2.206].

**El orden interno de estas listas no se publica como ranking.** El conjunto de
las diez fechas de arriba y de las diez de abajo es estable. El orden dentro de
cada grupo no lo es: el intervalo de confianza de una fecha que no es feriado es
de más o menos 0,09 en índice, porque el día de la semana de cada fecha rota
entre años. Quien lea esta lista está viendo diez fechas altas y diez bajas, no
un primero, un segundo y un tercero.

**El 18 y el 19 de septiembre son el caso que vale la pena mirar.** En el
calendario crudo están entre las diez fechas menos comunes del año. Una vez
descontados el día de la semana y el feriado, quedan en 1,100 y 1,097, es decir
en el centro del máximo estacional del año. El contraste entre las dos versiones
es el hallazgo: el déficit del dieciocho es programación de partos, no falta de
embarazos de término. Lo que no se puede decir es que sean las fechas más altas
del calendario limpio. Ninguna de las dos se distingue del bloque de fechas
vecinas de septiembre: la diferencia es +0,024 con error estándar de 0,014 para
el 18 y +0,020 con error estándar de 0,013 para el 19.

**El calendario limpio solo es legible en parte del año.** El regresor que
recoge los días previos a un feriado toca 187 de las 365 fechas en al menos un
año, y en esas fechas el índice limpio arrastra estructura del propio modelo.
Sobre las 178 fechas que nunca reciben coeficiente de feriado en ningún año, el
máximo va del 28 de septiembre al 1 de octubre, entre 1,094 y 1,089, y el mínimo
está en la primera quincena de mayo, con el 8 de mayo en 0,952.

**Un control que salió bien.** No hay acumulación de nacimientos en el día 1 de
cada mes, que era lo que haría sospechar de fechas imputadas en masa. La razón
entre el día 01 y los días 02 a 28 está entre 0,97 y 1,03 en todo el año, salvo
en enero, mayo y noviembre, y en esos tres casos la explicación es que el día 1
es feriado.

**Lo que sí es real es el déficit del día 31** con -3,87% [-4,93; -2,80]. No es un
error de digitación de la fuente escolar: el mismo déficit está en los registros
vitales. El día 13 tiene un déficit genérico de -1,84% [-2,85; -0,82], y ni el
martes 13 ni el viernes 13 agregan nada distinguible por encima de ese déficit
genérico.

### [F3] Calendario de cumpleaños

Ubicación: al comienzo de la sección, después de la bajada.

**Texto alternativo.** Dos calendarios de 366 casillas uno al lado del otro, con
una escala de color que va de menos a más nacimientos centrada en el promedio. En
el calendario crudo, de la izquierda, el 27 de diciembre es la casilla más
oscura del lado alto y los feriados aparecen como casillas claras aisladas: 25 de
diciembre, 1 de enero, 1 de mayo, 18 y 19 de septiembre. En el calendario limpio,
de la derecha, esas casillas de feriado desaparecen del extremo bajo y el 18 y el
19 de septiembre quedan dentro de la zona alta de septiembre. Las 187 fechas que
reciben coeficiente de feriado en algún año están rayadas en gris.

**Pie de figura.** Izquierda: índice crudo de cumpleaños, tal como se vive.
Derecha: índice una vez descontados el día de la semana y el feriado. Las fechas
rayadas reciben coeficiente de feriado en al menos un año y su índice limpio
arrastra estructura del modelo; el calendario limpio solo es legible sobre las
178 fechas restantes. El orden interno entre fechas cercanas no es un ranking: el
IC95 de una fecha no feriada es de más o menos 0,09 en índice.

**Versión sin JavaScript.** Dos tablas de veinte filas: las diez fechas más
comunes y las diez menos comunes del calendario crudo, con fecha, número de
personas y "una de cada N". Antes de las tablas:

> El 27 de diciembre es el cumpleaños más común, con 16.886 personas, una de cada
> 300,5. El 25 de diciembre es el menos común, con una de cada 543,8. La razón
> entre el día más y el menos común es 1,823. El orden dentro de cada lista no es
> publicable como ranking, porque el IC95 de una fecha no feriada es de más o
> menos 0,09 en índice. Una vez quitados el día de la semana y el feriado, el 18
> y el 19 de septiembre pasan del grupo de abajo al centro del máximo estacional,
> con 1,100 y 1,097.

---

## 05 · Lo que cambia según quién y dónde

**Título de sección.** 05 · Lo que cambia según quién y dónde

**Bajada de sección.** La fecha del máximo es la misma para todos. Lo que cambia
de un grupo a otro es cuánto pesa el calendario.

**Cuerpo.**

En los 16 estratos principales de la muestra, por sexo, dependencia del colegio,
zona, ruralidad y período, el máximo semanal de concepción cae en la semana 52 o
en la 1. Entre las 13 regiones tampoco se mueve, con dos excepciones que el
bootstrap deja sin resolver. Borrar por completo los nacimientos del 11 al 28 de
septiembre, que es donde la programación alrededor del dieciocho deforma la
serie, deja el pico en la misma semana y le quita solo un octavo de su altura.

Lo que varía es la amplitud, es decir la distancia entre la semana más alta y la
más baja de cada grupo. Sobre la serie por estratos, la amplitud nacional es
0,1284 [0,1133; 0,1474]. El particular pagado llega a 0,1780 [0,1488; 0,2058], el
particular subvencionado a 0,1393 [0,1235; 0,1601] y el municipal a 0,1139
[0,1039; 0,1400]. La zona rural marca 0,1823 [0,1416; 0,2378] contra 0,1216
[0,1062; 0,1384] de la urbana. La zona sur marca 0,1896 [0,1708; 0,2153] contra
0,1017 [0,0872; 0,1213] de la norte. Comparando los mismos remuestreos de años en
ambos estratos, pagado menos municipal da +0,0641 [0,0316; 0,0866], pagado menos
subvencionado +0,0387 [0,0074; 0,0644] y rural menos urbano +0,0607
[0,0253; 0,1130].

El sexo del nacido no cambia nada. La amplitud de los hombres es 0,1275 y la de
las mujeres 0,1298, con una diferencia de -0,0022 [-0,0132; +0,0097] y una
correlación de 0,993 entre ambas curvas. La razón de sexos por mes de concepción
tampoco tiene estacionalidad detectable.

La ruralidad amplifica sin cambiar la forma. La curva rural es 1,446 veces la
nacional [1,236; 1,693] y la urbana 0,942 [0,910; 0,969], con una correlación de
0,954 entre las dos, la misma semana de pico y ningún pico secundario. Un
calendario agrícola propio no aparece. El exceso rural se concentra en febrero y
el déficit en julio.

**La latitud describe una joroba, no una recta.** La escala de cada región contra la
curva nacional, de norte a sur, va así. Tarapacá y Arica 0,182; Antofagasta
0,425; Atacama 0,909; Coquimbo 1,051; Valparaíso 0,942; Metropolitana 0,781;
O'Higgins 1,074; Maule 1,221; Biobío 1,430; Araucanía 1,759; Los Lagos y Los Ríos
1,497; Aysén 0,924; Magallanes 0,783. Entre las 11 regiones continentales, sin
Aysén ni Magallanes, la correlación de rango entre amplitud y latitud es 0,927
con p de 4,0e-5. Al agregar las dos regiones australes cae a 0,527 con p de
0,064. La reversión austral no es ruido: la diferencia de escalas entre el sur y
la zona austral es 0,636 [0,366; 0,931]. Por eso esta página no publica una
pendiente por grado de latitud: ajustar una recta a 13 puntos que forman una
joroba entrega un número que cambia según cómo se ponderen las regiones.

Un forzante monótono con la latitud, como el fotoperíodo, no puede producir una
reversión a los 45 grados sur. La ruralidad sigue siendo un confusor fuerte. El
cruce entre zona y ruralidad muestra que el exceso del sur es territorial y no de
composición: el sur urbano, con escala 1,413, ya supera con holgura al centro
urbano, con 0,857. Dentro del centro, en cambio, lo rural no se distingue de lo
urbano.

**Un rasgo propio del particular pagado.** Su curva tiene un valle profundo a
fines de mayo, en las semanas 21 a 23, de -0,0569 contra el municipal. En
nacimientos eso corresponde a un déficit de febrero. El hecho no depende del
modelo. En el índice mensual crudo, sin ajuste ni deconvolución, febrero de
pagado menos municipal da -0,0662, con error estándar entre cohortes de 0,0095 y
t de -6,99. Es negativo en 18 de las 19 cohortes y no aparece en enero ni en
diciembre. El déficit dura cuatro semanas sin exceso vecino, de modo que no es
reprogramación de partos, que mueve días y no semanas.

La interpretación queda abierta entre dos lecturas y el dato no separa una de la
otra. La primera es concepción evitada, es decir no querer parir en febrero. La
segunda es selección por fecha de nacimiento en la admisión a colegios pagados:
con corte al 31 de marzo, los nacidos en verano son los menores del curso.

### [F8] Heterogeneidad por estrato

Ubicación: después del primer bloque de amplitudes.

**Texto alternativo.** A la izquierda, pequeños múltiplos con la curva semanal de
concepción de cada grupo y su banda de confianza: las tres dependencias del
colegio, rural contra urbano y las zonas. Todas tienen la misma forma y el mismo
máximo de fin de año, y se diferencian en la profundidad del valle. En la curva
del particular pagado se marca un valle adicional a fines de mayo. A la derecha,
un gráfico de puntos con las 13 regiones ordenadas de norte a sur según su escala
contra la curva nacional: los valores suben de forma sostenida desde el norte
hasta la Araucanía y luego caen en Aysén y Magallanes, formando una joroba.

**Pie de figura.** Izquierda: curvas semanales de concepción por estrato, con
IC95. Derecha: escala de cada región contra la curva nacional, ordenadas de norte
a sur. La forma es una joroba con máximo en la Araucanía y reversión en las dos
regiones australes, no una recta. Por eso no se publica una pendiente por grado
de latitud.

**Versión sin JavaScript.** Dos tablas. La primera con estrato, amplitud e IC95,
ocho filas. La segunda con las 13 regiones de norte a sur, escala contra la
nacional e IC95. Antes de las tablas:

> El máximo de fin de año es el mismo en todos los grupos. Lo que cambia es la
> amplitud: 0,1780 en particular pagado contra 0,1139 en municipal, 0,1823 en
> zona rural contra 0,1216 en urbana, y 0,1896 en la zona sur contra 0,1017 en la
> norte. Entre las 11 regiones continentales la amplitud crece de forma monótona
> con la latitud, con una correlación de rango de 0,927, y se revierte en Aysén y
> Magallanes.

---

## 06 · Noventa años

**Título de sección.** 06 · Noventa años

**Bajada de sección.** El calendario de los nacimientos chilenos se fue aplanando
durante casi un siglo. Y después de 2010 dejó de tener la forma que esta página
describe.

**Cuerpo.**

Empalmando fuentes escolares antiguas con los registros modernos se puede seguir
la estacionalidad de los nacimientos desde 1930 hasta 2023. La medida es la
semi-amplitud del primer armónico del año. Entre los nacidos en los años treinta
era 10,84% [7,86; 14,22]. En los cuarenta 9,21% [7,52; 10,83] y en los cincuenta
9,48% [8,09; 10,99]. Después cae: 5,10% en los sesenta [4,05; 6,56], 6,73% en los
setenta [5,66; 7,97] y 5,11% en los ochenta [3,72; 6,84]. En los registros
vitales la caída sigue: 3,21% entre 1992 y 1999 [2,61; 4,09], 2,19% entre 2000 y
2009 [1,29; 3,18], 1,69% entre 2010 y 2019 [1,12; 2,40] y 1,73% entre 2020 y 2023
[0,49; 4,01].

La estacionalidad era 1,68 veces mayor entre 1930 y 1959 que entre 1960 y 1989
[1,40; 2,04], y la caída ocurre entre los nacidos en los cincuenta y los nacidos
en los sesenta. Antes de 1989 el nivel queda acotado y no fijado: las fuentes
escolares antiguas dan una cota baja y la educación de adultos una cota alta, y
para los sesenta esas cotas son 5,1% y 11,4%. El máximo de concepción, en cambio,
se mantiene en enero durante setenta años, de 1930 a 2003, con un margen de unas
dos semanas.

Dentro de la ventana principal el aplanamiento también se ve, y ahí hay que
descontar algo. La amplitud de concepción pasa de 0,1622 [0,1487; 0,1778] en las
cohortes 1989 a 1995, a 0,1304 [0,1088; 0,1582] en 1996 a 2002 y a 0,1009
[0,0908; 0,1262] en 2003 a 2007. La diferencia entre el último y el primer
período es -0,0613 [-0,0821; -0,0294]. Lo que se rellena es el valle de julio.

El descuento es que una parte de esa caída es cobertura de la fuente escolar y no
población. En la fuente escolar la escala cae 4,17% por año, con error estándar
de 0,82 y p menor a 0,0001. En los registros vitales cae 2,36% por año, con
error estándar de 1,28 y p de 0,086. La diferencia entre ambas pendientes es
significativa. El fenómeno es real, y está sobreestimado entre un cuarto y la
mitad según la métrica que se use.

**La respuesta de esta página no describe al Chile de hoy.** En los registros
vitales, el pico de septiembre dejó de ser el máximo anual: la probabilidad de
que septiembre sea el mes con más nacimientos es 1,00 entre 1993 y 1999, 1,00
entre 2000 y 2009 y 0,08 entre 2010 y 2019. El rasgo local no desapareció, lo que
cambió es el fondo: enero a marzo suben 3,20 puntos y octubre a diciembre bajan.
Leído como concepciones, el máximo de diciembre y enero bajó de 104,97 a 100,44 y
el máximo anual se corrió a mayo o junio, sin que el orden entre esos dos meses
sea robusto al método. Todo lo que dice esta página vale para las cohortes 1989 a
2007.

### [F9] Noventa años de estacionalidad

Ubicación: después del primer párrafo del cuerpo.

**Texto alternativo.** Serie de la semi-amplitud estacional de los nacimientos
chilenos por tramo, desde la década de 1930 hasta 2023, con color por fuente y
barras de confianza. El valor parte alrededor de 10% en los años treinta a
cincuenta, cae de forma marcada hacia los años sesenta, sigue bajando de manera
sostenida y llega bajo 2% en los tramos más recientes. Un panel gemelo muestra el
índice mensual de concepciones por período: en los períodos antiguos el máximo
está en diciembre y enero, y en el período más reciente el máximo se corre hacia
mayo y junio.

**Pie de figura.** Semi-amplitud del primer armónico anual de nacimientos, por
tramo y por fuente, con IC bootstrap por año. La banda marca el error sistemático
entre fuentes, de cerca de un punto en los noventa por la rampa de cobertura y de
hasta seis puntos antes de 1980 por selección. Panel gemelo: índice mensual de
concepciones por período en registros vitales, donde el máximo se corre de enero
a mayo y junio después de 2008.

**Versión sin JavaScript.** Tabla con tramo, fuente, semi-amplitud e IC95, más
este párrafo:

> La estacionalidad de los nacimientos chilenos bajó de cerca de 10% en las
> cohortes de 1930 a 1959 a menos de 2% en 2010 a 2019. Era 1,68 veces mayor
> entre 1930 y 1959 que entre 1960 y 1989. En los registros vitales, la
> probabilidad de que septiembre sea el mes con más nacimientos pasa de 1,00
> entre 1993 y 2009 a 0,08 entre 2010 y 2019, y el máximo de concepciones se
> corre a mayo o junio.

---

## 07 · Método, datos y límites

**Título de sección.** 07 · Método, datos y límites

**Bajada de sección.** Qué se midió, con qué, contra qué se verificó y qué queda
fuera del alcance de estos datos.

**Cuerpo.**

**La fuente.** La población son 5.073.711 personas nacidas en Chile entre el 1 de
enero de 1989 y el 31 de diciembre de 2007 que llegaron a matricularse en el
sistema escolar. Están identificadas de forma única en los registros de matrícula
2004 a 2014 y rendimiento 2002 a 2014 del Ministerio de Educación. No son todos los
nacidos vivos: faltan los fallecidos en la infancia y los emigrados, y sobran
inmigrantes e inscripciones tardías. La cohorte 2008 se excluye porque su
cobertura cae dentro del año por el corte de edad escolar.

**Por qué esta fuente y no los registros vitales.** Porque tiene fecha exacta de
nacimiento para cinco millones de personas a lo largo de 19 años seguidos, que es
lo que el análisis diario necesita. Los registros vitales aportan lo que a esta
fuente le falta: la distribución de duración de la gestación y una verificación
externa.

**Qué se estima.** Un modelo lineal generalizado cuasi-Poisson separa el efecto
del día de la semana, estimado año por año, y el del feriado, estimado por fecha
real, de la estacionalidad suave del año. La serie limpia resultante se
deconvoluciona con la distribución de días entre concepción y parto medida en los
registros vitales, de media 260,3 días y desvío 12,5 días, para obtener un índice
diario de concepción que después se agrega por semana.

**La verificación externa.** El índice mensual de esta fuente reproduce el de los
registros vitales con una correlación de 0,9431 [0,914; 0,971] sobre 16 años y
192 meses. El error absoluto medio es 0,724% y el RMSE 1,129%, contra un desvío
del índice de referencia de 3,14%. El ajuste mejora con la cohorte: 1,85% de
error en 1992 y entre 0,17% y 0,29% en 2003 a 2005. En los días de 1999, 2000,
2002 y 2003 los conteos diarios de ambas fuentes son casi idénticos, con una
correlación de niveles de 0,99737 [0,9971; 0,9976]. El desvío de la log razón
diaria entre fuentes es 1,44%, contra 5,5% que se esperaría de dos muestras
independientes: son las mismas personas.

**El sesgo conocido de la fuente y su signo.** La fuente escolar tiene
proporcionalmente más nacimientos de fin de semana y feriado que los registros
vitales. Por eso subestima la amplitud del efecto de día de semana en 0,67 puntos
y subestima el piso de partos con fecha elegida en 0,84 puntos [0,60; 1,14]. Es un sesgo conservador: atenúa todos los efectos de programación
sin cambiar ninguna conclusión. No se detecta selección contra prematuros, y ese
control solo descarta una pérdida mayor al 11% de ellos.

**Qué recupera el método y qué atenúa.** Contra la verdad conocida de los
registros vitales 1999 a 2003, la deconvolución recupera la curva semanal con
correlación 0,877 y RMSE 0,0156. Acierta la semana del pico y lo atenúa: devuelve
71,7% del exceso de la semana 52 y 65,3% del de la semana 1, es decir alrededor
de 28% de atenuación del pico. El RMSE del método no se distingue del piso de
ruido de la propia verdad. A escala de resolución, un impulso de un día o de una
semana vuelve como una campana de 25 a 26 días de ancho a media altura. Dos picos
de una semana se separan solo si distan 35 días o más. El método no
recupera rasgos de concepción a escala de día.

**Los cuatro supuestos declarados.**

1. **Un feriado solo redistribuye partos.** El ajuste reescala dentro de cada
   ventana de feriado para conservar el total. Ese supuesto no está verificado.
   Con un fondo estacional de 6 armónicos, la ventana de Año Nuevo muestra un
   déficit de 287 partos por año, a 7,7 errores estándar, que lo contradice. Con
   los 14 armónicos del modelo base el mismo déficit cae a 1,6 errores estándar.
   Es una decisión de modelamiento cuya evidencia depende de la especificación.
2. **La distribución de duración de la gestación se toma como fija.** No lo es.
   Su estacionalidad medida, de 0,644 días de rango entre máximo y mínimo,
   propagada por el mismo solver, mueve la curva semanal de concepciones entre
   0,914% y 1,703%, contra un semiancho de IC95 medio de 0,770%. El sesgo por
   núcleo fijo es del mismo orden que la banda publicada y no está dentro de
   ella.
3. **El efecto de día de semana se estima por año, sin estructura estacional
   dentro del año.** El desvío entre las 52 semanas del residuo medio por día de
   la semana es 1,53 puntos en sábado y 1,39 en domingo, contra 1,06 a 1,19 en
   días hábiles, y los sábados de febrero quedan entre -2,0% y -3,7%. El error
   estándar del modelo subestima la incertidumbre de cualquier afirmación sobre
   un día de la semana en una semana concreta del año.
4. **La banda de confianza publicada no tiene cobertura nominal.** El IC95
   bootstrap por año cubre la verdad en 61,5% de las semanas contra los registros
   vitales 1999 a 2003, y en 60,8% en simulación nula. Captura la variación entre
   años y no el sesgo de regularización ni el del tratamiento de feriados.

**Lo que estos datos no permiten concluir.**

- **La cesárea no se mide acá.** Los agregados de registros vitales disponibles
  no traen vía de parto. Todo lo que esta página dice sobre programación de
  partos se apoya en el déficit de domingo, en el gradiente por dependencia del
  colegio y en la literatura clínica, y es una atribución plausible, no una
  medición.
- **La pérdida fetal temprana no está en los datos.** Sobre la mortinatalidad
  tardía sí hay una cota. Con una tasa de 3,79 por 1.000 nacidos vivos y una
  variación estacional estimada de 11,0% entre pico y valle, el efecto sobre los
  nacidos vivos es de 0,042 puntos porcentuales, es decir 0,31% de la amplitud
  semanal de concepción. Aun con un escenario deliberadamente generoso la cota no
  pasa de 7,0%. Sobre la pérdida anterior a la semana 20, que es donde ocurre la
  mayor parte del desgaste, no hay ningún dato.
- **Si el largo del descanso de Fiestas Patrias cambia las concepciones no se
  sabe.** En nacimientos la relación con el largo del descanso sí es sólida y
  está en la sección 03. En concepciones, la pendiente estimada año a año es
  -3,1% por día con IC95 de -25,0 a +18,9 y p de 0,77, y la variante con nivel
  local da +11,3% con IC95 de -14,3 a +36,8. La potencia solo alcanza para
  detectar efectos de 31% por día. El dato no permite concluir en ninguna
  dirección.
- **La duración de la gestación es estacional y el lado no está identificado.**
  El ciclo existe por mes de concepción, pero la atenuación del armónico anual
  por el núcleo es de solo 2,3%, así que ver la serie aplanarse al indexar por
  mes de concepción no prueba nada sobre de qué lado está el efecto.

**Dos resultados sugerentes que no son titular.**

- **Un exceso de concepciones concentrado en los días de fin de año, por encima
  del pico estacional ancho.** El pico estacional de la quincena no está en duda.
  Lo que no está identificado es un exceso adicional encima de él. El tamaño
  estimado depende por completo de cuántos armónicos tenga el fondo estacional:
  2,39 días-equivalentes con 6 armónicos, 0,82 con 8 y 0,39 con los 14 del modelo
  base. La diferencia entre las dos primeras especificaciones supera el error
  estándar de cualquiera de ellas.

  Hay tres razones más para no titular con una cifra. El máximo local de la curva
  de placebo cae el 28 y 29 de diciembre y no en las fechas señaladas. Las
  plantillas de Navidad y Año Nuevo están correlacionadas 0,815, de modo que el
  dato no las separa. Y la segunda mayor estructura de toda la curva de placebo
  aparece el 9 y 10 de abril, una fecha sin significado cuyos nacimientos caen
  justo sobre las ventanas de feriado de fin de año.

  La evidencia más limpia a favor de un exceso real viene de otro diseño: el
  cruce de microdatos de registros vitales 1999 a 2003 por semanas de gestación.
  Ese cruce estima entre 1,0 y 1,3 días-equivalentes entre el 24 de diciembre y
  el 6 de enero. **Esa cifra proviene de una verificación independiente y no está
  replicada en el análisis principal.**
- **El 14 de febrero mueve nacimientos, no concepciones.** Tiene +4,80% de
  nacimientos respecto del mismo día de la semana del mismo año en la misma
  posición estacional [+2,26; +7,40], sobre 19 ocurrencias y 14.613 nacimientos,
  y se replica en los registros vitales. No sobrevive la corrección por
  multiplicidad: en un barrido de los 365 días del año, su p familywise es 0,61.
  Lo que lo sostiene es estar preespecificado como fecha civil antes de mirar los
  datos, más la réplica externa y la estabilidad año a año. Es sugerente, no más.
  Y no pasa a concepciones: para producir un pico de nacimientos de un solo día
  de +4,80% haría falta un pulso de concepciones de +117% ese día, y el bulto
  resultante duraría unos 49 días.

**Qué haría falta para responder esto sobre el Chile de hoy.** La ventana de este
análisis termina en 2007 porque la cobertura de la fuente escolar se derrumba
después: la razón contra los nacidos vivos pasa de 0,980 en 2008 a 0,885 en 2009
y a 0,481 en 2010. Lo que este análisis pudo usar para los años posteriores es
mensual, y una serie mensual no permite separar el día de la semana del feriado
ni deconvolucionar a escala de semana. El camino para extender la respuesta a las
cohortes posteriores a 2010 es una solicitud por Ley de Transparencia de la serie
diaria de nacimientos al Departamento de Estadísticas e Información de Salud o al
Servicio de Registro Civil e Identificación.

---

## Nota de cierre, para el pie de la página

Publicado por Compañía Chilena de Inteligencia de Datos. Análisis sobre 5.073.711 nacimientos con fecha exacta,
cohortes 1989 a 2007, con verificación externa contra los registros vitales. Toda
cifra de esta página tiene su origen declarado en la sección 07. Las cifras
referidas a concepciones son semanales; las referidas a fechas concretas son de
nacimientos.

---

## Procedencia

Mapa de cada cifra publicada a su origen. `S<n>` es la sección de `SINTESIS.md`.
Las claves de `pagina.json` son las documentadas en la sección 6 de
`SINTESIS.md`.

| Cifra publicada | Origen |
|---|---|
| 5.073.711 nacimientos, cohortes 1989 a 2007 | S: encabezado, "Población" |
| 260,3 días de media, 12,5 de desvío; 4,1% de masa en el día modal | S: encabezado, "Qué se estima" y regla de lectura |
| Semana 52 +8,71% [+7,74; +9,75] | S1 tabla; `concepcion.semanal` índice 51 |
| Semana 1 +8,47% [+7,44; +9,69] | S1 tabla; `concepcion.semanal` índice 0 |
| Semana 51 +6,59% [+5,84; +7,33] | S1 tabla; `concepcion.semanal` índice 50 |
| Semana 2 +6,52% [+5,44; +7,77] | `concepcion.semanal.desv_lo/desv_hi` índice 1 |
| Duelo 52 contra 1: 0,24 pp [-0,14; +0,58], p 0,892 y 0,107 | S1; `concepcion.ranking.duelo_max` |
| 21 variantes y 400 de 400 bootstrap dentro de la quincena | S1 y S3.1 |
| Semana 34 -4,61% [-5,25; -3,97]; 29 -4,48%; 30 -4,43% | S1 tabla; `concepcion.semanal` |
| Bootstrap del mínimo 0,588 / 0,225 / 0,172 | S1; `metodo.boot_sem_valle` |
| Variantes del mínimo 15 / 4 / 1 / 1 | S1 |
| Curva entre 0,954 y 1,000 de la semana 20 a la 47 | S1 |
| Amplitud 13,32 pp; 47 de 52 semanas significativas | S1; `concepcion.amplitud_semanal_pct`, `n_semanas_significativas` |
| Ranking mensual de concepción | S1; `concepcion.mensual` |
| Robustez mensual dentro de 0,8 puntos sin deconvolución | S1 |
| Semana 38 en +0,01% [-0,67; +0,63] | S1 y S3.2 |
| Resolución: campana de 25 a 26 días, 79% a 84% de masa, 35 días de separación | S5.2 |
| Amplitud mínima detectable +3,4% y +4,1% semanal, +25% a +29% diaria | S5.2 |
| Recuperación del pico 71,7% y 65,3% | S5.2 |
| r 0,877 y RMSE 0,0156 contra verdad; piso de ruido 0,021 y 0,010 a 0,015 | S5.2 |
| Probabilidades por día de la semana y sus razones | S2.1 |
| Piso de partos con fecha elegida: 28,92%, 22,20% a 34,56%, +0,62 pp/año | S2.1; `dia_semana.f_por_anio` |
| Cuatro retrocesos en 1999, 2000, 2001 y 2007 | S2.1 y S7 item 5 |
| Quinquenios 0,2447 / 0,2882 / 0,3053 / 0,3387 | S2.1 |
| Razones por semana de gestación y descomposición del déficit | S2.1 |
| Piso por dependencia, rural, urbano; placebo de sexo | S2.1 |
| Feriado por día de semana, de -34,4% a -0,8% | S2.2; `feriados.dia0_por_dow` |
| Feriado en domingo pequeño, -1% a -4%; fin de semana -3,8% | S2.2 y S7 item 3 |
| Día 0 feriado por feriado y promedio de menores -22,0% | S2.2; `feriados.dia0_menores_promedio` |
| Víspera +6,6%; día siguiente +0,8%; lunes sándwich -5,6 pp; sábado -6,1% | S2.2 |
| 24 y 31 de diciembre; rebote del 26 y 27 y del 3 al 5 de enero | S2.2 |
| Traslados a lunes; 11 de septiembre -8,1% | S2.2 |
| Feriado menor por período: -24,1%, -30,0%, -32,0% | S2.2 |
| Semana Santa: -27,4%, -12,2%, -3,2%, adelanto de lunes a jueves | S2.3; `feriados.semana_santa_*` |
| Fiestas Patrias: 0,642 y 0,928 días-equivalentes, 507 nacimientos | S2.4; `fiestas_patrias` |
| Dosis del descanso en nacimientos: -0,175/día, p 0,00015, grupos 2 a 5 | S2.4 |
| 18 y 19 de septiembre en -28,0% y -29,1% | S2.4 |
| 27 de diciembre: 16.886 personas, 1 de cada 300,5 | S2.5; `cumpleanos.tabla` |
| Bloque de septiembre y lista de los diez menos comunes | S2.5 |
| Razón 1,823 entre el día más y el menos común | S2.5 |
| 29 de febrero: 1 de cada 1.780 [1.498; 2.206] | S2.5 |
| IC de fecha no feriada de más o menos 0,09 en índice | S2.5 |
| 18 y 19 de septiembre limpios en 1,100 y 1,097; +0,024 y +0,020 | S2.5 y S7 item 1 |
| 187 fechas con coeficiente de feriado, 178 limpias; máximo 28-sep a 1-oct | S2.5; `cumpleanos.n_fechas_sin_coef_feriado` |
| Día 1 sin acumulación; excepciones de enero, mayo y noviembre | S2.6 |
| Día 13 -1,84%; martes y viernes 13 sin extra | S2.6 y S7 item 6 |
| Día 31 -3,87%; el déficit también está en registros vitales | S2.6 y S0 E2, S7 item 7 |
| Pico en la semana 52 o 1 en los 16 estratos; borrado de septiembre | S4.1 |
| Amplitudes por estrato y diferencias pareadas | S4.2; `estratos.curvas`, `estratos.comparaciones` |
| Sexo: 0,1275 y 0,1298, diferencia -0,0022, r 0,993 | S4.2 |
| Rural 1,446 y urbano 0,942, r 0,954 | S4.2 |
| Valle de fines de mayo del pagado: -0,0569; crudo -0,0662, t -6,99 | S4.2 |
| Escalas de las 13 regiones | S4.3; `estratos.regiones` |
| Spearman 0,927 sobre 11 continentales; 0,527 con las australes | S4.3 |
| Sur menos austral 0,636 [0,366; 0,931] | S4.3 |
| Sur urbano 1,413 contra centro urbano 0,857 | S4.3 |
| Amplitud por período: 0,1622 / 0,1304 / 0,1009; diferencia -0,0613 | S4.4 |
| Pendientes de cobertura: -4,17%/año y -2,36%/año | S4.4 |
| Tabla de semi-amplitud 1930 a 2023 | S4.5; `serie_larga.empalme` |
| Razón 1,68 [1,40; 2,04]; cotas 5,1% y 11,4% | S4.5 |
| Máximo de concepción en enero durante setenta años | S4.5 |
| Probabilidad de septiembre como mes máximo: 1,00 / 1,00 / 0,08 | S4.5 |
| Máximo de 104,97 a 100,44; corrimiento a mayo o junio | S4.5 |
| Validación mensual r 0,9431 y diaria r 0,99737; log razón 1,44% | S5.1; `metodo.validacion_deis` |
| Sesgo de fin de semana: 0,67 y 0,84 puntos | S5.1 |
| Prematuros: descarta pérdida mayor al 11% | S5.1 |
| Cobertura 0,980 en 2008, 0,885 en 2009, 0,481 en 2010 | S5.1 |
| Los cuatro supuestos declarados | S0, "Supuestos de modelado que la página debe declarar" |
| Cobertura del IC95 de 61,5% y 60,8% | S0 supuesto 4 |
| Cesárea no medible | S5.3 |
| Mortinatalidad tardía: 3,79 por 1.000, 0,042 pp, cota 7,0% | S5.3 |
| Pérdida fetal antes de la semana 20 sin datos | S5.3 |
| Dosis en concepciones: -3,1% [-25,0; +18,9], p 0,77, potencia 31% | S3.2 |
| Estacionalidad de la duración: atenuación de 2,3% | S5.3 |
| Pulso de fin de año: 2,39 / 0,82 / 0,39 días-equivalentes | S3.1 |
| Placebo del 28 y 29 de diciembre; correlación 0,815; 9 y 10 de abril | S3.1 |
| Cruce de registros vitales: 1,0 a 1,3 días-equivalentes, citado | S3.1 |
| 14 de febrero: +4,80% [+2,26; +7,40], p familywise 0,61, +117% | S3.5 |

**Lo que se dejó fuera a propósito.** Ninguna afirmación de la sección 7 de
`SINTESIS.md` aparece en el texto como hallazgo. La lista de exclusiones es:

- Ranking de cumpleaños limpios, y el 18 de septiembre como el primero de ese
  ranking.
- Crecimiento año a año del déficit de fin de semana.
- El déficit del día 13 como superstición chilena.
- El déficit del día 31 como error de digitación de la fuente escolar.
- El feriado en domingo como efecto nulo.
- La fracción de partos recuperados después de un feriado.
- El pulso de fin de año descrito como estrecho, o con cifra de titular.
- Una pendiente por grado de latitud.
- Rebote de partos después de Fiestas Patrias.
- Efecto de los fines de semana largos de la ley 19.668 sobre concepciones.
- El 29 de febrero, el 1 de enero de 2000, el Mundial de 1998, la Teletón, los
  apagones, la luna llena y el día de pago como hallazgos de concepción.

---

## Verificación de prosa

Comando ejecutado sobre este archivo:

```
prosa-lint docs/concepciones-copy.md
```

Resultado, con el texto de recomendación repetido recortado de cada línea:

```

docs/concepciones-copy.md · 9770 palabras · 605 oraciones
  · P11 oración larga ×27
      L110: "Lo que el dato identifica es la quincena del 24 de diciembre al 7 de enero, y lo" → Oración de 42 palabras (máx 40 en modo prosa).
      L119: "La curva queda entre 0,954 y 1,000 desde la semana 20 hasta la 47, y el bootstra" → Oración de 41 palabras (máx 40 en modo prosa).
      L131: "Por mes de concepción, de mayor a menor: enero +5,27%, diciembre +4,42%, febrero" → Oración de 45 palabras (máx 40 en modo prosa).
      L176: "El > mínimo medido está en la semana 34, del 20 al 26 de agosto, con -4,61%, den" → Oración de 45 palabras (máx 40 en modo prosa).
      L219: "Contra la verdad medida en DEIS 1999 a 2003, donde la concepción se puede fechar" → Oración de 43 palabras (máx 40 en modo prosa).
      L299: "Crece en los cuatro quinquenios, con valores de 0,2447, 0,2882, 0,3053 y 0,3387," → Oración de 41 palabras (máx 40 en modo prosa).
      L304: "En los microdatos de DEIS 1999 a 2003, la razón entre partos de domingo y de día" → Oración de 46 palabras (máx 40 en modo prosa).
      L321: "Un feriado en lunes tiene -34,4% de nacimientos [-36,4; -32,3]; en martes -32,0%" → Oración de 42 palabras (máx 40 en modo prosa).
      L323: "El feriado en domingo no es nulo, es pequeño, del orden de -1% a -4%: el GLM no " → Oración de 46 palabras (máx 40 en modo prosa).
      L331: "Son el 25 de diciembre con -34,3% [-39,0; -29,2], el 19 de septiembre con -33,0%" → Oración de 46 palabras (máx 40 en modo prosa).
      L515: "El orden dentro de cada grupo no lo es: el intervalo de confianza de una fecha q" → Oración de 41 palabras (máx 40 en modo prosa).
      L534: "Sobre las 178 fechas que nunca reciben coeficiente de feriado en ningún año, el " → Oración de 48 palabras (máx 40 en modo prosa).
      L539: "La razón entre el día 01 y los días 02 a 28 está entre 0,97 y 1,03 en todo el añ" → Oración de 43 palabras (máx 40 en modo prosa).
      L555: "En el calendario crudo, de la izquierda, el 27 de diciembre es la casilla más os" → Oración de 41 palabras (máx 40 en modo prosa).
      L623: "Tarapacá y Arica 0,182; Antofagasta 0,425; Atacama 0,909; Coquimbo 1,051; Valpar" → Oración de 46 palabras (máx 40 en modo prosa).
      L663: "A la derecha, un gráfico de puntos con las 13 regiones ordenadas de norte a sur " → Oración de 45 palabras (máx 40 en modo prosa).
      L702: "En los registros vitales la caída sigue: 3,21% entre 1992 y 1999 [2,61; 4,09], 2" → Oración de 48 palabras (máx 40 en modo prosa).
      L716: "La amplitud de concepción pasa de 0,1622 [0,1487; 0,1778] en las cohortes 1989 a" → Oración de 41 palabras (máx 40 en modo prosa).
      L728: "En los registros vitales, el pico de septiembre dejó de ser el máximo anual: la " → Oración de 45 palabras (máx 40 en modo prosa).
      L763: "En los registros vitales, la > probabilidad de que septiembre sea el mes con más" → Oración de 41 palabras (máx 40 en modo prosa).
      L795: "La serie limpia resultante se deconvoluciona con la distribución de días entre c" → Oración de 43 palabras (máx 40 en modo prosa).
      L842: "El desvío entre las 52 semanas del residuo medio por día de la semana es 1,53 pu" → Oración de 46 palabras (máx 40 en modo prosa).
      L860: "Con una tasa de 3,79 por 1.000 nacidos vivos y una variación estacional estimada" → Oración de 45 palabras (máx 40 en modo prosa).
      L868: "En concepciones, la pendiente estimada año a año es -3,1% por día con IC95 de -2" → Oración de 43 palabras (máx 40 en modo prosa).
      L874: "El ciclo existe por mes de concepción, pero la atenuación del armónico anual por" → Oración de 43 palabras (máx 40 en modo prosa).
      L911: "La ventana de este análisis termina en 2007 porque la cobertura de la fuente esc" → Oración de 41 palabras (máx 40 en modo prosa).
      L916: "El camino para extender la respuesta a las cohortes posteriores a 2010 es una so" → Oración de 41 palabras (máx 40 en modo prosa).
  score 0.28 viol/100 palabras (0 bloqueantes, 27 avisos)
```

Cero violaciones bloqueantes. Los 27 avisos P11 son oraciones de 41 a 48 palabras,
casi todas enumeraciones de cifras con su intervalo de confianza. Partirlas más
obligaría a separar una cifra de su intervalo o a repetir el sujeto, y ninguna de
las dos cosas mejora el texto. Quien edite este documento debe volver a correr
`prosa-lint docs/concepciones-copy.md` y dejar el resultado actualizado acá.
