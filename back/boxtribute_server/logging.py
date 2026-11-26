"""Setup for logging in Google Cloud."""

import contextlib
import logging as std_logging
import time

from flask import current_app, request

from .utils import in_ci_environment, in_development_environment

# Context names
API_CONTEXT = "api"
WEBAPP_CONTEXT = "webapp"
SHARED_CONTEXT = "shared"


class RequestLogger:
    """Wrapper around a standard-library logger that forwards structured log entries
    to the given handler. In deployed environments the handler is a Google Cloud
    Logging handler with a background-thread transport, so that sending log entries
    never blocks the request-handling worker (a blocking gRPC call could otherwise
    exceed the gunicorn worker timeout and cause the worker to be aborted).
    """

    def __init__(self, name, handler):
        self._logger = std_logging.getLogger(f"boxtribute_server.gcloud.{name}")
        self._logger.setLevel(std_logging.INFO)
        self._logger.propagate = False
        self._logger.handlers = [handler]

    def log_struct(self, info, severity="INFO"):
        level = std_logging.getLevelName(severity)
        if not isinstance(level, int):
            level = std_logging.INFO
        # Dict messages are sent as structured JSON payload by the Cloud Logging
        # handler
        self._logger.log(level, info)


if in_ci_environment() or in_development_environment():
    # Skip logger initialization when running tests in CircleCI, or during local
    # development
    request_loggers = None
else:  # pragma: no cover
    # Google Cloud Logging is only available in deployed environments
    from google.cloud import logging as gcloud_logging  # type: ignore
    from google.cloud.logging.handlers import CloudLoggingHandler  # type: ignore

    # Initializing client requires Google credentials to be set (they automatically are
    # in the GOOGLE_APPLICATION_CREDENTIALS environment variable when the app is
    # deployed on App Engine).
    # Otherwise raising a `google.auth.exceptions.DefaultCredentialsError`
    _logging_client = gcloud_logging.Client()

    # Store logs in "projects/dropapp-******/logs/api-requests" or ".../webapp-requests"
    # The handler's default transport (BackgroundThreadTransport) sends entries
    # asynchronously from a background thread.
    request_loggers = {
        context: RequestLogger(
            context,
            CloudLoggingHandler(_logging_client, name=f"{context}-requests"),
        )
        for context in [API_CONTEXT, WEBAPP_CONTEXT, SHARED_CONTEXT]
    }


def log_request_to_gcloud(*, context, **extra_info):
    """Log the current request's JSON body to Google Cloud, depending on context.
    Optionally add extra info fields to the log entry.
    """
    if request_loggers is None:
        current_app.logger.info(extra_info.get("execution_time"))
        # Render function ineffective if loggers not defined
        return

    content = request.get_json()
    if extra_info:
        content |= extra_info
    request_loggers[context].log_struct(content, severity="INFO")


@contextlib.contextmanager
def log_profiled_request_to_gcloud(*, context):
    """Log the current request's JSON body to Google Cloud, including measured execution
    time.
    """
    start_time = time.perf_counter()
    try:
        yield
    finally:
        end_time = time.perf_counter()
        log_request_to_gcloud(context=context, execution_time=end_time - start_time)
