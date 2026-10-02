---
titulo: Mapa del sitio
descripcion: Todas las páginas y sitios públicos de COCHID en un solo lugar, agrupados por datos, territorio, investigaciones, herramientas y especiales.
ruta: /mapa-del-sitio/
---

<!-- Nota de implementación:
- El árbol se genera desde destinos.json y lo verifica el escáner de vínculos (SPEC §4.9 y §10). Las cifras {fecha}, {n} y {m} salen del último informe del escáner; si el informe tiene más de 14 días, se muestra solo la fecha.
- No listar rutas internas, alias técnicos ni estados de inicio de sesión. Los sitios que requieren cuenta llevan la etiqueta «Requiere cuenta».
- Etiquetas de tipo por nodo: Producto, Vista, Herramienta, Investigación, Requiere cuenta.
-->

# Mapa del sitio

Verificado el {fecha}: {n} destinos revisados, {m} con problemas.

Filtro: Escribe para filtrar el mapa (por ejemplo, «presupuesto» o «mapas»).

<!-- Árbol generado: Datos · Territorio · Investigaciones · Herramientas · Especiales -->

## Lo que no está en este mapa

Este mapa lista páginas para leer y explorar. No incluye las rutas de la API, que devuelven datos y están documentadas en [datos.cochid.cl/api/docs](https://datos.cochid.cl/api/docs), ni las direcciones alternativas que llevan a una página ya listada.

Para programas y buscadores: [sitemap-hosts.xml](/sitemap-hosts.xml) · [destinos.json](/destinos.json)
