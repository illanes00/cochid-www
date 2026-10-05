"""Contrato del RSS y del sitemap del blog, leído desde el dist ya construido."""
from email.utils import parsedate_to_datetime
from pathlib import Path
import re
import unittest
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
ATOM = "{http://www.w3.org/2005/Atom}"
SITEMAP = "{http://www.sitemaps.org/schemas/sitemap/0.9}"


def entradas():
    resultado = []
    for archivo in sorted((ROOT / "content" / "blog").glob("*.md")):
        bloque = re.match(r"^---\n(.*?)\n---", archivo.read_text(encoding="utf-8"), re.S).group(1)
        meta = {}
        for linea in bloque.splitlines():
            clave, _, valor = linea.partition(":")
            meta[clave.strip()] = valor.strip()
        resultado.append(meta)
    return resultado


class BlogRssContractTests(unittest.TestCase):
    def setUp(self):
        self.raiz = ET.parse(DIST / "blog" / "feed.xml").getroot()
        self.canal = self.raiz.find("channel")

    def test_is_rss_2_with_required_channel_elements(self):
        self.assertEqual("rss", self.raiz.tag)
        self.assertEqual("2.0", self.raiz.get("version"))
        self.assertIsNotNone(self.canal)
        for campo in ("title", "link", "description"):
            self.assertTrue((self.canal.findtext(campo) or "").strip(), campo)
        self.assertEqual("https://cochid.cl/blog/", self.canal.findtext("link"))
        self.assertEqual("es-cl", self.canal.findtext("language"))
        parsedate_to_datetime(self.canal.findtext("lastBuildDate"))
        propio = self.canal.find(f"{ATOM}link")
        self.assertEqual("self", propio.get("rel"))
        self.assertEqual("https://cochid.cl/blog/feed.xml", propio.get("href"))
        self.assertEqual("application/rss+xml", propio.get("type"))

    def test_has_one_valid_item_per_published_entry(self):
        items = self.canal.findall("item")
        esperadas = {f"https://cochid.cl{meta['ruta']}": meta for meta in entradas()}
        self.assertGreaterEqual(len(esperadas), 5)
        self.assertEqual(len(esperadas), len(items))
        guids = []
        for item in items:
            enlace = item.findtext("link")
            self.assertIn(enlace, esperadas)
            meta = esperadas[enlace]
            self.assertEqual(meta["titulo"], item.findtext("title"))
            guid = item.find("guid")
            self.assertEqual("true", guid.get("isPermaLink"))
            self.assertEqual(enlace, guid.text)
            guids.append(guid.text)
            fecha = parsedate_to_datetime(item.findtext("pubDate"))
            self.assertEqual(meta["fecha"], fecha.date().isoformat())
            self.assertTrue(item.findtext("description"))
        self.assertEqual(len(guids), len(set(guids)))
        fechas = [parsedate_to_datetime(item.findtext("pubDate")) for item in items]
        self.assertEqual(fechas, sorted(fechas, reverse=True))

    def test_feed_has_no_internal_notes(self):
        texto = (DIST / "blog" / "feed.xml").read_text(encoding="utf-8")
        self.assertNotIn("VERIFICAR", texto)
        self.assertNotIn("<!--", texto)
        self.assertNotRegex(texto, r"\bCIS\b")

    def test_sitemap_is_well_formed_and_lists_blog_and_news(self):
        raiz = ET.parse(DIST / "sitemap.xml").getroot()
        urls = {url.findtext(f"{SITEMAP}loc"): url.findtext(f"{SITEMAP}lastmod") for url in raiz}
        for ruta in ("/blog/", "/novedades/"):
            self.assertIn(f"https://cochid.cl{ruta}", urls)
        self.assertNotIn("https://cochid.cl/blog/feed.xml", urls)
        for meta in entradas():
            self.assertEqual(meta["fecha"], urls[f"https://cochid.cl{meta['ruta']}"])

    def test_blog_pages_stay_below_the_page_budget(self):
        for archivo in [DIST / "blog" / "index.html", DIST / "novedades" / "index.html", *(DIST / "blog").glob("*/index.html")]:
            with self.subTest(archivo=archivo.relative_to(DIST)):
                self.assertLessEqual(archivo.stat().st_size, 120 * 1024)
                html = archivo.read_text(encoding="utf-8")
                self.assertIn('<html lang="es-CL" data-brand="cochid">', html)
                self.assertEqual(1, len(re.findall(r"<h1\b", html)))
                self.assertNotRegex(html, r"\bCIS\b")
                self.assertNotRegex(html, "[–—]")


if __name__ == "__main__":
    unittest.main()
