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
                    baseId
                    urlParameters
                    view
                    validUntil
                }} }} }}"""
    link = assert_successful_request(client, mutation)
    valid_until = datetime.fromisoformat(link.pop("validUntil"))
    assert (valid_until - today.astimezone()).days == 7
    assert link == {
        "baseId": base_id,
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
                    baseId
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
        "baseId": base_id,
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
