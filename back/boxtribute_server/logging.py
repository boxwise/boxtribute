"""Setup for logging in Google Cloud."""

import contextlib
import time

from flask import request

from .utils import in_ci_environment, in_development_environment

# Context names
API_CONTEXT = "api"
WEBAPP_CONTEXT = "webapp"
SHARED_CONTEXT = "shared"

if in_ci_environment() or in_development_environment():
    # Skip logger initialization when running tests in CircleCI, or during local
    # development
    request_loggers = None
else:  # pragma: no cover
    # Google Cloud Logging is only available in deployed environments
    from google.cloud import logging as gcloud_logging  # type: ignore

    # Initializing client requires Google credentials to be set (they automatically are
    # in the GOOGLE_APPLICATION_CREDENTIALS environment variable when the app is
    # deployed on App Engine).
    # Otherwise raising a `google.auth.exceptions.DefaultCredentialsError`
    _logging_client = gcloud_logging.Client()

    # Store logs in "projects/dropapp-******/logs/api-requests" or ".../webapp-requests"
    request_loggers = {
        context: _logging_client.logger(f"{context}-requests")
        for context in [API_CONTEXT, WEBAPP_CONTEXT, SHARED_CONTEXT]
    }


def log_request_to_gcloud(*, context, **extra_info):
    """Log the current request's JSON body to Google Cloud, depending on context.
    Optionally add extra info fields to the log entry.
    """
    if request_loggers is None:
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
