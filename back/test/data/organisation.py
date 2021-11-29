import pytest
from boxtribute_server.models.organisation import Organisation


def default_organisation_data():
    mock_organisation = {
        "id": 1,
        "name": "CoolOrganisation",
        "created_by": None,
        "modified_by": None,
        "created": None,
        "deleted": None,
        "modified": None,
    }

    return mock_organisation


@pytest.fixture()
def default_organisation():
    return default_organisation_data()


def create():
    Organisation.create(**default_organisation_data())
