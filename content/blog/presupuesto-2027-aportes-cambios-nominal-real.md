---
titulo: Presupuesto 2027: qué cambia en los aportes fiscales y cuánto pesan los precios
slug: presupuesto-2027-aportes-cambios-nominal-real
fecha: 2026-10-05
autor: Equipo Compañía Chilena de Inteligencia de Datos
resumen: Los aportes fiscales libres suben 2,16% nominal. Revisamos sus 32 partidas, el traslado de Gendarmería y las líneas de empleo que cambian.
descripcion: Comparación del proyecto oficial de Presupuesto 2027 con la ley inicial 2026: cifras, gráficos, inflación hipotética, cambios de perímetro y continuidad de programas.
ruta: /blog/presupuesto-2027-aportes-cambios-nominal-real/
tipo: analisis
dominio: finanzas-publicas
etiquetas: [presupuesto, dipres, finanzas-publicas, ley-de-presupuestos]
datos: []
imagen: null
borrador: false
---

El proyecto oficial de Presupuesto 2027 propone **$71,17 billones de aporte fiscal libre en moneda nacional**, frente a $69,67 billones de la ley inicial 2026. Son $1,50 billones adicionales y un aumento nominal de **2,16%**. Con una inflación hipotética de 3%, ese financiamiento perdería **0,82% de poder de compra**. La comparación de las 32 partidas permite distinguir aumentos, reducciones y cambios de ubicación institucional.

:::aviso
Corte: 5 de octubre de 2026. El documento de la Cámara es el proyecto oficial en tramitación. Las cifras corresponden al aporte fiscal libre del Tesoro, no al gasto total del Gobierno Central ni al presupuesto completo de cada ministerio. Todos los valores reales de esta entrada son escenarios con inflación hipotética, no inflación observada de 2027.
:::

## Cinco hallazgos para leer la propuesta

- **Educación y Trabajo aumentan su financiamiento fiscal libre**: 5,32% y 3,89% nominal, respectivamente. Con inflación de 3%, los aumentos serían 2,25% y 0,86% en poder de compra.
- **Salud recibe 1,20% más pesos**, pero ese aporte perdería 1,75% de poder de compra bajo el mismo supuesto. Obras Públicas aumenta 2,81% nominal y quedaría prácticamente estable en términos reales, con una variación de -0,19%.
- **Vivienda presenta una reducción de 20,17% en este componente de financiamiento**. Culturas disminuye 16,37%, Energía 10,54% y Ciencia 5,01%. Estas variaciones requieren contrastar los ingresos restantes y el gasto de cada partida antes de atribuirlas a prestaciones concretas.
- **Seguridad cambia de perímetro**. Su comparación directa arroja +44,34%, pero incluye a Gendarmería en 2027. Comparando Seguridad y Gendarmería en ambos años, el aumento es 12,11% nominal.
- **En empleo hay líneas que cambian, aparecen o dejan de figurar**. La propuesta incorpora una asignación para el Subsidio Unificado de Empleo; conserva Inversión en la Comunidad y no muestra la asignación de Empleabilidad Sostenida en el cuadro de Proempleo revisado.

