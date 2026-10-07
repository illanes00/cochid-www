from html.parser import HTMLParser
from pathlib import Path
import unittest
from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]


class Body(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.bodies = []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        if tag == "body":
            self.bodies.append(dict(attrs))


class BirrenEnvironmentContract(unittest.TestCase):
    def test_each_published_template_declares_its_single_environment(self):
        templates = {
            "index.html": "acogida",
            "sobre-nosotros/index.html": "acogida",
            "proyectos/index.html": "acogida",
            "investigaciones/index.html": "lectura",
            "blog/index.html": "lectura",
            "concepciones/index.html": "lectura",
            "cambio-de-hora/index.html": "lectura",
            "documentacion/index.html": "lectura",
            "temas/index.html": "datos",
            "temas/salud/index.html": "datos",
            "mapas/index.html": "datos",
            "herramientas/index.html": "trabajo",
            "contacto/index.html": "servicio",
            "asesoria/index.html": "servicio",
        }
        for filename, environment in templates.items():
            with self.subTest(page=filename):
                body = Body((ROOT / "dist" / filename).read_text())
                self.assertEqual(len(body.bodies), 1)
                self.assertEqual(body.bodies[0].get("data-environment"), environment)

    def test_each_topic_identifies_its_approved_family_and_kit_icon(self):
        topics = {
            "seguridad-justicia": ("estado", "gavel"),
            "politica-instituciones": ("estado", "building-2"),
            "poblacion-sociedad": ("estado", "users"),
            "economia-trabajo": ("dinero", "briefcase"),
            "empresas-innovacion": ("dinero", "factory"),
            "finanzas-publicas": ("dinero", "landmark"),
            "salud": ("saber", "stethoscope"),
            "educacion": ("saber", "school"),
            "territorio-vivienda": ("territorio", "home"),
            "transporte-infraestructura": ("territorio", "bus"),
            "medio-ambiente-energia": ("territorio", "leaf"),
        }
        for slug, (family, icon) in topics.items():
            with self.subTest(topic=slug):
                page = BeautifulSoup((ROOT / "dist" / "temas" / slug / "index.html").read_text(), "html.parser")
                heading_icon = page.select_one(".pt__ico")
                self.assertEqual(heading_icon.get("data-family"), family)
                self.assertEqual(heading_icon.select_one("svg").get("data-kit-icon"), icon)
                self.assertTrue(page.select_one("h1").get_text(strip=True))

    def test_the_seven_navigation_destinations_include_their_kit_icon(self):
        page = BeautifulSoup((ROOT / "dist" / "index.html").read_text(), "html.parser")
        icons = {"sobre": "info", "datos": "database", "mapas": "map",
                 "investigaciones": "book-open", "blog": "file-text",
                 "proyectos": "folder-kanban", "contacto": "mail"}
        for destination, icon in icons.items():
            with self.subTest(destination=destination):
                link = page.select_one(f'.cx-nav__enlaces [data-nav-id="{destination}"]')
                self.assertIsNotNone(link.select_one(f'svg[data-kit-icon="{icon}"]'))
                self.assertTrue(link.get_text(strip=True))


if __name__ == "__main__":
    unittest.main()
