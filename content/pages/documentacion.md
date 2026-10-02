---
titulo: Documentación
descripcion: Cómo usar los datos de Compañía Chilena de Inteligencia de Datos: API pública, formatos de descarga, archivos originales, límites de uso, cómo citar y dónde está la metodología.
ruta: /documentacion/
---

<!-- Nota de implementación:
- Solo se documenta lo que existe y se verificó el 1-oct-2026 21:08 a 21:14 UTC. No documentar Parquet, ZIP, metadata.json, chart.png/svg, /cita ni volcados completos hasta que existan (SPEC §7.1, columna «Estado hoy»).
- Los ejemplos de llave no muestran el prefijo real (D-PREFIJO).
- Cuando exista /api/dataset/{id}/cita y la ficha con «Cómo citar», reemplazar el formato manual de abajo por el generado.
-->

# Documentación

## API pública

La API de Compañía Chilena de Inteligencia de Datos responde en JSON y no requiere registro. La referencia completa, con todas las rutas y sus parámetros, está en [datos.cochid.cl/api/docs](https://datos.cochid.cl/api/docs).

Ejemplos:

```
# Ficha de un conjunto: fuente, años, frecuencia y enlaces de descarga
curl "https://datos.cochid.cl/api/catalog/dipres_ley_linea"

# Lista de temas
curl "https://datos.cochid.cl/api/temas/"

# Años disponibles de la Ley de Presupuestos
curl "https://datos.cochid.cl/api/presupuesto/ley-anios"
```

**Límites del acceso público:** 120 consultas por minuto y 2.000 por hora por dirección IP. Si los superas, la API responde con el código 429 y debes esperar antes de volver a consultar.

## Descargar un conjunto

Cada conjunto del catálogo se descarga en dos formatos:

| Formato | Ruta |
|---|---|
| CSV | `https://datos.cochid.cl/api/dataset/{id}/export.csv` |
| Excel (XLSX) | `https://datos.cochid.cl/api/dataset/{id}/export.xlsx` |

`{id}` es el identificador que aparece en la dirección de la ficha. Por ejemplo, para `https://datos.cochid.cl/dataset/dipres_glosas` el CSV está en `https://datos.cochid.cl/api/dataset/dipres_glosas/export.csv`.

Cada descarga gratuita entrega hasta 10.000 filas. Si el conjunto tiene más filas, el archivo llega recortado a 10.000. Para el conjunto completo, [pide una descarga completa](/asesoria/?tipo=descarga-masiva).

## Archivos originales

Los archivos tal como los publicó la fuente (CSV, Excel, PDF) están en la [Biblioteca](https://datos.cochid.cl/biblioteca). Cada archivo tiene su dirección de origen, la fecha de descarga y su huella SHA-256.

```
# Metadatos de un archivo original
curl "https://datos.cochid.cl/api/raw-files/8154"

# Descarga del archivo
curl -O "https://datos.cochid.cl/api/raw-files/8154/download"
```

Para comprobar que el archivo no cambió, calcula su SHA-256 (`sha256sum archivo.pdf`) y compáralo con el valor de los metadatos.

## API con llave y créditos

Para consultas por sobre el límite público se usa una llave de la Cuenta con créditos prepagados. Los planes están en [Servicios](/servicios/).

```
curl -H "X-API-Key: TU_LLAVE" "https://api.innovacionsantiago.cl/gateway/cochid-datos/api/temas/"
```

[[VERIFICAR: cabecera que acepta el gateway para la llave (`X-API-Key` según `cuenta.md` §2.4; la SPEC §4.8 propone `Authorization: Bearer`) y ruta base pública del gateway para cochid-datos]]
[[VERIFICAR: URL de la Cuenta para crear una llave (`cuenta.innovacionsantiago.cl/…?producto=product.cochid.datos`, `lib/account.ts`)]]

## Cómo citar

Cita el conjunto o la vista con el nombre del autor, el año, el título, la dirección y la fecha de consulta:

> Compañía Chilena de Inteligencia de Datos (2026). DIPRES · Ley de Presupuestos por línea terminal. https://datos.cochid.cl/dataset/dipres_ley_linea. Consultado el 1 de octubre de 2026.

Cita también la fuente original que aparece en la ficha. En el ejemplo, la Dirección de Presupuestos.

## Licencia

Los datos de Compañía Chilena de Inteligencia de Datos no tienen una licencia formal. Si los usas, cita a Compañía Chilena de Inteligencia de Datos y a la fuente original que aparece en cada ficha, como se indica en «Cómo citar».

El uso de la API con llave y créditos pagados se rige por los términos de tu cuenta.

## Método y calidad

- [Metodología](https://datos.cochid.cl/metodologia): fuente, método y limitaciones de cada conjunto.
- [Trazabilidad](https://datos.cochid.cl/lineage): el camino de cada tabla desde el archivo original hasta la vista publicada.
- [Calidad](https://datos.cochid.cl/calidad): registro de cada corrida de carga, con filas leídas y escritas y su resultado.
- [Cobertura](https://datos.cochid.cl/coverage): años y territorios disponibles por conjunto.
- [Estado del servicio](https://datos.cochid.cl/api/health/deep).
