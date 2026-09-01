from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")
KIT_HOST = "https://kit.innovacionsantiago.cl"
CANONICAL_BASE = re.compile(re.escape(KIT_HOST) + r"/v10/[0-9a-f]{64}")
CANDIDATE_DIGEST = "7bfd2f185fda94a4b44fe62530df1477a9ee6f64d9acc3f8bc4eb37c1c709c86"


def _kit_bases():
    return set(re.findall(re.escape(KIT_HOST) + r"/[^\"'\s]+?/(?=style\.css|theme\.js|assets/)", HTML))


class CochidMainStyleV10ContractTests(unittest.TestCase):
    def test_pins_the_published_candidate_with_shared_chrome(self):
        base = f"{KIT_HOST}/v10/{CANDIDATE_DIGEST}"
        self.assertGreaterEqual(HTML.count(base), 6)
        self.assertIn('integrity="sha384-4gPYauhZAOlgKjBpo9G+sBfv3fJvQNtXhwS/gCvIPOA74Arw50JG3LZFr8mcxAPb"', HTML)
        self.assertIn('integrity="sha384-SfOYNfiltvNBhqAT+uSrMTrpQbSsiVqUJByllcrOkitokI9xKgSe2owoYOHCBXp5"', HTML)
        self.assertIn("chrome.js", HTML)
        self.assertNotIn("4cb4a4f28aeb26aa5b8c33c591c54a418c280db53be46a5d0d0cfd2c2c803bc4", HTML)

    def test_uses_a_single_canonical_v10_anchor(self):
        bases = _kit_bases()
        self.assertTrue(bases, "el HTML no referencia el kit")
        self.assertEqual(1, len(bases), f"hay más de un anclaje del kit: {sorted(bases)}")
        base = bases.pop().rstrip("/")
        self.assertRegex(base, CANONICAL_BASE)

    def test_rejects_the_legacy_releases_path_scheme(self):
        self.assertNotIn(f"{KIT_HOST}/releases/", HTML)

    def test_pins_both_entrypoints_with_subresource_integrity(self):
        for tag in re.findall(r"<(?:link|script)\b[^>]*kit\.innovacionsantiago\.cl[^>]*>", HTML):
            if "style.css" in tag or "theme.js" in tag:
                self.assertIn('integrity="sha384-', tag)
                self.assertIn('crossorigin="anonymous"', tag)
        self.assertIn("/style.css", HTML)
        self.assertIn("/theme.js", HTML)

    def test_declares_the_cochid_identity_and_circular_favicon(self):
        self.assertIn("/assets/brands/cochid-mark.svg", HTML)
        self.assertIn("/assets/chrome/favicons/cochid.svg", HTML)
        self.assertIn('data-brand="cochid"', HTML)
        self.assertIn('data-theme="light"', HTML)
        self.assertNotIn("style.innovacionsantiago.cl/v9", HTML)
        self.assertNotIn("/v6/", HTML)

    def test_keeps_the_public_data_surface_without_external_or_legacy_assets(self):
        navigation_and_api = (
            'href="https://datos.cochid.cl/"',
            'href="https://datos.cochid.cl/temas"',
            'href="https://datos.cochid.cl/explorar"',
            'href="https://datos.cochid.cl/metodologia"',
            'href="https://datos.cochid.cl/presupuesto"',
        )

        for public_surface in navigation_and_api:
            self.assertIn(public_surface, HTML)
        self.assertNotIn("googletagmanager.com", HTML)
        self.assertNotIn("fonts.googleapis.com", HTML)
        self.assertNotIn("font-family: Inter", HTML)
        self.assertNotIn("box-shadow:", HTML)
        self.assertNotIn("border-left:", HTML)

    def test_theme_and_keyboard_contracts_are_explicit(self):
        self.assertIn('data-theme-toggle', HTML)
        self.assertIn('aria-pressed="false"', HTML)
        self.assertNotIn('id="themeToggle"', HTML)
        self.assertNotIn('bindThemeToggle', HTML)
        self.assertIn('<a class="skip-link" href="#contenido">', HTML)
        self.assertIn('<main id="contenido"', HTML)

    def test_header_and_footer_use_the_shared_chrome_contract(self):
        for selector in (
            'class="gr-nav"',
            'class="gr-nav__inner"',
            'class="gr-nav__links"',
            'class="gr-nav__toggle"',
            'class="gr-nav__actions"',
            'class="gr-footer"',
            'class="gr-footer__top"',
            'class="gr-footer__grid"',
            'class="gr-footer__attrib"',
        ):
            self.assertIn(selector, HTML)
        self.assertNotIn("ccnav", HTML)
        self.assertNotIn("ccfooter", HTML)
        self.assertNotIn("mobile-nav", HTML)
        for label in ("Datos", "Qué es COCHID", "Ecosistema", "Servicios", "Metodología"):
            self.assertIn(f">{label}</a>", HTML)

    def test_uses_the_canonical_lockup_and_grouped_ecosystem_navigation(self):
        self.assertIn("/assets/namebrands/compania-chilena-inteligencia-datos-lockup.svg", HTML)
        self.assertNotIn("/assets/brands/cochid-lockup.svg", HTML)
        self.assertNotIn("un proyecto de la Compañía de Innovación de Santiago", HTML)
        self.assertNotIn('"parentOrganization"', HTML)
        self.assertNotIn('class="brand-wordmark"', HTML)
        self.assertIn('class="cochid-brand-plate"', HTML)
        self.assertIn("background: #fff", HTML)
        self.assertIn("height: 40px", HTML)
        self.assertIn('href="#que-es-cochid"', HTML)
        self.assertIn('href="#servicios"', HTML)
        self.assertIn("Iniciar sesión</a>", HTML)
        self.assertNotIn("filter: invert", HTML)

    def test_contains_long_content_and_avoids_syllable_breaking(self):
        self.assertIn("overflow-wrap: anywhere", HTML)
        self.assertIn("hyphens: none", HTML)
        self.assertIn("min-width: 0", HTML)
        self.assertIn("max-width: 100%", HTML)

    def test_primary_product_navigation_is_semantic_and_keyboard_native(self):
        self.assertIn('<nav class="primary-links" aria-label="Entradas principales de COCHID Datos">', HTML)
        self.assertNotIn('role="link"', HTML)
        self.assertNotIn('tabindex="0"', HTML)


if __name__ == "__main__":
    unittest.main()
