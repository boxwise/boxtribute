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


def test_backend_connection():
    """Verify that database connection is established and operational.

    Follow the setup-proceduce of the main module, instantiate a test client,
    and query a box via the GraphQL endpoint.
    """
    app = create_app()
    app.testing = True
    # cf. main.py but inserting values from docker-compose.yml
    app.config["DATABASE"] = "mysql://root:dropapp_root@localhost:32000/dropapp_dev"

    db.init_app(app)

    client = app.test_client()

    data = {
        "query": """query Box {
                box(qr_code: "fff74d8503b1a5773c301cbe1e1ff43") {
                    box_id
                    items
                    created
                }
            }"""
    }
    response = client.post("/graphql", json=data)
    queried_box = response.json["data"]["box"]
    assert response.status_code == 200
    assert queried_box == {"box_id": "751464", "items": 92, "created": None}

    db.close_db(None)
