import pytest
from data import MODELS


@pytest.fixture(scope="session", autouse=True)
def bind_models_to_database(setup_testing_database):
    with setup_testing_database.bind_ctx(MODELS, False, False):
        yield
