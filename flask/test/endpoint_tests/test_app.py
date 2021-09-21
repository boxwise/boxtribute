import os

import pytest


@pytest.mark.skipif("CIRCLECI" not in os.environ, reason="only functional in CircleCI")
def test_get_box_details(mysql_app_client):
    data = {
        "query": """query BoxIdAndItems {
                qrCode(qrCode: "ffdd7f7243d74a663b417562df0ebeb") {
                    box {
                        id
                        boxLabelIdentifier
                        location {
                            id
                            base {
                                id
                            }
                            name
                        }
                        items
                        size
                        state
                    }
                }
            }"""
    }
    response = mysql_app_client.post("/graphql", json=data)
    queried_box = response.json["data"]["qrCode"]["box"]
    assert response.status_code == 200
    assert queried_box == {
        "id": "642",
        "boxLabelIdentifier": "436898",
        "items": 87,
        "location": {
            "id": "18",
            "base": {"id": "2"},
            "name": "WH2",
        },
        "size": "52 Mixed",
        "state": "InStock",
    }

    data = {
        "query": """query SomeBoxDetails {
                box(boxId: "996559") {
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
    response = mysql_app_client.post("/graphql", json=data)
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
        "size": "53 S",
    }


@pytest.mark.skipif("CIRCLECI" not in os.environ, reason="only functional in CircleCI")
def test_get_boxes(mysql_app_client):
    data = {
        "query": """query CommentsOfLostBoxes {
                location(id: "14") {
                    boxes {
                        comment
                    }
                }
            }"""
    }
    response = mysql_app_client.post("/graphql", json=data)
    queried_boxes = response.json["data"]["location"]["boxes"]
    assert response.status_code == 200
    assert len(queried_boxes) == 78
    # There are no comments currently. Verify by creating a set
    assert {box["comment"] for box in queried_boxes} == {""}


@pytest.mark.skipif("CIRCLECI" not in os.environ, reason="only functional in CircleCI")
def test_get_bases(mysql_app_client):
    data = {
        "query": """query basesOfBoxAid {
                organisation(id: "1") {
                    bases {
                        name
                        organisation {
                            id
                        }
                    }
                }
            }"""
    }
    response = mysql_app_client.post("/graphql", json=data)
    queried_locations = response.json["data"]["organisation"]["bases"]
    assert response.status_code == 200
    assert len(queried_locations) == 1
    assert queried_locations[0]["name"] == "Lesvos"


@pytest.mark.skipif("CIRCLECI" not in os.environ, reason="only functional in CircleCI")
def test_get_products(mysql_app_client):
    data = {
        "query": """query getShoes {
                productCategory(id: "5") {
                    products {
                        id
                    }
                }
            }"""
    }
    response = mysql_app_client.post("/graphql", json=data)
    queried_products = response.json["data"]["productCategory"]["products"]
    assert response.status_code == 200
    assert len(queried_products) == 13
