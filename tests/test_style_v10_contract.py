from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "dist" / "index.html").read_text(encoding="utf-8")
DIGEST = "d4b1a31b65e7ded392140cd72deaca3b05cb9975f328985439981f90a16eb2c0"


class PortalStyleV2ContractTests(unittest.TestCase):
    def test_pins_one_canonical_style_v10_release(self):
        bases = set(re.findall(r"https://kit\.innovacionsantiago\.cl/v10/[0-9a-f]{64}", HTML))
        self.assertEqual(bases, {f"https://kit.innovacionsantiago.cl/v10/{DIGEST}"})
        self.assertNotIn("/releases/", HTML)

    def test_loads_the_versioned_portal_chrome_and_theme(self):
        self.assertIn('/assets/chrome-v2/chrome.css', HTML)
        self.assertIn('/assets/chrome-v2/chrome.js', HTML)
        self.assertIn('data-theme-toggle', HTML)
        self.assertIn('<a class="skip-link" href="#contenido">', HTML)
        self.assertIn('<main id="contenido"', HTML)

    def test_uses_the_new_shared_header_and_footer_contract(self):
        for marker in ('class="cx-nav"', 'class="cx-nav__enlaces"', 'class="cx-pill"',
                       'cx-menu-btn', 'class="cx-sub"', 'class="cx-pie"'):
            self.assertIn(marker, HTML)
        self.assertNotIn('class="gr-nav"', HTML)
        self.assertNotIn('class="gr-footer"', HTML)

    def test_uses_canonical_logos_and_account_entry(self):
        self.assertIn("/assets/namebrands/compania-chilena-inteligencia-datos-lockup.svg", HTML)
        self.assertIn("/assets/brands/cochid-lockup-dark.svg", HTML)
        self.assertIn('href="https://cuenta.innovacionsantiago.cl/">Iniciar sesión</a>', HTML)
        self.assertNotIn("filter: invert", HTML)

    def test_avoids_forbidden_visual_shortcuts(self):
        chrome = (ROOT / "dist" / "assets" / "chrome-v2" / "chrome.css").read_text(encoding="utf-8")
        self.assertNotIn("box-shadow:", chrome)
        self.assertNotRegex(chrome, r"text-transform:\s*uppercase")
        self.assertNotIn("border-left:", HTML)


if __name__ == "__main__":
    unittest.main()
