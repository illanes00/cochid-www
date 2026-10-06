---
titulo: Sobre nosotros
descripcion: La Compañía Chilena de Inteligencia de Datos reúne datos públicos de Chile con su fuente, su fecha y el archivo original del que salen. Quién lo hace, cómo trabaja y quién opera la plataforma.
ruta: /sobre-nosotros/
---

<!-- Nota de implementación: las cifras de «Qué hay hoy» salen de la instantánea de build (data/inventario.snapshot.json), no se escriben a mano. Si la instantánea tiene más de 14 días, el bloque se omite (SPEC §4.1 y §4.6). Los valores de abajo son los verificados el 1-oct-2026 21:08 UTC. -->

# Sobre nosotros

Compañía Chilena de Inteligencia de Datos reúne datos públicos de Chile en un catálogo único. Cada conjunto indica de dónde viene, cuándo se actualizó y desde qué archivo original se cargó. Está pensado para periodistas, equipos de investigación, organismos públicos y quienes construyen aplicaciones con datos chilenos.

## Qué hay hoy

Al 6 de octubre de 2026, el [catálogo de datos](https://datos.cochid.cl/catalogo) publica **110 conjuntos de datos** en **11 temas**, cada uno con su fuente original.

Entre las fuentes están la Dirección de Presupuestos (DIPRES), el Ministerio de Educación, el Instituto Nacional de Estadísticas, el Ministerio de Desarrollo Social y Familia (Encuesta CASEN), el Banco Central, la Biblioteca del Congreso Nacional, el Servel, Gendarmería y ChileCompra.

Fuente de las cifras: API pública de datos.cochid.cl (`/api/catalog/`, `/api/temas/`, `/api/raw-files/`), consulta del 1 de octubre de 2026.

## Principios

- **Cada cifra con su fuente.** La ficha de cada conjunto nombra al organismo que publica el dato y enlaza a su sitio.
- **Cada cifra con su fecha.** Las fichas muestran la última actualización y la frecuencia declarada.
- **El original disponible.** El archivo tal como lo publicó la fuente se puede descargar desde la Biblioteca, con su huella SHA-256 para comprobar que no cambió.
- **Lo que falta se muestra.** Un valor ausente en la fuente queda ausente; no se reemplaza por cero ni se estima sin decirlo.

## Cómo trabajamos

Cada dato pasa por cuatro pasos:

1. **Fuente.** Se descarga el archivo del organismo que lo publica y se registran su dirección, la fecha de descarga y su huella SHA-256.
2. **Carga.** Un proceso lee el archivo y ordena sus filas. Cada carga queda registrada con su fecha, las filas leídas y su resultado.
3. **Revisión.** Antes de publicar se revisa que las cifras cuadren con la fuente; lo que no cuadra no se publica.
4. **Publicación.** El dato pasa al catálogo, a la API y a las vistas. Cada ficha indica la fuente y permite llegar al archivo original.

El detalle por conjunto está en [Metodología](https://datos.cochid.cl/metodologia).

## Equipo

Martín Illanes, fundador.

## Relación institucional

Compañía Chilena de Inteligencia de Datos es la marca de Compañía Chilena de Inteligencia de Datos SpA (RUT 78.374.391-4), que mantiene este ecosistema de datos.

## Contacto

Para consultas, correcciones o pedidos de datos, revisa la página de [Contacto](/contacto/). Si necesitas un dato a medida, más cuota de API o un informe, usa el formulario de [Asesoría y datos a medida](/asesoria/).
