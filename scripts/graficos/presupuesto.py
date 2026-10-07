#!/usr/bin/env python3
"""Fichas de gráficos para redes desde la comparación verificada del proyecto de presupuesto 2027.

Lee `assets/presupuesto-2027/comparacion.json` (la misma tabla del análisis del blog, con sus fuentes
y comprobaciones en `scripts/presupuesto-2027.py`) y escribe, por cada gráfico:

- `content/graficos/<slug>.json`: textos, filas del gráfico, tabla de datos, fuentes y texto para X;
- `assets/g/<slug>/{x,og,vertical}.jpg`: la imagen para X (1200×675), la de vista previa en redes
  (1200×630) y la vertical para Instagram (1080×1350), dibujadas con la plantilla «grafico» de cis-posts;
- `assets/g/<slug>/datos.csv`: las cifras del gráfico.

No consulta bases ni la red. Las imágenes se dibujan con el mismo código que usa cis-posts al publicar,
así la imagen de la página y la del post son iguales.

Uso (Pillow y cairosvg, por ejemplo el venv de cis-posts):
    python scripts/graficos/presupuesto.py               # escribe fichas e imágenes
    python scripts/graficos/presupuesto.py --sin-imagenes
"""
from __future__ import annotations

import argparse
import csv
import io
import json
import sys
from decimal import Decimal
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
CIS_POSTS = Path("/srv/projects/cis/cis-posts")
DATOS_KIT = Path("/srv/data/cis-posts")
BASE_URL = "https://cochid.cl/g/"
NBSP = " "
INFLACION = Decimal("0.03")
CORTE = "2026-10-05"
CORTE_TEXTO = "5 de octubre de 2026"
FUENTE_CORTA = "DIPRES (ley 2026) y Cámara de Diputadas y Diputados (proyecto 2027). Datos al 5 de octubre de 2026"
SERIE = "presupuesto-2027"

# partida -> (nombre completo, nombre corto para el gráfico, ícono lucide)
PARTIDAS = {
    "01": ("Presidencia de la República", "Presidencia", "flag"),
    "02": ("Congreso Nacional", "Congreso", "landmark"),
    "03": ("Poder Judicial", "Poder Judicial", "gavel"),
    "04": ("Contraloría General de la República", "Contraloría", "clipboard-check"),
    "05": ("Ministerio del Interior", "Interior", "map"),
    "06": ("Ministerio de Relaciones Exteriores", "Relaciones Exteriores", "globe"),
    "07": ("Ministerio de Economía, Fomento y Turismo", "Economía", "briefcase"),
    "08": ("Ministerio de Hacienda", "Hacienda", "coins"),
    "09": ("Ministerio de Educación", "Educación", "graduation-cap"),
    "10": ("Ministerio de Justicia y Derechos Humanos", "Justicia", "scale"),
    "11": ("Ministerio de Defensa Nacional", "Defensa", "shield"),
    "12": ("Ministerio de Obras Públicas", "Obras Públicas", "hard-hat"),
    "13": ("Ministerio de Agricultura", "Agricultura", "wheat"),
    "14": ("Ministerio de Bienes Nacionales", "Bienes Nacionales", "map-pin"),
    "15": ("Ministerio del Trabajo y Previsión Social", "Trabajo y Previsión", "users"),
    "16": ("Ministerio de Salud", "Salud", "heart-pulse"),
    "17": ("Ministerio de Minería", "Minería", "pickaxe"),
    "18": ("Ministerio de Vivienda y Urbanismo", "Vivienda", "house"),
    "19": ("Ministerio de Transportes y Telecomunicaciones", "Transportes", "bus"),
    "20": ("Ministerio Secretaría General de Gobierno", "Secretaría General de Gobierno", "megaphone"),
    "21": ("Ministerio de Desarrollo Social y Familia", "Desarrollo Social", "hand-heart"),
    "22": ("Ministerio Secretaría General de la Presidencia", "Secretaría de la Presidencia", "file-text"),
    "23": ("Ministerio Público", "Ministerio Público", "search"),
    "24": ("Ministerio de Energía", "Energía", "zap"),
    "25": ("Ministerio del Medio Ambiente", "Medio Ambiente", "leaf"),
    "26": ("Ministerio del Deporte", "Deporte", "trophy"),
    "27": ("Ministerio de la Mujer y la Equidad de Género", "Mujer y Equidad de Género", "heart-handshake"),
    "28": ("Servicio Electoral", "Servicio Electoral", "vote"),
    "29": ("Ministerio de las Culturas, las Artes y el Patrimonio", "Culturas", "palette"),
    "30": ("Ministerio de Ciencia, Tecnología, Conocimiento e Innovación", "Ciencia", "flask-conical"),
    "31": ("Gobiernos regionales", "Gobiernos regionales", "building-2"),
    "32": ("Ministerio de Seguridad Pública", "Seguridad Pública", "shield-check"),
}
# Partidas cuyo cambio mezcla un traslado de servicios: no entran a los rankings de alzas y bajas.
CAMBIAN_PERIMETRO = {"10", "32"}

