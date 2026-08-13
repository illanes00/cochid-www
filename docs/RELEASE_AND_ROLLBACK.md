# Propuesta de liberación y reversión

Esta rama es un candidato local. No cambia Caddy, systemd ni el directorio que
sirve `cochid.cl`.

## Alcance verificable

- Fuente candidata: `index.html` de esta rama.
- Fuente actualmente servida: `/srv/projects/cis/projects/cochid/frontend/index.html`.
- Proxy actual: `/etc/caddy/sites.d/cochid.cl.caddy` usa ese directorio como
  `root`; no requiere un cambio de configuración para actualizar sólo el HTML.
- Baseline de contenido: commit `71488874e26653c8d6e3a8ce59408c14b0f6aca5`.

## Liberación propuesta

Un operador autorizado debe, en una ventana separada, respaldar el único
archivo servido con fecha y SHA-256, publicar exclusivamente el `index.html`
revisado y comprobar `https://cochid.cl/` junto con el endpoint público de
presupuesto. Caddy y systemd se mantienen sin cambios.

## Reversión propuesta

Si falla la comprobación HTTP, visual o de datos, restaurar de forma
byte-a-byte el `index.html` del commit baseline y repetir las mismas
comprobaciones. La reversión no requiere recargar Caddy porque no altera su
configuración. Conservar el respaldo fechado hasta cerrar la ventana.
