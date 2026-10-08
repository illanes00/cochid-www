"""Comparaciones públicas del IFP: precios corrientes y constantes separados."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]


class PresupuestoIFPTests(unittest.TestCase):
    def test_cli_compares_gct_against_the_correct_price_bases(self):
        with tempfile.TemporaryDirectory() as directory:
            result = subprocess.run(
                [sys.executable, str(ROOT / "scripts/presupuesto-ifp-2027.py"),
                 "--salida", directory], capture_output=True, text=True,
            )
            self.assertEqual(0, result.returncode, result.stderr)
            data = json.loads((Path(directory) / "resumen-ifp.json").read_text())
            self.assertAlmostEqual(4.462765209, data["gct_nominal_pct"], places=6)
            self.assertAlmostEqual(1.543244144, data["gct_real_recalculado_pct"], places=6)
            self.assertEqual("1.5", data["gct_real_oficial_pct"])
            self.assertEqual(33, data["programas_fusionados_reportados"])
            self.assertEqual(12, data["iniciativas_resultantes_reportadas"])
            self.assertEqual(4603273, data["nuevos_programas_miles_clp"])

    def test_cli_rejects_a_real_comparison_with_different_price_years(self):
        data = json.loads((ROOT / "assets/presupuesto-2027/ifp-2027.json").read_text())
        data["gobierno_central"]["cierre_2026_precios_2027"]["ano_precios"] = 2026
        with tempfile.TemporaryDirectory() as directory:
            fixture = Path(directory) / "input.json"
            fixture.write_text(json.dumps(data))
            output = Path(directory) / "result"
            result = subprocess.run(
                [sys.executable, str(ROOT / "scripts/presupuesto-ifp-2027.py"),
                 "--datos", str(fixture), "--salida", str(output)],
                capture_output=True, text=True,
            )
            self.assertNotEqual(0, result.returncode)
            self.assertIn("misma base de precios", result.stderr)
            self.assertFalse(output.exists())


if __name__ == "__main__":
    unittest.main()
