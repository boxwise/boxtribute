def test_get_box_details(auth0_client):
    data = {
        "query": """query BoxIdAndItems {
                qrCode(qrCode: "03a6ad3e5a8677fe350f9849a208552") {
                    box {
                        id
                        labelIdentifier
                        items
                        size
                        state
                    }
                }
            }"""
    }
    response = auth0_client.post("/graphql", json=data)
    queried_box = response.json["data"]["qrCode"]["box"]
    assert response.status_code == 200
    assert queried_box == {
        "id": "67",
        "labelIdentifier": "728544",
        "items": 18,
        "size": "52",
        "state": "Donated",
    }
