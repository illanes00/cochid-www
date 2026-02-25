from datetime import datetime

from flask import Flask, render_template, request


def create_app():
    app = Flask(__name__)

    @app.context_processor
    def inject_globals():
        return {
            "current_year": datetime.now().year,
            "canonical_base": "https://cochid.cl",
            "stats": {
                "services": "19+",
                "servers": "3",
                "sources": "100+",
                "domains": "10+",
            },
        }

    @app.route("/")
    def index():
        return render_template("index.html", nav_page="inicio", canonical_path="/")

    @app.route("/servicios")
    def servicios():
        return render_template(
            "servicios.html", nav_page="servicios", canonical_path="/servicios"
        )

    @app.route("/nosotros")
    def nosotros():
        return render_template(
            "nosotros.html", nav_page="nosotros", canonical_path="/nosotros"
        )

    @app.route("/contacto")
    def contacto():
        return render_template(
            "contacto.html", nav_page="contacto", canonical_path="/contacto"
        )

    @app.route("/health")
    def health():
        return "ok", 200

    @app.route("/robots.txt")
    def robots():
        return (
            "User-agent: *\nAllow: /\n\n"
            "Sitemap: https://cochid.cl/sitemap.xml\n",
            200,
            {"Content-Type": "text/plain"},
        )

    @app.route("/sitemap.xml")
    def sitemap():
        pages = ["/", "/servicios", "/nosotros", "/contacto"]
        xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        for page in pages:
            xml += f"  <url><loc>https://cochid.cl{page}</loc></url>\n"
        xml += "</urlset>\n"
        return xml, 200, {"Content-Type": "application/xml"}

    @app.errorhandler(404)
    def not_found(e):
        return render_template("error.html", code=404, message="Página no encontrada"), 404

    @app.errorhandler(500)
    def server_error(e):
        return render_template("error.html", code=500, message="Error interno del servidor"), 500

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=8180, debug=True)
