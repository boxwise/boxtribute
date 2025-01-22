from datetime import date, timedelta

from boxtribute_server.enums import ShareableView
from utils import assert_successful_request

today = date.today()


def test_shareable_link_mutations(client, default_base):
    # Test case 8.X.X
    base_id = default_base["id"]
    url_parameters = "?from=2024-10-22&to=2025-01-22&boi=ic"
    valid_until = (today + timedelta(weeks=1)).isoformat()
    mutation = f"""mutation {{
                createShareableLink(creationInput: {{
                    baseId: {base_id}
                    urlParameters: "{url_parameters}"
                    view: {ShareableView.StatvizDashboard.name}
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
    assert len(link.pop("code")) == 8
    assert link.pop("createdOn").startswith(today.isoformat())
    assert link == {
        "baseId": base_id,
        "urlParameters": url_parameters,
        "view": ShareableView.StatvizDashboard.name,
        "validUntil": valid_until + "T00:00:00+00:00",
        "createdBy": {"id": "8"},
    }
