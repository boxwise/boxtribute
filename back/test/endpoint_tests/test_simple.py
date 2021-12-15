def test_private_endpoint(read_only_client):
    """example test for private endpoint"""
    response_data = read_only_client.get("/api/private")
    assert response_data.status_code == 200
    assert (
        "Hello from a private endpoint! You need to be authenticated to see this."
        == response_data.json["message"]
    )
