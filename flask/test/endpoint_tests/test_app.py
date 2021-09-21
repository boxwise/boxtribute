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
            "name": None,
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
                    boxLabelIdentifier
                }
            }"""
    }
    response = mysql_app_client.post("/graphql", json=data)
    queried_boxes = response.json["data"]["getBoxesByGender"]
    assert response.status_code == 200
    assert len(queried_boxes) == 47
    # boxLabelIds are six-digit numbers
    for box in queried_boxes:
        assert 99999 < int(box["boxLabelIdentifier"]) < 1000000
