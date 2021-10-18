"""Main entry point for application"""
import os

from .app import configure_app, create_app
from .db import db

app = create_app()
configure_app(
    app,
    mysql_host=os.environ["MYSQL_HOST"],
    mysql_port=os.getenv("MYSQL_PORT", ""),
    mysql_user=os.environ["MYSQL_USER"],
    mysql_password=os.environ["MYSQL_PASSWORD"],
    mysql_db=os.environ["MYSQL_DB"],
    mysql_socket=os.getenv("MYSQL_SOCKET"),
)
db.init_app(app)
