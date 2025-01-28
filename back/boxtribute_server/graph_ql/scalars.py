from datetime import date, datetime, timezone

from ariadne import ScalarType

datetime_scalar = ScalarType("Datetime")
date_scalar = ScalarType("Date")


# Serializing date(time) object in application layer to string for API
@datetime_scalar.serializer
def serialize_datetime(value):
    # Return datetime value as UTC in format YYYY-MM-DDTHH:MM:SS+00:00
    value = value.replace(tzinfo=timezone.utc)
    return value.isoformat()


@date_scalar.serializer
def serialize_date(value):
    # Return date value in format YYYY-MM-DD
    return value.isoformat()


# Parsing string from API into date(time) object in application layer
@date_scalar.value_parser
def parse_date(value):
    # Allowed formats: YYYY-MM-DD and YYYYMMDD
    return date.fromisoformat(value)


@datetime_scalar.value_parser
def parse_datetime(value):
    # Allowed formats cf.
    # https://docs.python.org/3/library/datetime.html#datetime.datetime.fromisoformat
    # This returns a offset-naive datetime if value without "+XX:XX" suffix
    return datetime.fromisoformat(value)
