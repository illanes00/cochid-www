# Birren v2 en el portal

El portal aplica la paleta aprobada mediante el kit publicado candidate.46.
`scripts/birren.mjs` compone los ambientes acogida, lectura, datos y servicio,
la leyenda visible del muro y los iconos y familias del kit. El nombre, los
lockups y el favicon mantienen los archivos aprobados anteriores. Las cuatro
familias de este portal son estado, dinero, saber y territorio.

Los gráficos científicos conservan sus fuentes, unidades, series y archivos.
La pieza sobre Presupuesto 2027 sigue comparando aporte fiscal libre; el
escenario de inflación del 3 % se presenta como supuesto. Este cambio de diseño
no incorpora las tablas institucionales que otra sesión está preparando.

La adaptación toca las seis hojas enumeradas en `KIT-DESVIACIONES.md`. Los
radios del sol y de la entrada de cuenta corresponden a geometría funcional y
al componente canónico, respectivamente. El registro H29 enumera estas
superficies; no exime al host completo de H28.

## Evidencia del corte

Las pruebas de contratos, contenido y build se ejecutan en DEV bajo el mutex
`cis-build`, con el runtime Node 20 existente, sin instalar dependencias. Los
recibos conservan hashes de entradas, artefactos, runtimes prestados y el cierre
de cada proceso Native. La candidata emitida contiene 77 rutas y 287 archivos.

Los recibos fechados y las capturas están bajo
`/srv/projects/tasks/ui-ux-portal-birren46-20261007T1410/`. La evidencia compacta
versionada en `core/ui-ux/auditoria/evidencia/BW-37/` registra el resultado final,
la comparación con BW-01, Git, release, URL pública y rollback. Un recibo privado
no acredita por sí solo la publicación.

La copia sin JavaScript, los botones de copia, su fallback, las descargas y la
búsqueda se comprueban con interacción real. En la candidata privada, sólo el
índice estático se entrega desde los mismos bytes construidos para resolver la
diferencia de origen. La repetición pública usa el índice público sin relay.

## Historia y publicación

La fuente estática vigente y el antiguo `origin/main` de agosto tienen historias
independientes. Integrar ambas mediante `merge -s ours --allow-unrelated-histories`
conserva el árbol estático revisado y ambos padres. El corte exige igualdad del
árbol antes y después, revisión inmediata del SHA remoto y push atómico sin
force; el checkout principal y su WIP quedan preservados.

Publicar el artefacto DEV validado como release inmutable siguiendo
[`DEPLOY.md`](DEPLOY.md), con respaldo y sustitución CAS del enlace existente.
El recibo liga los hashes de entradas compilables al árbol final. Los cambios
posteriores de documentación o herramientas de QA quedan identificados y no se
presentan como entradas recompiladas. Repetir navegador, medición, hashes, salud
y logs en producción antes de cerrar BW-37.
