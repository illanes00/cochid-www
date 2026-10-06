---
titulo: El visor de presupuesto, ordenado en tres tareas
slug: visor-de-presupuesto-tres-tareas
fecha: 2026-10-01
autor: Equipo de la Compañía Chilena de Inteligencia de Datos
resumen: El visor de presupuesto de la Compañía Chilena de Inteligencia de Datos se reorganizó en tres tareas: entender el presupuesto, explorar instituciones y comparar años. Los controles, las tablas y las descargas quedan plegados hasta que los necesitas.
descripcion: Cómo usar el visor de presupuesto de la Compañía Chilena de Inteligencia de Datos después de su reorganización del 1 de octubre de 2026: tres tareas, gráficos legibles en el teléfono, descargas y verificación de cada consulta.
ruta: /blog/visor-de-presupuesto-tres-tareas/
tipo: metodologia
dominio: finanzas-publicas
etiquetas: [presupuesto, visor, dipres]
datos: [dataset:dipres_ley_linea, dataset:dipres_glosas]
imagen: /blog/visor-de-presupuesto-tres-tareas/portada.png
tiempo_lectura: auto
borrador: false
---

<!-- Nota: el id de dominio `presupuesto-gasto-publico` es provisional (SPEC §2.4). -->

El 1 de octubre de 2026 publicamos una nueva organización del [visor de presupuesto](https://datos.cochid.cl/presupuesto). La versión anterior mostraba muchos selectores, menús y secciones a la vez. Ahora la entrada son tres tareas, y el resto queda a un clic.

## Las tres tareas

**[Entender el presupuesto](https://datos.cochid.cl/presupuesto).** Empieza por el total de la Ley de Presupuestos del año: el monto inicial, aprobado por el Congreso, y el vigente, con las modificaciones del año. Los dos se dibujan en la misma escala y desde cero, para que la diferencia entre barras corresponda a la diferencia entre montos. El contexto fiscal, como la deuda, va en una sección aparte.

**[Explorar instituciones](https://datos.cochid.cl/presupuesto/ministerios).** Un ranking de partidas en un solo gráfico de barras. Al elegir una institución ves sus capítulos, sus programas y sus [glosas](/blog/glosas-presupuestarias-2026/), y puedes bajar hasta el último nivel de detalle del clasificador.

**[Comparar años](https://datos.cochid.cl/presupuesto/comparacion).** Pone dos leyes lado a lado, por ejemplo 2025 y 2026, para ver qué instituciones subieron o bajaron.

## Más vistas

Bajo «Más vistas del presupuesto» están las vistas para quien busca algo específico:

- Ejecución del Gobierno Central y Ejecución por corte oficial.
- Clasificador, Ingresos y gastos, y Matriz.
- Historia fiscal, Composición económica y Funciones del Estado.
- Próximo proyecto, que informa si DIPRES ya publicó los archivos del proyecto de presupuesto del año siguiente.
- Fuentes y método.

## Lo que queda plegado

Cada vista muestra primero el gráfico y una frase sobre qué mide. El resto está en paneles que se abren al tocarlos:

- **Unidades y formato numérico**, para elegir la escala de los montos y el formato de los números.
- **Descargar y compartir**, con los datos de la vista en CSV y JSON, el gráfico en SVG y PNG, y un enlace para copiar.
- **Ver tabla de datos**, con los mismos valores del gráfico en una tabla.
- **Filtros avanzados del corte** y **Filtrar por códigos del clasificador**, para acotar la consulta.

Las barras se ajustan al ancho de la pantalla y las etiquetas se muestran completas, también en un teléfono. Los ceros, los negativos y los valores ausentes se muestran como tales: un dato que no está en la fuente no se dibuja como cero.

## Verificación por consulta

Cada vista tiene un bloque «Verificación por consulta». Indica qué conjunto y qué archivos originales de DIPRES producen las cifras de esa consulta en particular, con enlace a cada archivo en la [Biblioteca](https://datos.cochid.cl/biblioteca). La verificación se hace consulta por consulta: Compañía Chilena de Inteligencia de Datos no certifica el presupuesto completo de una vez.

## Cuéntanos si algo no se entiende

Si una vista te confunde o un número no coincide con el que tienes, [escríbenos](/contacto/) con el enlace de la vista. El enlace guarda el año y las preferencias de la consulta.
