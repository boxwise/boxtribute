from boxtribute_server.cron.internal_stats import _compute_base_trends


class TestComputeBaseTrends:
    """Tests for the _compute_base_trends function."""

    def test_bases_exist_in_both_datasets(self):
        """Test correct trend calculation when bases exist in both current and comparison data."""
        current_data = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 110,
            },
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 11,
                "base_name": "Base Y",
                "number": 80,
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
                "base_id": 11,
                "base_name": "Base Y",
                "number": 100,
            },
        ]

        trends = _compute_base_trends(current_data, comparison_data)

        assert 1 in trends
        assert trends[1]["name"] == "Org A"
        assert 10 in trends[1]["bases"]
        assert trends[1]["bases"][10]["name"] == "Base X"
        # (110 - 100) / 100 * 100 = 10.0%
        assert trends[1]["bases"][10]["trend"] == 10.0
        assert 11 in trends[1]["bases"]
        assert trends[1]["bases"][11]["name"] == "Base Y"
        # (80 - 100) / 100 * 100 = -20.0%
        assert trends[1]["bases"][11]["trend"] == -20.0

    def test_base_in_current_not_in_comparison(self):
        """Test behavior when a base exists in current_data but not in comparison_data.
        
        The trend should be None when comparison is 0 (indicating n/a).
        """
        current_data = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 50,
            }
        ]
        comparison_data = []

        trends = _compute_base_trends(current_data, comparison_data)

        assert 1 in trends
        assert trends[1]["name"] == "Org A"
        assert 10 in trends[1]["bases"]
        assert trends[1]["bases"][10]["name"] == "Base X"
        # Trend should be None when comparison value is 0
        assert trends[1]["bases"][10]["trend"] is None

    def test_base_in_comparison_not_in_current(self):
        """Test behavior when a base exists in comparison_data but not in current_data.
        
        The base should not appear in trends at all.
        """
        current_data = []
        comparison_data = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 100,
            }
        ]

        trends = _compute_base_trends(current_data, comparison_data)

        # No trends should be computed since there's no current data
        assert trends == {}

    def test_zero_current_value(self):
        """Test edge case with zero as current value."""
        current_data = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 0,
            }
        ]
        comparison_data = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 100,
            }
        ]

        trends = _compute_base_trends(current_data, comparison_data)

        assert 1 in trends
        assert 10 in trends[1]["bases"]
        # (0 - 100) / 100 * 100 = -100.0%
        assert trends[1]["bases"][10]["trend"] == -100.0

    def test_zero_comparison_value(self):
        """Test edge case with zero as comparison value."""
        current_data = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 50,
            }
        ]
        comparison_data = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 0,
            }
        ]

        trends = _compute_base_trends(current_data, comparison_data)

        assert 1 in trends
        assert 10 in trends[1]["bases"]
        # Trend should be None when comparison value is 0 (cannot divide by zero)
        assert trends[1]["bases"][10]["trend"] is None

    def test_both_values_zero(self):
        """Test edge case when both current and comparison values are zero."""
        current_data = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 0,
            }
        ]
        comparison_data = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 0,
            }
        ]

        trends = _compute_base_trends(current_data, comparison_data)

        assert 1 in trends
        assert 10 in trends[1]["bases"]
        # Trend should be None when comparison value is 0
        assert trends[1]["bases"][10]["trend"] is None

    def test_negative_trend(self):
        """Test that negative trends are calculated correctly."""
        current_data = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 75,
            }
        ]
        comparison_data = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 100,
            }
        ]

        trends = _compute_base_trends(current_data, comparison_data)

        assert 1 in trends
        assert 10 in trends[1]["bases"]
        # (75 - 100) / 100 * 100 = -25.0%
        assert trends[1]["bases"][10]["trend"] == -25.0

    def test_multiple_organizations(self):
        """Test correct trend calculation with multiple organizations."""
        current_data = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 120,
            },
            {
                "organisation_id": 2,
                "organisation_name": "Org B",
                "base_id": 20,
                "base_name": "Base Y",
                "number": 80,
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
                "organisation_id": 2,
                "organisation_name": "Org B",
                "base_id": 20,
                "base_name": "Base Y",
                "number": 100,
            },
        ]

        trends = _compute_base_trends(current_data, comparison_data)

        assert 1 in trends
        assert trends[1]["name"] == "Org A"
        assert trends[1]["bases"][10]["trend"] == 20.0
        assert 2 in trends
        assert trends[2]["name"] == "Org B"
        assert trends[2]["bases"][20]["trend"] == -20.0

    def test_multiple_bases_per_organization(self):
        """Test correct trend calculation with multiple bases in same organization."""
        current_data = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 150,
            },
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 11,
                "base_name": "Base Y",
                "number": 90,
            },
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 12,
                "base_name": "Base Z",
                "number": 100,
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
                "base_id": 11,
                "base_name": "Base Y",
                "number": 100,
            },
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 12,
                "base_name": "Base Z",
                "number": 100,
            },
        ]

        trends = _compute_base_trends(current_data, comparison_data)

        assert 1 in trends
        assert len(trends[1]["bases"]) == 3
        assert trends[1]["bases"][10]["trend"] == 50.0
        assert trends[1]["bases"][11]["trend"] == -10.0
        assert trends[1]["bases"][12]["trend"] == 0.0

    def test_empty_datasets(self):
        """Test that empty datasets return empty trends."""
        trends = _compute_base_trends([], [])
        assert trends == {}

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
