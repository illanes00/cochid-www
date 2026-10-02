from html.parser import HTMLParser
from pathlib import Path
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
