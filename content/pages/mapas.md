---
titulo: Mapas y territorio
descripcion: Mapas de Compañía Chilena de Inteligencia de Datos para explorar Chile por territorio: atlas, transporte público, bicicleta, trenes, cables submarinos y clima.
ruta: /mapas/
---

<!-- Nota de implementación:
- Orden de la puerta según la SPEC §2.2: Atlas, Ciudad, Transporte, Bici, Trenes, Cables, Clima. Ciudad es una vista de Mapas (https://mapas.cochid.cl/ciudad); no enlazar ciudad.cochid.cl, que es el servicio de datos (decisión de Martín, 1-oct-2026).
- Texto de Ciudad tomado de la página servida en la release cochid-mapas 1934b48.
- Nombres canónicos del contrato de familia y D-NOMBRES: Mapas, Cables, Bici, Clima, Transporte (tpte).
- Descripciones tomadas de los <title> y <meta name="description"> servidos el 1-oct-2026 21:10 UTC.
-->

# Mapas y territorio

Todos los mapas usan datos con fuente declarada.

::: tarjetas
## Atlas
[mapas.cochid.cl](https://mapas.cochid.cl/)
Atlas interactivo de datos territoriales de Chile y Sudamérica. Reúne las capas publicadas por Compañía Chilena de Inteligencia de Datos en un mismo mapa, con su fuente, licencia y atribución.

## Ciudad
[mapas.cochid.cl/ciudad](https://mapas.cochid.cl/ciudad)
Modelo de Santiago para explorar rutas, tiempos de viaje, accesos y servicios cercanos. Permite comparar auto, caminata, bicicleta y transporte público entre un mismo origen y destino. Es una vista del Atlas.

## Transporte
[tpte.cochid.cl](https://tpte.cochid.cl/)
Paraderos, recorridos y llegadas del transporte público de Santiago.

## Bici
[bici.cochid.cl](https://bici.cochid.cl/)
Ciclovías de Santiago.

## Trenes
[trenes.cochid.cl](https://trenes.cochid.cl/)
Corredores y nodos de la red ferroviaria. Es una vista del Atlas.

## Cables
[cables.cochid.cl](https://cables.cochid.cl/)
El recorrido físico de internet: servidores de nombres, redes y cables submarinos.

## Clima
[clima.cochid.cl](https://clima.cochid.cl/)
Mapa meteorológico de Chile continental e insular: relieve, pronóstico horario animado, búsqueda de localidades, pronóstico a catorce días e imágenes satelitales, con sus fuentes.
:::

## Para equipos que trabajan con mapas

[Taller](https://taller.cochid.cl/) es el laboratorio de visualización territorial de Compañía Chilena de Inteligencia de Datos: mapas, componentes y experimentos en preparación.

Los datos detrás de cada capa están en el [catálogo](https://datos.cochid.cl/catalogo). Si necesitas un mapa o una capa a medida, [escríbenos](/asesoria/?tipo=dato-a-medida).
