# Registro vendorizado de destinos

`destinos.mjs` y `destinos.publico.json` son copias exactas de
`core-style/generated/portal/` en el commit `e9ff6a5f656e534a1067efc3d188fa0f52f111da`.
El build del apex los lee localmente para ser reproducible y no depender de otro
worktree ni de la red. `SHA256SUMS` permite comprobar que la copia no cambió.
