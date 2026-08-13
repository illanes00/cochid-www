from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = Path(__file__).resolve().parents[2]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")
STYLE_ROOT = "https://style.innovacionsantiago.cl/v9/f417275cbb1c390a6b158f2f6574db1b36e2a6cc61e734029530ef90b9d1dd77"


class CochidMainStyleV9ContractTests(unittest.TestCase):
    def test_uses_the_pinned_v9_runtime_and_cochid_lockup(self):
        required_assets = (
            "fonts/css/ibm-plex-sans.css",
            "fonts/css/jetbrains-mono.css",
            "base/tokens.css",
            "base/chrome.css",
            "base/components.css",
            "brands/cochid/tokens.css",
            "brands/cochid/lockup.svg",
        )

        for asset in required_assets:
            self.assertIn(f"{STYLE_ROOT}/{asset}", HTML)
        self.assertNotIn("/v6/", HTML)

    def test_keeps_the_public_data_surface_without_legacy_external_chrome(self):
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

    def test_exposes_the_existing_primary_navigation_on_mobile(self):
        self.assertIn('<details class="mobile-nav">', HTML)
        for label in ("Datos", "Temas", "Explorar", "Metodología", "Quiénes somos", "FAQ"):
            self.assertIn(f">{label}</a>", HTML)

    def test_legacy_flask_cd_cannot_mutate_production(self):
        workflow = (REPO_ROOT / ".github/workflows/cd.yml").read_text(
            encoding="utf-8"
        )

        self.assertIn("workflow_dispatch:", workflow)
        self.assertNotIn("  push:", workflow)
        self.assertNotIn("self-hosted", workflow)
        self.assertNotIn("appleboy/ssh-action", workflow)
        self.assertNotIn("git reset --hard", workflow)
        self.assertNotIn("systemctl restart cochid-www", workflow)
        self.assertIn("release inmutable", workflow)
        self.assertIn("deploy-cis", workflow)


if __name__ == "__main__":
    unittest.main()
