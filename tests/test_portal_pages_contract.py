from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
ROUTES = (
    "quienes-somos", "contacto", "servicios", "datos", "mapas",
    "herramientas", "investigaciones", "documentacion", "mapa-del-sitio",
)


class PortalPagesContractTests(unittest.TestCase):
    def page(self, route: str) -> str:
        return (DIST / route / "index.html").read_text(encoding="utf-8")

    def test_all_editorial_pages_use_the_public_template(self):
        for route in ROUTES:
            with self.subTest(route=route):
                html = self.page(route)
                self.assertIn('<html lang="es-CL" data-brand="cochid">', html)
                self.assertEqual(1, len(re.findall(r"<h1\b", html)))
                self.assertIn('class="skip-link"', html)
                self.assertIn("data-site-header", html)
                self.assertIn('data-footer-owner="cochid"', html)
                self.assertNotIn("[[VERIFICAR", html)
                self.assertNotIn("<!--", html)
                self.assertNotRegex(html, r"\bCIS\b")

    def test_resolved_business_decisions_are_visible(self):
        about = self.page("quienes-somos")
        self.assertIn("Martín Illanes, fundador.", about)
        self.assertIn("Compañía Chilena de Inteligencia de Datos SpA", about)
        self.assertIn("Compañía de Innovación de Santiago SpA", about)

        services = self.page("servicios")
        self.assertIn("$5.000 IVA incluido", services)
        self.assertIn("$25.000 IVA incluido", services)
        self.assertNotIn('href="/asesoria/', services)

        maps = self.page("mapas")
        self.assertIn("https://mapas.cochid.cl/ciudad", maps)
        self.assertNotIn("https://ciudad.cochid.cl", maps)

        docs = self.page("documentacion")
        self.assertIn("no tienen una licencia formal", docs)
        self.assertNotIn("X-API-Key", docs)
        self.assertNotIn("gateway/cochid-datos", docs)

    def test_generated_navigation_files_are_public(self):
        for name in ("destinos.json", "sitemap.xml", "sitemap-hosts.xml", "robots.txt"):
            self.assertTrue((DIST / name).is_file(), name)
        mapa = self.page("mapa-del-sitio")
        self.assertIn("Verificado el 1 de octubre de 2026", mapa)
        self.assertIn("265 páginas revisadas, 3 con problemas", mapa)


if __name__ == "__main__":
    unittest.main()
