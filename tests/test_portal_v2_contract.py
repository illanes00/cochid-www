from __future__ import annotations

import hashlib
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
BUNDLE = ROOT / "vendor" / "chrome-v2"
THEMES = (
    "salud", "educacion", "economia-trabajo", "empresas-innovacion",
    "finanzas-publicas", "seguridad-justicia", "poblacion-sociedad",
    "territorio-vivienda", "transporte-infraestructura",
    "medio-ambiente-energia", "politica-instituciones",
)


def header(html: str) -> str:
    match = re.search(r'<header class="cx-nav"[\s\S]*?</header>', html)
    if not match:
        raise AssertionError("falta la barra principal v2")
    return match.group(0) + "\n"


class PortalV2ContractTests(unittest.TestCase):
    def test_every_page_uses_the_exact_versioned_main_bar(self) -> None:
        expected = (BUNDLE / "header.html").read_text(encoding="utf-8")
        expected = expected[expected.index('<header class="cx-nav"'):]
        expected_digest = hashlib.sha256(expected.encode()).hexdigest()
        pages = [
            "index.html", "blog/index.html", "novedades/index.html",
            "mapa-del-sitio/index.html", "asesoria/index.html", "contacto/index.html",
            "servicios/index.html", "documentacion/index.html",
            "concepciones/index.html", "cambio-de-hora/index.html",
            "sobre-nosotros/index.html", "buscar/index.html", "temas/index.html",
        ]
        for page in pages:
            with self.subTest(page=page):
                html = (DIST / page).read_text(encoding="utf-8")
                self.assertEqual(hashlib.sha256(header(html).encode()).hexdigest(), expected_digest)
                self.assertIn('class="cx-sub"', html)
                self.assertIn('class="cx-pie"', html)

    def test_publishes_home_search_about_and_eleven_theme_pages(self) -> None:
        self.assertTrue((DIST / "buscar" / "indice.json").is_file())
        self.assertTrue((DIST / "buscar" / "index.html").is_file())
        self.assertTrue((DIST / "sobre-nosotros" / "index.html").is_file())
        self.assertIn("/sobre-nosotros/", (DIST / "quienes-somos" / "index.html").read_text(encoding="utf-8"))
        for theme in THEMES:
            with self.subTest(theme=theme):
                self.assertTrue((DIST / "temas" / theme / "index.html").is_file())

    def test_public_html_never_uses_the_abbreviated_brand(self) -> None:
        offenders = []
        for path in DIST.rglob("*.html"):
            if re.search(r"\b(?:COCHID|Cochid)\b", path.read_text(encoding="utf-8")):
                offenders.append(path.relative_to(DIST).as_posix())
        self.assertEqual(offenders, [])

    def test_home_keeps_the_approved_low_density_structure(self) -> None:
        html = (DIST / "index.html").read_text(encoding="utf-8")
        self.assertIn("Datos públicos de Chile, con su fuente y su fecha", html)
        self.assertIn('id="temas"', html)
        self.assertIn('id="mapas"', html)
        self.assertIn('id="publicaciones"', html)
        self.assertNotRegex(html, r'class="[^"]*(?:eyebrow|overline)[^"]*"')
        self.assertNotIn("border-left:", html)

    def test_editorial_content_uses_the_same_container_gutter_as_chrome(self) -> None:
        css = (ROOT / "assets" / "portal.css").read_text(encoding="utf-8").replace(" ", "")
        self.assertIn(
            ".portal-contenido{box-sizing:border-box;width:min(100%,var(--container));"
            "margin:0auto;padding:2.5remvar(--pad-x)4rem}",
            css,
        )
        self.assertNotIn(".portal-contenido{width:min(100%-1.25rem", css)


if __name__ == "__main__":
    unittest.main()
