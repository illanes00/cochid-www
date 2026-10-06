#!/usr/bin/env python3
"""Crea en cis-posts un post para X por cada ficha de content/graficos/ (quedan en revisión).

El post usa la plantilla «grafico» con los mismos campos con que se dibujó la imagen de la página, el
texto de la ficha y el enlace a https://cochid.cl/g/<slug>/. Antes de crear cada post comprueba que la
página responde 200: un post nunca apunta a una página que no existe. `origen_ref` = slug, así que
correrlo de nuevo no duplica.

Uso:
    python3 scripts/graficos/publicar_posts.py [--solo slug,slug] [--prueba]
La clave sale de `vault get cis-posts PRODUCTOR_PRESUPUESTO_CLAVE`.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import urllib.error
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
CIS_POSTS = "http://127.0.0.1:8344"
sys_path = str(Path(__file__).resolve().parent)


def campos_post(f: dict) -> dict:
    return {"etiqueta": f["etiqueta"], "icono": f["icono"], "titulo": f["titulo"], "bajada": f["bajada"],
            "fuente": f["fuente_corta"], "grafico": f["grafico"]}


def responde(url: str) -> bool:
    req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "cochid-graficos/1"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.status == 200
    except urllib.error.URLError:
        return False


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--solo", default="")
    ap.add_argument("--prueba", action="store_true", help="muestra los cuerpos sin crear posts")
    args = ap.parse_args()
    solo = {s for s in args.solo.split(",") if s}
    clave = subprocess.run(["vault", "get", "cis-posts", "PRODUCTOR_PRESUPUESTO_CLAVE"], check=True,
                           capture_output=True, text=True).stdout.strip()
    creados, existentes, errores = 0, 0, 0
    for archivo in sorted((RAIZ / "content/graficos").glob("*.json")):
        f = json.loads(archivo.read_text())
        if solo and f["slug"] not in solo:
            continue
        if not responde(f["url"]):
            print(f"OMITIDO {f['slug']}: {f['url']} no responde 200")
            errores += 1
            continue
        cuerpo = {"marca": f["marca"], "plantilla": "grafico", "pilar": "dato", "origen_ref": f["slug"],
                  "redes": ["x"], "campos": campos_post(f), "texto": f["texto_x"], "enlace": f["url"]}
        if args.prueba:
            print(json.dumps(cuerpo, ensure_ascii=False)[:300])
            continue
        req = urllib.request.Request(f"{CIS_POSTS}/api/posts", data=json.dumps(cuerpo).encode(), method="POST",
                                     headers={"Content-Type": "application/json", "X-Productor": "presupuesto",
                                              "X-Productor-Clave": clave})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                respuesta = json.loads(r.read())
                post = respuesta["post"]
                if respuesta.get("repetido"):
                    existentes += 1
                    print(f"YA EXISTE {f['slug']} -> post {post['id']} ({post['estado']})")
                else:
                    creados += 1
                    print(f"CREADO {f['slug']} -> post {post['id']} ({post['estado']})")
        except urllib.error.HTTPError as e:
            cuerpo_error = e.read().decode()
            if e.code == 409:
                existentes += 1
                print(f"YA EXISTE {f['slug']}")
            else:
                errores += 1
                print(f"ERROR {e.code} {f['slug']}: {cuerpo_error[:400]}")
    print(f"creados {creados} · ya existían {existentes} · errores {errores}")


if __name__ == "__main__":
    main()
