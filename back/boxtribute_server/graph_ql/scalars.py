from datetime import datetime, timezone

from ariadne import ScalarType

datetime_scalar = ScalarType("Datetime")
date_scalar = ScalarType("Date")


@datetime_scalar.serializer
def serialize_datetime(value):
    value = value.replace(tzinfo=timezone.utc)
    return value.isoformat()


@date_scalar.serializer
def serialize_date(value):
    if value == "0000-00-00 00:00:00":
        # A NULL value in a DateTimeField is represented by the zero-date string which
        # cannot be converted to a reasonable Python datetime
        return
    return value.isoformat()


@date_scalar.value_parser
def parse_date(value):
    return datetime.strptime(value, "%Y-%m-%d").date()
