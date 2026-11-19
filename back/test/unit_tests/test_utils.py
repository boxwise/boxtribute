from datetime import datetime, timedelta

import pytest
from boxtribute_server.business_logic.metrics.crud import get_time_span
from boxtribute_server.models.utils import compute_age


@pytest.mark.parametrize(
    "start,end,duration",
    [
        (datetime(2025, 1, 30), datetime(2025, 1, 1), None),
        (datetime(2025, 1, 30), None, -20),
        (None, datetime(2025, 1, 30), -20),
        (None, None, -20),
        (datetime.today() + timedelta(weeks=1), None, None),
        (None, None, None),
    ],
)
def test_get_time_span_with_invalid_inputs(start, end, duration):
    with pytest.raises(ValueError):
        get_time_span(start_date=start, end_date=end, duration_days=duration)


def test_compute_age_without_date_of_birth():
    assert compute_age(None) is None