QUE_ES = ("El aporte fiscal libre es el dinero que el Tesoro Público entrega a cada ministerio para "
          "funcionar. No es todo su presupuesto: los ministerios también tienen ingresos propios y otras "
          "transferencias.")
NOMINAL_REAL = ("«Nominal» compara pesos de cada año. «Real» descuenta una inflación hipotética de 3 % para "
                "saber si alcanza para comprar más o menos que en 2026. No es una proyección oficial.")
QUE_ES_PROYECTO = ("2027 es el proyecto de ley que el Gobierno envió al Congreso y que todavía se discute; "
                   "2026 es la ley aprobada al inicio del año.")


# --- formato ---------------------------------------------------------------------------------------
def num(valor: float | Decimal, decimales: int = 2) -> str:
    texto = f"{abs(float(valor)):,.{decimales}f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return ("−" if float(valor) < 0 else "") + texto


def pct(valor: float | Decimal, decimales: int = 1, signo: bool = True) -> str:
    v = float(valor)
    prefijo = "+" if signo and v > 0 else ""
    return f"{prefijo}{num(v, decimales)}{NBSP}%"


def plata(miles: int | Decimal) -> str:
    """Monto en pesos a partir de miles de pesos, en billones o miles de millones."""
    pesos = Decimal(miles) * 1000
    if pesos >= Decimal(10) ** 12:
        return f"${num(pesos / Decimal(10) ** 12)}{NBSP}billones"
    return f"${num(pesos / Decimal(10) ** 9, 0 if pesos >= Decimal(10) ** 11 else 2 if pesos < Decimal(10) ** 11 // 4 else 1)}{NBSP}mil{NBSP}millones"


def plata_corta(miles: int | Decimal) -> str:
    pesos = Decimal(miles) * 1000
    if pesos >= Decimal(10) ** 12:
        return f"${num(pesos / Decimal(10) ** 12)}{NBSP}bill."
    return f"${num(pesos / Decimal(10) ** 9, 0)}{NBSP}mil{NBSP}mill."


def al(nombre: str) -> str:
    """«al Ministerio de Salud», «a la Contraloría», «a los gobiernos regionales»."""
    if nombre.startswith(("Ministerio", "Congreso", "Poder", "Servicio")):
        return f"al {nombre}"
    if nombre.startswith(("Presidencia", "Contraloría")):
        return f"a la {nombre}"
    if nombre.startswith("Gobiernos"):
        return f"a los {nombre[0].lower()}{nombre[1:]}"
    return f"a {nombre}"


def y_lista(nombres: list[str]) -> str:
    return ", ".join(nombres[:-1]) + f" y {nombres[-1]}" if len(nombres) > 1 else nombres[0]


def a_pesos_2026(miles: int) -> Decimal:
    return Decimal(miles) / (1 + INFLACION)


def variacion(base, nuevo, inflacion: Decimal = Decimal(0)) -> Decimal:
    return (Decimal(nuevo) / Decimal(base) / (1 + inflacion) - 1) * 100


def plano(texto: str) -> str:
    """Texto para HTML y CSV: sin espacios duros ni el signo menos tipográfico."""
    return texto.replace(NBSP, " ")


