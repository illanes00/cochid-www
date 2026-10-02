# Portal estático de COCHID

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

## Build y pruebas

```sh
cis-build --dir "$PWD" node scripts/build.mjs
cis-build --dir "$PWD" python3 -m unittest discover -s tests -p 'test_*.py' -v
cis-build --dir "$PWD" node --test
```

La salida pública incluye las nueve puertas editoriales, los dos cuadernos,
`destinos.json`, `sitemap.xml`, `sitemap-hosts.xml` y `robots.txt`. El build
elimina comentarios de implementación y nunca publica fragmentos
`[[VERIFICAR]]`. Mientras `/asesoria/` no exista, una única función de
`scripts/markdown.mjs` dirige esos enlaces al contacto de Compañía de
Innovación de Santiago SpA.

La publicación usa releases inmutables y un cambio atómico del enlace ya
existente. No requiere editar Caddy ni reiniciar unidades. Consulta
`docs/DEPLOY.md`; preparar una candidata no autoriza activarla.
