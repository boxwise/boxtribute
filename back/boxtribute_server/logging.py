"""Setup for logging in Google Cloud."""
import os

from flask import request
from google.cloud import logging as gcloud_logging

if os.getenv("CI") == "true" or os.getenv("environment") == "development":
    # Skip logger initialization when running tests in CircleCI, or during local
    # development
    request_logger = None
else:
    # Initializing client requires Google credentials to be set (they automatically are
    # in the GOOGLE_APPLICATION_CREDENTIALS environment variable when the app is
    # deployed on App Engine).
    # Otherwise raising a `google.auth.exceptions.DefaultCredentialsError`
    _logging_client = gcloud_logging.Client()
    request_logger = _logging_client.logger("requests")


def log_request_to_gcloud():
    """Log the query field of the current request's JSON body to Google Cloud."""
    if request_logger is None:
        # Render function ineffective if logger not defined
        return

    request_logger.log_struct(request.get_json()["query"])
