"""Main entry point for web application"""
from .app import main
from .routes import app_bp

app = main(app_bp)
