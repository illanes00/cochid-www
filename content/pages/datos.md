---
titulo: Datos por dominio
descripcion: Busca datos públicos de Chile por dominio: presupuesto, seguridad, población y educación, economía y trabajo, elecciones, legislación, transporte y centros de estudio.
ruta: /datos/
---

<!-- Nota de implementación:
- Solo se publican tarjetas de dominios que hoy tienen temas con conjuntos (SPEC §2.4). «Territorio y clima» y «Salud y medicamentos» no van aquí hasta tener tema; sus productos están en /mapas/ y /investigaciones/.
- Destino de cada tarjeta: /dominio/<id> no existe hasta la etapa 3. Mientras tanto, dominios de un solo tema enlazan a https://datos.cochid.cl/tema/<slug>; dominios de varios temas enlazan al primer tema listado y muestran los demás como enlaces secundarios. El filtro ?tema= del catálogo hoy se ignora: no usarlo como destino.
- Ids de dominio provisionales (los fija destinos.json, §3): presupuesto-gasto-publico, seguridad-justicia, poblacion-sociedad-educacion, economia-trabajo, elecciones-congreso, legislacion, transporte-infraestructura, conocimiento-centros-estudio.
- Ícono: el del kit v10 indicado; si no existe, se pide al kit (KIT-DESVIACIONES H28).
- Rótulos de temas con tildes desde la capa de presentación, no desde meta.temas (que hoy no las tiene).
-->

# Datos por dominio

Elige un dominio para ver sus temas, sus conjuntos de datos y las vistas que los usan. Si sabes lo que buscas, usa el [buscador del catálogo](https://datos.cochid.cl/catalogo).

::: dominios
## Presupuesto y gasto público
Ícono: moneda
Ley de Presupuestos, ejecución, glosas, deuda y empleo público, con el archivo original de DIPRES detrás de cada cifra.
Temas: [Presupuesto público](https://datos.cochid.cl/tema/presupuesto)
Vistas: [Visor de presupuesto](https://datos.cochid.cl/presupuesto) · [Mercado Público](https://datos.cochid.cl/mercado-publico)

## Seguridad y justicia
Ícono: escudo
Denuncias, victimización, causas judiciales y población penal.
Temas: [Seguridad ciudadana](https://datos.cochid.cl/tema/seguridad) · [Seguridad y justicia](https://datos.cochid.cl/tema/seguridad-justicia) · [Victimización](https://datos.cochid.cl/tema/seguridad-victimizacion) · [Sistema penitenciario](https://datos.cochid.cl/tema/sistema-penitenciario)
Vistas: [Seguridad](https://datos.cochid.cl/seguridad)

## Población, sociedad y educación
Ícono: personas
Población, pobreza e ingresos de los hogares, matrícula, asistencia y docentes.
Temas: [Demografía y pobreza](https://datos.cochid.cl/tema/demografia) · [Educación](https://datos.cochid.cl/tema/educacion)
Vistas: [Encuesta CASEN](https://datos.cochid.cl/casen)

## Economía y trabajo
Ícono: gráfico
Actividad, precios, empleo y adopción tecnológica en empresas.
Temas: [Economía](https://datos.cochid.cl/tema/economia) · [Mercado laboral e IA](https://datos.cochid.cl/tema/economia-laboral)
Vistas: [Economía](https://economia.cochid.cl/)

## Elecciones y Congreso
Ícono: urna
Participación, resultados y padrón electoral; proyectos de ley y votaciones.
Temas: [Elecciones](https://datos.cochid.cl/tema/elecciones)
Vistas: [Elecciones](https://elecciones.cochid.cl/) · [Congreso](https://congreso.cochid.cl/)

## Legislación
Ícono: balanza
Leyes publicadas, normas y búsqueda en el corpus jurídico.
Temas: [Legislación](https://datos.cochid.cl/tema/legislacion)
Vistas: [Lex](https://lex.cochid.cl/)

## Transporte e infraestructura
Ícono: bus
Paradas y recorridos del transporte público de Santiago, cables submarinos y otras redes físicas.
Temas: [Transporte público](https://datos.cochid.cl/tema/transporte) · [Infraestructura](https://datos.cochid.cl/tema/infraestructura)
Vistas: [Transporte](https://tpte.cochid.cl/) · [Cables](https://cables.cochid.cl/) · [Trenes](https://trenes.cochid.cl/)

## Conocimiento y centros de estudio
Ícono: brújula
Posición de centros de estudio chilenos entre 1990 y 2026, a partir de codificación experta y de sus publicaciones.
Temas: [Centros de estudio](https://datos.cochid.cl/tema/centros-estudio)
Vistas: [Thesis](https://thesis.cochid.cl/)
:::

## Vistas y observatorios

Cada dominio se consulta también en estas vistas, que usan los mismos conjuntos de datos.

@@VISTAS_DOMINIOS@@

## Necesitas otro corte

Si el dato que buscas no está publicado o necesitas otra desagregación, [pide un dato a medida](/asesoria/?tipo=dato-a-medida).
