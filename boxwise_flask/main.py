"""Main entry point for application"""
import os

from .app import db
from .routes import app

app.config["DATABASE"] = {
    "name": os.getenv("MYSQL_DB"),
    "engine": "peewee.MySQLDatabase",
    "user": os.getenv("MYSQL_USER"),
    "host": os.getenv("MYSQL_HOST"),
    "password": os.getenv("MYSQL_PASSWORD"),
    # int, otherwise: TypeError: %d format: a number is required, not str from
    # pymysql.connections
    "port": int(os.getenv("MYSQL_PORT", 0)),
}

db.init_app(app)
