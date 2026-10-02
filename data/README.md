# Registro vendorizado de destinos

`destinos.mjs` y `destinos.publico.json` son copias exactas de
`core-style/generated/portal/` en el commit `5a0f51673b921e7fcaa1a7f1353ca6e755e25a9b`.
El build del apex los lee localmente para ser reproducible y no depender de otro
worktree ni de la red. `SHA256SUMS` permite comprobar que la copia no cambió.