# --- fichas ----------------------------------------------------------------------------------------
def base_ficha(slug: str, **campos) -> dict:
    return {"slug": slug, "url": f"{BASE_URL}{slug}/", "serie": SERIE, "marca": "cochid", "corte": CORTE,
            "corte_texto": CORTE_TEXTO, "fuente_corta": FUENTE_CORTA, "lectura": [QUE_ES, QUE_ES_PROYECTO],
            "explorar": [{"etiqueta": "Comparar todas las instituciones en el visor del proyecto 2027",
                          "url": "https://datos.cochid.cl/presupuesto/proyecto"},
                         {"etiqueta": "Leer el análisis completo, con método y fuentes",
                          "url": "https://cochid.cl/blog/presupuesto-2027-aportes-cambios-nominal-real/"}],
            **campos}


def ficha_total(d: dict) -> dict:
    t26, t27 = d["total_2026_miles_clp"], d["total_2027_miles_clp"]
    nominal, real = variacion(t26, t27), variacion(t26, t27, INFLACION)
    real27 = a_pesos_2026(t27)
    filas = [
        {"etiqueta": "En pesos de cada año", "icono": "banknote", "valor": float(t26) / 1e9, "texto": plata_corta(t26),
         "valor_b": float(t27) / 1e9, "texto_b": plata_corta(t27), "delta": pct(nominal, 2)},
        {"etiqueta": "En pesos de 2026", "icono": "piggy-bank", "valor": float(t26) / 1e9, "texto": plata_corta(t26),
         "valor_b": float(real27) / 1e9, "texto_b": plata_corta(real27), "delta": pct(real, 2), "destacar": True},
    ]
    return base_ficha(
        "presupuesto-2027-aporte-total",
        titulo=f"El aporte del Fisco sube {pct(nominal, 2, False)}, pero pierde poder de compra",
        bajada=(f"Los {plata(t27)} del proyecto 2027 equivalen a {plata(real27)} de 2026 si la inflación "
                f"fuera de 3{NBSP}%."),
        descripcion=(f"El aporte fiscal libre pasa de {plano(plata(t26))} en la ley 2026 a {plano(plata(t27))} en el "
                     f"proyecto 2027 ({plano(pct(nominal, 2))} nominal, {plano(pct(real, 2))} con inflación hipotética de 3 %)."),
        texto_x=(f"Proyecto de presupuesto 2027: el aporte del Fisco a los ministerios pasa de {plata(t26)} a "
                 f"{plata(t27)} ({pct(nominal, 2)}). Con una inflación de 3{NBSP}%, alcanzaría para comprar "
                 f"{pct(-real, 2, False)} menos que en 2026."),
        etiqueta="Presupuesto 2027", icono="landmark",
        grafico={"tipo": "comparacion", "serie_a": "Ley 2026", "serie_b": "Proyecto 2027",
                 "url": f"cochid.cl/g/presupuesto-2027-aporte-total", "filas": filas,
                 "anotaciones": [{"fila": "En pesos de 2026",
                                  "texto": f"Escenario con inflación de 3{NBSP}%, no una proyección oficial"}]},
        alt=(f"Barras de la ley 2026 y el proyecto 2027: {plano(plata(t26))} y {plano(plata(t27))} en pesos de cada año "
             f"({plano(pct(nominal, 2))}); {plano(plata(t26))} y {plano(plata(real27))} en pesos de 2026 ({plano(pct(real, 2))})."),
        lectura=[QUE_ES, NOMINAL_REAL, QUE_ES_PROYECTO],
        tabla={"columnas": ["Medida", "Ley 2026", "Proyecto 2027", "Variación"],
               "filas": [["Pesos de cada año", plano(plata(t26)), plano(plata(t27)), plano(pct(nominal, 2))],
                         ["Pesos de 2026 (inflación 3 %)", plano(plata(t26)), plano(plata(real27)), plano(pct(real, 2))]]},
        csv=[["medida", "ley_2026_miles_clp", "proyecto_2027_miles_clp", "variacion_pct"],
             ["pesos_de_cada_anio", t26, t27, f"{nominal:.4f}"],
             ["pesos_de_2026_inflacion_3", t26, f"{real27:.0f}", f"{real:.4f}"]],
    )


