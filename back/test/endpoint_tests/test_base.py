from auth import mock_user_for_request
from utils import assert_successful_request


def test_bases_query(
    client,
    default_base,
    deleted_base,
    default_beneficiaries,
    mocker,
    base1_instock_boxes,
):
    # Test case 99.1.1
    query = """query {
                bases {
                    id
                    name
                    freeshopCurrencyName
                    monetaryCurrencyCode
                    deletedOn
                    instockBoxesCount
                    instockItemsCount
                    beneficiaries { elements { id } }
                }
            }"""

    bases = assert_successful_request(client, query)
    assert len(bases[0]["beneficiaries"].pop("elements")) == len(default_beneficiaries)
    assert bases == [
        {
            "id": str(default_base["id"]),
            "name": default_base["name"],
            "freeshopCurrencyName": default_base["freeshop_currency_name"],
            "monetaryCurrencyCode": default_base["monetary_currency_code"],
            "deletedOn": None,
            "instockBoxesCount": len(base1_instock_boxes),
            "instockItemsCount": sum(b["number_of_items"] for b in base1_instock_boxes),
            "beneficiaries": {},
        }
    ]

    # Test case 99.1.1a
    mock_user_for_request(mocker, base_ids=[deleted_base["id"]])
    query = """query { bases(filterInput: {includeDeleted: false}) { id } }"""
    response = assert_successful_request(client, query)
    assert response == []

    query = """query { bases { id } }"""
    response = assert_successful_request(client, query)
    assert response == []

    query = """query { bases(filterInput: {includeDeleted: true}) { id deletedOn } }"""
    response = assert_successful_request(client, query)
    assert response == [
        {
            "id": str(deleted_base["id"]),
            "deletedOn": deleted_base["deleted_on"].isoformat() + "+00:00",
        }
    ]


def test_base_query(
    client,
    default_base,
    base1_active_tags,
    base1_undeleted_classic_locations,
    base1_undeleted_products,
):
    # Test case 99.1.2
    test_id = str(default_base["id"])
    query = f"""query Base {{
                base(id: {test_id}) {{
                    id
                    name
                    organisation {{ id }}
                    locations {{ id }}
                    products(filterInput: {{ type: All }}) {{ id }}
                    tags {{ id }}
                    groupIdentifier
                    adultAge
                    daysToKeepInactiveBeneficiaries
                    tokensPerAdult
                    tokensPerChild
                    trackingRegisteredBeneficiariesEnabled
                    beneficiariesAsVolunteersEnabled
                    beneficiaryEmailEnabled
                    beneficiaryPhoneEnabled
                    beneficiaryCustomTextField1Enabled
                    beneficiaryCustomTextField2Enabled
                    beneficiaryCustomNumberFieldEnabled
                    beneficiaryCustomDateFieldEnabled
                    beneficiaryCustomTextField1Name
                    beneficiaryCustomTextField2Name
                    beneficiaryCustomNumberFieldName
                    beneficiaryCustomDateFieldName
                }}
            }}"""

    base = assert_successful_request(client, query)
    assert base == {
        "id": test_id,
        "name": default_base["name"],
        "organisation": {"id": str(default_base["organisation"])},
        "products": [{"id": str(p["id"])} for p in base1_undeleted_products],
        "tags": [{"id": str(t["id"])} for t in base1_active_tags],
        "locations": [
            {"id": str(loc["id"])} for loc in base1_undeleted_classic_locations
        ],
        "groupIdentifier": default_base["group_identifier"],
        "adultAge": default_base["adult_age"],
        "daysToKeepInactiveBeneficiaries": default_base[
            "days_to_keep_inactive_beneficiaries"
        ],
        "creditPerAdult": default_base["credit_per_adult"],
        "creditPerChild": default_base["credit_per_child"],
        "trackingRegisteredBeneficiariesEnabled": default_base[
            "tracking_registered_beneficiaries_enabled"
        ],
        "beneficiariesAsVolunteersEnabled": default_base[
            "beneficiaries_as_volunteers_enabled"
        ],
        "beneficiaryEmailEnabled": default_base["beneficiary_email_enabled"],
        "beneficiaryPhoneEnabled": default_base["beneficiary_phone_enabled"],
        "beneficiaryCustomTextField1Enabled": default_base[
            "beneficiary_custom_text_field_1_enabled"
        ],
        "beneficiaryCustomTextField2Enabled": default_base[
            "beneficiary_custom_text_field_2_enabled"
        ],
        "beneficiaryCustomNumberFieldEnabled": default_base[
            "beneficiary_custom_number_field_enabled"
        ],
        "beneficiaryCustomDateFieldEnabled": default_base[
            "beneficiary_custom_date_field_enabled"
        ],
        "beneficiaryCustomTextField1Name": default_base[
            "beneficiary_custom_text_field_1_name"
        ],
        "beneficiaryCustomTextField2Name": default_base[
            "beneficiary_custom_text_field_2_name"
        ],
        "beneficiaryCustomNumberFieldName": default_base[
            "beneficiary_custom_number_field_name"
        ],
        "beneficiaryCustomDateFieldName": default_base[
            "beneficiary_custom_date_field_name"
        ],
    }
