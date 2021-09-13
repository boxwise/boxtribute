import os

import pytest
from boxwise_flask.app import create_app
from boxwise_flask.db import db


def test_private_endpoint(client):
    """example test for private endpoint"""
    response_data = client.get("/api/private")
    assert response_data.status_code == 200
    assert (
        "Hello from a private endpoint! You need to be authenticated to see this."
        == response_data.json["message"]
    )


@pytest.mark.skipif("CIRCLECI" not in os.environ, reason="only functional in CircleCI")
def test_backend_connection():
    """Verify that database connection is established and operational.

    Follow the setup-proceduce of the main module, instantiate a test client,
    and query a box via the GraphQL endpoint.
    """
    app = create_app()
    app.testing = True

    # cf. main.py but inserting values from docker-compose.yml
    app.config["DATABASE"] = "mysql://root:dropapp_root@127.0.0.1:3306/dropapp_dev"

    db.init_app(app)

    client = app.test_client()

    data = {
        "query": """query Box {
                box(qr_code: "ffdd7f7243d74a663b417562df0ebeb") {
                    box_id
                    items
                    created
                }
            }"""
    }
    response = client.post("/graphql", json=data)
    queried_box = response.json["data"]["box"]
    assert response.status_code == 200
    assert queried_box == {"box_id": "436898", "items": 87, "created": None}

    db.close_db(None)


@pytest.mark.skipif("CIRCLECI" not in os.environ, reason="only functional in CircleCI")
def test_get_box_details():
    app = create_app()
    app.testing = True
    app.config["DATABASE"] = "mysql://root:dropapp_root@127.0.0.1:3306/dropapp_dev"

    db.init_app(app)
    client = app.test_client()

    data = {
        "query": """query Box {
                getBoxDetails(box_id: 996559) {
                    qr_id
                    product_id
                    size_id
                    items
                    created
                }
            }"""
    }
    response = client.post("/graphql", json=data)
    queried_box = response.json["data"]["getBoxDetails"]
    assert response.status_code == 200
    assert queried_box == {
        "qr_id": 574,
        "items": 84,
        "created": None,
        "product_id": 156,
        "size_id": 53,
    }
    db.close_db(None)


@pytest.mark.skipif("CIRCLECI" not in os.environ, reason="only functional in CircleCI")
def test_get_boxes_by_location():
    app = create_app()
    app.testing = True
    app.config["DATABASE"] = "mysql://root:dropapp_root@127.0.0.1:3306/dropapp_dev"

    db.init_app(app)
    client = app.test_client()

    data = {
        "query": """query Box {
                getBoxesByLocation(location_id: 14) {
                    comments
                }
            }"""
    }
    response = client.post("/graphql", json=data)
    queried_boxes = response.json["data"]["getBoxesByLocation"]
    assert response.status_code == 200
    assert len(queried_boxes) == 78
    # There are no comments currently. Verify by creating a set
    assert {box["comments"] for box in queried_boxes} == {""}
    db.close_db(None)
