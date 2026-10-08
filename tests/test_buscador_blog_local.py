"""El índice de una release debe usar el RSS de esa misma release."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]


class BuscadorBlogLocalTests(unittest.TestCase):
    def test_cli_indexes_the_updated_local_feed_instead_of_the_published_cache(self):
        with tempfile.TemporaryDirectory() as tmp:
            work = Path(tmp) / "buscador"
            work.mkdir()
            script = work / "generar_indice.py"
            shutil.copyfile(ROOT / "buscador/generar_indice.py", script)
            shutil.copytree(ROOT / "buscador/fuentes", work / "fuentes")
            feed = Path(tmp) / "feed.xml"
            slug = "presupuesto-2027-aportes-cambios-nominal-real"
            titulo = "Presupuesto 2027: gasto actualizado"
            feed.write_text(f'''<rss version="2.0"><channel><item>
<title>{titulo}</title><link>https://cochid.cl/blog/{slug}/</link>
<pubDate>Mon, 05 Oct 2026 00:00:00 -0300</pubDate>
<description>El gasto total crece y se revisan los programas.</description>
<category>Finanzas públicas</category></item></channel></rss>''')
            env = {**os.environ, "DESTINOS_JSON": str(ROOT / "data/destinos.v1.json"),
                   "TAXONOMIA_JSON": str(ROOT / "data/taxonomia.json")}
            result = subprocess.run([sys.executable, str(script), "--blog-local", str(feed)],
                                    env=env, text=True, capture_output=True, timeout=20)
            self.assertEqual(0, result.returncode, result.stderr)
            indice = json.loads((work / "indice.json").read_text())
            entrada = next(item for item in indice["items"] if item["t"] == "blog" and item["i"] == slug)
            self.assertEqual(titulo, entrada["n"])
            self.assertEqual("El gasto total crece y se revisan los programas.", entrada["d"])
            fuente = next(f for f in indice["meta"]["fuentes"] if f.get("url") == "https://cochid.cl/blog/feed.xml")
            self.assertEqual("archivo del build", fuente["modo"])


if __name__ == "__main__":
    unittest.main()
