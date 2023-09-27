"""Development main entry point for webapp back-end AND query API"""
from .app import main
from .routes import api_bp, app_bp

app = main(api_bp, app_bp)
