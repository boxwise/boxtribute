import hashlib
from datetime import timedelta

import pytest
from boxtribute_server.enums import ShareableView
from boxtribute_server.models.definitions.shareable_link import ShareableLink
from boxtribute_server.models.utils import utcnow

from .user import default_user_data

now = utcnow()
one_week_from_now = now + timedelta(weeks=1)


def data():
    return [
        {
            "id": 1,
            "code": hashlib.sha256(b"1").hexdigest(),
            "valid_until": one_week_from_now,
            "view": ShareableView.StatvizDashboard,
            "base_id": 1,
            "url_parameters": "filter=foo",
            "created_on": now,
            "created_by": default_user_data()["id"],
        },
        {
            "id": 2,
            "code": hashlib.sha256(b"2").hexdigest(),
            "valid_until": now - timedelta(weeks=1),
            "view": ShareableView.StatvizDashboard,
            "base_id": 1,
            "url_parameters": None,
            "created_on": now - timedelta(weeks=2),
            "created_by": default_user_data()["id"],
        },
        {
            "id": 3,
            "code": hashlib.sha256(b"3").hexdigest(),
            "valid_until": one_week_from_now,
            "view": ShareableView.StockOverview,
            "base_id": 1,
            "url_parameters": None,
            "created_on": now,
            "created_by": default_user_data()["id"],
        },
        {
            "id": 4,
            "code": hashlib.sha256(b"4").hexdigest(),
            "valid_until": one_week_from_now,
            "view": ShareableView.StockOverview,
            "base_id": 1,
            "url_parameters": "tags=2%2C3",
            "created_on": now,
            "created_by": default_user_data()["id"],
        },
    ]


@pytest.fixture
def shareable_link():
    return data()[0]


@pytest.fixture
def expired_link():
    return data()[1]


@pytest.fixture
def stock_overview_link():
    return data()[2]


@pytest.fixture
def tagged_stock_overview_link():
    return data()[3]


def create():
    ShareableLink.insert_many(data()).execute()
