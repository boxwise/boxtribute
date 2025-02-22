import pytest
from boxtribute_server.routes import EXPLORER_TITLE


@pytest.mark.parametrize("endpoint", ["", "graphql"])
def test_private_endpoint(read_only_client, endpoint):
    response = read_only_client.get(f"/{endpoint}")
    assert response.status_code == 200
    assert EXPLORER_TITLE in response.data.decode()


def test_public_endpoint(read_only_client, monkeypatch):
    response = read_only_client.get("/public")
    assert response.status_code == 200
    assert EXPLORER_TITLE in response.data.decode()

    monkeypatch.setenv("ENVIRONMENT", "production")
    response = read_only_client.get("/public")
    assert response.status_code == 401
    assert response.json["error"] == "No permission to access public API"
