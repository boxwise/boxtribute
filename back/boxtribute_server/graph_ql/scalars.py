from datetime import datetime, timezone

import dateutil.parser
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
    return datetime.strptime(value, "%Y-%m-%d").date()


@datetime_scalar.value_parser
def parse_datetime(value):
    # return datetime.from strptime(value, "%Y-%m-%dT%H:%M:%S.%fZ")
    return dateutil.parser.isoparse(value)
