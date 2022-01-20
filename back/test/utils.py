def _assert_erroneous_request(client, query):
    data = {"query": query}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    assert len(response.json["errors"]) == 1
    return response


def _verify_response_data(*, query, response, field=None, none_data=False, value=None):
    """If `none_data` is given, verify that the `data` field of the response JSON is None.
    Otherwise extract field as query operation name, and verify that it is identical to
    given `value` (default: None).
    """
    if none_data:
        assert response.json["data"] is None
    else:
        field = field or _extract_field(query)
        if value is None:
            assert response.json["data"][field] is None
        else:
            assert response.json["data"][field] == value


def assert_bad_user_input(client, query, **kwargs):
    """Send GraphQL request with query using given client.
    Assert that single BAD_USER_INPUT error is returned in response.
    `kwargs` are forwarded to `_verify_response_data()`.
    """
    response = _assert_erroneous_request(client, query)
    assert response.json["errors"][0]["extensions"]["code"] == "BAD_USER_INPUT"
    _verify_response_data(query=query, response=response, **kwargs)
    return response


def _extract_field(query):
    """Extract field name, e.g. 'updateShipment' from a query like
       mutation { updateShipment(id: 1) { state } }
    Only works for queries that have arguments (and hence a '(' right after the
    operation name).
    """
    return query.split("{")[1].split("(")[0].strip()


def assert_forbidden_request(client, query, **kwargs):
    """Assertion utility that posts the given data via a client fixture.
    Assert that single FORBIDDEN error is returned in response.
    `kwargs` are forwarded to `_verify_response_data()`.
    """
    response = _assert_erroneous_request(client, query)
    assert response.json["errors"][0]["extensions"]["code"] == "FORBIDDEN"
    _verify_response_data(query=query, response=response, **kwargs)


def assert_successful_request(client, query, field=None):
    """Send GraphQL request with query using given client.
    Assert response HTTP code 200, and return main response JSON data field.
    """
    data = {"query": query}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200

    field = field or _extract_field(query)
    return response.json["data"][field]
