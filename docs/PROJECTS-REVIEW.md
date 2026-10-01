# Home: conexiones entre proyectos

Candidato desde e5b310d15ce8, sin commit ni deploy. Root conserva único flujo de publicación. API, DNS, Caddy, units, env, pagos y repos ajenos no modificados.

Portada institucional, tres entradas de trabajo y destacados presupuesto/medicamentos. Header exacto Datos (catálogo), Mapas, Proyectos. Directorio #proyectos en segundo nivel con cuatro grupos inicialmente plegados: Datos, Territorio, Investigaciones y Herramientas. Títulos summary H3 visibles y teclado nativo. Se reutiliza kit43, sin framework ni recursos nuevos.

Ocho productos canónicos/JSON-LD preservados; vistas, aliases y auxiliares no se convierten en productos. Logins rotulados sin certificar interior ni journey autenticado. Ciudad/trenes/estilo secundarios; staging/tiles excluidos. Contacto simple sin ofertas no acreditadas; footerlegal previo conservado. Claim HTML/JSONLD «fuentes y trazabilidad».

Iconos decorativos EXACTOS delkit, aria-hidden/focusablefalse/currentColor, sin dependencia externa ni modificaciónkit:

- cochid-search: /srv/projects/cis/cis-style/brands/cochid/symbols.svg; spriteSHA dce98dfec88fbb776b05d98e6c8f7373187a4e0fbf8e5e5c42d7d05efea294fe. Source/pubv6byteidénticos, glyphSHA a9ffd85be0eae9981d2895b12c59142031b11529e2090d0a0e4026efd2ffbf54.
- cochid-elecciones-map: /srv/projects/cis/cis-style/brands/cochid-elecciones/symbols.svg; spriteSHA 9c63bafa770dea07c775d787309267d556c97e5d0dd9f203ecec90000537303a. Source/pubv6byteidénticos, glyphSHA e66076f2770f9a6a9e9964fda4d563c40f32f4cf213c79490a35d0a2b4c36f36.
- cis-file: /srv/projects/cis/cis-style/brands/cis/symbols.svg; spriteSHA a5e21c07e103f09ee3ff508a36d435420724e30f914fbd54176f4633c512dc1b. Source/pubv6byteidénticos, glyphSHA 0d3001608958fda2f2ff595f843d40db93a011108f6e1e6985c3351bcdd819f2.

Dos previews PNG existentes1200×630, altvacío/enlaceúnico/lazy/proporciónreservada/object-fitcontain, sin recorte. No imagen atribuida a medicamentos.

## Inventario publicado

Fuente published-sites.json fechado01oct03:40UTC, SHA412d052419f454843dc48f05205b0fed97d2b917b8ee29eed8f2ffec623cd3fc. Es inventario observado, no verificación actual de28productos. Tratamiento:

| Host observado | Tratamiento |
|---|---|
| vpn.cochid.cl | Proyecto, vista o herramienta con propósito visible |
| elecciones.cochid.cl | Proyecto, vista o herramienta con propósito visible |
| ciudad.cochid.cl | Enlace secundario, API JSON explícita |
| style.cochid.cl | Enlace secundario, guía visual |
| medicamentos.cochid.cl | Proyecto, vista o herramienta con propósito visible |
| medicamentos-staging.cochid.cl | Excluido: staging, no versión canónica |
| lex.cochid.cl | Proyecto, vista o herramienta con propósito visible |
| cables.cochid.cl | Proyecto, vista o herramienta con propósito visible |
| peru.cochid.cl | Proyecto, vista o herramienta con propósito visible |
| graphs.cochid.cl | Proyecto, vista o herramienta con propósito visible |
| taller.cochid.cl | Proyecto, vista o herramienta con propósito visible |
| economia.cochid.cl | Proyecto, vista o herramienta con propósito visible |
| tpte.cochid.cl | Proyecto, vista o herramienta con propósito visible |
| prosa.cochid.cl | Alias: se enlaza destino canónico prosa.medicamentos.cochid.cl |
| thesis.cochid.cl | Proyecto, vista o herramienta con propósito visible |
| www.cochid.cl | Entrada institucional; www alias de apex |
| cochid.cl | Entrada institucional; www alias de apex |
| datos.cochid.cl | Proyecto, vista o herramienta con propósito visible |
| trenes.cochid.cl | Enlace secundario, vista compartida con Mapas |
| prosa.medicamentos.cochid.cl | Proyecto, vista o herramienta con propósito visible |
| clima.cochid.cl | Proyecto, vista o herramienta con propósito visible |
| congreso.cochid.cl | Proyecto, vista o herramienta con propósito visible |
| tiles.cochid.cl | Excluido: teselas de infraestructura, no proyecto |
| mapas.cochid.cl | Proyecto, vista o herramienta con propósito visible |
| mundial.cochid.cl | Proyecto, vista o herramienta con propósito visible |
| scribe.cochid.cl | Proyecto, vista o herramienta con propósito visible |
| bici.cochid.cl | Proyecto, vista o herramienta con propósito visible |
| sdr.cochid.cl | Proyecto, vista o herramienta con propósito visible |

