import pytest
from boxtribute_server.routes import EXPLORER_TITLE


@pytest.mark.parametrize("endpoint", ["", "graphql"])
def test_private_endpoint(client, endpoint):
    response = client.get(f"/{endpoint}")
    assert response.status_code == 200
    assert EXPLORER_TITLE in response.data.decode()


def test_public_endpoint(client, monkeypatch):
    response = client.get("/public")
    assert response.status_code == 200
    assert EXPLORER_TITLE in response.data.decode()
