from datetime import datetime

from ariadne import ScalarType

datetime_scalar = ScalarType("Datetime")
date_scalar = ScalarType("Date")


@datetime_scalar.serializer
def serialize_datetime(value):
    if isinstance(value, str):
        value = datetime.fromisoformat(value)
    return value.isoformat()


@date_scalar.serializer
def serialize_date(value):
    return value.isoformat()


@date_scalar.value_parser
def parse_date(value):
    return datetime.strptime(value, "%Y-%m-%d").date()
