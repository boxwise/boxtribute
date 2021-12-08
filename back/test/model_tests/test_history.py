import pytest
from boxtribute_server.models.definitions.history import DbChangeHistory


@pytest.mark.usefixtures("default_history")
def test_history_model(default_history):
    query = DbChangeHistory.get_by_id(default_history["id"])

    assert query.changes == default_history["changes"]
