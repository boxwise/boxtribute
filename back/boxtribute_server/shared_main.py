"""Main entry point for public BE"""

from .app import main
from .routes import shared_bp

app = main(shared_bp)
