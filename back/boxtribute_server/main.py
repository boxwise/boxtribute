"""Main entry point for web application"""
import os

from .app import configure_app, create_app
from .routes import app_bp

app = create_app()
configure_app(
    app,
    app_bp,
    host=os.environ["MYSQL_HOST"],
    port=int(os.environ["MYSQL_PORT"]),
    user=os.environ["MYSQL_USER"],
    password=os.environ["MYSQL_PASSWORD"],
    database=os.environ["MYSQL_DB"],
    unix_socket=os.getenv("MYSQL_SOCKET"),
)
