from flask import Flask


def create_app():
    app = Flask(__name__)

    @app.route("/")
    def index():
        return "<h1>cochid.cl</h1><p>Próximamente.</p>"

    @app.route("/health")
    def health():
        return "ok", 200

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=8180, debug=True)
