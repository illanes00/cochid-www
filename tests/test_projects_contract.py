"""Static navigation contract; no HTTP or authenticated-journey assertion."""
from html.parser import HTMLParser
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.hrefs = []
        self.groups = []
        self.visible_group = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "a":
            self.hrefs.append(attrs.get("href", ""))
        if tag == "details" and "project-group" in attrs.get("class", ""):
            self.groups.append(attrs["id"])
            self.visible_group |= "open" in attrs


class ProjectsContract(unittest.TestCase):
    def setUp(self):
        self.html = (ROOT / "dist" / "index.html").read_text()
        self.links = Links()
        self.links.feed(self.html)

    def test_all_local_fragments_resolve_and_ids_are_unique(self):
        self.assertEqual(len(self.links.ids), len(set(self.links.ids)))
        for href in self.links.hrefs:
            if href.startswith("#") or href.startswith("/#"):
                self.assertIn(href.split("#", 1)[1], self.links.ids)

    def test_four_groups_start_folded_below_featured_work(self):
        self.assertEqual(self.links.groups, ["proyectos-datos", "proyectos-territorio", "proyectos-investigaciones", "proyectos-herramientas"])
        self.assertFalse(self.links.visible_group)
        self.assertLess(self.html.index('id="estudio-destacado"'), self.html.index('id="proyectos"'))
        self.assertIn('href="#proyectos">Ver todos los proyectos', self.html)

    def test_published_project_destinations_are_reachable_from_home_source(self):
        for host in ("datos", "economia", "congreso", "lex", "elecciones", "mundial", "mapas", "tpte", "bici", "cables", "clima", "taller", "medicamentos", "thesis", "graphs", "scribe", "vpn", "peru", "sdr"):
            self.assertIn(f"https://{host}.cochid.cl/", self.links.hrefs)
        self.assertIn("https://prosa.medicamentos.cochid.cl/", self.links.hrefs)
        for path in ("/cambio-de-hora/", "/concepciones/"):
            self.assertIn(path, self.links.hrefs)
            self.assertTrue((ROOT / path.strip("/") / "index.html").is_file())
            source = self.html.split(f'href="{path}"', 1)[1].split("</a>", 1)[0]
            self.assertIn(f'src="{path}social.png"', source)
            self.assertIn('alt=""', source)
            self.assertIn('loading="lazy"', source)
            import struct
            png = (ROOT / path.strip("/") / "social.png").read_bytes()
            self.assertEqual(png[:8], b"\x89PNG\r\n\x1a\n")
            self.assertEqual(struct.unpack(">II", png[16:24]), (1200, 630))
        self.assertNotIn("https://medicamentos-staging.cochid.cl/", self.links.hrefs)
        self.assertNotIn("https://tiles.cochid.cl/", self.links.hrefs)

    def test_alias_api_and_login_roles_are_explicit(self):
        self.assertIn("comparte el proyecto Mapas", self.html)
        self.assertIn('href="https://mapas.cochid.cl/ciudad"', self.html)
        self.assertNotIn('href="https://ciudad.cochid.cl/"', self.html)
        for host in ("peru", "sdr"):
            card = self.html.split(f'href="https://{host}.cochid.cl/"', 1)[1].split("</a>", 1)[0]
            self.assertIn("Requiere iniciar sesión", card)
            self.assertNotIn("data-product-slug", card)
        self.assertIn("Requiere una cuenta", self.html)
        self.assertIn("https://datos.cochid.cl/metodologia", self.links.hrefs)
        header = self.html.split('<header class="gr-nav"', 1)[1].split('</header>', 1)[0]
        for href in ("/datos/", "/mapas/", "/investigaciones/", "https://datos.cochid.cl/presupuesto", "https://cochid.cl/#proyectos"):
            self.assertIn(f'href="{href}"', header)
        self.assertNotIn('href="/blog/"', header)
        self.assertNotIn("trazabilidad completa", self.html)

    def test_footer_exploration_routes_are_canonical_and_ordered(self):
        footer = self.html.split('<footer class="gr-footer"', 1)[1].split('</footer>', 1)[0]
        expected = [
            ('Datos', 'https://datos.cochid.cl/catalogo'),
            ('Mapas', 'https://mapas.cochid.cl/'),
            ('Investigaciones', 'https://cochid.cl/#investigaciones'),
            ('Presupuesto', 'https://datos.cochid.cl/presupuesto'),
            ('Todos los proyectos', 'https://cochid.cl/#proyectos'),
        ]
        anchors = [f'<a href="{href}">{label}</a>' for label, href in expected]
        positions = [footer.index(anchor) for anchor in anchors]
        self.assertEqual(positions, sorted(positions))


if __name__ == "__main__":
    unittest.main()
