"""Contrato de la página /concepciones/ en el sitio estático de COCHID.

Cubre lo que el resto de las pruebas no ve: el enlace desde la portada, el
sitemap, la imagen social y los marcadores que el build necesita. Las series
de datos y la prosa de la página se verifican en tests/concepciones.test.mjs.
"""
from pathlib import Path
import struct
import unittest


ROOT = Path(__file__).resolve().parents[1]
HOME = (ROOT / "index.html").read_text(encoding="utf-8")
PAGINA = (ROOT / "concepciones" / "index.html").read_text(encoding="utf-8")
SITEMAP = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
SOCIAL = ROOT / "concepciones" / "social.png"


class ConcepcionesContractTests(unittest.TestCase):
    def test_home_links_to_the_study_like_the_other_cuaderno(self):
        self.assertIn('href="/concepciones/"', HOME)
        self.assertIn('id="cuaderno-concepciones"', HOME)
        self.assertIn('href="/cambio-de-hora/"', HOME)
        self.assertIn("Cuándo se concibe en Chile", HOME)

    def test_sitemap_lists_the_study(self):
        self.assertIn("<loc>https://cochid.cl/concepciones/</loc>", SITEMAP)
        self.assertIn("<loc>https://cochid.cl/cambio-de-hora/</loc>", SITEMAP)

    def test_page_declares_identity_and_shared_chrome_markers(self):
        self.assertIn('<html lang="es" data-brand="cochid" data-theme="light">', PAGINA)
        self.assertIn('<link rel="canonical" href="https://cochid.cl/concepciones/">', PAGINA)
        for marker in ("<!--KIT_HEAD-->", "<!--HEADER-->", "<!--FOOTER-->"):
            self.assertIn(marker, PAGINA)
        self.assertIn('<a class="skip-link" href="#contenido">', PAGINA)
        self.assertIn("<noscript>", PAGINA)

    def test_page_ships_its_own_layer_and_no_external_dependency(self):
        self.assertIn('<link rel="stylesheet" href="./story.css">', PAGINA)
        self.assertIn('<script type="module" src="./story.mjs">', PAGINA)
        for prohibido in ("cdn.", "unpkg", "jsdelivr", "fonts.googleapis", "googletagmanager"):
            self.assertNotIn(prohibido, PAGINA)

    def test_social_image_is_twelve_hundred_by_six_hundred_thirty(self):
        self.assertTrue(SOCIAL.is_file(), "falta concepciones/social.png")
        data = SOCIAL.read_bytes()
        self.assertEqual(b"\x89PNG\r\n\x1a\n", data[:8])
        width, height = struct.unpack(">II", data[16:24])
        self.assertEqual((1200, 630), (width, height))
        self.assertIn('content="https://cochid.cl/concepciones/social.png"', PAGINA)

    def test_page_avoids_the_forbidden_signs_and_the_loose_acronym(self):
        for caracter in ("—", "–", "−"):
            self.assertNotIn(caracter, PAGINA)
        self.assertNotIn("class=\"overline\"", PAGINA)
        self.assertNotIn("class=\"eyebrow\"", PAGINA)


if __name__ == "__main__":
    unittest.main()
