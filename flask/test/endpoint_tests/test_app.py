import os

import pytest
from boxwise_flask.app import create_app
from boxwise_flask.db import db


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
                getBoxDetails(qrCode: "ffdd7f7243d74a663b417562df0ebeb") {
                    ID
                    items
                }
            }"""
    }
    response = client.post("/graphql", json=data)
    queried_box = response.json["data"]["getBoxDetails"]
    assert response.status_code == 200
    assert queried_box == {"ID": "436898", "items": 87}

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
                getBoxDetails(boxId: 996559) {
                    qrCode {
                        ID
                    }
                    product {
                        ID
                    }
                    size
                    items
                }
            }"""
    }
    response = client.post("/graphql", json=data)
    queried_box = response.json["data"]["getBoxDetails"]
    assert response.status_code == 200
    assert queried_box == {
        "qrCode": {
            "ID": "574",
        },
        "items": 84,
        "product": {
            "ID": "156",
        },
        "size": "53 S",
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
                getBoxesByLocation(locationId: 14) {
                    comment
                }
            }"""
    }
    response = client.post("/graphql", json=data)
    queried_boxes = response.json["data"]["getBoxesByLocation"]
    assert response.status_code == 200
    assert len(queried_boxes) == 78
    # There are no comments currently. Verify by creating a set
    assert {box["comment"] for box in queried_boxes} == {""}
    db.close_db(None)


@pytest.mark.skipif("CIRCLECI" not in os.environ, reason="only functional in CircleCI")
def test_get_boxes_by_gender():
    app = create_app()
    app.testing = True
    app.config["DATABASE"] = "mysql://root:dropapp_root@127.0.0.1:3306/dropapp_dev"

    db.init_app(app)
    client = app.test_client()

    data = {
        "query": """query BoxesWithUnisexAdultProducts {
                getBoxesByGender(genderId: UnisexAdult) {
                    ID
                }
            }"""
    }
    response = client.post("/graphql", json=data)
    queried_boxes = response.json["data"]["getBoxesByGender"]
    assert response.status_code == 200
    assert len(queried_boxes) == 47
    # IDs are six-digit numbers
    for box in queried_boxes:
        assert 99999 < int(box["ID"]) < 1000000
    db.close_db(None)
