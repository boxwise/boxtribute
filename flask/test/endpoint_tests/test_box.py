import pytest


@pytest.mark.usefixtures("default_qr_code")
@pytest.mark.usefixtures("default_box")
def test_get_box_from_code(client, default_box, default_qr_code):
    graph_ql_query_string = f"""query Box {{
                box(id: "{default_box['box_id']}") {{
                    box_id
                }}
            }}"""
    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    queried_box = response_data.json["data"]["box"]
    assert response_data.status_code == 200
    assert queried_box["box_id"] == default_box["box_id"]
