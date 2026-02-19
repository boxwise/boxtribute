"""Configuration and instantiation of web app and peewee-managed database"""

import os

import sentry_sdk
from flask import Flask
from graphql.error import GraphQLError
from sentry_sdk.integrations.ariadne import AriadneIntegration
from sentry_sdk.integrations.flask import FlaskIntegration

from .db import create_db_interface, db
from .models.definitions import Model


def create_app():
    return Flask(__name__, static_folder=None)


def register_blueprints(app, *blueprints):
    for blueprint in blueprints:
        app.register_blueprint(blueprint)


def main(*blueprints):
    """Integrate Sentry SDK. Create and configure Flask app."""

    def before_sentry_send(event, hint):  # pragma: no cover
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
            # Don't send GraphQLErrors from the Query API caused by GraphQL explorer
            # users during experimenting/typing. Authz and validation errors (custom
            # back-end exceptions) are still reported because they have the 'extensions'
            # attribute
            return
        return event

    # The SDK requires the parameters dns, and optionally, environment and release for
    # initialization. In the deployed GAE environments they are read from the
    # environment variables `SENTRY_*`. Since in local or CI testing environments these
    # variables don't exist, the SDK is not effective which is desired.
    sentry_sdk.init(
        integrations=[FlaskIntegration(), AriadneIntegration()],
        traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", 0.0)),
        before_send=before_sentry_send,
        profiles_sample_rate=float(os.getenv("SENTRY_PROFILES_SAMPLE_RATE", 0)),
    )

    app = create_app()
    register_blueprints(app, *blueprints)

    # Establish DB connection(s) and initialize DatabaseManager
    db_connection_parameters = dict(
        # always used
        user=os.environ["MYSQL_USER"],
        password=os.environ["MYSQL_PASSWORD"],
        database=os.environ["MYSQL_DB"],
        # used for connecting to development / CI testing DB
        host=os.getenv("MYSQL_HOST"),
        port=int(os.getenv("MYSQL_PORT", 0)),
    )
    # used for connecting to Google Cloud from GAE
    database_socket = os.getenv("MYSQL_SOCKET")
    replica_socket = os.getenv("MYSQL_REPLICA_SOCKET")

    db.database = create_db_interface(
        unix_socket=database_socket, **db_connection_parameters
    )
    # In deployed environment: replica_socket is set
    # In integration tests: connect to same host/port as primary database
    # In endpoint tests, no replica connection is used
    db.replica = create_db_interface(
        unix_socket=replica_socket, **db_connection_parameters
    )

    # Enable opening/closing DB connection before/after request
    db.register_handlers(app)
    # With a complete list of models no need to recursively bind dependencies
    db.database.bind(Model.__subclasses__(), bind_refs=False, bind_backrefs=False)
    return app