def filas_ranking(partidas, inflacion=Decimal(0)):
    filas = []
    for p in partidas:
        nombre, corto, icono = PARTIDAS[p["partida"]]
        v = variacion(p["ley_2026_miles_clp"], p["proyecto_2027_miles_clp"], inflacion)
        filas.append({"etiqueta": corto, "icono": icono, "valor": float(v), "texto": pct(v)})
    return filas


def ficha_extremos(d: dict, sentido: str) -> dict:
    comparables = [p for p in d["partidas"] if p["partida"] not in CAMBIAN_PERIMETRO]
    orden = sorted(comparables, key=lambda p: p["variacion_nominal_pct"], reverse=sentido == "alzas")[:6]
    filas = filas_ranking(orden)
    for f in filas[:2]:
        f["destacar"] = True
    p0 = orden[0]
    nombre0, corto0, _ = PARTIDAS[p0["partida"]]
    dif = Decimal(p0["proyecto_2027_miles_clp"]) - Decimal(p0["ley_2026_miles_clp"])
    sube = sentido == "alzas"
    titulo = ("Deporte, Ministerio Público y Contraloría: los aportes del Fisco que más suben en 2027" if sube else
              "Vivienda y Cultura: los aportes del Fisco que más caen en 2027")
    nombres = y_lista([PARTIDAS[p["partida"]][1] for p in orden[:3]])
    return base_ficha(
        f"presupuesto-2027-mayores-{sentido}",
        titulo=titulo if (orden[0]["partida"], orden[1]["partida"]) in (("26", "23"), ("18", "29")) else
        f"Los aportes del Fisco que más {'suben' if sube else 'caen'} en el proyecto 2027",
        bajada=("Cambio del aporte fiscal libre de la ley 2026 al proyecto 2027. Sin Justicia ni Seguridad, "
                "por el traslado de Gendarmería."),
        descripcion=(f"Las seis instituciones cuyo aporte fiscal libre más {'sube' if sube else 'baja'} en el proyecto 2027: "
                     f"{', '.join(plano(f['etiqueta'] + ' ' + f['texto']) for f in filas)}."),
        texto_x=(f"Proyecto de presupuesto 2027: los aportes del Fisco que más {'suben' if sube else 'caen'} son "
                 f"{nombres}. {corto0} {'recibiría' if sube else 'recibiría'} {plata(abs(dif))} "
                 f"{'más' if sube else 'menos'} que en la ley 2026 ({pct(p0['variacion_nominal_pct'])})."),
        etiqueta="Presupuesto 2027", icono="trending-up" if sube else "trending-down",
        grafico={"tipo": "variacion", "url": f"cochid.cl/g/presupuesto-2027-mayores-{sentido}",
                 "nota": "En pesos de cada año, sin ajustar por inflación", "filas": filas,
                 "anotaciones": [{"fila": corto0, "texto": f"{plata(abs(dif))} {'más' if sube else 'menos'} que en 2026"}]},
        alt=(f"Barras horizontales con el cambio del aporte fiscal libre 2026 a 2027: "
             f"{'; '.join(plano(f['etiqueta'] + ' ' + f['texto']) for f in filas)}."),
        lectura=[QUE_ES, QUE_ES_PROYECTO,
                 "Justicia y Seguridad Pública no se comparan aquí: Gendarmería pasa de Justicia a Seguridad en 2027 y "
                 "eso mueve sus cifras sin que cambie el gasto."],
        tabla=tabla_partidas(orden), csv=csv_partidas(orden),
    )


def tabla_partidas(partidas) -> dict:
    filas = []
    for p in partidas:
        nombre = PARTIDAS[p["partida"]][0]
        filas.append([nombre, plano(plata(p["ley_2026_miles_clp"])), plano(plata(p["proyecto_2027_miles_clp"])),
                      plano(pct(p["variacion_nominal_pct"])), plano(pct(p["variacion_real_escenario_3_pct"]))])
    return {"columnas": ["Institución", "Ley 2026", "Proyecto 2027", "Variación nominal", "Con inflación de 3 %"],
            "filas": filas}


