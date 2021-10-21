from auth import create_jwt_payload


def test_invalid_permission(client, mocker):
    # verify missing transaction:read permission
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        permissions=["beneficiary:read"]
    )
    data = {"query": "query { beneficiary(id: 3) { tokens } }"}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    assert response.json["data"]["beneficiary"] == {"tokens": None}
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "FORBIDDEN"
