# Capa del portal sobre el kit

BW-37 aplica la aprobación Birren v2 del 6 de octubre de 2026. La fuente de
decisiones es [APLICAR-v2-CODEX.md](/srv/projects/tmp/birren-ecosistema-20261006/v2/APLICAR-v2-CODEX.md).
Los valores se consumen del kit fijado en [provenance.json](vendor/birren-v2/provenance.json).
Las 38 secciones aprobadas del portal quedan como snapshot para reproducir el build;
los íconos proceden del mismo artefacto inmutable, con su licencia ISC.

La composición estática usa `vendor/chrome-v2/chrome.css`,
`vendor/v2/portada/portada.css`, `vendor/v2/temas/temas.css`,
`assets/portal.css` y los dos `story.css`. El kit aporta los muros, superficies,
tipografía, controles, familias, señales y leyenda. El portal compone siete
destinos comunes, seis tareas locales, el catálogo de temas y las figuras
editoriales existentes. No introduce excepción de H28: superficies sin sombra,
controles rectos, foco explícito y acceso como única píldora de interfaz.
Los círculos de la ilustración solar representan el Sol; los radios de las
marcas de datos son geometría de las figuras, no esquinas de controles.

En la portada, los once temas usan íconos sobre cuadrados neutros y las cuatro
familias aprobadas solo colorean el ícono. La cabecera de cada tema usa el
cuadrado de familia del kit. Las subáreas muestran ícono y nombre, y los
servicios, herramientas y los cinco grupos de la portada usan íconos neutros.
En el directorio, los íconos de subsitios toman su familia de la spec. Se retiran los seis
colores propios de tema. El mapa conserva clases, rangos, números y geometría;
su escala continua se deriva del acento del kit. Los especiales mantienen
sus paletas de series y las leyendas que explican cada variable.

El adaptador `scripts/iconos.mjs` conserva los nombres del registro histórico;
la geometría se importa de los 81 íconos canónicos. `scripts/birren.mjs`
declara el ambiente de cada documento y compone las señales con palabra e
ícono. `g/para-x`, herramientas y el hilo para copiar textos son trabajo;
el índice de gráficos, mapas y temas son datos; las fichas y notas son
lectura; portada y presentación son acogida; contacto, asesoría, búsqueda
y errores son servicio. Ningún estado depende solo del color.

Los logos y el favicon se congelan por SHA desde el kit anterior; no se
aplica la alineación pendiente de aprobación. En teléfono, dos filas dejan
la búsqueda y el acceso fuera del menú sin recortar el nombre de la compañía.
El panel de cuenta permanece byte por byte y conserva su SRI anterior.

Responsable: UIUX (Codex), por encargo de Martín. Fecha: 2026-10-07.
Revisión: 2026-11-07. Alcance del registro central H29: estos seis CSS y su
composición; no cubre otros hosts ni permite franjas, sombras o esquinas.
La verificación, publicación y rollback se acreditan en el recibo del corte,
que se incorpora al cerrar la entrega.
