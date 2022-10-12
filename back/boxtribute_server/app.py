"""Configuration and instantiation of web app and peewee-managed database"""
import os

import sentry_sdk
from flask import Flask
from flask_cors import CORS
from sentry_sdk.integrations.flask import FlaskIntegration

from .db import create_db_interface, db


def create_app():
    return Flask(__name__)


def configure_app(app, *blueprints, database_interface=None, **mysql_kwargs):
    """Initialize CORS handling in app, and register blueprints.
    Configure the app's database interface. `mysql_kwargs` are forwarded.
    """
    CORS(app)

    for blueprint in blueprints:
        app.register_blueprint(blueprint)

    app.config["DATABASE"] = database_interface or create_db_interface(**mysql_kwargs)
    db.init_app(app)


def main(*blueprints):
    """Integrate Sentry SDK. Create and configure Flask app."""
    # dsn/environment/release: reading SENTRY_* environment variables set in CircleCI
    sentry_sdk.init(
        integrations=[FlaskIntegration()],
        traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", 1.0)),
    )

    app = create_app()
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
    return app
