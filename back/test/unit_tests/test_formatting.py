from boxtribute_server.cron.formatting import (
    format_as_table,
    get_base_number,
    get_base_trend,
)


class TestGetBaseNumber:
    """Tests for the get_base_number helper function."""

    def test_missing_org(self):
        """Test get_base_number when organization doesn't exist."""
        result = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 42,
            }
        ]
        assert get_base_number(result, 999, 10) == 0

    def test_missing_base(self):
        """Test get_base_number when base doesn't exist in organization."""
        result = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 42,
            }
        ]
        assert get_base_number(result, 1, 999) == 0

    def test_existing_data(self):
        """Test get_base_number when both org and base exist."""
        result = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 42,
            }
        ]
        assert get_base_number(result, 1, 10) == 42

    def test_zero_value(self):
        """Test get_base_number with a base that has zero as the number."""
        result = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 0,
            }
        ]
        assert get_base_number(result, 1, 10) == 0


class TestGetBaseTrend:
    """Tests for the get_base_trend helper function."""

    def test_missing_org(self):
        """Test get_base_trend when organization doesn't exist."""
        trends = {
            1: {
                "name": "Org A",
                "bases": {10: {"name": "Base X", "trend": 5.5}},
            }
        }
        assert get_base_trend(trends, 999, 10) is None

    def test_missing_base(self):
        """Test get_base_trend when base doesn't exist in organization."""
        trends = {
            1: {
                "name": "Org A",
                "bases": {10: {"name": "Base X", "trend": 5.5}},
            }
        }
        assert get_base_trend(trends, 1, 999) is None

    def test_existing_data(self):
        """Test get_base_trend when both org and base exist."""
        trends = {
            1: {
                "name": "Org A",
                "bases": {10: {"name": "Base X", "trend": 12.345}},
            }
        }
        assert get_base_trend(trends, 1, 10) == 12.345

    def test_none_value(self):
        """Test get_base_trend with a base that has None as the trend (n/a)."""
        trends = {
            1: {
                "name": "Org A",
                "bases": {10: {"name": "Base X", "trend": None}},
            }
        }
        assert get_base_trend(trends, 1, 10) is None

    def test_negative_trend(self):
        """Test get_base_trend with negative trend value."""
        trends = {
            1: {
                "name": "Org A",
                "bases": {10: {"name": "Base X", "trend": -15.7}},
            }
        }
        assert get_base_trend(trends, 1, 10) == -15.7


