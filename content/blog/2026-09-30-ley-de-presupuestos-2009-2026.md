---
titulo: La Ley de Presupuestos de 2009 a 2026, línea por línea
slug: ley-de-presupuestos-2009-2026
fecha: 2026-09-30
autor: Equipo COCHID
resumen: Cargamos 152.779 líneas de la Ley de Presupuestos de 18 años, con monto inicial y vigente, y la ejecución observada de cada año desde 2009.
descripcion: COCHID publica 152.779 líneas de la Ley de Presupuestos entre 2009 y 2026 y 665.881 observaciones de ejecución, cada una ligada al archivo original de DIPRES.
ruta: /blog/ley-de-presupuestos-2009-2026/
tipo: datos-nuevos
dominio: presupuesto-gasto-publico
etiquetas: [presupuesto, dipres, ley-de-presupuestos, ejecucion]
datos: [dataset:dipres_ley_linea, dataset:dipres_ejecucion_linea]
imagen: /blog/ley-de-presupuestos-2009-2026/portada.png
tiempo_lectura: auto
borrador: false
---

<!-- Nota: el id de dominio `presupuesto-gasto-publico` es provisional hasta que destinos.json fije los ids (SPEC §2.4 y §6.3). La imagen de portada está por producir. -->

El 30 de septiembre de 2026 terminamos de cargar la Ley de Presupuestos del Sector Público de 2009 a 2026: **152.779 líneas en 18 años**. Cada línea trae el monto de la ley inicial y el monto vigente, y conserva el archivo y la fila de la que salió.

:::cifras
- 152.779 líneas de la Ley de Presupuestos, 2009 a 2026
- 18 años con al menos una línea de gasto distinta de cero
- 665.881 observaciones de ejecución presupuestaria, 2009 a 2026
:::

Fuente: Dirección de Presupuestos (DIPRES), archivos publicados en [datos.gob.cl](https://datos.gob.cl/organization/direccion_de_presupuestos). Cifras contadas en la base de COCHID el 1 de octubre de 2026.

## Qué es una línea

La Ley de Presupuestos se ordena en siete niveles: partida (por lo general un ministerio), capítulo (un servicio), programa, subtítulo, ítem, asignación y subasignación. Una línea es el último nivel informado para un gasto. Sumar solo esas líneas evita contar dos veces el mismo peso, porque los niveles superiores ya son la suma de sus partes.

Cada línea guarda dos montos: el **inicial**, aprobado por el Congreso, y el **vigente**, que incluye las modificaciones hechas durante el año. Los montos vienen en miles de pesos o en miles de dólares, según la moneda de la línea en el archivo de DIPRES. El [visor de presupuesto](https://datos.cochid.cl/presupuesto) los muestra en millones de pesos.

## Cómo comprobar una cifra

Cada línea apunta al archivo de origen y a su número de fila. Desde la [ficha del conjunto](https://datos.cochid.cl/dataset/dipres_ley_linea) puedes descargar los datos en CSV o Excel. Desde la [Biblioteca](https://datos.cochid.cl/biblioteca) puedes descargar el archivo original de DIPRES de cada año, con su huella SHA-256 para verificar que es el mismo que publicó la fuente.

Si una cifra del visor no coincide con la que tienes, puedes ir al archivo original y buscar la fila. Si encuentras una diferencia, [escríbenos](/contacto/).

## La ejecución, año por año

Junto con la ley cargamos la ejecución presupuestaria publicada por DIPRES: **665.881 observaciones** con lo gastado en el mes y lo acumulado en el año, por los mismos siete niveles. Este conjunto incluye también las filas de los niveles superiores; para sumar, usa solo las filas terminales.

Hay un límite que conviene tener presente. Para cada año entre 2009 y 2025 tenemos el corte de diciembre, que muestra la ejecución acumulada al cierre del año. Para 2026 el último corte cargado es julio. No es todavía una serie mensual completa: los meses intermedios de cada año no están cargados.

La ejecución por corte se consulta en [Ejecución por corte oficial](https://datos.cochid.cl/presupuesto/ejecucion-detallada), dentro de «Más vistas del presupuesto». La [ficha del conjunto de ejecución](https://datos.cochid.cl/dataset/dipres_ejecucion_linea) tiene la descarga.

## Qué sigue

Para 2027, un proceso automático revisa cada hora las páginas de DIPRES y de datos.gob.cl para detectar cuándo se publican los archivos del proyecto de presupuesto. El resultado se muestra en [Próximo proyecto](https://datos.cochid.cl/presupuesto/proyecto), separado de la ley vigente, porque un proyecto puede cambiar antes de ser aprobado. Al 1 de octubre de 2026 no se habían observado cifras del proyecto 2027 en esas fuentes.
