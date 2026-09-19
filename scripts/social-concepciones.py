#!/usr/bin/env python3
"""Genera concepciones/social.png, la imagen de 1200x630 para og:image.

Dibuja la curva semanal real de concepciones/datos/semanal.json, con la
quincena máxima y la meseta mínima marcadas como bloques, nunca como puntos.
No calcula nada: solo lee el mismo archivo que alimenta la figura 1.

Uso:
    /srv/projects/cochid/cochid-concepciones/.venv/bin/python \\
        scripts/social-concepciones.py
"""
from pathlib import Path
import json

import matplotlib
matplotlib.use("Agg")
from matplotlib import font_manager
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

RAIZ = Path(__file__).resolve().parents[1]
DATOS = RAIZ / "concepciones" / "datos" / "semanal.json"
SALIDA = RAIZ / "concepciones" / "social.png"

# Tipografías canónicas del kit. Si no están instaladas, matplotlib usa su
# familia por defecto y la imagen igual se genera.
PLEX = Path("/srv/projects/cds/cds-sebastian/fonts")
MONO = Path("/usr/share/fonts/truetype/jetbrains-mono")
for carpeta, patron in ((PLEX, "IBMPlexSans-*.ttf"), (MONO, "JetBrainsMono-*.ttf")):
    if carpeta.is_dir():
        for ruta in sorted(carpeta.glob(patron)):
            font_manager.fontManager.addfont(str(ruta))

FAMILIAS = {f.name for f in font_manager.fontManager.ttflist}
SANS = "IBM Plex Sans" if "IBM Plex Sans" in FAMILIAS else "DejaVu Sans"
CIFRA = "JetBrains Mono" if "JetBrains Mono" in FAMILIAS else SANS

# Mismos valores que el bloque de tema claro de concepciones/story.css.
PAPEL = "#ffffff"
TINTA = "#14212b"
SUAVE = "#5b6b77"
LINEA = "#e5e9ec"
CONC = "#1f5d78"
BANDA = "#c4dde7"
EMPATE = "#2f7d63"
BLOQUE = "#e8eef1"


def dias_de_semana(s):
    return (358, 365) if s == 52 else ((s - 1) * 7 + 1, s * 7)


def main():
    d = json.loads(DATOS.read_text(encoding="utf-8"))
    if len(d["semana"]) != 52:
        raise SystemExit("semanal.json no trae 52 semanas")

    fig = plt.figure(figsize=(12, 6.3), dpi=100)
    fig.patch.set_facecolor(PAPEL)
    ax = fig.add_axes([0.055, 0.14, 0.905, 0.50])
    ax.set_facecolor(PAPEL)

    # Bloques de lectura: la quincena máxima cruza el fin de año.
    for a, b in ((358, 365), (1, 7)):
        ax.add_patch(Rectangle((a, 0.94), b - a, 0.16, color=EMPATE, alpha=0.14, lw=0))
    ax.add_patch(Rectangle((190, 0.94), 55, 0.16, color=BLOQUE, lw=0))

    for k in range(52):
        a, b = dias_de_semana(d["semana"][k])
        ax.fill_between([a, b], d["indice_lo"][k], d["indice_hi"][k], color=BANDA, lw=0, zorder=2)
    for k in range(52):
        a, b = dias_de_semana(d["semana"][k])
        ax.plot([a, b], [d["indice"][k]] * 2, color=CONC, lw=3.2, solid_capstyle="butt", zorder=3)
        if k:
            previo = dias_de_semana(d["semana"][k - 1])[1]
            ax.plot([previo, a], [d["indice"][k - 1], d["indice"][k]], color=CONC, lw=1.2, zorder=3)

    ax.axhline(1.0, color=SUAVE, lw=1, zorder=1)
    ax.set_xlim(1, 365)
    ax.set_ylim(0.94, 1.10)
    inicios = [1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335]
    largos = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
    ax.set_xticks([i + l / 2 for i, l in zip(inicios, largos)])
    ax.set_xticklabels(meses, fontfamily=SANS, fontsize=13, color=SUAVE)
    ax.set_yticks([0.96, 1.00, 1.04, 1.08])
    ax.set_yticklabels(["0,96", "1,00", "1,04", "1,08"], fontfamily=CIFRA, fontsize=12, color=SUAVE)
    ax.tick_params(length=0)
    for lado in ("top", "right", "left"):
        ax.spines[lado].set_visible(False)
    ax.spines["bottom"].set_color(LINEA)

    ax.annotate("Máximo: 24-dic a 7-ene", xy=(356, 1.093), ha="right", va="bottom",
                fontfamily=SANS, fontsize=15, color=TINTA, fontweight="semibold")
    ax.annotate("+8,7% y +8,5%, dos semanas empatadas", xy=(356, 1.077), ha="right", va="bottom",
                fontfamily=SANS, fontsize=12, color=SUAVE)
    ax.annotate("Mínimo: una meseta de casi dos meses", xy=(217, 1.063), ha="center", va="bottom",
                fontfamily=SANS, fontsize=14, color=TINTA, fontweight="semibold")
    ax.annotate("entre -4,6% y -4,0%, sin semana identificable", xy=(217, 1.048), ha="center", va="bottom",
                fontfamily=SANS, fontsize=11, color=SUAVE)

    fig.text(0.055, 0.885, "Cuándo se concibe en Chile", fontfamily=SANS, fontsize=40,
             fontweight="semibold", color=TINTA, va="top")
    fig.text(0.055, 0.755, "Índice semanal de concepción, cohortes 1989 a 2007. El día promedio es 1,00.",
             fontfamily=SANS, fontsize=16, color=SUAVE, va="top")
    fig.text(0.055, 0.055, "COCHID · cochid.cl/concepciones", fontfamily=CIFRA, fontsize=13, color=SUAVE)
    fig.text(0.945, 0.055, "5.073.711 nacimientos con fecha exacta", fontfamily=CIFRA, fontsize=13,
             color=SUAVE, ha="right")

    fig.savefig(SALIDA, facecolor=PAPEL)
    plt.close(fig)
    print(f"{SALIDA} escrito")


if __name__ == "__main__":
    main()
