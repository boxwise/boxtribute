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
