def test_get_box_details(auth0_client):
    data = {
        "query": """query BoxIdAndItems {
                qrCode(qrCode: "ffdd7f7243d74a663b417562df0ebeb") {
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
        "id": "642",
        "labelIdentifier": "436898",
        "items": 87,
        "size": "52",
        "state": "InStock",
    }

    data = {
        "query": """query SomeBoxDetails {
                box(labelIdentifier: "996559") {
                    qrCode {
                        id
                        code
                        createdOn
                    }
                    product {
                        id
                    }
                    size
                    items
                }
            }"""
    }
    response = auth0_client.post("/graphql", json=data)
    queried_box = response.json["data"]["box"]
    assert response.status_code == 200
    assert queried_box == {
        "qrCode": {
            "id": "574",
            "code": "224ac643d3b929f99c71c25ccde7dde",
            "createdOn": None,
        },
        "items": 84,
        "product": {
            "id": "156",
        },
        "size": "53",
    }
