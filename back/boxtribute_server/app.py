"""Configuration and instantiation of web app and peewee-managed database"""
from flask import Flask
from flask_cors import CORS

from .db import create_db_interface, db
from .routes import api_bp, app_bp


def create_app():
    return Flask(__name__)


def configure_app(app, database_interface=None, **mysql_kwargs):
    """Initialize CORS handling in app, and register blueprints.
    Configure the app's database interface. `mysql_kwargs` are forwarded.
    """
    CORS(app)

    app.register_blueprint(api_bp)
    app.register_blueprint(app_bp)

    app.config["DATABASE"] = database_interface or create_db_interface(**mysql_kwargs)
    db.init_app(app)
