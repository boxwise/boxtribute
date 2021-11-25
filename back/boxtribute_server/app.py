"""Configuration and instantiation of web app and peewee-managed database"""
from flask import Flask
from flask_cors import CORS

from .routes import api_bp


def create_app():
    # Not able to change the static folder variables after app is initialized
    app = Flask(__name__)

    CORS(app)

    app.register_blueprint(api_bp)
    return app


def configure_app(
    app,
    *,
    mysql_host,
    mysql_port,
    mysql_user,
    mysql_password,
    mysql_db,
    mysql_socket=None,
):
    """Configure database connection."""
    app.config["DATABASE"] = "mysql://{}:{}@{}/{}{}".format(
        mysql_user,
        mysql_password,
        f"{mysql_host}:{mysql_port}",
        mysql_db,
        mysql_socket or "",
    )
