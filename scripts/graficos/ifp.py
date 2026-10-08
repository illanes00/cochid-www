#!/usr/bin/env python3
"""Figuras exportables del IFP, con bases explícitas y tipografía canónica."""
import argparse
from decimal import Decimal
import json
from pathlib import Path
import runpy


ROOT = Path(__file__).resolve().parents[2]


def graficos(datos, salida, fuente):
    import matplotlib
    matplotlib.use("Agg")
    from matplotlib import font_manager
    import matplotlib.pyplot as plt
    from matplotlib.patches import Rectangle

    font_manager.fontManager.addfont(str(fuente))
    nombre_fuente = font_manager.FontProperties(fname=fuente).get_name()
    if nombre_fuente != "IBM Plex Sans":
        raise ValueError("Se requiere IBM Plex Sans del kit canónico")
    plt.rcParams.update({"font.family": nombre_fuente, "font.size": 28,
                         "svg.fonttype": "path", "svg.hashsalt": "presupuesto-2027-ifp",
                         "axes.spines.top": False,
                         "axes.spines.right": False, "axes.spines.left": False})
    azul, gris, tinta, borde = "#1d4ed8", "#595d63", "#17181a", "#c4c6c9"
    gct = datos["gobierno_central"]
    resumen = runpy.run_path(str(ROOT / "scripts/presupuesto-ifp-2027.py"))["resumir"](datos)
    salida.mkdir(parents=True, exist_ok=True)
    validaciones = []

    def guardar(fig, nombre):
        from matplotlib.text import Text
        fig.set_dpi(180)
        fig.canvas.draw()
        renderer = fig.canvas.get_renderer()
        textos = [(t.get_text(), t.get_window_extent(renderer), t.get_fontsize())
                  for t in fig.findobj(Text) if t.get_visible() and t.get_text().strip()]
        ancho, alto = fig.canvas.get_width_height()
        for texto, caja, _ in textos:
            if caja.x0 < 0 or caja.y0 < 0 or caja.x1 > ancho or caja.y1 > alto:
                raise ValueError(f"{nombre}: texto recortado: {texto}")
        for i, (texto, caja, _) in enumerate(textos):
            for otro, segunda, _ in textos[i + 1:]:
                if caja.overlaps(segunda):
                    raise ValueError(f"{nombre}: rótulos superpuestos: {texto} / {otro}")
        minimo = min(size * 180 / 72 * 256 / ancho for _, _, size in textos)
        if minimo < 12:
            raise ValueError(f"{nombre}: texto inferior a 12 px a 256 px de ancho")
        validaciones.append({"figura": nombre, "ancho": ancho, "alto": alto,
                             "rotulos": len(textos), "recortes": 0, "superposiciones": 0,
                             "texto_minimo_px_a_256": minimo})
        fig.savefig(salida / f"{nombre}.png", dpi=180, facecolor="white")
        fig.savefig(salida / f"{nombre}.svg", facecolor="white", metadata={
            "Title": nombre.replace("-", " "),
            "Date": resumen["corte"],
            "Description": "Proyecto 2027; fuente DIPRES, IFP del tercer trimestre de 2026 y Oferta Programática 2027. Bases y valores en tablas HTML y CSV vinculadas."
        })
        plt.close(fig)

    fig, ejes = plt.subplots(2, 1, figsize=(8, 10))
    for ax, clave, titulo, cambio in zip(
        ejes, ["cierre_2026_nominal", "cierre_2026_precios_2027"],
        ["Pesos de cada año", "Pesos de 2027"], ["+4,46% nominal", "+1,5% real, DIPRES"]
    ):
        valores = [gct[clave]["valor_mm_clp"] / 1e6, gct["proyecto_2027"]["valor_mm_clp"] / 1e6]
        ax.barh([1, 0], valores, height=.54, color=[gris, azul])
        ax.set_yticks([1, 0], ["2026", "2027"])
        ax.set_xlim(0, 100)
        ax.set_xticks([0, 50, 100])
        ax.set_xlabel("Billones de pesos", labelpad=10)
        ax.set_title(titulo + "\n" + cambio, loc="left", fontsize=28, pad=20)
        for y, v in zip([1, 0], valores):
            ax.text(v - 2, y, f"{v:.2f}".replace(".", ","), color="white", ha="right", va="center", fontsize=28)
        ax.tick_params(axis="both", labelsize=28)
    fig.subplots_adjust(left=.17, right=.92, top=.86, bottom=.24, hspace=1.3)
    fig.text(.06, .02, "DIPRES, IFP 3T 2026\nCierre esperado 2026 / proyecto 2027", fontsize=27, color=tinta)
    guardar(fig, "gasto-gobierno-central")

    # La proyección IPC se aplica al aporte fiscal como cálculo propio, sin
    # sustituir la comparación real oficial del Gobierno Central.
    canon = runpy.run_path(str(ROOT / "scripts/presupuesto-2027.py"))
    aporte = json.loads((ROOT / "assets/presupuesto-2027/comparacion.json").read_text())
    canon["validar"](aporte)
    base, propuesta = aporte["total_2026_miles_clp"], aporte["total_2027_miles_clp"]
    ipc = Decimal(datos["supuestos_2027"]["ipc_promedio_anual_pct"]) / 100
    nominal = canon["variacion"](base, propuesta)
    real = canon["variacion"](base, propuesta, ipc)
    resumen.update(aporte_fiscal_nominal_pct=float(nominal),
                   aporte_fiscal_real_ipc_proyectado_pct=float(real))
    fig, ejes = plt.subplots(2, 1, figsize=(8, 10))
    for ax, deflactor, titulo, cambio in zip(
        ejes, [Decimal(1), Decimal(1) + ipc],
        ["Pesos de cada año", "Pesos de 2026, IPC 2,9%"],
        ["+2,16% nominal", "−0,72% real estimado"]
    ):
        valores = [base / 1e9, float(Decimal(propuesta) / deflactor / Decimal(10**9))]
        ax.barh([1, 0], valores, height=.54, color=[gris, azul])
        ax.set_yticks([1, 0], ["2026", "2027"])
        ax.set_xlim(0, 80)
        ax.set_xticks([0, 40, 80])
        ax.set_xlabel("Billones de pesos", labelpad=10)
        ax.set_title(titulo + "\n" + cambio, loc="left", fontsize=28, pad=20)
        for y, v in zip([1, 0], valores):
            ax.text(v - 2, y, f"{v:.2f}".replace(".", ","), ha="right", va="center", color="white", fontsize=28)
        ax.tick_params(axis="both", labelsize=28)
    fig.subplots_adjust(left=.17, right=.92, top=.86, bottom=.24, hspace=1.3)
    fig.text(.06, .02, "Aporte fiscal libre, cálculo propio\nDIPRES 2026 / Cámara 2027 / IFP", fontsize=27, color=tinta)
    guardar(fig, "aporte-fiscal-ipc-proyectado")

    fig, ax = plt.subplots(figsize=(8, 7))
    ax.barh([2, 1, 0], [220, 114, 141], height=.55, color=[gris, azul, gris])
    ax.set_yticks([2, 1, 0], ["Reducen", "Aumentan", "Sin cambio\no sin base"])
    ax.set_xlim(0, 250)
    ax.set_xticks([0, 100, 200])
    ax.set_xlabel("Número de programas", fontsize=28, labelpad=15)
    ax.tick_params(axis="both", labelsize=28)
    for y, v in zip([2, 1, 0], [220, 114, 141]):
        ax.text(v - 8, y, str(v), ha="right", va="center", color="white", fontsize=28)
    ax.set_title("475 programas con\nfinanciamiento específico", loc="left", fontsize=28, pad=30)
    fig.subplots_adjust(left=.31, right=.95, top=.79, bottom=.31)
    fig.text(.05, .03, "DIPRES, Oferta Programática 2027\nLey 2026 ajustada, a precios de 2027", fontsize=27, color=tinta)
    guardar(fig, "oferta-programas")

    fig, ax = plt.subplots(figsize=(8, 9))
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.set_axis_off()
    filas = [
        ("Aysén, Patagonia Aysén\ny Magallanes", "Becas Patagonia"),
        ("Biblioteca Pública Digital\ny Bibliomás", "Frecuencia Lectora"),
        ("Elige Vida Sana y tres\nintervenciones de APS", "Más Salud en Comunidad"),
    ]
    for y, (origen, destino) in zip([.92, .60, .28], filas):
        ax.add_patch(Rectangle((.02, y - .11), .96, .13, facecolor="white", edgecolor=borde))
        ax.text(.50, y - .045, origen, ha="center", va="center", fontsize=28, color=tinta)
        ax.annotate("", xy=(.50, y - .183), xytext=(.50, y - .125), arrowprops={"arrowstyle": "->", "color": tinta, "lw": 1.5})
        ax.add_patch(Rectangle((.02, y - .27), .96, .085, facecolor="white", edgecolor=borde))
        ax.text(.50, y - .2275, destino, ha="center", va="center", fontsize=28, color=tinta)
    fig.subplots_adjust(left=.04, right=.96, top=.93, bottom=.16)
    fig.text(.06, .03, "Ejemplos de integración, no eliminación\nDIPRES, cuadro 4 de Oferta 2027", fontsize=27, color=tinta)
    guardar(fig, "fusiones-programas")
    resumen["figuras"] = validaciones
    return resumen


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--fuente", required=True, type=Path)
    parser.add_argument("--salida", type=Path, default=ROOT / "assets/presupuesto-2027")
    args = parser.parse_args()
    datos = json.loads((ROOT / "assets/presupuesto-2027/ifp-2027.json").read_text())
    print(json.dumps(graficos(datos, args.salida, args.fuente), ensure_ascii=False))


if __name__ == "__main__":
    main()