def csv_partidas(partidas) -> list:
    salida = [["partida", "institucion", "ley_2026_miles_clp", "proyecto_2027_miles_clp", "variacion_nominal_pct",
               "variacion_real_inflacion_3_pct"]]
    for p in partidas:
        salida.append([p["partida"], PARTIDAS[p["partida"]][0], p["ley_2026_miles_clp"], p["proyecto_2027_miles_clp"],
                       f"{p['variacion_nominal_pct']:.4f}", f"{p['variacion_real_escenario_3_pct']:.4f}"])
    return salida


def ficha_mayores_montos(d: dict) -> dict:
    orden = sorted(d["partidas"], key=lambda p: p["proyecto_2027_miles_clp"], reverse=True)[:7]
    total = Decimal(d["total_2027_miles_clp"])
    filas = []
    for p in orden:
        _, corto, icono = PARTIDAS[p["partida"]]
        filas.append({"etiqueta": corto, "icono": icono, "valor": p["proyecto_2027_miles_clp"] / 1e9,
                      "texto": plata_corta(p["proyecto_2027_miles_clp"])})
    filas[0]["destacar"] = filas[1]["destacar"] = filas[2]["destacar"] = True
    tres = sum(Decimal(p["proyecto_2027_miles_clp"]) for p in orden[:3])
    parte = tres / total * 100
    return base_ficha(
        "presupuesto-2027-donde-va-el-aporte",
        titulo=f"Educación, Trabajo y Salud se llevan {num(parte, 0)}{NBSP}% del aporte del Fisco en 2027",
        bajada=f"Instituciones que más aporte fiscal libre recibirían en el proyecto 2027, de un total de {plata(total)}.",
        descripcion=(f"Las siete instituciones con más aporte fiscal libre en el proyecto 2027. Educación, Trabajo y Salud "
                     f"suman {plano(plata(tres))}, el {num(parte, 0)} % del total."),
        texto_x=(f"Proyecto de presupuesto 2027: de los {plata(total)} que el Fisco entrega a los ministerios, "
                 f"Educación, Trabajo y Salud se llevan {plata(tres)} ({num(parte, 0)}{NBSP}%)."),
        etiqueta="Presupuesto 2027", icono="chart-column",
        grafico={"tipo": "ranking", "url": "cochid.cl/g/presupuesto-2027-donde-va-el-aporte", "filas": filas,
                 "nota": "Aporte fiscal libre del proyecto 2027",
                 "anotaciones": [{"fila": filas[2]["etiqueta"],
                                  "texto": f"Entre las tres: {num(parte, 0)}{NBSP}% del total"}]},
        alt=("Ranking del aporte fiscal libre 2027: " + "; ".join(plano(f["etiqueta"] + " " + f["texto"]) for f in filas)).rstrip(".") + ".",
        tabla=tabla_partidas(orden), csv=csv_partidas(orden),
    )


