"""Configuration and instantiation of web app and peewee-managed database"""

import os

import sentry_sdk
from flask import Flask
from graphql.error import GraphQLError
from sentry_sdk.integrations.ariadne import AriadneIntegration
from sentry_sdk.integrations.flask import FlaskIntegration

from .db import create_db_interface, db
from .utils import in_staging_environment


def create_app():
    return Flask(__name__, static_folder=None)


def configure_app(
    app, *blueprints, database_interface=None, replica_socket=None, **mysql_kwargs
):
    """Register blueprints. Configure the app's database interface. `mysql_kwargs` are
    forwarded.
    """
    for blueprint in blueprints:
        app.register_blueprint(blueprint)

    app.config["DATABASE"] = database_interface or create_db_interface(**mysql_kwargs)

    if replica_socket or mysql_kwargs:
        # In deployed environment: replica_socket is set
        # In integration tests: connect to same host/port as primary database
        # In endpoint tests, no replica connection is used
        mysql_kwargs["unix_socket"] = replica_socket
        app.config["DATABASE_REPLICA"] = create_db_interface(**mysql_kwargs)

    db.init_app(app)


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
    setup_opentelemetry(app)
    configure_app(
        app,
        *blueprints,
        # always used
        user=os.environ["MYSQL_USER"],
        password=os.environ["MYSQL_PASSWORD"],
        database=os.environ["MYSQL_DB"],
        # used for connecting to development / CI testing DB
        host=os.getenv("MYSQL_HOST"),
        port=int(os.getenv("MYSQL_PORT", 0)),
        # used for connecting to Google Cloud from GAE
        unix_socket=os.getenv("MYSQL_SOCKET"),
        replica_socket=os.getenv("MYSQL_REPLICA_SOCKET"),
    )
    return app


def setup_opentelemetry(app):
    if not in_staging_environment():
        return

    # https://cloud.google.com/stackdriver/docs/instrumentation/choose-approach#app_engine
    # https://cloud.google.com/trace/docs/setup/python-ot
    # https://github.com/GoogleCloudPlatform/opentelemetry-operations-python/blob/1f1775886d7314b113acd322633afb278f875687/samples/instrumentation-quickstart/setup_opentelemetry.py
    # No permission for trace.googleapis.com
    from opentelemetry import trace
    from opentelemetry.exporter.cloud_trace import CloudTraceSpanExporter
    from opentelemetry.propagate import set_global_textmap
    from opentelemetry.propagators.cloud_trace_propagator import (
        CloudTraceFormatPropagator,
    )
    from opentelemetry.sdk.resources import SERVICE_INSTANCE_ID, Resource

    # from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor

    resource = Resource.create(
        attributes={
            # Use the PID as the service.instance.id to avoid duplicate timeseries
            # from different Gunicorn worker processes.
            SERVICE_INSTANCE_ID: f"worker-{os.getpid()}",
        }
    )

    provider = TracerProvider(resource=resource)
    processor = BatchSpanProcessor(CloudTraceSpanExporter())
    provider.add_span_processor(processor)

    trace.set_tracer_provider(provider)
    set_global_textmap(CloudTraceFormatPropagator())

    from opentelemetry.instrumentation.flask import FlaskInstrumentor

    FlaskInstrumentor().instrument_app(app)
