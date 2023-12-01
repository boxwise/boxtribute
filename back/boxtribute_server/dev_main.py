"""Development main entry point for webapp back-end AND query API"""
from .app import main
from .routes import api_bp, app_bp

app = main(api_bp, app_bp)


if __name__ == "__main__":
    app.run(host="0.0.0", port=5005, debug=True)
