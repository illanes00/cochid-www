---
titulo: Cargos públicos, deuda y anuario financiero de DIPRES, con fichas nuevas
slug: cargos-publicos-deuda-y-anuario
fecha: 2026-10-01
autor: Equipo de la Compañía Chilena de Inteligencia de Datos
resumen: Tres series de DIPRES entran al catálogo con fichas propias: 874.586 observaciones de cargos del sector público, la deuda del Gobierno Central desde 1990 y el Anuario de Estadísticas de Finanzas Públicas.
descripcion: Compañía Chilena de Inteligencia de Datos publica las series de cargos públicos (2014 a 2025), deuda del Gobierno Central (1990 a 2025) y Anuario de Estadísticas de Finanzas Públicas (2015 a 2024) de DIPRES, con fichas de lectura y descarga.
ruta: /blog/cargos-publicos-deuda-y-anuario/
tipo: datos-nuevos
dominio: finanzas-publicas
etiquetas: [dipres, empleo-publico, deuda, finanzas-publicas]
datos: [dataset:dipres_macro_empleo_sector_publico, dataset:dipres_macro_deuda_gobierno_central, dataset:dipres_macro_anuario_efp]
imagen: /blog/cargos-publicos-deuda-y-anuario/portada.png
tiempo_lectura: auto
borrador: false
---

<!-- Nota: el id de dominio `presupuesto-gasto-publico` es provisional (SPEC §2.4). -->

El 30 de septiembre de 2026 cargamos tres series que DIPRES publica en planillas y documentos fuera de la Ley de Presupuestos. El 1 de octubre quedaron publicadas sus fichas de lectura en datos.cochid.cl.

:::cifras
- 874.586 observaciones de cargos del sector público, 2014 a 2025
- 144 observaciones de deuda del Gobierno Central, 1990 a 2025
- 800 observaciones del Anuario de Estadísticas de Finanzas Públicas, 2015 a 2024
:::

Fuente: Dirección de Presupuestos. Cifras contadas en la base de la Compañía Chilena de Inteligencia de Datos el 1 de octubre de 2026.

## Cargos del sector público

Es la serie más grande de las tres. Cada observación es un número de cargos en una fecha de corte para una combinación de ministerio, servicio, sexo, tramo de edad, estamento, calidad jurídica y tipo de personal. La calidad jurídica distingue planta, contrata, honorarios, suplentes y reemplazos y resto; el tipo, si el cargo está dentro o fuera de la dotación. Por ejemplo, el número de técnicos de planta, hombres, de 65 años o más, del Servicio de Salud Libertador General Bernardo O'Higgins al 30 de junio de 2023.

En la [ficha de cargos públicos](https://datos.cochid.cl/dataset/dipres_macro_empleo_sector_publico) eliges un año y una fecha de corte, y luego una institución y uno de sus servicios. La ficha muestra una tabla de cargos por perfil. Al elegir un perfil, muestra cómo cambió su número de cargos entre cortes.

Hay cuatro cortes por año: 31 de marzo, 30 de junio, 30 de septiembre y 31 de diciembre. No todas las combinaciones tienen dato en todos los cortes. Una combinación que no está en el archivo de origen tampoco está en Compañía Chilena de Inteligencia de Datos; no se completa con ceros.

## Deuda del Gobierno Central

La [ficha de deuda](https://datos.cochid.cl/dataset/dipres_macro_deuda_gobierno_central) reúne el stock anual de deuda del Gobierno Central entre 1990 y 2025: deuda interna, externa y total en millones de dólares, y deuda total como porcentaje del PIB. Son 36 años por cuatro medidas. Cada valor indica la página y el cuadro del documento de origen.

## Anuario de Estadísticas de Finanzas Públicas

El [anuario](https://datos.cochid.cl/dataset/dipres_macro_anuario_efp) trae los cuadros de activos y pasivos financieros del Gobierno Central y del Banco Central entre 2015 y 2024, en millones de pesos, millones de dólares y porcentaje del PIB. La ficha pide dos elecciones: el ámbito, que corresponde a uno de los cuatro cuadros, y el concepto, por ejemplo «Pagarés Fiscales con Banco Central». Con eso muestra la unidad, el último dato y la evolución anual, y debajo la tabla completa.

## Cómo se guardan

Las tres series comparten un formato: una fila por valor, con el archivo de origen, la hoja o página, el número de fila, el período, la métrica, la unidad y las dimensiones. La unidad va en cada fila porque DIPRES no usa la misma en todos sus cuadros: hay millones de pesos, millones de dólares y número de cargos.

Los archivos originales están en la [Biblioteca](https://datos.cochid.cl/biblioteca). Las fichas permiten descargar hasta 10.000 filas en CSV o Excel; para la serie completa de cargos, que supera ese límite, puedes [pedir una descarga completa](/asesoria/?tipo=descarga-masiva&conjunto=dipres_macro_empleo_sector_publico).

Para el gasto aprobado en la Ley de Presupuestos, usa el [visor de presupuesto](https://datos.cochid.cl/presupuesto).
