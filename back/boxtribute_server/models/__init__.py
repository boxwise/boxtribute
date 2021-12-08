from datetime import datetime, timezone


def utcnow():
    """Return current datetime in UTC."""
    return datetime.now(tz=timezone.utc)
