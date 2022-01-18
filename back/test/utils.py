def _assert_erroneous_request(client, query):
    data = {"query": query}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    assert len(response.json["errors"]) == 1
    return response


def assert_bad_user_input(client, query):
    """Send GraphQL request with query using given client.
    Assert that single BAD_USER_INPUT error is returned in response.
    """
    response = _assert_erroneous_request(client, query)
    assert response.json["errors"][0]["extensions"]["code"] == "BAD_USER_INPUT"


def _extract_field(query):
    """Extract field name, e.g. 'updateShipment' from a query like
       mutation { updateShipment(id: 1) { state } }
    Only works for queries that have arguments (and hence a '(' right after the
    operation name).
    """
    return query.split("{")[1].split("(")[0].strip()


def assert_forbidden_request(client, query, *, field=None, none_data=False, value=None):
    """Assertion utility that posts the given data via a client fixture.
    Afterwards verifies response field containing error information. If specified, the
    response data field named `field` is verified against an expected `value` (default
    None). By default, `field` is extracted as given query's operation name.
    """
    response = _assert_erroneous_request(client, query)
    assert response.json["errors"][0]["extensions"]["code"] == "FORBIDDEN"
    if none_data:
        assert response.json["data"] is None
    else:
        field = field or _extract_field(query)
        if value is None:
            assert response.json["data"][field] is None
        else:
            assert response.json["data"][field] == value


def assert_successful_request(client, query):
    """Send GraphQL request with query using given client.
    Assert response HTTP code 200, and return main response JSON data field.
    """
    data = {"query": query}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200

    field = _extract_field(query)
    return response.json["data"][field]