## Evidencia ejecutada y límites

35 Python PASS (0,030 s), salida completa en `packet/python-icon-final.log`; 37 Node PASS, sintaxis de los dos módulos PASS y build canónico `node scripts/build.mjs` EXIT 0 bajo `cis-build`. Los recibos y logs están en `source-checks-20261001T174958Z/`. La preservación comprobada cubre 30 rutas de payload: 27 recursos byte a byte, dos HTML especiales con cambio limitado al footer delimitado, y una portada nueva. Las 25 fuentes de los especiales permanecen byte a byte. Producción e5b, sus 32 archivos y el symlink legado permanecieron sin cambios.

El primer navegador, `qa-2026-10-01T174423856Z`, falló por el orden de headings de cartas ocultas y el H4 del footer. Se conserva como evidencia. La corrección autorizada dejó los H3 dentro de los summaries y no editó el footer del kit. `qa-2026-10-01T175008046Z/receipt.json` obtuvo 21 checks PASS: seis combinaciones 1440/768/320 claro y oscuro, cuatro grupos cerrados y abiertos por teclado, 12 análisis Axe sin infracciones, previews de 1200×630 con `contain`, tres glyphs decorativos y cero errores de página. El journey real de catálogo llegó de Buscar DIPRES a `dipres_ley_linea` y su fuente visible; el preview público de Mapas no exigió autenticación. Esto no acredita cobertura de datos ni el interior autenticado.

La galería anterior tenía un límite: la precarga lazy con `scrollIntoView` dejó el viewport intermedio y la captura completa mostró el header sticky y el enlace de salto con foco. Se conserva esa ejecución. Un diagnóstico aislado posterior, `top-viewport-2026-10-01T181246489Z/receipt.json`, verificó en 1440 y 320 que el header sticky mide 65 px y 59 px, respectivamente; antes y después del cambio de tema, Control+Home y click en H1 el scroll fue 0 y el H1 quedó completamente visible. Por tanto, no hay regresión de layout: era un artefacto de la secuencia de captura. La QA se ajustó solo para esperar fuentes, volver a scroll 0, quitar foco y comprobar geometría antes de fotografiar. `qa-2026-10-01T181328439Z/receipt.json`, de 18:13:29 a 18:14:05 UTC, pasó 21 checks, produjo 24 capturas: viewport y página completa de seis combinaciones 1440/768/320 claro y oscuro. Cada estado inicial guarda scroll 0, header presente y H1 entero en viewport; Axe y overflow permanecen en cero y no hubo errores de página. Se ejecutó contra `dist/` local después del build canónico; no es todavía una verificación del borde público.

Fuentes de implementación: `index.html`, `tests/test_home_contract.py`, `tests/test_projects_contract.py` y este informe. El packet privado conserva `activation.enabled=false`, commit y revisión de root nulos, baseline de 30 payloads y el guard 27/2/25. La galería local ya está cerrada. Quedan la revisión de root, el commit, la release y la QA pública, todas solo con GO de root. Fuente efectiva de portada: `227e3c8b8b59e922564e2440530fd48965fdd3c1e1680ae9663311f63de889fd`. No se afirman retornos de todos los otros sitios: este alcance cubre Home y sus salidas; otro agente audita los regresos.
