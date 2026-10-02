from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "dist" / "index.html").read_text(encoding="utf-8")


class PortalHomeV2ContractTests(unittest.TestCase):
    def test_uses_the_approved_low_density_portal_structure(self):
        self.assertIn("Datos públicos de Chile, con su fuente y su fecha", HTML)
        for section in ("temas", "mapas", "publicaciones", "proyectos", "sobre-nosotros"):
            self.assertIn(f'id="{section}"', HTML)
        self.assertNotRegex(HTML, r'class="[^"]*(?:eyebrow|overline)[^"]*"')

    def test_routes_the_three_primary_tasks(self):
        for destination in (
            "https://datos.cochid.cl/catalogo",
            "https://mapas.cochid.cl/",
            "https://cochid.cl/investigaciones/",
        ):
            self.assertIn(f'href="{destination}"', HTML)

    def test_uses_the_full_public_brand_and_canonical_legal_identity(self):
        self.assertIn("Compañía Chilena de Inteligencia de Datos SpA", HTML)
        self.assertIn("Compañía de Innovación de Santiago SpA", HTML)
        self.assertNotRegex(HTML, r"\b(?:COCHID|Cochid)\b")

    def test_keeps_search_engine_controls_and_current_routes(self):
        robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
        sitemap = (ROOT / "dist" / "sitemap.xml").read_text(encoding="utf-8")
        self.assertIn("Sitemap: https://cochid.cl/sitemap.xml", robots)
        for route in ("/", "/sobre-nosotros/", "/buscar/", "/temas/"):
            self.assertIn(f"<loc>https://cochid.cl{route}</loc>", sitemap)

    def test_does_not_repeat_stale_or_unverified_metrics(self):
        for stale_copy in (
            "datasets registrados", "temas en el explorador", "880 filas · 15 años",
            "877 filas · 66 años", "396 filas matview", "Próximamente.",
        ):
            self.assertNotIn(stale_copy, HTML)


if __name__ == "__main__":
    unittest.main()
