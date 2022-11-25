"""Configuration and instantiation of web app and peewee-managed database"""
import os

import sentry_sdk
from flask import Flask
from flask_cors import CORS
from graphql.error import GraphQLError
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

    def before_sentry_send(event, hint):
        """Callback for filtering error events right before sending to Sentry. This
        function must either return an event to be reported, or None for the event to be
        dismissed.
        """
        blueprint_names = [bp.name for bp in blueprints]
        if "api_bp" not in blueprint_names:
            # Errors in the webapp backend shall be reported
            return event

        exc_info = hint.get("exc_info")
        if not exc_info:
            # Following the SDK documentation, the exc_info attribute for a hint object
            # seems to be optional. If it is not present, report the error
            return event

        error_class, error, _ = exc_info
        if issubclass(error_class, GraphQLError) and not error.extensions:
            # Don't send GraphQLErrors from the Query API caused by GraphQL Playground
            # users during experimenting/typing. Authz and validation errors (custom
            # back-end exceptions) are still reported because they have the 'extensions'
            # attribute
            return
        return event

    # dsn/environment/release: reading SENTRY_* environment variables set in CircleCI
    sentry_sdk.init(
        integrations=[FlaskIntegration()],
        traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", 0.0)),
        before_send=before_sentry_send,
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