def ficha_seguridad(d: dict) -> dict:
    s = d["perimetro_constante_seguridad"]
    a, b = s["ley_2026_combinada_miles_clp"], s["proyecto_2027_seguridad_incluye_gendarmeria_miles_clp"]
    seg26 = s["ley_2026_seguridad_miles_clp"]
    directa = variacion(seg26, b)
    nominal, real = variacion(a, b), variacion(a, b, INFLACION)
    filas = [
        {"etiqueta": "Sólo Seguridad en 2026", "icono": "shield", "valor": seg26 / 1e9, "texto": plata_corta(seg26),
         "valor_b": b / 1e9, "texto_b": plata_corta(b), "delta": pct(directa)},
        {"etiqueta": "Con Gendarmería ambos años", "icono": "shield-check", "valor": a / 1e9, "texto": plata_corta(a),
         "valor_b": b / 1e9, "texto_b": plata_corta(b), "delta": pct(nominal), "destacar": True},
    ]
    return base_ficha(
        "presupuesto-2027-seguridad",
        titulo=f"Seguridad: el aporte del Fisco sube {pct(nominal, 1, False)}, no {pct(directa, 1, False)}",
        bajada=("Gendarmería pasa de Justicia a Seguridad Pública en 2027. Para comparar lo mismo, hay que sumarla "
                "también en 2026."),
        descripcion=(f"Comparando el mismo perímetro, el aporte fiscal libre de Seguridad Pública con Gendarmería sube "
                     f"{plano(pct(nominal, 1, False))} nominal y {plano(pct(real, 1, False))} con inflación hipotética de 3 %; la comparación directa "
                     f"({plano(pct(directa))}) mezcla el traslado de Gendarmería."),
        texto_x=(f"Proyecto 2027: el aporte del Fisco a Seguridad Pública parece subir {pct(directa, 1, False)}, pero incluye a "
                 f"Gendarmería, que en 2026 estaba en Justicia. Con Gendarmería en ambos años, sube {pct(nominal, 1, False)}."),
        etiqueta="Presupuesto 2027", icono="shield-check",
        grafico={"tipo": "comparacion", "serie_a": "Ley 2026", "serie_b": "Proyecto 2027",
                 "url": "cochid.cl/g/presupuesto-2027-seguridad", "filas": filas,
                 "anotaciones": [{"fila": "Con Gendarmería ambos años",
                                  "texto": f"La comparación correcta: {pct(real)} con inflación de 3{NBSP}%"}]},
        alt=(f"Seguridad Pública 2026 y 2027. Sin Gendarmería en 2026: {plano(plata(seg26))} a {plano(plata(b))} "
             f"({plano(pct(directa))}). Con Gendarmería ambos años: {plano(plata(a))} a {plano(plata(b))} ({plano(pct(nominal))})."),
        lectura=[QUE_ES, "Gendarmería pasa del Ministerio de Justicia al de Seguridad Pública en el proyecto 2027. Si se "
                 "compara Seguridad 2026 sin Gendarmería con Seguridad 2027 con Gendarmería, el alza se exagera.",
                 NOMINAL_REAL],
        tabla={"columnas": ["Comparación", "Ley 2026", "Proyecto 2027", "Variación"],
               "filas": [["Sin ajustar (Gendarmería solo en 2027)", plano(plata(seg26)), plano(plata(b)), plano(pct(directa))],
                         ["Con Gendarmería en ambos años", plano(plata(a)), plano(plata(b)), plano(pct(nominal))]]},
        csv=[["comparacion", "ley_2026_miles_clp", "proyecto_2027_miles_clp", "variacion_nominal_pct"],
             ["directa", seg26, b, f"{directa:.4f}"], ["perimetro_constante", a, b, f"{nominal:.4f}"]],
    )


