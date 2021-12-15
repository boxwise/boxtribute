def test_organisation(read_only_client, default_bases, default_organisation):
    query = f"""query {{
                organisation(id: "{default_organisation['id']}") {{
                    id
                    name
                    bases {{
                        id
                    }}
                }}
            }}"""
    data = {"query": query}
    response_data = read_only_client.post("/graphql", json=data)
    queried_organisation = response_data.json["data"]["organisation"]
    assert queried_organisation == {
        "id": str(default_organisation["id"]),
        "name": default_organisation["name"],
        "bases": [{"id": str(b["id"])} for b in list(default_bases.values())[:2]],
    }

    query = """query {
                organisations {
                    name
                }
            }"""
    data = {"query": query}
    response_data = read_only_client.post("/graphql", json=data)
    queried_organisation = response_data.json["data"]["organisations"][0]
    assert queried_organisation["name"] == default_organisation["name"]
