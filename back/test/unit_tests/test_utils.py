from datetime import date, datetime, timedelta

import pytest
from boxtribute_server.business_logic.metrics.crud import get_time_span
from boxtribute_server.models.utils import compute_age, compute_age_in_days


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


def test_compute_age_in_days_uses_current_date(monkeypatch):
    class MockDate(date):
        current_date = date(2025, 1, 1)

        @classmethod
        def today(cls):
            return cls.current_date

    monkeypatch.setattr("boxtribute_server.models.utils.date", MockDate)

    date_of_birth = date(2024, 12, 31)
    assert compute_age_in_days(date_of_birth) == 1

    MockDate.current_date = date(2025, 1, 2)
    assert compute_age_in_days(date_of_birth) == 2
