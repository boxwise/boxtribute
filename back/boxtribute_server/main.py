"""Main entry point for web application"""
import os

from .app import configure_app, create_app
from .routes import api_bp, app_bp

app = create_app()
blueprints = [api_bp] if os.getenv("EXPOSE_FULL_GRAPHQL") is None else [app_bp]
configure_app(
    app,
    *blueprints,
    host=os.environ["MYSQL_HOST"],
    port=int(os.environ["MYSQL_PORT"]),
    user=os.environ["MYSQL_USER"],
    password=os.environ["MYSQL_PASSWORD"],
    database=os.environ["MYSQL_DB"],
    unix_socket=os.getenv("MYSQL_SOCKET"),
)
