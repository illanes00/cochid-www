from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")
KIT_HOST = "https://kit.innovacionsantiago.cl"
CANONICAL_BASE = re.compile(re.escape(KIT_HOST) + r"/v10/[0-9a-f]{64}")
STABLE_DIGEST = "4cb4a4f28aeb26aa5b8c33c591c54a418c280db53be46a5d0d0cfd2c2c803bc4"


def _kit_bases():
    return set(re.findall(re.escape(KIT_HOST) + r"/[^\"'\s]+?/(?=style\.css|theme\.js|assets/)", HTML))


class CochidMainStyleV10ContractTests(unittest.TestCase):
    def test_pins_the_published_stable_digest_without_incompatible_chrome(self):
        base = f"{KIT_HOST}/v10/{STABLE_DIGEST}"
        self.assertEqual(5, HTML.count(base))
        self.assertIn('integrity="sha384-4gPYauhZAOlgKjBpo9G+sBfv3fJvQNtXhwS/gCvIPOA74Arw50JG3LZFr8mcxAPb"', HTML)
        self.assertNotIn("c2c15cacc312f95345ab31bbb720bb0d197ccb668003990a2ba50fa2d914f68c", HTML)
        self.assertNotIn("5303c30dbc9afc51586b1d4659e3072cd360882a5c15827eca350d9eb4f644ec", HTML)
        self.assertNotIn("chrome.js", HTML)

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

    def test_declares_the_cochid_identity_without_legacy_runtimes(self):
        self.assertIn("/assets/brands/cochid-mark.svg", HTML)
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
            "https://datos.cochid.cl/api/cofog/composition?year=2024",
        )

        for public_surface in navigation_and_api:
            self.assertIn(public_surface, HTML)
        self.assertNotIn("googletagmanager.com", HTML)
        self.assertNotIn("fonts.googleapis.com", HTML)
        self.assertNotIn("font-family: Inter", HTML)
        self.assertNotIn("box-shadow:", HTML)
        self.assertNotIn("border-left:", HTML)

    def test_theme_and_keyboard_contracts_are_explicit(self):
        self.assertIn('localStorage.setItem("cis-style:theme"', HTML)
        self.assertIn('aria-pressed="false"', HTML)
        self.assertIn('<a class="skip-link" href="#contenido">', HTML)
        self.assertIn('<main id="contenido"', HTML)

    def test_exposes_the_existing_primary_navigation_on_mobile(self):
        self.assertIn('<details class="mobile-nav">', HTML)
        for label in ("Qué es COCHID", "Servicios", "Datos", "Mapas", "Transporte", "Lex", "Congreso", "Elecciones", "Scribe", "Thesis"):
            self.assertIn(f">{label}</a>", HTML)

    def test_uses_the_canonical_lockup_and_grouped_ecosystem_navigation(self):
        self.assertIn("/assets/namebrands/compania-chilena-inteligencia-datos-lockup.svg", HTML)
        self.assertNotIn("/assets/brands/cochid-lockup.svg", HTML)
        self.assertNotIn("un proyecto de la Compañía de Innovación de Santiago", HTML)
        self.assertNotIn('"parentOrganization"', HTML)
        self.assertNotIn('class="brand-wordmark"', HTML)
        self.assertIn("[data-theme=\"dark\"] .ccnav .brand-lockup", HTML)
        self.assertIn("filter: invert(1) hue-rotate(180deg)", HTML)
        self.assertIn("height: auto; width: 192px", HTML)
        self.assertIn('<details class="ecosystem-menu">', HTML)
        self.assertIn('href="#que-es-cochid"', HTML)
        self.assertIn('href="#servicios"', HTML)
        self.assertIn("Iniciar sesión</a>", HTML)
        self.assertIn('id="themeToggle"', HTML)

    def test_contains_long_content_and_avoids_syllable_breaking(self):
        self.assertIn("overflow-wrap: anywhere", HTML)
        self.assertIn("hyphens: none", HTML)
        self.assertIn("min-width: 0", HTML)
        self.assertIn("max-width: 100%", HTML)

    def test_budget_chart_supports_pointer_and_keyboard_disclosure(self):
        self.assertIn("class: 'budget-row'", HTML)
        self.assertIn("'aria-expanded': 'false'", HTML)
        self.assertIn("'aria-controls': detailsId", HTML)
        self.assertIn("wrap.addEventListener('click'", HTML)
        self.assertIn("class: 'budget-details'", HTML)
        self.assertIn("details.hidden = expanded", HTML)


if __name__ == "__main__":
    unittest.main()
