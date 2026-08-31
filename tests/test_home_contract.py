from html.parser import HTMLParser
from pathlib import Path
import json
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")
DATA_CONTRACT_PATH = ROOT / "contracts" / "cochid-datos-home.v1.json"


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

    def test_declares_every_cochid_datos_request_in_a_versioned_contract(self):
        self.assertTrue(DATA_CONTRACT_PATH.exists(), "falta el contrato consumidor")
        contract = json.loads(DATA_CONTRACT_PATH.read_text(encoding="utf-8"))
        self.assertEqual("1.0.0", contract["contract_version"])
        self.assertEqual("cochid-home", contract["consumer"])
        self.assertEqual("cochid-datos", contract["producer"])

        resources = contract["resources"]
        self.assertEqual(
            {"platform_health", "themes", "budget_composition"},
            set(resources),
        )
        declared_urls = {resource["url"] for resource in resources.values()}
        requested_urls = set(
            re.findall(r"fetch\(['\"](https://datos\.cochid\.cl/[^'\"]+)", HTML)
        )
        self.assertEqual(declared_urls, requested_urls)

        for resource in resources.values():
            self.assertEqual("GET", resource["method"])
            self.assertGreater(resource["ttl_seconds"], 0)
            self.assertTrue(resource["required_fields"])
            self.assertTrue(resource["fallback"])

    def test_data_modules_expose_source_retrieval_and_freshness_metadata(self):
        for resource in ("platform_health", "themes", "budget_composition"):
            self.assertIn(f'data-contract-resource="{resource}"', HTML)
        for field in ("data-source", "data-retrieved-at", "data-freshness-status"):
            self.assertIn(field, HTML)


if __name__ == "__main__":
    unittest.main()