Fuente de la comparación: [Tesoro Público, proyecto 2027, programa 50/01/05, páginas 29 a 36 del PDF](https://www.camara.cl/legislacion/presupuesto/2027/50_TesoroPublico.pdf) y [aporte fiscal libre de la ley inicial 2026](https://www.dipres.gob.cl/597/articles-397421_doc_pdf.pdf).

:::figura
src: /assets/presupuesto-2027/total-aporte.png
alt: El aporte fiscal libre pasa de 69,67 a 71,17 billones nominales. Con inflación hipotética de 3%, equivale a 69,10 billones a precios de 2026.
pie: Financiamiento en moneda nacional. Fuente: DIPRES 2026 y Cámara 2027, programa 50/01/05. Corte: 05-10-2026. El ajuste de precios es un escenario, no una proyección oficial.
ancho: 1440
alto: 648
:::

## Nominal y real: qué estamos calculando

La variación nominal compara cantidades de pesos. La variación real estima cuánto cambia su capacidad de compra después de descontar un incremento de precios. Si un aporte sube 2,16% y los precios suben 3%, el aumento de pesos no alcanza para mantener la misma capacidad de compra.

Aplicamos estas fórmulas, sin restar porcentajes como aproximación:

```
Variación nominal = (aporte 2027 / aporte 2026 - 1) × 100
Variación real = (aporte 2027 / aporte 2026 / (1 + inflación) - 1) × 100
```

El año 2027 todavía no ocurre: **no existe un IPC observado para ese año**. Usamos 3% como supuesto ilustrativo y publicamos sensibilidad a 2% y 4%. El [calendario oficial de DIPRES](https://www.dipres.gob.cl/598/w3-article-426537.html) fija la presentación del nuevo Informe de Finanzas Públicas para el 6 de octubre. Este corte no atribuye al informe aún pendiente una proyección que no hemos verificado.

| Inflación hipotética 2027 | Variación nominal del aporte total | Variación real estimada |
| --- | --- | --- |
| 2% | +2,16% | +0,16% |
| 3% | +2,16% | -0,82% |
| 4% | +2,16% | -1,77% |

Estos escenarios miden un ajuste general por precios. Los costos de personal, construcción o equipamiento pueden variar de manera distinta al IPC. Tampoco equivalen a cambios en cobertura, calidad o beneficiarios.

:::figura
src: /assets/presupuesto-2027/sectores-nominal-real.png
alt: Gráfico de variaciones nominales y reales estimadas en once áreas. Vivienda, Culturas, Energía y Ciencia disminuyen; Salud y Obras Públicas aumentan nominalmente pero pierden poder de compra con inflación de 3%. Seguridad usa perímetro constante.
pie: Sectores seleccionados del aporte fiscal libre. Puntos llenos: variación nominal. Puntos vacíos: variación real con inflación hipotética de 3%. La tabla completa y los CSV conservan los importes de origen.
ancho: 1440
alto: 1080
:::

[Descargar el gráfico de sectores en SVG](/assets/presupuesto-2027/sectores-nominal-real.svg) · [Descargar todas las comparaciones en CSV](/assets/presupuesto-2027/comparacion.csv)

## Seguridad: el traslado que infla la comparación directa

En la ley inicial de 2026, Gendarmería figura en Justicia y recibe $681,33 mil millones de aporte fiscal libre. En el proyecto 2027 aparece en Seguridad Pública con $836,36 mil millones. Su traslado cambia la composición de ambas partidas.

La comparación homogénea incorpora a Gendarmería en los dos años:

| Perímetro de comparación | Ley 2026, billones de pesos | Proyecto 2027, billones de pesos | Cambio nominal |
| --- | --- | --- | --- |
| Partida Seguridad, tal como aparece en cada año | 2,37 | 3,42 | +44,34% |
| Seguridad más Gendarmería en ambos años | 3,05 | 3,42 | +12,11% |

Con inflación hipotética de 3%, el segundo aumento equivale a **8,84% real estimado**. La entrada de Gendarmería explica aproximadamente 79,60% de la diferencia nominal entre las partidas de Seguridad sin ajustar el perímetro. Ese porcentaje describe la composición contable; no significa que el gasto de Gendarmería sea nuevo.

Fuentes: [ley 2026, aporte fiscal libre, Justicia y Seguridad](https://www.dipres.gob.cl/597/articles-397421_doc_pdf.pdf), [proyecto 2027, Tesoro Público](https://www.camara.cl/legislacion/presupuesto/2027/50_TesoroPublico.pdf) y [partida Seguridad Pública 2027](https://www.camara.cl/legislacion/presupuesto/2027/32_SegPublica.pdf).

:::figura
src: /assets/presupuesto-2027/seguridad-perimetro.png
alt: El aumento nominal de Seguridad parece de 44,34% al cambiar el perímetro. Comparando Seguridad más Gendarmería en ambos años, es de 12,11%.
pie: Aporte fiscal libre, moneda nacional. La segunda barra incluye a Gendarmería en la base 2026 y en la propuesta 2027. No compara un servicio incorporado con una base que lo omite.
ancho: 1440
alto: 648
:::

## ¿Qué programas desaparecen y cuáles cambian?

Revisamos los cuadros de Presidencia y Trabajo, además del traslado de Gendarmería. **Esta revisión no es un censo de todos los programas del Estado.** La ausencia de una asignación en un cuadro no acredita por sí sola la eliminación jurídica de un beneficio: puede existir financiamiento en otra línea, una transición legal o una reasignación.

| Línea o servicio revisado | Evidencia 2026 | Evidencia del proyecto 2027 | Lectura del cambio |
| --- | --- | --- | --- |
| Gendarmería | Justicia, aporte libre de $681.326,9 millones | Seguridad, $836.360,1 millones | Traslado y cambio de recursos; el servicio sigue figurando |
| Inversión en la Comunidad, Proempleo, 15/01/03/24/03/264 | $22.159,8 millones | $140.403,7 millones | La asignación continúa y aumenta; no está eliminada |
| Empleabilidad Sostenida, Proempleo, 15/01/03/24/03/290 | $1.600,3 millones | La asignación no figura en el cuadro de Proempleo revisado | Línea ausente en ese cuadro; falta conciliar destinos alternativos antes de afirmar cierre del programa |
| Subsidio al Empleo y Subsidio Empleo a la Mujer, SENCE | $74.010,9 millones y $107.738,8 millones | $6.746,4 millones para cada línea; figura además Subsidio Unificado de Empleo por $76.119,9 millones | Cambia la composición del financiamiento; las líneas antiguas conservan asignación |
| Cambio de Mando Presidencial, 01/01/01/24/09/703 | $727,5 millones, con glosa para el primer trimestre 2026 | No figura esa asignación en Presidencia 2027 | Gasto de un evento específico de 2026 que no se repite; no es un programa social eliminado |

El conjunto de subsidios SENCE mencionado pasa de $181.749,7 millones en las dos líneas antiguas a $89.612,6 millones en las tres líneas de 2027: **-50,69% nominal**. Esta comparación acotada no incluye todo SENCE, otras prestaciones de empleo ni recursos administrados por convenio. Requiere revisar reglas de transición y beneficiarios antes de estimar efectos sobre las personas.

:::figura
src: /assets/presupuesto-2027/empleo-lineas.png
alt: Dos asignaciones de subsidios SENCE suman 181,75 mil millones de pesos en la ley 2026. Las dos antiguas más el Subsidio Unificado de Empleo suman 89,61 mil millones en la propuesta 2027, una reducción nominal de 50,69% en ese conjunto.
pie: Asignaciones seleccionadas de SENCE, programa 15/05/04. No es todo el presupuesto de SENCE ni todo el financiamiento del empleo. Fuente: DIPRES 2026 y Cámara 2027.
ancho: 1440
alto: 648
:::

Fuentes: [Proempleo, ley inicial 2026, página 1](https://www.dipres.gob.cl/597/articles-397233_doc_pdf.pdf), [SENCE Empleo, ley inicial 2026, página 1](https://www.dipres.gob.cl/597/articles-397238_doc_pdf.pdf), [Trabajo, proyecto 2027, páginas 10 y 24 del PDF](https://www.camara.cl/legislacion/presupuesto/2027/15_Trabajo.pdf), [Presidencia, ley 2026, páginas 1 y 3](https://www.dipres.gob.cl/597/articles-396957_doc_pdf.pdf) y [Presidencia, proyecto 2027](https://www.camara.cl/legislacion/presupuesto/2027/01_Presidencia.pdf).

## La propuesta aún puede cambiar

El Ejecutivo ingresó el proyecto el 30 de septiembre de 2026. El Congreso debe revisar sus partidas y glosas. Una asignación propuesta tampoco acredita cuánto se ejecutará durante 2027. El análisis conserva separados el proyecto, la ley inicial y la ejecución.

:::figura
src: /assets/presupuesto-2027/tramitacion.svg
alt: El Ejecutivo ingresó el proyecto el 30 de septiembre de 2026. El Congreso lo revisa y la ley aprobada está pendiente al 5 de octubre. El Tesoro financia a los ministerios y ese aporte se cuenta una sola vez.
pie: Diagrama de tramitación y financiamiento. Fuentes: Cámara y calendario DIPRES. Estado al 05-10-2026.
ancho: 900
alto: 540
:::

Consulta los originales en la [página de Presupuesto de la Cámara](https://www.camara.cl/legislacion/Presupuesto.aspx) y sigue las fuentes en el [portal del proyecto 2027](https://datos.cochid.cl/presupuesto/proyecto). Lee también la [noticia con los principales cambios en Periodismo2](https://periodismo2.cl/article/c4eb0791-4c19-59d7-9465-1fc53e25290a).

## Las 32 partidas del aporte fiscal libre

Importes en **billones de pesos chilenos**, equivalentes a 10¹² pesos. Los cálculos usan los enteros originales en miles de pesos, antes de redondear. La variación real usa inflación hipotética de 3%.

| Partida | Ley inicial 2026 | Proyecto 2027 | Nominal | Real, escenario 3% |
| --- | --- | --- | --- | --- |
| 01 · Presidencia | 0,02 | 0,02 | -0,10% | -3,01% |
| 02 · Congreso | 0,18 | 0,19 | +5,58% | +2,50% |
| 03 · Poder Judicial | 0,73 | 0,80 | +9,90% | +6,70% |
| 04 · Contraloría | 0,12 | 0,13 | +11,81% | +8,55% |
| 05 · Interior | 0,62 | 0,65 | +4,50% | +1,45% |
| 06 · Relaciones Exteriores | 0,10 | 0,11 | +3,53% | +0,52% |
| 07 · Economía | 0,31 | 0,32 | +1,73% | -1,23% |
| 08 · Hacienda | 0,64 | 0,63 | -1,02% | -3,90% |
| 09 · Educación | 16,82 | 17,72 | +5,32% | +2,25% |
| 10 · Justicia* | 1,31 | 0,79 | -39,64% | -41,40% |
| 11 · Defensa | 1,54 | 1,65 | +7,28% | +4,16% |
| 12 · Obras Públicas | 3,52 | 3,62 | +2,81% | -0,19% |
| 13 · Agricultura | 0,81 | 0,80 | -1,01% | -3,89% |
| 14 · Bienes Nacionales | 0,01 | 0,01 | +2,88% | -0,12% |
| 15 · Trabajo y Previsión Social | 15,29 | 15,89 | +3,89% | +0,86% |
| 16 · Salud | 13,23 | 13,39 | +1,20% | -1,75% |
| 17 · Minería | 0,05 | 0,05 | +2,17% | -0,81% |
| 18 · Vivienda y Urbanismo | 5,61 | 4,48 | -20,17% | -22,49% |
| 19 · Transportes | 1,85 | 1,88 | +1,85% | -1,12% |
| 20 · Secretaría General de Gobierno | 0,03 | 0,03 | +0,94% | -2,00% |
| 21 · Desarrollo Social y Familia | 1,46 | 1,49 | +2,44% | -0,55% |
| 22 · Secretaría General de la Presidencia | 0,01 | 0,01 | +0,68% | -2,25% |
| 23 · Ministerio Público | 0,28 | 0,32 | +14,42% | +11,09% |
| 24 · Energía | 0,15 | 0,13 | -10,54% | -13,14% |
| 25 · Medio Ambiente | 0,09 | 0,10 | +4,52% | +1,47% |
| 26 · Deporte | 0,17 | 0,24 | +44,94% | +40,72% |
| 27 · Mujer y Equidad de Género | 0,09 | 0,09 | +1,86% | -1,11% |
| 28 · Servicio Electoral | 0,04 | 0,03 | -10,35% | -12,96% |
| 29 · Culturas | 0,52 | 0,44 | -16,37% | -18,81% |
| 30 · Ciencia | 0,57 | 0,54 | -5,01% | -7,78% |
| 31 · Gobiernos Regionales | 1,12 | 1,19 | +6,24% | +3,15% |
| 32 · Seguridad Pública* | 2,37 | 3,42 | +44,34% | +40,14% |

Nota: Justicia y Seguridad cambian de perímetro por Gendarmería. Sus porcentajes directos no son comparaciones homogéneas; consulta el ajuste anterior. La suma nacional conserva una sola cuenta para cada partida.

## Datos y método reproducible

¿Quieres compartir estos hallazgos? Usa el [hilo con textos listos para copiar y gráficos PNG descargables](/blog/presupuesto-2027-aportes-cambios-nominal-real/hilo/).

- **Base:** ley inicial aprobada de 2026, no el proyecto 2026 ni su presupuesto vigente modificado.
- **Propuesta:** cuadro del aporte fiscal libre del Tesoro 2027, programa 50/01/05. Las 32 partidas suman exactamente $69.669.527.710 miles en 2026 y $71.174.286.503 miles en 2027.
- **Monedas:** la columna en miles de dólares se mantiene separada: 329.524 en 2026 y 400.035 en 2027. No se suma a los pesos.
- **Alcance:** financiamiento fiscal libre. No se agrega otra vez al gasto de los ministerios, lo que duplicaría recursos; quedan fuera de este indicador ingresos propios, otros aportes y transferencias.
- **Continuidad:** se distingue traslado, línea ausente en un cuadro, gasto no recurrente y asignación nueva. No publicamos una cantidad nacional de programas eliminados sin una conciliación completa.
- **Corte:** 5 de octubre de 2026. Las fuentes primarias originales quedan enlazadas; los valores 2027 proceden de su texto consultado y se controlaron mediante conciliación de totales.

[Tabla CSV](/assets/presupuesto-2027/comparacion.csv) · [Datos y fuentes en JSON](/assets/presupuesto-2027/comparacion.json) · [Sensibilidad de inflación en CSV](/assets/presupuesto-2027/sensibilidad.csv)
