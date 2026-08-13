# Runtime de cochid.cl

La fuente vigente del apex está en [`runtime-static/`](runtime-static/). Caddy
sirve un export inmutable del commit aprobado y no ejecuta la aplicación Flask
histórica de este repositorio.

## Estado de las dos superficies

| Superficie | Estado | Uso |
| --- | --- | --- |
| `runtime-static/index.html` | Canónica | Fuente del release público |
| `app.py`, `templates/`, `static/`, Tailwind | Legado | No desplegar; pendiente retiro en un corte separado |

La separación es deliberada: permite versionar de inmediato el sitio que está
en producción sin mezclar ni borrar la historia Flask. La siguiente limpieza
debe eliminar el legado y retirar el workflow CD antiguo sólo después de
aprobar el contrato de despliegue estático.

## Release vigente

- Commit de fuente local: `acb8eb3546837192a5c4baa45293656daf4f7fab`.
- Directorio servido:
  `/srv/projects/releases/cochid-main/acb8eb3546837192a5c4baa45293656daf4f7fab`.
- Digest Style v9: `f417275cbb1c390a6b158f2f6574db1b36e2a6cc61e734029530ef90b9d1dd77`.
- Rollback: restaurar el bloque Caddy respaldado según
  [`runtime-static/docs/RELEASE_AND_ROLLBACK.md`](runtime-static/docs/RELEASE_AND_ROLLBACK.md).

El workflow `.github/workflows/cd.yml` pertenece al runtime Flask histórico y
no autoriza ni describe el despliegue del apex actual.
