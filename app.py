from flask import Flask, render_template


def create_app():
    app = Flask(__name__)

    @app.route("/")
    def index():
        return render_template("index.html", nav_page="inicio")

    @app.route("/servicios")
    def servicios():
        return render_template("servicios.html", nav_page="servicios")

    @app.route("/nosotros")
    def nosotros():
        return render_template("nosotros.html", nav_page="nosotros")

    @app.route("/contacto")
    def contacto():
        return render_template("contacto.html", nav_page="contacto")

    @app.route("/propuestas")
    def propuestas():
        return render_template("propuestas.html")

    @app.route("/health")
    def health():
        return "ok", 200

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=8180, debug=True)
