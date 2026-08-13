# Propuesta de liberación y reversión

Esta rama es un candidato local. La liberación publica un directorio inmutable
y cambia exclusivamente el `root` del bloque `cochid.cl` en Caddy. No modifica
el checkout legado ni los bloques de `www.cochid.cl` o `datos.cochid.cl`.

## Alcance verificable

- Fuente candidata: `index.html` de esta rama.
- Fuente actualmente servida: `/srv/projects/cis/projects/cochid/frontend/index.html`.
- Proxy actual: `/etc/caddy/sites.d/cochid.cl.caddy` usa ese directorio como
  `root`.
- Baseline de contenido: commit `71488874e26653c8d6e3a8ce59408c14b0f6aca5`.

## Liberación propuesta

Un operador autorizado debe respaldar con fecha el archivo servido y la
configuración efectiva de Caddy. Luego debe exportar este commit a
`/srv/projects/releases/cochid-main/<commit>/`, cambiar el `root` del bloque
`cochid.cl` a ese directorio, validar Caddy y recargarlo. El corte se comprueba
con `https://cochid.cl/`, los recursos Style v9 y el endpoint público de
presupuesto. No hay build ni servicio de aplicación para este sitio estático.

## Reversión propuesta

Si falla la comprobación HTTP, visual o de datos, restaurar el archivo Caddy
respaldado, validarlo y recargarlo. Esto devuelve el `root` al directorio
legado sin modificarlo. Repetir las mismas comprobaciones y conservar el
respaldo fechado hasta cerrar la ventana.
