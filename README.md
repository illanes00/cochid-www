# Cochid principal

Baseline local del contenido efectivamente servido por `https://cochid.cl/` al
2026-08-13. Caddy lo entrega desde
`/srv/projects/cis/projects/cochid/frontend/index.html`; ese directorio no era
un repositorio Git. Este repositorio aislado existe para revisar cambios sin
alterar el runtime.

El único contenido del sitio es `index.html`. La configuración de Caddy, los
logs y los releases quedan fuera de este árbol. `cochid-www` no es esta fuente:
es una aplicación Flask archivada que no atiende el apex.
