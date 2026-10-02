# Portal estático de Compañía Chilena de Inteligencia de Datos

Fuente del apex `https://cochid.cl/`. El sitio no usa un framework ni un proceso
de aplicación: `scripts/build.mjs` compone HTML estático en `dist/` a partir de
la portada, los especiales, los Markdown de `content/pages/` y los parciales de
`partials/`.

Los bloques `::: tarjetas` y `::: dominios` de los Markdown se convierten en
grillas con `scripts/tarjetas.mjs`. Los íconos salen solo de
`scripts/iconos.mjs`: un nombre sin SVG detiene el build y la línea `Ícono:` es
metadato, nunca texto publicado. La grilla de `/datos/` se valida contra los
dominios de `destinos.json`, y la portada reutiliza sus seis primeros.

La cabecera, el pie y el mapa del sitio se derivan del registro vendorizado en
`data/`. `data/SHA256SUMS` permite comprobar que `destinos.mjs` y
`destinos.publico.json` corresponden al mismo corte de core-style. Para cambiar
el registro se actualiza primero su fuente canónica, se regenera allí y luego se
vendorizan juntos ambos archivos y sus sumas.

## Blog y novedades

Las entradas del blog son Markdown en `content/blog/` con front matter
(`titulo`, `slug`, `fecha`, `autor`, `resumen`, `descripcion`, `ruta`, `tipo`,
`dominio`, `etiquetas`, `datos`). `scripts/blog.mjs` valida cada entrada (fecha
ISO, dominio existente en `destinos.json` o `null`, etiquetas con rótulo, sin
guiones largos ni la sigla de la operadora), convierte el cuerpo con
`scripts/markdown.mjs` (bloques `:::cifras` y `:::aviso`) y genera `/blog/`,
`/blog/<slug>/` y `/blog/feed.xml` en RSS 2.0. Los comentarios HTML y las
marcas `[[VERIFICAR: …]]`, también las de comentarios YAML del front matter,
se omiten con su fragmento y el build lista cada omisión. Las imágenes de
portada declaradas no se publican mientras no existan.

`scripts/novedades.mjs` arma `/novedades/` y el bloque «Lo nuevo» de la
portada (las tres más recientes) solo con dos fuentes locales: las entradas del
blog y el campo explícito `novedad` del `RELEASE.json` de cada release
`/srv/projects/releases/cochid-*/current`, leído sin escribir. Sin ese campo no
hay ítem; no se leen mensajes de commit, red ni API. La salida del build
informa qué releases aceptó u omitió y por qué.

## Build y pruebas

```sh
cis-build --dir "$PWD" node scripts/build.mjs
cis-build --dir "$PWD" python3 -m unittest discover -s tests -p 'test_*.py' -v
cis-build --dir "$PWD" node --test
```

La salida pública incluye las nueve puertas editoriales, los dos cuadernos, el
blog con su RSS, `/novedades/`, `destinos.json`, `sitemap.xml`,
`sitemap-hosts.xml` y `robots.txt`. La copia `sitemap.xml` de la raíz se
mantiene igual a la de `dist/` (lo comprueba una prueba). El build
elimina comentarios de implementación y nunca publica fragmentos
`[[VERIFICAR]]`. Mientras `/asesoria/` no exista, una única función de
`scripts/markdown.mjs` dirige esos enlaces al contacto de Compañía de
Innovación de Santiago SpA.

La publicación usa releases inmutables y un cambio atómico del enlace ya
existente. No requiere editar Caddy ni reiniciar unidades. Consulta
`docs/DEPLOY.md`; preparar una candidata no autoriza activarla.
