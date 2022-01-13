from utils import assert_successful_request


def test_get_box_details(auth0_client):
    query = """query BoxIdAndItems {
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
    queried_box = assert_successful_request(auth0_client, query)["box"]
    assert queried_box == {
        "id": "67",
        "labelIdentifier": "728544",
        "items": 18,
        "size": "52",
        "state": "Donated",
    }
