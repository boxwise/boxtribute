"""Setup for logging in Google Cloud."""
from google.cloud import logging as gcloud_logging

logging_client = gcloud_logging.Client()
# Retrieve a Cloud Logging handler based on the environment the app is run in and
# integrate the handler with the Python logging module. By default this captures all
# logs at INFO level and higher
# logging_client.setup_logging()

request_logger = logging_client.logger("requests")
