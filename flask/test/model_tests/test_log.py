import pytest
from boxwise_flask.models.log import Log


@pytest.mark.usefixtures("default_log")
def test_log_model(default_log):
    query = Log.get_by_id(default_log["id"])

    assert query.content == "Content"
    assert query.ip is None
    assert query.date is None
    assert query.user is None
