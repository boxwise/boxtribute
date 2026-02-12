import pytest


@pytest.fixture(scope="session", autouse=True)
def use_database(setup_testing_database):
    yield
