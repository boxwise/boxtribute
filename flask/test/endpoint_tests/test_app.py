import os

import pytest


@pytest.mark.skipif("CIRCLECI" not in os.environ, reason="only functional in CircleCI")
def test_get_box_details(mysql_app_client):
    data = {
        "query": """query BoxIdAndItems {
                getBoxDetails(qrCode: "ffdd7f7243d74a663b417562df0ebeb") {
                    ID
                    items
                }
            }"""
    }
    response = mysql_app_client.post("/graphql", json=data)
    queried_box = response.json["data"]["getBoxDetails"]
    assert response.status_code == 200
    assert queried_box == {"ID": "436898", "items": 87}

    data = {
        "query": """query SomeBoxDetails {
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
    response = mysql_app_client.post("/graphql", json=data)
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

    data = {
        "query": """query BoxLookupWithTwoParameters {
                getBoxDetails(boxId: 996559, qrCode: "deadbeef") {
                    ID
                }
            }"""
    }
    response = mysql_app_client.post("/graphql", json=data)
    queried_box = response.json["data"]["getBoxDetails"]
    assert response.status_code == 200
    assert queried_box is None


@pytest.mark.skipif("CIRCLECI" not in os.environ, reason="only functional in CircleCI")
def test_get_boxes(mysql_app_client):
    data = {
        "query": """query CommentsOfLostBoxes {
                getBoxesByLocation(locationId: 14) {
                    comment
                }
            }"""
    }
    response = mysql_app_client.post("/graphql", json=data)
    queried_boxes = response.json["data"]["getBoxesByLocation"]
    assert response.status_code == 200
    assert len(queried_boxes) == 78
    # There are no comments currently. Verify by creating a set
    assert {box["comment"] for box in queried_boxes} == {""}

    data = {
        "query": """query BoxesWithUnisexAdultProducts {
                getBoxesByGender(genderId: UnisexAdult) {
                    ID
                }
            }"""
    }
    response = mysql_app_client.post("/graphql", json=data)
    queried_boxes = response.json["data"]["getBoxesByGender"]
    assert response.status_code == 200
    assert len(queried_boxes) == 47
    # IDs are six-digit numbers
    for box in queried_boxes:
        assert 99999 < int(box["ID"]) < 1000000
