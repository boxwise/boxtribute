from datetime import date, datetime, timezone

from ariadne import ScalarType

datetime_scalar = ScalarType("Datetime")
date_scalar = ScalarType("Date")


@datetime_scalar.serializer
def serialize_datetime(value):
    value = value.replace(tzinfo=timezone.utc)
    return value.isoformat()


@date_scalar.serializer
def serialize_date(value):
    return value.isoformat()


@date_scalar.value_parser
def parse_date(value):
    # Allowed formats: YYYY-MM-DD and YYYYMMDD
    return date.fromisoformat(value)


@datetime_scalar.value_parser
def parse_datetime(value):
    # Datetime string must be of format '2022-08-30T14:00:00'.
    # With Python 3.11 more formats will be supported
    return datetime.fromisoformat(value)
