"""Configuration and instantiation of web app and peewee-managed database"""
from flask import Flask
from flask_cors import CORS

from .db import create_db_interface
from .routes import api_bp


def create_app():
    # Not able to change the static folder variables after app is initialized
    app = Flask(__name__)

    CORS(app)

    app.register_blueprint(api_bp)
    return app


def configure_app(app, **mysql_kwargs):
    """Configure the app's database interface. `mysql_kwargs` are forwarded."""
    app.config["DATABASE"] = create_db_interface(**mysql_kwargs)
