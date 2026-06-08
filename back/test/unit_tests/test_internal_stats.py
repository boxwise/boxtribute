from datetime import datetime

from boxtribute_server.cron import internal_stats
from boxtribute_server.cron.internal_stats import _compute_base_trends


class TestComputeBaseTrends:

    def test_partial_overlap(self):
        """Test when only some bases overlap between current and comparison data."""
        current_data = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 120,
            },
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 11,
                "base_name": "Base Y",
                "number": 50,
            },
        ]
        comparison_data = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 100,
            },
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 12,
                "base_name": "Base Z",
                "number": 80,
            },
        ]

        trends = _compute_base_trends(current_data, comparison_data)

        assert 1 in trends
        assert len(trends[1]["bases"]) == 2
        # Base X has comparison data: trend should be 20.0%
        assert trends[1]["bases"][10]["trend"] == 20.0
        # Base Y has no comparison data: trend should be None
        assert trends[1]["bases"][11]["trend"] is None
        # Base Z only in comparison, should not appear in trends
        assert 12 not in trends[1]["bases"]


class TestGetInternalData:
    def test_all_time_created_boxes_contains_boxes_and_items(self, monkeypatch):
        now = datetime(2025, 1, 1)
        boxes_result = [{"organisation_id": 1, "base_id": 1, "number": 3}]
        items_result = [{"organisation_id": 1, "base_id": 1, "number": 12}]
        beneficiaries_result = [{"organisation_id": 1, "base_id": 1, "number": 2}]
        format_calls = []

        monkeypatch.setattr(internal_stats, "utcnow", lambda: now)
        monkeypatch.setattr(
            internal_stats,
            "number_of_boxes_created_between",
            lambda start, end: boxes_result,
        )
        monkeypatch.setattr(
            internal_stats,
            "number_of_items_in_boxes_created_between",
            lambda start, end: items_result,
        )
        monkeypatch.setattr(
            internal_stats,
            "number_of_beneficiaries_registered_between",
            lambda start, end: beneficiaries_result,
        )
        monkeypatch.setattr(
            internal_stats,
            "number_of_beneficiaries_reached_between",
            lambda *args: [],
        )
        monkeypatch.setattr(
            internal_stats, "number_of_active_users_between", lambda *args: []
        )
        monkeypatch.setattr(
            internal_stats, "get_data_for_number_of_active_users", lambda: []
        )
        monkeypatch.setattr(
            internal_stats,
            "compute_with_trend",
            lambda func, end_date, duration, *args: ([], None, {}),
        )

        def _fake_format_as_table(*results, **kwargs):
            format_calls.append((results, kwargs))
            return "table"

        monkeypatch.setattr(internal_stats, "format_as_table", _fake_format_as_table)

        data = list(internal_stats.get_internal_data())

        assert data[0] == {"title": internal_stats.TITLES[0], "data": "table"}
        assert format_calls[0] == (
            (boxes_result, items_result),
            {"column_names": ["boxes (all time)", "items (all time)"]},
        )

        assert data[1] == {"title": internal_stats.TITLES[1], "data": "table"}
        assert format_calls[1] == (
            (beneficiaries_result,),
            {"column_names": ["all time"]},
        )
