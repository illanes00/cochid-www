# Publicar el portal estático de COCHID

El apex conserva HTML estático y el chrome compartido de COCHID. El build
compone la portada, nueve páginas editoriales y los especiales
`/cambio-de-hora/` y `/concepciones/`. No hay backend ni proceso Node en
producción para esta superficie.

## Verificaciones y build

Desde este árbol:

```sh
free -g
cis-build --dir "$PWD" node scripts/build.mjs
cis-build --dir "$PWD" python3 -m unittest discover -s tests -p 'test_*.py' -v
cis-build --dir "$PWD" node --test
sha256sum -c data/SHA256SUMS
```

El especial `/concepciones/` lee `concepciones/datos/*.json`, que es el recorte
publicable de `data/out/pagina.json` del repositorio `cochid-concepciones`. El
build verifica el largo de cada serie antes de escribir nada y aborta si una
cambió aguas arriba. Las quince tablas equivalentes se generan en el build, de
modo que la página sirve completa sin JavaScript.

La imagen social no la produce el build, porque necesita Python con matplotlib:

```sh
/srv/projects/cochid/cochid-concepciones/.venv/bin/python scripts/social-concepciones.py
```

Regenerarla solo cuando cambie la curva semanal. El PNG está versionado.

La QA del portal recorre todas las páginas a 1440, 768 y 320 px, en claro y
oscuro, siempre bajo `flock /tmp/cochid-ui-browser.lock`. Verifica Axe, desborde,
foco de teclado y menú móvil. La unidad Caddy sirve archivos; no hay una
compilación Next ni un servicio de aplicación para el apex.

## Destino efectivo

Consultar `/etc/caddy/sites.d/cochid.cl.caddy` y la configuración activa antes
de cada corte. Al preparar esta candidata, el root existente es el enlace:

`/srv/projects/releases/cochid-main/91132ff-medicamentos-20260903T183955Z`

Ese enlace apunta a
`/srv/projects/releases/cochid-main/baf59070d2d2-home-connections-20261001T195509Z`.
La candidata debe comparar ese destino por CAS antes de preparar o activar. No
desplegar desde el checkout antiguo ni cambiar el enlace desde dos flujos.

## Corte y reversión

1. Reservar el único flujo del apex con `cis-note`. Confirmar que el enlace
   continúa apuntando a la base revisada y no hay un deploy concurrente.
2. Guardar un respaldo con timestamp del enlace, manifiesto y hashes vivos.
3. Crear una ref Git recuperable y un bundle en el respaldo. Copiar `dist/`
   a una release nueva, añadir `RELEASE.json` y `SHA256SUMS`, verificar hashes
   y sellar todos los archivos (0444) y directorios (0555).
4. Solo con revisión y autorización de la sesión supervisora, preparar un
   symlink temporal al nuevo destino y sustituir atómicamente el enlace
   existente con `os.replace`. No modificar Caddy, reiniciar unidades ni
   escribir sobre la release anterior.
5. Verificar hashes servidos por Caddy local con SNI y en el borde público;
   comprobar el especial, portada, recursos, 404, logs y estado de Caddy.
6. Repetir navegador y accesibilidad en la URL pública; registrar receipt.

Rollback: preparar un enlace temporal al destino anterior registrado en el
respaldo, comprobar que el enlace activo sigue siendo el de este corte y
sustituirlo atómicamente. Cada respaldo incluye un `rollback.py` ejecutable.
Comprobar después portada y estudio de medicamentos. No se toca Caddy, DNS,
units, esquemas, datos ni EnvironmentFile.
