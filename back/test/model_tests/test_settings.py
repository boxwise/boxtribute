import pytest
from boxtribute_server.models.definitions.settings import Settings


@pytest.mark.usefixtures("default_settings")
def test_settings_model(default_settings):
    query = Settings.get_by_id(default_settings["id"])

    assert query.category_id == default_settings["category_id"]
    assert query.code == default_settings["code"]
