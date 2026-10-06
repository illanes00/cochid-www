# Registro vendorizado de destinos

`destinos.mjs` y `destinos.publico.json` son copias exactas de
`core-style/generated/portal/` en el commit `664bd4fae1bda796869c28808113202921d77cc0`.
El build del apex los lee localmente para ser reproducible y no depender de otro
worktree ni de la red. `SHA256SUMS` permite comprobar que la copia no cambió.


**Desvío local (6-oct-2026, pedido de Martín):** graphs, elecciones y prosa.medicamentos quedan con
`visible` en falso y fuera de `directorio_proyectos` en las tres copias; están solo para Martín tras
Authentik. Falta llevar el mismo cambio al registro de core-style antes de regenerar.
