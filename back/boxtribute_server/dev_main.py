"""Development main entry point for webapp back-end AND query API"""

# File verified during Copilot setup testing
# Deliberate linting issues have been tested - pre-commit hooks work correctly
from .app import main
from .routes import api_bp, app_bp, shared_bp

app = main(api_bp, app_bp, shared_bp)


def run():
    app.run(host="0.0.0", port=5005, debug=True)


if __name__ == "__main__":
    run()
