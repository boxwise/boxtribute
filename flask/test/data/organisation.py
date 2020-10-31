import pytest
from boxwise_flask.models.organisation import Organisation
from data.user import default_user_data


def default_organisation_data():
    mock_organisation = {
        "id": 1,
        "label": 1,
        "created_by": default_user_data()["id"],
        "modified_by": default_user_data()["id"],
    }
    return mock_organisation


@pytest.fixture()
def default_organisation():
    return default_organisation_data()


def create_default_organisation():
    Organisation.create(**default_organisation_data())
