"""Main entry point for query API"""
from .app import main
from .routes import api_bp

app = main(api_bp)
