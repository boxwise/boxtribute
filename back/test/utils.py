def assert_bad_user_input(client, mutation):
    """Send mutation GraphQL request using given client.
    Assert that single BAD_USER_INPUT error is returned in response.
    """
    data = {"query": mutation}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "BAD_USER_INPUT"
