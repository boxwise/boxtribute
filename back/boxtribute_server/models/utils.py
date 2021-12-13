"""Utility functions to support data model definitions."""
from datetime import datetime, timezone


def utcnow():
    """Return current datetime in UTC, in second precision (the MySQL database is
    configured to not store any fractional seconds).
    """
    return datetime.now(tz=timezone.utc).replace(microsecond=0)
