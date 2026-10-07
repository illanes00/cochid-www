# Publicar el portal estático de Compañía Chilena de Inteligencia de Datos

El apex conserva HTML estático y el chrome compartido de Compañía Chilena de Inteligencia de Datos. El build
compone la portada, nueve páginas editoriales, el blog (`/blog/`, las entradas aprobadas
y `/blog/feed.xml` en RSS 2.0), `/novedades/` y los especiales
`/cambio-de-hora/` y `/concepciones/`. Las novedades son una instantánea del
momento del build: leen en modo lectura el campo `novedad` de los
`RELEASE.json` de `releases/cochid-*/current`, así que construir dos veces con
releases distintas puede cambiar `/novedades/` y la portada. Registrar el
manifiesto de `dist/` de la candidata revisada. No hay backend ni proceso Node en
producción para esta superficie.

## Verificaciones y build

Desde este árbol:

```sh
free -g
cis-build --dir "$PWD" node scripts/build.mjs
cis-build --dir "$PWD" python3 -m unittest discover -s tests -p 'test_*.py' -v
cis-build --dir "$PWD" node --test
(cd data && sha256sum -c SHA256SUMS)
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

La QA del portal recorre todas las páginas, incluidas las del blog y
`/novedades/`, a 1440, 1000, 768, 390 y 320 px, en claro y oscuro, siempre bajo
`flock /tmp/cochid-ui-browser.lock`. Fijar siempre `COCHID_QA_OUT` para no
escribir sobre los recibos de un corte anterior:

```sh
flock /tmp/cochid-ui-browser.lock bash -c '
python3 -m http.server 18547 --bind 127.0.0.1 --directory dist & srv=$!
trap "kill $srv; wait $srv" EXIT; sleep 1
COCHID_QA_OUT=/srv/projects/tasks/cochid-portal-20261001/qa/<corte> node scripts/qa-portal.mjs'
``` Verifica Axe, desborde,
foco de teclado y menú móvil. La unidad Caddy sirve archivos; no hay una
compilación Next ni un servicio de aplicación para el apex.

## Destino efectivo

Consultar `/etc/caddy/sites.d/cochid.cl.caddy` y la configuración activa antes
de cada corte. Al preparar esta candidata, el root existente es el enlace:

`/srv/projects/releases/cochid-main/91132ff-medicamentos-20260903T183955Z`

Resolver el destino vigente con `readlink` y leer su `RELEASE.json` en cada
corte. No copiar aquí el destino cambiante: el recibo fechado de publicación
registra la base y la candidata. Comparar por CAS antes de activar y conservar
un único flujo del apex.

## Presupuesto 2027

El recorte numérico, la comparación y los escenarios se reproducen con
`python3 scripts/presupuesto-2027.py`. La opción `--graficos` requiere
matplotlib y genera PNG y SVG. Ejecutarla con `cis-build` en el servidor con
memoria disponible. El hilo lee `assets/presupuesto-2027/hilo.json`; el build
publica seis textos seleccionables, botones de copia y PNG descargables en
`/blog/presupuesto-2027-aportes-cambios-nominal-real/hilo/`.

La QA portátil acepta `COCHID_QA_REQUIRE_FROM` y `COCHID_QA_CHROME` para el
runtime privado. Verificar en navegador copia individual y completa,
fallback de selección si se deniega el portapapeles, contenido sin JavaScript
y SHA de las descargas. Las fuentes, unidades, cobertura, años y escenarios
figuran en los PNG; revisar los originales para detectar rótulos recortados.

## Corte y reversión

1. Reservar el único flujo del apex con `cis-note`. Confirmar que el enlace
   continúa apuntando a la base revisada y no hay un deploy concurrente.
2. Guardar un respaldo con timestamp del enlace, manifiesto y hashes vivos.
3. Crear una ref Git recuperable y un bundle en el respaldo. Copiar `dist/`
   a una release nueva, añadir `RELEASE.json` y `SHA256SUMS`, verificar hashes
   y sellar todos los archivos (0444) y directorios (0555).
4. Con las verificaciones verdes y la autorización persistente aplicable, preparar un
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
