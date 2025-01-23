from datetime import date, timedelta

from boxtribute_server.enums import ShareableView
from boxtribute_server.models.utils import RANDOM_SEQUENCE_GENERATION_ATTEMPTS
from utils import assert_successful_request

today = date.today()


def test_shareable_link_mutations(client, default_base, mocker):
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
    first_link_code = link.pop("code")
    assert len(first_link_code) == 8
    assert link.pop("createdOn").startswith(today.isoformat())
    assert link == {
        "baseId": base_id,
        "urlParameters": url_parameters,
        "view": ShareableView.StatvizDashboard.name,
        "validUntil": valid_until + "T00:00:00+00:00",
        "createdBy": {"id": "8"},
    }

    # Test case 8.A
    past_valid_until = "2024-12-31"
    mutation = f"""mutation {{
                createShareableLink(creationInput: {{
                    baseId: {base_id}
                    view: {ShareableView.StatvizDashboard.name}
                    validUntil: "{past_valid_until}"
                }}) {{
                    ...on InvalidDateError {{ date }}
                }} }}"""
    link = assert_successful_request(client, mutation)
    assert link == {"date": past_valid_until + "T00:00:00+00:00"}

    # Test case 8.Y
    # Verify that link-creation fails after several attempts if newly generated code is
    # never unique
    mutation = f"""mutation {{
                createShareableLink(creationInput: {{
                    baseId: {base_id}
                    view: {ShareableView.StatvizDashboard.name}
                    validUntil: "{valid_until}"
                }}) {{
                    ...on UniqueCodeCreationError {{ code }}
                    ...on ShareableLink {{ code }}
                }} }}"""

    rng_function = mocker.patch("random.choices")
    rng_function.return_value = first_link_code
    link = assert_successful_request(client, mutation)
    assert link == {"code": first_link_code}
    assert rng_function.call_count == RANDOM_SEQUENCE_GENERATION_ATTEMPTS

    # Verify that link-creation succeeds even if an existing code happens to be
    # generated once
    code = "fakecode"
    side_effect = [first_link_code, code]
    rng_function.reset_mock(return_value=True)
    rng_function.side_effect = side_effect
    link = assert_successful_request(client, mutation)
    assert link == {"code": code}
    assert rng_function.call_count == len(side_effect)