def ficha_partida(d: dict, p: dict) -> dict:
    nombre, corto, icono = PARTIDAS[p["partida"]]
    a, b = p["ley_2026_miles_clp"], p["proyecto_2027_miles_clp"]
    nominal, real = Decimal(str(p["variacion_nominal_pct"])), Decimal(str(p["variacion_real_escenario_3_pct"]))
    real27 = a_pesos_2026(b)
    slug = f"presupuesto-2027-{p['partida']}"
    extra_lectura = []
    if p["partida"] == "10":
        g = d["perimetro_constante_seguridad"]["ley_2026_gendarmeria_miles_clp"]
        sin_g = a - g
        nominal_sin = variacion(sin_g, b)
        filas = [
            {"etiqueta": "Con Gendarmería en 2026", "icono": "scale", "valor": a / 1e9, "texto": plata_corta(a),
             "valor_b": b / 1e9, "texto_b": plata_corta(b), "delta": pct(nominal)},
            {"etiqueta": "Sin Gendarmería ambos años", "icono": "scale", "valor": sin_g / 1e9, "texto": plata_corta(sin_g),
             "valor_b": b / 1e9, "texto_b": plata_corta(b), "delta": pct(nominal_sin), "destacar": True},
        ]
        titulo = f"Justicia: la caída de {pct(-nominal, 1, False)} se explica por el traslado de Gendarmería"
        verbo = "sube" if nominal_sin >= 0 else "baja"
        bajada = f"Sin Gendarmería en ninguno de los dos años, el aporte del Fisco a Justicia {verbo} {pct(abs(nominal_sin), 1, False)}."
        texto_x = (f"Proyecto 2027: el aporte del Fisco a Justicia baja {pct(-nominal, 1, False)}, porque Gendarmería pasa a "
                   f"Seguridad Pública. Comparando sin Gendarmería en ambos años, {verbo} {pct(abs(nominal_sin), 1, False)}.")
        anot = {"fila": "Sin Gendarmería ambos años", "texto": "La comparación con el mismo perímetro"}
        extra_lectura = ["Gendarmería deja el Ministerio de Justicia y pasa al de Seguridad Pública en el proyecto 2027."]
        tabla_filas = [["Directa", plano(plata(a)), plano(plata(b)), plano(pct(nominal))],
                       ["Sin Gendarmería en ambos años", plano(plata(sin_g)), plano(plata(b)), plano(pct(nominal_sin))]]
    else:
        filas = [
            {"etiqueta": "En pesos de cada año", "icono": "banknote", "valor": a / 1e9, "texto": plata_corta(a),
             "valor_b": b / 1e9, "texto_b": plata_corta(b), "delta": pct(nominal)},
            {"etiqueta": "En pesos de 2026", "icono": "piggy-bank", "valor": a / 1e9, "texto": plata_corta(a),
             "valor_b": float(real27) / 1e9, "texto_b": plata_corta(real27), "delta": pct(real)},
        ]
        if nominal > 0 and real < 0:
            titulo = f"{corto}: más pesos en 2027, pero menos poder de compra"
            filas[1]["destacar"] = True
        elif nominal >= 0:
            titulo = f"{corto}: el aporte del Fisco sube {pct(nominal, 1, False)} en el proyecto 2027"
            filas[0]["destacar"] = True
        else:
            titulo = f"{corto}: el aporte del Fisco baja {pct(-nominal, 1, False)} en el proyecto 2027"
            filas[0]["destacar"] = True
        if len(titulo) > 90:
            titulo = f"{corto}: {'sube' if nominal >= 0 else 'baja'} {pct(abs(nominal), 1, False)} el aporte del Fisco en 2027"
        bajada = f"Pasaría de {plata(a)} en la ley 2026 a {plata(b)} en el proyecto 2027."
        if nominal >= 0:
            remate = (f"Con una inflación de 3{NBSP}%, alcanzaría para comprar {pct(abs(real), 1, False)} "
                      f"{'más' if real >= 0 else 'menos'} que en 2026.")
        else:
            remate = f"Con una inflación de 3{NBSP}%, la caída en poder de compra sería de {pct(-real, 1, False)}."
        texto_x = (f"Proyecto de presupuesto 2027: el aporte del Fisco {al(nombre)} pasa de "
                   f"{plata(a)} a {plata(b)} ({pct(nominal)}). {remate}")
        anot = None
        tabla_filas = [["Pesos de cada año", plano(plata(a)), plano(plata(b)), plano(pct(nominal))],
                       ["Pesos de 2026 (inflación 3 %)", plano(plata(a)), plano(plata(real27)), plano(pct(real))]]
    return base_ficha(
        slug, titulo=titulo, bajada=bajada, institucion=nombre, partida=p["partida"],
        descripcion=(f"{nombre}: aporte fiscal libre de {plano(plata(a))} en la ley 2026 y {plano(plata(b))} en el proyecto "
                     f"2027 ({plano(pct(nominal))} nominal, {plano(pct(real))} con inflación hipotética de 3 %)."),
        texto_x=texto_x, etiqueta=nombre if len(nombre) <= 40 else corto, icono=icono,
        grafico={"tipo": "comparacion", "serie_a": "Ley 2026", "serie_b": "Proyecto 2027",
                 "url": f"cochid.cl/g/{slug}", "filas": filas, "anotaciones": [anot] if anot else []},
        alt=(f"{nombre}: aporte fiscal libre de {plano(plata(a))} en 2026 y {plano(plata(b))} en el proyecto 2027 "
             f"({plano(pct(nominal))}); en pesos de 2026, {plano(plata(real27))} ({plano(pct(real))})."),
        lectura=[QUE_ES, *extra_lectura, NOMINAL_REAL, QUE_ES_PROYECTO],
        tabla={"columnas": ["Medida", "Ley 2026", "Proyecto 2027", "Variación"], "filas": tabla_filas},
        csv=csv_partidas([p]),
        explorar=[{"etiqueta": f"Ver {corto} en el visor del proyecto 2027",
                   "url": f"https://datos.cochid.cl/presupuesto/proyecto?institucion={p['partida']}"},
                  {"etiqueta": "Leer el análisis completo, con método y fuentes",
                   "url": "https://cochid.cl/blog/presupuesto-2027-aportes-cambios-nominal-real/"}],
    )


