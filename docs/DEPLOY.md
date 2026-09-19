# Publicar el sitio estático de COCHID

El sitio conserva HTML estático y el chrome compartido de COCHID. El especial
`/cambio-de-hora/` calcula Santiago 2026 en el navegador, sin backend ni datos
del lake. `scripts/build.mjs` genera la tabla accesible y los CSV con el mismo
modelo que alimenta las visualizaciones.

## Verificaciones y build

Desde este árbol:

```sh
python3 -m unittest discover -s tests -p 'test_*.py' -v
node --test tests/*.test.mjs
node --check cambio-de-hora/story.mjs
node --check concepciones/story.mjs
prosa-lint cambio-de-hora/index.html
prosa-lint concepciones/index.html
cis-build node scripts/build.mjs
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

Ejecutar navegador real en 1440, 390 y 320 px: fecha, slider, reproducción y
pausa, antes y después del salto, crepúsculo, selección mensual, rutina,
tabla sin JavaScript, CSV, SVG y tema claro/oscuro. Revisar etiquetas a tamaño
real y contrastes con Axe. La unidad Caddy sirve archivos; no hay un proceso
Node de producción ni una compilación Next para esta superficie existente.

## Destino efectivo

Consultar `/etc/caddy/sites.d/cochid.cl.caddy` y la configuración activa antes
de cada corte. En el corte de 7 septiembre 2026, el root existente es el enlace:

`/srv/projects/releases/cochid-main/91132ff-medicamentos-20260903T183955Z`

Antes de este cambio apuntaba a
`/srv/projects/releases/cochid-main/f5dd842-medicamentos-20260903T205438Z`.
Su fuente es f5dd842; el árbol de trabajo parte de ese commit y preserva el
estudio de medicamentos. No desplegar desde el main antiguo del repo legado.

## Corte y reversión

1. Reservar el único flujo del apex con `cis-note`. Confirmar que el enlace
   continúa apuntando a la base revisada y no hay un deploy concurrente.
2. Guardar un respaldo con timestamp del enlace, manifiesto y hashes vivos.
3. Crear una ref Git recuperable y un bundle en el respaldo. Copiar `dist/`
   a una release nueva, añadir `RELEASE.json` y `SHA256SUMS`, verificar hashes
   y sellar todos los archivos (0444) y directorios (0555).
4. Preparar un symlink temporal al nuevo destino y sustituir atómicamente
   el enlace existente con `os.replace`. No modificar la configuración de
   Caddy, no reiniciar Caddy y no escribir sobre la release anterior.
5. Verificar hashes servidos por Caddy local con SNI y en el borde público;
   comprobar el especial, portada, recursos, 404, logs y estado de Caddy.
6. Repetir navegador y accesibilidad en la URL pública; registrar receipt.

Rollback: preparar un enlace temporal al destino anterior registrado en el
respaldo, comprobar que el enlace activo sigue siendo el de este corte y
sustituirlo atómicamente. Cada respaldo incluye un `rollback.py` ejecutable.
Comprobar después portada y estudio de medicamentos. No se toca Caddy, DNS,
units, esquemas, datos ni EnvironmentFile.
