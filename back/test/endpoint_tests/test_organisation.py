from utils import assert_forbidden_request, assert_successful_request


def test_organisation_query(
    read_only_client,
    default_bases,
    default_organisation,
    default_beneficiaries,
    another_organisation,
):
    # Test case 99.1.8
    # The user is a member of base 1 for default_organisation. They can read name and ID
    # of the organisation's bases but the beneficiary data of base 1 ONLY
    organisation_id = str(default_organisation["id"])
    query = f"""query {{
                organisation(id: "{organisation_id}") {{
                    id
                    name
                    bases {{ id name beneficiaries {{ totalCount }} }}
                }}
            }}"""
    response = assert_forbidden_request(read_only_client, query, verify_response=False)
    assert response.json["data"]["organisation"] == {
        "id": organisation_id,
        "name": default_organisation["name"],
        "bases": [
            {
                "id": str(default_bases[1]["id"]),
                "name": default_bases[1]["name"],
                "beneficiaries": {"totalCount": len(default_beneficiaries)},
            },
            {
                "id": str(default_bases[2]["id"]),
                "name": default_bases[2]["name"],
                "beneficiaries": None,
            },
        ],
    }

    # The user is not a member of another_organisation. They can read name and ID of
    # that organisation's bases but NOT the beneficiary data
    organisation_id = str(another_organisation["id"])
    query = f"""query {{
                organisation(id: "{organisation_id}") {{
                    id
                    bases {{ id name beneficiaries {{ totalCount }} }}
                }}
            }}"""
    response = assert_forbidden_request(
        read_only_client, query, error_count=2, verify_response=False
    )
    assert response.json["data"]["organisation"] == {
        "id": organisation_id,
        "bases": [
            {"id": str(base["id"]), "name": base["name"], "beneficiaries": None}
            for base in [default_bases[3], default_bases[4]]
        ],
    }


def test_organisations_query(read_only_client, organisations):
    # Test case 99.1.7
    query = """query { organisations { name } }"""
    queried_organisations = assert_successful_request(read_only_client, query)
    assert queried_organisations == [{"name": org["name"]} for org in organisations]
