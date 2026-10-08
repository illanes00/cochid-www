#!/usr/bin/env python3
"""Reproduce comparaciones del IFP y la oferta; sin red ni bases de datos."""
from __future__ import annotations

import argparse
import csv
from decimal import Decimal
import json
from pathlib import Path
import runpy

ROOT = Path(__file__).resolve().parents[1]
VARIACION = runpy.run_path(str(ROOT / "scripts/presupuesto-2027.py"))["variacion"]


def resumir(datos):
    """Mantiene separadas las bases nominal, real y de ley inicial."""
    gct = datos["gobierno_central"]
    nominal = gct["cierre_2026_nominal"]
    real = gct["cierre_2026_precios_2027"]
    ley = gct["ley_2026_precios_2027"]
    nueva = gct["proyecto_2027"]
    if real["ano_precios"] != nueva["ano_precios"] or ley["ano_precios"] != nueva["ano_precios"]:
        raise ValueError("La comparación real exige la misma base de precios")
    if [f["ano"] for f in [nominal, real, ley, nueva]] != [2026, 2026, 2026, 2027]:
        raise ValueError("Años de comparación distintos de las fuentes verificadas")
    if nominal["ano_precios"] != 2026 or nueva["ano_precios"] != 2027:
        raise ValueError("La comparación nominal exige pesos corrientes de cada año")
    if [f["tipo"] for f in [nominal, real, ley, nueva]] != ["cierre_proyectado", "cierre_proyectado", "ley_aprobada", "proyecto"]:
        raise ValueError("Las bases de ley, cierre y proyecto no son intercambiables")
    for fila in [nominal, real, ley, nueva]:
        if fila["moneda"] != "CLP" or not isinstance(fila["valor_mm_clp"], int) or fila["valor_mm_clp"] <= 0:
            raise ValueError("Los importes deben ser positivos y estar en millones CLP")
    proyecto = gct["proyecto_2027"]["valor_mm_clp"]
    oferta = datos["oferta"]
    if oferta["financiamiento_especifico"] + oferta["financiamiento_institucional"] != oferta["total_programas"]:
        raise ValueError("La cobertura de programas no concilia")
    if oferta["aumentan"] + oferta["reducen"] + oferta["sin_variacion_o_sin_base_2026"] != oferta["financiamiento_especifico"]:
        raise ValueError("Las categorías de variación no concilian")
    return {
        "corte": datos["corte"],
        "gct_2027_mm_clp": proyecto,
        "gct_diferencia_nominal_mm_clp": proyecto - gct["cierre_2026_nominal"]["valor_mm_clp"],
        "gct_nominal_pct": float(VARIACION(gct["cierre_2026_nominal"]["valor_mm_clp"], proyecto)),
        "gct_real_recalculado_pct": float(VARIACION(gct["cierre_2026_precios_2027"]["valor_mm_clp"], proyecto)),
        "gct_real_oficial_pct": gct["variacion_real_oficial_cierre_pct"],
        "gct_real_ley_recalculado_pct": float(VARIACION(gct["ley_2026_precios_2027"]["valor_mm_clp"], proyecto)),
        "gct_real_ley_oficial_pct": gct["variacion_real_oficial_ley_pct"],
        "ipc_proyectado_2027_pct": datos["supuestos_2027"]["ipc_promedio_anual_pct"],
        "oferta_cobertura_pct": float(Decimal(oferta["financiamiento_especifico"]) / Decimal(oferta["total_programas"]) * 100),
        "programas_fusionados_reportados": datos["fusiones"]["programas_integrados_reportados"],
        "iniciativas_resultantes_reportadas": datos["fusiones"]["iniciativas_resultantes_reportadas"],
        "nuevos_programas_miles_clp": sum(p["proyecto_2027_miles_clp"] for p in datos["nuevos_programas"]),
        "advertencias": datos["advertencias"],
    }


def escribir(datos, salida):
    resultado = resumir(datos)
    salida.mkdir(parents=True, exist_ok=True)
    (salida / "resumen-ifp.json").write_text(json.dumps(resultado, ensure_ascii=False, indent=2) + "\n")
    with (salida / "gasto-gobierno-central.csv").open("w", newline="", encoding="utf-8") as archivo:
        escritor = csv.writer(archivo)
        escritor.writerow(["medida", "ano", "ano_precios", "tipo", "moneda", "millones"])
        for clave in ["cierre_2026_nominal", "cierre_2026_precios_2027", "ley_2026_precios_2027", "proyecto_2027"]:
            fila = datos["gobierno_central"][clave]
            escritor.writerow([clave, fila["ano"], fila["ano_precios"], fila["tipo"], fila["moneda"], fila["valor_mm_clp"]])
    with (salida / "programas-fusionados.csv").open("w", newline="", encoding="utf-8") as archivo:
        escritor = csv.writer(archivo)
        escritor.writerow(["programas_origen", "programa_resultante", "servicio", "estado"])
        for grupo in datos["fusiones"]["grupos"]:
            escritor.writerow(["; ".join(grupo["origen"]), grupo["resultado"], grupo["servicio"], "fusion_propuesta_2027"])
    return resultado


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--datos", type=Path, default=ROOT / "assets/presupuesto-2027/ifp-2027.json")
    parser.add_argument("--salida", type=Path, default=ROOT / "assets/presupuesto-2027")
    args = parser.parse_args()
    datos = json.loads(args.datos.read_text())
    resultado = escribir(datos, args.salida)
    print(json.dumps(resultado, ensure_ascii=False))


if __name__ == "__main__":
    main()