class TestFormatAsTable:
    """Tests for the format_as_table function."""

    def test_empty_data(self):
        """Test format_as_table with empty datasets."""
        result_30 = []
        result_90 = []
        result_365 = []
        trends = [0.0, 0.0, 0.0]
        base_trends = [{}, {}, {}]

        table = format_as_table(
            result_30, result_90, result_365, trends=trends, base_trends=base_trends
        )

        # Should have headers, separator, separator before totals, and TOTAL row
        lines = table.split("\n")
        assert len(lines) == 4  # header + separator + separator + TOTAL
        assert "Organisation" in lines[0]
        assert "Base" in lines[0]
        assert "30 days" in lines[0]
        assert "90 days" in lines[0]
        assert "365 days" in lines[0]
        assert "TOTAL" in lines[3]

    def test_single_org_single_base(self):
        """Test format_as_table with single organization and base."""
        result_30 = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 42,
            }
        ]
        result_90 = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 50,
            }
        ]
        result_365 = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 100,
            }
        ]
        trends = [5.5, 10.2, -3.7]
        base_trends = [
            {1: {"name": "Org A", "bases": {10: {"name": "Base X", "trend": 8.0}}}},
            {1: {"name": "Org A", "bases": {10: {"name": "Base X", "trend": 12.5}}}},
            {1: {"name": "Org A", "bases": {10: {"name": "Base X", "trend": -5.0}}}},
        ]

        table = format_as_table(
            result_30, result_90, result_365, trends=trends, base_trends=base_trends
        )

        lines = table.split("\n")
        # header + separator + 1 data row + separator + TOTAL
        assert len(lines) == 5
        assert "Org A" in lines[2]
        assert "Base X" in lines[2]
        assert "42 (+8.0%)" in lines[2]
        assert "50 (+12.5%)" in lines[2]
        assert "100 (-5.0%)" in lines[2]
        assert "42 (+5.5%)" in lines[4]  # Total for 30 days with overall trend
        assert "50 (+10.2%)" in lines[4]  # Total for 90 days
        assert "100 (-3.7%)" in lines[4]  # Total for 365 days

    def test_multiple_orgs_multiple_bases(self):
        """Test format_as_table with multiple organizations and bases."""
        result_30 = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 42,
            },
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 11,
                "base_name": "Base Y",
                "number": 33,
            },
            {
                "organisation_id": 2,
                "organisation_name": "Org B",
                "base_id": 20,
                "base_name": "Base Z",
                "number": 100,
            },
        ]
        result_90 = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 50,
            },
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 11,
                "base_name": "Base Y",
                "number": 40,
            },
            {
                "organisation_id": 2,
                "organisation_name": "Org B",
                "base_id": 20,
                "base_name": "Base Z",
                "number": 120,
            },
        ]
        result_365 = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 200,
            },
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 11,
                "base_name": "Base Y",
                "number": 150,
            },
            {
                "organisation_id": 2,
                "organisation_name": "Org B",
                "base_id": 20,
                "base_name": "Base Z",
                "number": 300,
            },
        ]
        trends = [0.0, 5.0, -2.5]
        base_trends = [
            {
                1: {
                    "name": "Org A",
                    "bases": {
                        10: {"name": "Base X", "trend": 5.0},
                        11: {"name": "Base Y", "trend": 3.0},
                    },
                },
                2: {"name": "Org B", "bases": {20: {"name": "Base Z", "trend": -2.0}}},
            },
            {
                1: {
                    "name": "Org A",
                    "bases": {
                        10: {"name": "Base X", "trend": 10.0},
                        11: {"name": "Base Y", "trend": 8.0},
                    },
                },
                2: {"name": "Org B", "bases": {20: {"name": "Base Z", "trend": 2.5}}},
            },
            {
                1: {
                    "name": "Org A",
                    "bases": {
                        10: {"name": "Base X", "trend": -5.0},
                        11: {"name": "Base Y", "trend": 0.0},
                    },
                },
                2: {"name": "Org B", "bases": {20: {"name": "Base Z", "trend": -1.0}}},
            },
        ]

        table = format_as_table(
            result_30, result_90, result_365, trends=trends, base_trends=base_trends
        )

        lines = table.split("\n")
        # header + separator + 3 data rows + separator + TOTAL
        assert len(lines) == 7

        # Check that first base of each org has org name, subsequent bases don't
        assert "Org A" in lines[2]
        assert "Base X" in lines[2]
        # Second base of Org A should have empty org column (starts with whitespace, not
        # org name)
        base_y_line = lines[3]
        assert "Base Y" in base_y_line
        assert not base_y_line.lstrip().startswith("Org A")
        # First base of Org B should have org name
        assert "Org B" in lines[4]
        assert "Base Z" in lines[4]

        # Check totals: 42+33+100=175, 50+40+120=210, 200+150+300=650
        assert "175 (+0.0%)" in lines[6]
        assert "210 (+5.0%)" in lines[6]
        assert "650 (-2.5%)" in lines[6]

    def test_missing_data_in_some_windows(self):
        """Test format_as_table when some bases are missing in certain time windows."""
        result_30 = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 42,
            }
        ]
        result_90 = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 50,
            },
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 11,
                "base_name": "Base Y",
                "number": 25,
            },
        ]
        result_365 = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 11,
                "base_name": "Base Y",
                "number": 100,
            }
        ]
        trends = [0.0, 0.0, 0.0]
        base_trends = [
            {1: {"name": "Org A", "bases": {10: {"name": "Base X", "trend": 10.0}}}},
            {
                1: {
                    "name": "Org A",
                    "bases": {
                        10: {"name": "Base X", "trend": 5.0},
                        11: {"name": "Base Y", "trend": 15.0},
                    },
                }
            },
            {1: {"name": "Org A", "bases": {11: {"name": "Base Y", "trend": 20.0}}}},
        ]

        table = format_as_table(
            result_30, result_90, result_365, trends=trends, base_trends=base_trends
        )

        lines = table.split("\n")
        # Should have 2 data rows (one for each unique base)
        assert len(lines) == 6  # header + separator + 2 data rows + separator + TOTAL

        # Base X should have 42 (+10.0%), 50 (+5.0%), 0 ( n/a ) (no data in 365 window)
        base_x_line = [line for line in lines if "Base X" in line][0]
        assert "42 (+10.0%)" in base_x_line
        assert "50 (+5.0%)" in base_x_line
        assert "0 ( n/a )" in base_x_line

        # Base Y should have 0 ( n/a ) (no data in 30 window), 25 (+15.0%), 100 (+20.0%)
        base_y_line = [line for line in lines if "Base Y" in line][0]
        assert "0 ( n/a )" in base_y_line
        assert "25 (+15.0%)" in base_y_line
        assert "100 (+20.0%)" in base_y_line

    def test_trend_formatting(self):
        """Test that trends are formatted correctly with sign and percentage."""
        result = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 10,
            }
        ]
        trends = [12.345, -5.678, 0.0]
        base_trends = [
            {1: {"name": "Org A", "bases": {10: {"name": "Base X", "trend": 8.5}}}},
            {1: {"name": "Org A", "bases": {10: {"name": "Base X", "trend": -3.2}}}},
            {1: {"name": "Org A", "bases": {10: {"name": "Base X", "trend": 0.0}}}},
        ]

        table = format_as_table(
            result, result, result, trends=trends, base_trends=base_trends
        )

        lines = table.split("\n")
        data_line = lines[2]
        assert "+8.5%" in data_line  # Positive with +
        assert "-3.2%" in data_line  # Negative with -
        assert "+0.0%" in data_line  # Zero with +

        # Check TOTAL line
        total_line = lines[-1]
        assert "+12.3%" in total_line  # Positive with +
        assert "-5.7%" in total_line  # Negative with -
        assert "+0.0%" in total_line  # Zero with +

    def test_column_alignment(self):
        """Test that columns are properly aligned using | separators."""
        result_30 = [
            {
                "organisation_id": 1,
                "organisation_name": "Organization with Long Name",
                "base_id": 10,
                "base_name": "Base",
                "number": 1,
            }
        ]
        result_90 = result_30
        result_365 = result_30
        trends = [0.0, 0.0, 0.0]
        base_trends = [
            {
                1: {
                    "name": "Organization with Long Name",
                    "bases": {10: {"name": "Base", "trend": None}},
                }
            },
            {
                1: {
                    "name": "Organization with Long Name",
                    "bases": {10: {"name": "Base", "trend": None}},
                }
            },
            {
                1: {
                    "name": "Organization with Long Name",
                    "bases": {10: {"name": "Base", "trend": None}},
                }
            },
        ]

        table = format_as_table(
            result_30, result_90, result_365, trends=trends, base_trends=base_trends
        )

        lines = table.split("\n")
        # All lines should have the same number of | separators
        separator_counts = [line.count("|") for line in lines if "|" in line]
        assert len(set(separator_counts)) == 1  # All counts should be the same
        assert separator_counts[0] == 4  # 5 columns = 4 separators

        # Check that separator line uses - characters
        separator_line = lines[1]
        assert all(c in "-+|" for c in separator_line)
