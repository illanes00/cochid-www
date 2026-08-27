from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")
KIT_ROOT = "https://kit.innovacionsantiago.cl/releases/10.0.0-candidate.16/c9aa1c7530c1050549aaa013253f0059b147abe1f725a2979c07e11b35c06c69"
STYLE_SRI = "sha384-ooe8iwt0KS7V9q2BRMfVeC3cf/hgK0QdII5jSGBXM4GBHdy1+rnjSQAxukVu9Dw9"
THEME_SRI = "sha384-4z/J3/xbpw17qJScwLAq3N2hW5F9+5M9by+yIDuu63LedHlPJq2cZE716lDAxL3c"


class CochidMainStyleV10ContractTests(unittest.TestCase):
    def test_uses_the_pinned_v10_runtime_and_cochid_identity(self):
        self.assertIn(f'href="{KIT_ROOT}/style.css"', HTML)
        self.assertIn(f'integrity="{STYLE_SRI}"', HTML)
        self.assertIn(f'src="{KIT_ROOT}/theme.js"', HTML)
        self.assertIn(f'integrity="{THEME_SRI}"', HTML)
        self.assertIn(f'src="{KIT_ROOT}/assets/brands/cochid-mark.svg"', HTML)
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
        for label in ("Datos", "Temas", "Explorar", "Metodología", "Quiénes somos", "FAQ"):
            self.assertIn(f">{label}</a>", HTML)

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