def fichas(d: dict) -> list[dict]:
    salida = [ficha_total(d), ficha_mayores_montos(d), ficha_extremos(d, "alzas"), ficha_extremos(d, "bajas"),
              ficha_seguridad(d)]
    # Seguridad Pública (32) sólo se publica con perímetro constante (ficha_seguridad): su comparación directa
    # suma el traslado de Gendarmería y exagera el alza.
    salida += [ficha_partida(d, p) for p in sorted(d["partidas"], key=lambda p: p["partida"]) if p["partida"] != "32"]
    fuentes = [{"etiqueta": "Ley de Presupuestos 2026, partida 50 Tesoro Público (DIPRES, PDF)", "url": d["fuentes"][0]["url"]},
               {"etiqueta": "Proyecto de Ley de Presupuestos 2027, partida 50 Tesoro Público (Cámara, PDF)",
                "url": d["fuentes"][1]["url"]}]
    for f in salida:
        f["fuentes"] = fuentes
        f["metodo"] = ("Aporte del Tesoro Público a cada ministerio, en pesos (línea 50-01-05-27 de la Ley de Presupuestos). "
                       "Variación nominal = proyecto 2027 / ley 2026 − 1. Variación con inflación = proyecto 2027 / "
                       "ley 2026 / 1,03 − 1.")
    return salida


# --- validación y salida ---------------------------------------------------------------------------
def validar(f: dict) -> None:
    sys.path.insert(0, str(CIS_POSTS))
    from app.flujo import largo_x
    from app.render import validar_campos

    errores = validar_campos("grafico", campos_post(f))
    texto = f"{f['texto_x']}\n\n{f['url']}"
    if largo_x(texto) > 280:
        errores.append(f"el texto para X mide {largo_x(texto)} con el enlace")
    for k in ("titulo", "bajada", "descripcion", "texto_x", "alt"):
        if "—" in f[k] or "–" in f[k]:
            errores.append(f"{k} tiene raya")
    if errores:
        raise SystemExit(f"{f['slug']}: " + "; ".join(errores))


def campos_post(f: dict) -> dict:
    return {"etiqueta": f["etiqueta"], "icono": f["icono"], "titulo": f["titulo"], "bajada": f["bajada"],
            "fuente": f["fuente_corta"], "grafico": f["grafico"]}


def imagenes(f: dict, destino: Path) -> dict:
    sys.path.insert(0, str(CIS_POSTS))
    from app.kit import Kit
    from app.render import render

    kit = Kit(DATOS_KIT)
    salida = {}
    for nombre, formato in (("x", "x"), ("og", "facebook"), ("vertical", "instagram")):
        datos = render(kit, "cochid", "cochid.cl", "grafico", campos_post(f), formato)
        (destino / f"{nombre}.jpg").write_bytes(datos)
        salida[nombre] = f"/assets/g/{f['slug']}/{nombre}.jpg"
    return salida


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--sin-imagenes", action="store_true")
    args = ap.parse_args()
    d = json.loads((RAIZ / "assets/presupuesto-2027/comparacion.json").read_text())
    dir_fichas = RAIZ / "content/graficos"
    dir_fichas.mkdir(parents=True, exist_ok=True)
    lista = fichas(d)
    for f in lista:
        validar(f)
        destino = RAIZ / "assets/g" / f["slug"]
        destino.mkdir(parents=True, exist_ok=True)
        salida = io.StringIO()
        csv.writer(salida, lineterminator="\n").writerows(f.pop("csv"))
        (destino / "datos.csv").write_text(salida.getvalue())
        f["descargas"] = {"csv": f"/assets/g/{f['slug']}/datos.csv"}
        if not args.sin_imagenes:
            f["imagenes"] = imagenes(f, destino)
        (dir_fichas / f"{f['slug']}.json").write_text(json.dumps(f, ensure_ascii=False, indent=1) + "\n")
    print(f"{len(lista)} fichas en {dir_fichas}")


if __name__ == "__main__":
    main()
