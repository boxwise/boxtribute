def assert_bad_user_input(client, mutation):
    """Send mutation GraphQL request using given client.
    Assert that single BAD_USER_INPUT error is returned in response.
    """
    data = {"query": mutation}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "BAD_USER_INPUT"


def assert_successful_request(client, query):
    """Send GraphQL request with query using given client.
    Assert response HTTP code 200, and return main response JSON data field.
    """
    data = {"query": query}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200

    # Extract field name, e.g. 'updateShipment' from a query like
    #   mutation { updateShipment(id: 1) { state } }
    field = query.split("{")[1].split("(")[0].strip()
    return response.json["data"][field]
