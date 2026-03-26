import pytest
from boxtribute_server.models import MODELS


@pytest.fixture(scope="module", autouse=True)
def use_database(setup_testing_database):
    with setup_testing_database.bind_ctx(MODELS, False, False):
        yield
