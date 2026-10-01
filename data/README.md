# Registro vendorizado de destinos

`destinos.mjs` y `destinos.publico.json` son copias exactas de
`core-style/generated/portal/` en el commit `f0729fc9fb78b84c3a055e9c73d197d79167aaed`.
El build del apex los lee localmente para ser reproducible y no depender de otro
worktree ni de la red. `SHA256SUMS` permite comprobar que la copia no cambió.
