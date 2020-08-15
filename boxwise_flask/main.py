"""Main entry point for application"""
import os

from .app import create_app
from .db import db

app = create_app()

# Prepare address of mysql host
mysql_host = os.getenv("MYSQL_HOST", "") + (
    ":" + os.getenv("MYSQL_PORT") if os.getenv("MYSQL_PORT", False) else ""
)

# establish database connection
app.config["DATABASE"] = "mysql://{}:{}@{}/{}{}".format(
    os.getenv("MYSQL_USER"),
    os.getenv("MYSQL_PASSWORD"),
    mysql_host,
    os.getenv("MYSQL_DB"),
    os.getenv("MYSQL_SOCKET", ""),
)

db.init_app(app)
