from html.parser import HTMLParser
from pathlib import Path
import json
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")


class ProductSectionParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_products = False
        self.depth = 0
        self.products = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag == "section" and attributes.get("id") == "productos":
            self.in_products = True
            self.depth = 1
            return

        if not self.in_products:
            return

        if tag == "section":
            self.depth += 1

        slug = attributes.get("data-product-slug")
        if slug:
            self.products.append(slug)

    def handle_endtag(self, tag):
        if not self.in_products or tag != "section":
            return
        self.depth -= 1
        if self.depth == 0:
            self.in_products = False


class CochidHomeContractTests(unittest.TestCase):
    def test_presents_cochid_as_the_company_and_datos_as_its_primary_product(self):
        self.assertIn('<link rel="canonical" href="https://cochid.cl/">', HTML)
        self.assertIn("Compañía Chilena de Inteligencia de Datos", HTML)
        hero = re.search(r'<section class="hero">(.*?)</section>', HTML, re.DOTALL)
        self.assertIsNotNone(hero, "falta el hero institucional")
        primary = re.search(
            r'<a href="([^"]+)" class="btn-primary">([^<]+)</a>',
            hero.group(1),
        )
        self.assertIsNotNone(primary, "falta la acción principal")
        self.assertEqual("https://datos.cochid.cl/", primary.group(1))
        self.assertEqual("Abrir COCHID Datos", primary.group(2))

    def test_featured_study_states_its_commission_and_independent_authorship(self):
        study = re.search(
            r'<section class="primary-product" id="estudio-destacado".*?</section>',
            HTML,
            re.DOTALL,
        )
        self.assertIsNotNone(study, "falta el estudio destacado")
        self.assertIn("Espacio Público", study.group(0))
        self.assertIn("encargado por la Cámara de la Innovación Farmacéutica (CIF)", study.group(0))
        self.assertIn("análisis y las conclusiones son de Espacio Público", study.group(0))
        self.assertNotIn("con apoyo de la Cámara", study.group(0))

    def test_featured_study_has_share_metadata_and_no_primary_login_cta(self):
        self.assertIn(
            '<meta property="og:description" content="Infraestructura de datos para comprender Chile. Estudio destacado: Cobertura y protección financiera de medicamentos en Chile, de Espacio Público para la CIF.">',
            HTML,
        )
        self.assertIn(
            '<meta property="og:image" content="https://medicamentos.cochid.cl/og.png">',
            HTML,
        )
        self.assertNotIn('class="gr-nav__cta"', HTML)

    def test_publishes_search_engine_controls_for_the_company_site(self):
        robots = ROOT / "robots.txt"
        sitemap = ROOT / "sitemap.xml"
        self.assertTrue(robots.exists(), "falta robots.txt")
        self.assertTrue(sitemap.exists(), "falta sitemap.xml")
        self.assertIn("Sitemap: https://cochid.cl/sitemap.xml", robots.read_text())
        sitemap_text = sitemap.read_text()
        self.assertIn("<loc>https://cochid.cl/</loc>", sitemap_text)
        self.assertIn("<lastmod>2026-09-03</lastmod>", sitemap_text)

    def test_exposes_exactly_the_eight_canonical_products(self):
        parser = ProductSectionParser()
        parser.feed(HTML)

        self.assertEqual(
            [
                "datos",
                "mapas",
                "transporte",
                "lex",
                "congreso",
                "elecciones",
                "scribe",
                "thesis",
            ],
            parser.products,
        )

    def test_auxiliary_graphs_and_scribe_thesis_mode_are_not_products(self):
        self.assertNotIn('data-product-slug="graphs"', HTML)
        self.assertNotIn('data-product-slug="tesis"', HTML)
        self.assertIn('data-component-slug="graphs"', HTML)
        self.assertIn('data-feature-slug="scribe-thesis"', HTML)

    def test_structured_catalog_matches_the_visible_product_catalog(self):
        match = re.search(
            r'<script type="application/ld\+json">\s*(\{.*?\})\s*</script>',
            HTML,
            re.DOTALL,
        )
        self.assertIsNotNone(match, "falta el catálogo JSON-LD")
        organization = json.loads(match.group(1))

        self.assertEqual(
            [
                "Cochid · Datos",
                "Cochid · Mapas",
                "Cochid · Transporte",
                "Cochid · Lex",
                "Cochid · Congreso",
                "Cochid · Elecciones",
                "Cochid · Scribe",
                "Cochid · Thesis",
            ],
            [offer["name"] for offer in organization["makesOffer"]],
        )

    def test_keeps_the_company_home_static_and_routes_data_work_to_the_portal(self):
        self.assertNotIn("fetch(", HTML)
        self.assertNotIn("data-contract-resource=", HTML)
        self.assertNotIn("Presupuesto público de Chile 2024", HTML)
        for destination in (
            "https://datos.cochid.cl/catalogo",
            "https://datos.cochid.cl/presupuesto",
            "https://datos.cochid.cl/explorar",
            "https://datos.cochid.cl/metodologia",
            "https://mapas.cochid.cl/",
        ):
            self.assertIn(f'href="{destination}"', HTML)

    def test_explains_cochid_and_offers_three_services_through_cis(self):
        self.assertIn('<section id="que-es-cochid"', HTML)
        self.assertIn('<section id="servicios"', HTML)
        self.assertEqual(1, HTML.count('data-service-slug="consultoria"'))
        self.assertEqual(1, HTML.count('data-service-slug="datos"'))
        self.assertEqual(1, HTML.count('data-service-slug="api"'))
        self.assertIn("Los servicios comerciales son contratados y facturados por", HTML)
        self.assertIn("Compañía de Innovación de Santiago SpA", HTML)
        self.assertIn('href="https://innovacionsantiago.cl/contacto"', HTML)
        self.assertNotIn("API paga vía", HTML)

    def test_footer_routes_commercial_access_through_cis(self):
        self.assertNotIn('<li><a href="https://indieweb.cl">API access (paid)</a></li>', HTML)
        self.assertIn("Documentación de la API", HTML)
        self.assertIn("Contratar datos y API", HTML)
        self.assertIn("Estado de la plataforma", HTML)
        self.assertIn("servicios comerciales son contratados y facturados por", HTML)

    def test_hero_uses_clear_spanish_and_routes_into_the_company(self):
        self.assertIn("fuentes públicas", HTML)
        self.assertNotIn("La <em>data pública</em>", HTML)
        for destination in ("#productos", "#que-es-cochid", "https://datos.cochid.cl/"):
            self.assertIn(f'href="{destination}"', HTML)

    def test_does_not_repeat_unverified_or_stale_data_metrics(self):
        for stale_copy in (
            "datasets registrados",
            "temas en el explorador",
            "Presupuesto público de Chile 2024",
            "880 filas · 15 años",
            "877 filas · 66 años",
            "396 filas matview",
            "Próximamente.",
        ):
            self.assertNotIn(stale_copy, HTML)


if __name__ == "__main__":
    unittest.main()
