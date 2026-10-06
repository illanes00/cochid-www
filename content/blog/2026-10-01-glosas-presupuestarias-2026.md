---
titulo: Las 3.048 glosas de la Ley de Presupuestos 2026, cada una con su página
slug: glosas-presupuestarias-2026
fecha: 2026-10-01
autor: Equipo de la Compañía Chilena de Inteligencia de Datos
resumen: Leímos los 470 documentos de glosas de la Ley de Presupuestos 2026 publicados por DIPRES. Cada glosa queda ligada a su programa y a la página del PDF de donde sale.
descripcion: Compañía Chilena de Inteligencia de Datos publica las 3.048 glosas de la Ley de Presupuestos 2026, leídas de 470 documentos de DIPRES, con el programa, la página y el PDF original de cada una.
ruta: /blog/glosas-presupuestarias-2026/
tipo: datos-nuevos
dominio: finanzas-publicas
etiquetas: [presupuesto, dipres, glosas, ley-de-presupuestos]
datos: [dataset:dipres_glosas, dataset:dipres_law_documents]
imagen: /blog/glosas-presupuestarias-2026/portada.png
tiempo_lectura: auto
borrador: false
---

<!-- Nota: el id de dominio `presupuesto-gasto-publico` es provisional (SPEC §2.4). -->

Desde el 1 de octubre de 2026, Compañía Chilena de Inteligencia de Datos publica **3.048 glosas** de la Ley de Presupuestos 2026, leídas de los **470 documentos** de glosas que DIPRES publica para ese año. Cada glosa queda ligada a su partida, capítulo y programa, y a la página del PDF original donde aparece.

:::cifras
- 3.048 glosas de la Ley de Presupuestos 2026
- 470 documentos de DIPRES revisados
- 463 documentos con glosas y 7 sin glosas
:::

Fuente: Dirección de Presupuestos, [documentos de la Ley de Presupuestos 2026](https://www.dipres.gob.cl/597/w3-multipropertyvalues-15145-37782.html). Conteo hecho sobre la descarga pública del conjunto el 1 de octubre de 2026.

## Qué es una glosa

La Ley de Presupuestos no fija solo montos. Para muchos programas agrega notas, llamadas glosas, que ponen condiciones al gasto: cuántas personas puede contratar un servicio, cuántos vehículos puede tener, cuánto puede gastar en horas extraordinarias o en viáticos, o a quién debe informar y cuándo.

Un ejemplo del Ministerio de Salud. Para el programa 01 del Fondo Nacional de Salud (partida 16, capítulo 02), la glosa 01 fija una dotación máxima de 17 vehículos y la glosa 02 una dotación máxima de 1.273 personas. Ambas empiezan en la página 2 del [documento original de DIPRES](https://www.dipres.gob.cl/597/articles-397247_doc_pdf.pdf?ts=1765870075).

## Dónde verlas

En el [visor de presupuesto](https://datos.cochid.cl/presupuesto/ministerios), elige una institución. Bajo sus capítulos aparecen sus glosas, con un buscador. Para ver solo las de un programa, baja hasta ese programa en el clasificador. Cada glosa tiene el enlace «Ver PDF», que abre el documento original en la página donde está.

El conjunto completo se descarga en CSV o Excel desde la [ficha de glosas](https://datos.cochid.cl/dataset/dipres_glosas). Cada fila trae el año, la partida, el capítulo, el programa, el número de glosa, el texto y la página y línea de inicio y fin en el documento. Los PDF originales están en la [Biblioteca](https://datos.cochid.cl/biblioteca?dataset=dipres_glosas), cada uno con su huella SHA-256.

## La corrección del 1 de octubre

La primera carga, del 30 de septiembre, encontró 3.007 glosas. Al revisar los documentos uno por uno contra su PDF, dos tenían páginas a dos columnas que la lectura automática unía: glosas distintas quedaban como una sola. Corregimos la lectura de esos dos documentos el 1 de octubre. El resultado fueron 41 glosas recuperadas y 2 textos corregidos. Los otros 468 documentos no cambiaron.

Si descargaste el conjunto el 30 de septiembre, tu copia tiene 3.007 glosas; la vigente tiene 3.048.

## Qué no incluye todavía

Por ahora el conjunto cubre solo la ley de 2026. Las glosas de años anteriores están en revisión: los documentos de esos años tienen formatos distintos y cada formato se comprueba contra el PDF antes de cargarlo. El conjunto separa las glosas de la ley de las de un proyecto de presupuesto, porque un proyecto puede cambiar durante su tramitación.

Si encuentras una glosa mal leída, envíanos el enlace y el número de glosa por la página de [contacto](/contacto/).
