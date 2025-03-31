from datetime import datetime, timedelta, timezone

from boxtribute_server.enums import ShareableView
from utils import assert_successful_request

today = datetime.today()


def test_shareable_link_mutations(client, default_base, mocker):
    # Test case 12.2.1
    base_id = default_base["id"]
    view = ShareableView.StatvizDashboard.name
    mutation = f"""mutation {{
                createShareableLink(creationInput: {{
                    baseId: {base_id}
                    view: {view}
                }}) {{ ...on ShareableLink {{
                    base {{ id name }}
                    urlParameters
                    view
                    validUntil
                }} }} }}"""
    link = assert_successful_request(client, mutation)
    valid_until = datetime.fromisoformat(link.pop("validUntil"))
    assert (valid_until - today.astimezone()).days == 7
    assert link == {
        "base": {"id": str(base_id), "name": default_base["name"]},
        "urlParameters": None,
        "view": view,
    }

    # Test case 12.2.2
    url_parameters = "?from=2024-10-22&to=2025-01-22&boi=ic"
    # Future date in system timezone
    two_weeks_from_now = (today + timedelta(weeks=2)).astimezone()
    valid_until = two_weeks_from_now.isoformat()
    valid_until_utc = two_weeks_from_now.astimezone(timezone.utc).isoformat()
    mutation = f"""mutation {{
                createShareableLink(creationInput: {{
                    baseId: {base_id}
                    urlParameters: "{url_parameters}"
                    view: {view}
                    validUntil: "{valid_until}"
                }}) {{ ...on ShareableLink {{
                    code
                    base {{ id }}
                    urlParameters
                    view
                    validUntil
                    createdOn
                    createdBy {{ id }}
                }} }} }}"""
    link = assert_successful_request(client, mutation)
    first_link_code = link.pop("code")
    assert len(first_link_code) == 64
    assert link.pop("createdOn").startswith(today.date().isoformat())
    assert link == {
        "base": {"id": str(base_id)},
        "urlParameters": url_parameters,
        "view": view,
        "validUntil": valid_until_utc,
        "createdBy": {"id": "8"},
    }

    # Test case 12.2.3
    past_valid_until = "2024-12-31"
    mutation = f"""mutation {{
                createShareableLink(creationInput: {{
                    baseId: {base_id}
                    view: {view}
                    validUntil: "{past_valid_until}"
                }}) {{
                    ...on InvalidDateError {{ date }}
                }} }}"""
    link = assert_successful_request(client, mutation)
    assert link == {"date": past_valid_until + "T00:00:00+00:00"}


def test_shareable_link_queries(read_only_client, shareable_link, expired_link):
    code = shareable_link["code"]
    query = f"""query {{ resolveLink(code: "{code}") {{
                ...on ResolvedLink {{
                    code
                    validUntil
                    view
                    baseId
                    urlParameters
                    data {{
                        ...on BeneficiaryDemographicsData {{
                            demographicsFacts: facts {{ age }}
                        }}
                        ...on CreatedBoxesData {{
                            createdBoxesFacts: facts {{ createdOn }}
                        }}
                        ...on MovedBoxesData {{
                            movedBoxesFacts: facts {{ movedOn }}
                        }}
                        ...on StockOverviewData {{
                            stockOverviewFacts: facts {{ boxState }}
                        }}
                    }}
                }} }} }}"""
    response = assert_successful_request(read_only_client, query, endpoint="public")
    data = response.pop("data")
    assert response == {
        "code": code,
        "validUntil": shareable_link["valid_until"].isoformat(),
        "view": ShareableView.StatvizDashboard.name,
        "baseId": shareable_link["base_id"],
        "urlParameters": shareable_link["url_parameters"],
    }
    assert len(data[0]["demographicsFacts"]) > 0
    assert len(data[1]["createdBoxesFacts"]) > 0
    assert len(data[2]["movedBoxesFacts"]) > 0
    assert len(data[3]["stockOverviewFacts"]) > 0

    code = expired_link["code"]
    query = f"""query {{ resolveLink(code: "{code}") {{
                    ...on ExpiredLinkError {{ validUntil }}
                }} }}"""
    response = assert_successful_request(read_only_client, query, endpoint="public")
    assert response == {"validUntil": expired_link["valid_until"].isoformat()}

    code = "unknown"
    query = f"""query {{ resolveLink(code: "{code}") {{
                    ...on UnknownLinkError {{ code }}
                }} }}"""
    response = assert_successful_request(read_only_client, query, endpoint="public")
    assert response == {"code": code}
