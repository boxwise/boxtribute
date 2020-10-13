import pytest
from boxwise_flask.models.organisation import Organisation


@pytest.fixture()
def default_organisation(default_user):
    mock_organisation = {
        "id": 1,
        "label": 1,
        "created_by": default_user["id"],
        "modified_by": default_user["id"],
    }
    Organisation.create(**mock_organisation)
    return mock_organisation
