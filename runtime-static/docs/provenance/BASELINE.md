# Procedencia del baseline

- Captura: 2026-08-13T01:26:47-04:00.
- Fuente efectiva: `/srv/projects/cis/projects/cochid/frontend/index.html`.
- Ruta live: `https://cochid.cl/`.
- Enrutamiento observado: `/etc/caddy/sites.d/cochid.cl.caddy` usa `file_server`
  con esa raíz, sin proceso de aplicación para el apex.
- Integridad: el SHA-256 de la respuesta HTTP y del archivo fuente fue
  `4247d1e3043da3fae8d922e75e3686d8cd255f1c2c4d00a310d3d498364c991e`.

No se copia Caddy ni estado de runtime al baseline.
