from html.parser import HTMLParser
from pathlib import Path
import json
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "dist" / "index.html").read_text(encoding="utf-8")


class IdParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []

    def handle_starttag(self, _tag, attrs):
        value = dict(attrs).get("id")
        if value:
            self.ids.append(value)


class PortalProjectsV2ContractTests(unittest.TestCase):
    def test_home_keeps_anchor_and_all_project_navigation_uses_directory(self):
        home = (ROOT / "dist" / "index.html").read_text(encoding="utf-8")
        self.assertIn('id="proyectos"', home)
        self.assertIn(
            '<a class="more" href="https://cochid.cl/proyectos/">Ver todos los proyectos',
            home,
        )
        old_target = "https://cochid.cl/#proyectos"
        for path in (ROOT / "dist").rglob("*.html"):
            with self.subTest(path=path.relative_to(ROOT / "dist")):
                self.assertNotIn(old_target, path.read_text(encoding="utf-8"))
        search_index = (ROOT / "dist" / "buscar" / "indice.json").read_text(encoding="utf-8")
        self.assertNotIn(old_target, search_index)
        self.assertIn('https://cochid.cl/proyectos/', search_index)

    def test_project_directory_lists_the_complete_approved_public_sites(self):
        page = (ROOT / "dist" / "proyectos" / "index.html").read_text(encoding="utf-8")
        directory = page.split('data-project-directory', 1)[1].split(
            '<p class="portal-meta"', 1
        )[0]
        groups = ["Datos", "Territorio", "Investigaciones", "Herramientas", "Especiales"]
        positions = [directory.index(f">{group}</h2>") for group in groups]
        self.assertEqual(positions, sorted(positions))
        # 6-oct-2026: graphs, elecciones y prosa quedan solo para Martín y salen del directorio público.
        expected = [
            "https://datos.cochid.cl/",
            "https://datos.cochid.cl/presupuesto",
            "https://economia.cochid.cl/",
            "https://congreso.cochid.cl/",
            "https://votos.cochid.cl/",
            "https://lex.cochid.cl/",
            "https://mapas.cochid.cl/",
            "https://mapas.cochid.cl/ciudad",
            "https://trenes.cochid.cl/",
            "https://tpte.cochid.cl/",
            "https://bici.cochid.cl/",
            "https://cables.cochid.cl/",
            "https://clima.cochid.cl/",
            "/concepciones/",
            "/cambio-de-hora/",
            "https://medicamentos.cochid.cl/",
            "https://taller.cochid.cl/",
            "https://scribe.cochid.cl/",
            "https://mundial.cochid.cl/",
        ]
        for href in expected:
            with self.subTest(href=href):
                self.assertEqual(directory.count(f'href="{href}"'), 1)
        self.assertEqual(directory.count('class="portal-proyecto"'), len(expected))

    def test_project_directory_separates_intro_and_uses_distinct_election_icons(self):
        css = (ROOT / "assets" / "portal.css").read_text(encoding="utf-8")
        self.assertRegex(css, r"\.portal-directorio\{[^}]*margin-top:")
        contract = json.loads((ROOT / "data" / "destinos.publico.json").read_text(encoding="utf-8"))
        destinations = {item["id"]: item for item in contract["destinos"]}
        self.assertNotEqual(
            destinations["cochid.elecciones"]["icono"],
            destinations["cochid.votos"]["icono"],
        )

    def test_project_section_uses_the_approved_five_entries(self):
        section = re.search(r'<section class="sec" id="proyectos"[\s\S]*?</section>', HTML)
        self.assertIsNotNone(section)
        fragment = section.group(0)
        expected = [
            "https://datos.cochid.cl/", "https://mapas.cochid.cl/",
            "https://cochid.cl/investigaciones/", "https://cochid.cl/herramientas/",
            "https://mundial.cochid.cl/",
        ]
        positions = [fragment.index(f'href="{href}"') for href in expected]
        self.assertEqual(positions, sorted(positions))

    def test_personal_and_operational_destinations_are_not_projects(self):
        section = HTML.split('id="proyectos"', 1)[1].split('</section>', 1)[0]
        for host in ("thesis.cochid.cl", "vpn.cochid.cl", "tiles.cochid.cl", "style.cochid.cl"):
            self.assertNotIn(host, section)

    def test_local_fragment_ids_are_unique(self):
        parser = IdParser()
        parser.feed(HTML)
        self.assertEqual(len(parser.ids), len(set(parser.ids)))
        for href in re.findall(r'href="#([^"]+)"', HTML):
            self.assertIn(href, parser.ids)


if __name__ == "__main__":
    unittest.main()
