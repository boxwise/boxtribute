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
            "url_parameters": "?filter=foo",
            "created_on": now,
            "created_by": default_user_data()["id"],
        }
    ]


@pytest.fixture
def shareable_link():
    return data()[0]


def create():
    ShareableLink.insert_many(data()).execute()
