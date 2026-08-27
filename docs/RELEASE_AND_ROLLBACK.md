# Liberación y reversión de `cochid.cl`

La portada institucional se publica desde releases estáticas e inmutables. El
corte cambia exclusivamente el `root` del bloque `cochid.cl` en Caddy. No
modifica el checkout legado ni los bloques de `www.cochid.cl` o
`datos.cochid.cl`.

## Alcance verificable

- Fuente desplegada: commit `3ceeb0a54a8051c855377378f096bfc664a1e8d4`.
- Release activa: `/srv/projects/releases/cochid-main/3ceeb0a54a8051c855377378f096bfc664a1e8d4`.
- Release anterior: `/srv/projects/releases/cochid-main/acb8eb3546837192a5c4baa45293656daf4f7fab`.
- Configuración: `/etc/caddy/sites.d/cochid.cl.caddy`.
- Respaldo fechado: `/srv/projects/backups/cochid-main/style-v10-20260827T101128Z`.
- Style: `10.0.0-candidate.16`, digest `c9aa1c7530c1050549aaa013253f0059b147abe1f725a2979c07e11b35c06c69`.

## Corte del 27 de agosto de 2026

El release se exportó desde Git sin symlinks, se agregó `RELEASE.json`, se
generó `SHA256SUMS` y se selló sin archivos escribibles. No existe un build ni
un servicio de aplicación para esta portada estática.

La verificación observable cubrió:

- 6 pruebas de contrato;
- HTTP 200 en `https://cochid.cl/` y en la API COFOG pública;
- carga real de Style v10 con SRI y ausencia de Style v9;
- 320, 768 y 1440 px sin desborde horizontal;
- modo claro inicial, toggle oscuro y persistencia al recargar;
- gráfico real con 10 filas y detalle expandible por clic o teclado;
- Axe en claro y oscuro, 0 violaciones en los tres anchos;
- Caddy activo, `NRestarts=0` y sin errores nuevos en la ventana del corte.

La portada no instala cookies ni carga analítica. La telemetría operativa
disponible es el access log filtrado de Caddy. Una futura analítica de producto
debe usar un endpoint first-party, consentimiento verificable y documentación
de retención antes de agregarse.

## Reversión propuesta

Restaurar `cochid.cl.caddy.before` desde el respaldo fechado, validar Caddy con
sus `EnvironmentFile` efectivos y recargarlo. Esto devuelve el `root` a
`acb8eb3546837192a5c4baa45293656daf4f7fab` sin modificar ningún release.

La reversión se probó durante el corte: v10 volvió a v9 f417 con HTTP 200 y
luego se reaplicó v10 con HTTP 200. Como no cambió ningún `EnvironmentFile`, la
operación correcta fue `reload`; si ese archivo cambia, corresponde `stop` y
`start`.
