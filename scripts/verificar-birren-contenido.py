"""Compara el contenido construido con el baseline real previo al pintado.

La captura previa pertenece al controlador de QA; no se obtiene de una maqueta.
Solo se excluyen SVG, código y los títulos nuevos de señales, identificados en el DOM.
"""
from pathlib import Path
import json
import sys
from bs4 import BeautifulSoup


root = Path(__file__).resolve().parents[1]
baseline_path = Path(sys.argv[1])
baseline = json.loads(baseline_path.read_text())
# H28 exige minúscula de oración en este rótulo de presentación; ninguna cifra cambia.
solar = "cambio-de-hora/index.html"
assert baseline[solar]["text"].count("EN EL RELOJ") == 1
baseline[solar]["text"] = baseline[solar]["text"].replace("EN EL RELOJ", "En el reloj")
current = {}
for page in sorted((root / "dist").rglob("*.html")):
    soup = BeautifulSoup(page.read_text(), "html.parser")
    main = soup.find("main")
    if main:
        for node in main.select("script,style,svg,[data-birren-added]"):
            node.decompose()
        current[str(page.relative_to(root / "dist"))] = {
            "text": main.get_text(" ", strip=True),
            "links": [(a.get("href"), a.get_text(" ", strip=True)) for a in main.select("a")],
            "images": [(img.get("src"), img.get("alt")) for img in main.select("img")],
        }
# JSON convierte las tuplas de las capturas en listas.
current = json.loads(json.dumps(current))
assert baseline.keys() == current.keys(), "Se agregaron o retiraron páginas sin aprobación"
changes = {name: [key for key in baseline[name] if baseline[name][key] != current[name][key]]
           for name in baseline if baseline[name] != current[name]}
assert not changes, f"Cambió el contenido factual, un enlace o una imagen: {changes}"
print(json.dumps({"pages": len(current), "content": "identical except declared presentation label", "presentation_change": "EN EL RELOJ -> En el reloj (H28)", "excluded": "SVG, código y títulos de señales añadidas"}))
