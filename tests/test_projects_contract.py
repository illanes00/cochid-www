"""Static navigation contract; no HTTP or authenticated-journey assertion."""
from html.parser import HTMLParser
from pathlib import Path
import re
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

    def test_five_visible_groups_start_folded_in_the_approved_order(self):
        self.assertEqual(
            self.links.groups,
            [
                "proyectos-datos",
                "proyectos-territorio",
                "proyectos-investigaciones",
                "proyectos-herramientas",
                "proyectos-especiales",
            ],
        )
        self.assertFalse(self.links.visible_group)
        self.assertLess(self.html.index('id="estudio-destacado"'), self.html.index('id="proyectos"'))
        self.assertIn('href="#proyectos">Ver todos los proyectos', self.html)

        mundial = self.html.split('href="https://mundial.cochid.cl/"', 1)[1].split("</a>", 1)[0]
        self.assertIn("Proyecto terminado el 19 de julio de 2026", mundial)

    def test_each_group_lists_the_approved_destinations_in_order(self):
        expected = {
            "proyectos-datos": [
                "https://datos.cochid.cl/", "https://datos.cochid.cl/presupuesto",
                "https://economia.cochid.cl/", "https://elecciones.cochid.cl/",
                "https://congreso.cochid.cl/", "https://votos.cochid.cl/", "https://lex.cochid.cl/",
            ],
            "proyectos-territorio": [
                "https://mapas.cochid.cl/", "https://mapas.cochid.cl/ciudad",
                "https://trenes.cochid.cl/", "https://tpte.cochid.cl/",
                "https://bici.cochid.cl/", "https://cables.cochid.cl/", "https://clima.cochid.cl/",
            ],
            "proyectos-investigaciones": [
                "https://medicamentos.cochid.cl/", "/concepciones/", "/cambio-de-hora/",
            ],
            "proyectos-herramientas": [
                "https://graphs.cochid.cl/", "https://taller.cochid.cl/",
                "https://prosa.medicamentos.cochid.cl/", "https://scribe.cochid.cl/",
            ],
            "proyectos-especiales": ["https://mundial.cochid.cl/"],
        }
        for group_id, hrefs in expected.items():
            with self.subTest(group=group_id):
                fragment = self.html.split(f'id="{group_id}"', 1)[1].split("</details>", 1)[0]
                actual = re.findall(r'<a href="([^"]+)" class="tema-card', fragment)
                self.assertEqual(actual, hrefs)

    def test_personal_thesis_is_not_listed_as_a_cochid_project(self):
        self.assertNotIn("https://thesis.cochid.cl/", self.links.hrefs)
        self.assertNotIn("thesis.cochid.cl", self.html)

    def test_published_content_has_no_links_to_the_personal_thesis(self):
        fuentes = [ROOT / "index.html", *sorted((ROOT / "content").rglob("*.md"))]
        publicados = [
            ruta for ruta in sorted((ROOT / "dist").rglob("*"))
            if ruta.suffix in {".html", ".xml", ".txt"}
        ]
        self.assertTrue(publicados, "falta dist/: corre el build antes de las pruebas")
        for ruta in fuentes + publicados:
            with self.subTest(ruta=str(ruta.relative_to(ROOT))):
                self.assertNotIn("thesis.cochid.cl", ruta.read_text(encoding="utf-8"))

    def test_published_project_destinations_are_reachable_from_home_source(self):
        for host in ("datos", "economia", "congreso", "votos", "lex", "elecciones", "mundial", "mapas", "trenes", "tpte", "bici", "cables", "clima", "taller", "medicamentos", "graphs", "scribe"):
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
        for host in ("vpn", "peru", "sdr"):
            self.assertNotIn(f"https://{host}.cochid.cl/", self.links.hrefs)

    def test_alias_api_and_outside_destinations_are_explicit(self):
        self.assertIn('href="https://mapas.cochid.cl/ciudad"', self.html)
        self.assertNotIn('href="https://ciudad.cochid.cl/"', self.html)
        for host in ("peru", "sdr", "vpn", "style", "tiles", "medicamentos-staging"):
            self.assertNotIn(f'href="https://{host}.cochid.cl/', self.html)
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
