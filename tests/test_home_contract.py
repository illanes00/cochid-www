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


if __name__ == "__main__":
    unittest.main()
