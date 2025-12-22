from boxtribute_server.cron.formatting import (
    format_as_table,
    get_base_number,
    transform_data,
)


class TestTransformData:
    """Tests for the transform_data function."""

    def test_empty_input(self):
        """Test transform_data with an empty list."""
        result = transform_data([])
        assert result == {}

    def test_single_org_single_base(self):
        """Test transform_data with a single organization and base."""
        rows = [
            {
                "organisation_id": 1,
                "organisation_name": "Org A",
                "base_id": 10,
                "base_name": "Base X",
                "number": 42,
            }
        ]
        result = transform_data(rows)
        assert result == {
            1: {
                "name": "Org A",
                "bases": {10: {"name": "Base X", "number": 42}},
            }
        }

    def test_single_org_multiple_bases(self):
        """Test transform_data with one organization having multiple bases."""
        rows = [
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
        ]
        result = transform_data(rows)
        assert result == {
            1: {
                "name": "Org A",
                "bases": {
                    10: {"name": "Base X", "number": 42},
                    11: {"name": "Base Y", "number": 33},
                },
            }
        }

    def test_multiple_orgs_multiple_bases(self):
        """Test transform_data with multiple organizations and bases."""
        rows = [
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
        result = transform_data(rows)
        assert result == {
            1: {
                "name": "Org A",
                "bases": {
                    10: {"name": "Base X", "number": 42},
                    11: {"name": "Base Y", "number": 33},
                },
            },
            2: {
                "name": "Org B",
                "bases": {20: {"name": "Base Z", "number": 100}},
            },
        }


class TestGetBaseNumber:
    """Tests for the get_base_number helper function."""

    def test_missing_org(self):
        """Test get_base_number when organization doesn't exist."""
        result = {
            1: {
                "name": "Org A",
                "bases": {10: {"name": "Base X", "number": 42}},
            }
        }
        assert get_base_number(result, 999, 10) == 0

    def test_missing_base(self):
        """Test get_base_number when base doesn't exist in organization."""
        result = {
            1: {
                "name": "Org A",
                "bases": {10: {"name": "Base X", "number": 42}},
            }
        }
        assert get_base_number(result, 1, 999) == 0

    def test_existing_data(self):
        """Test get_base_number when both org and base exist."""
        result = {
            1: {
                "name": "Org A",
                "bases": {10: {"name": "Base X", "number": 42}},
            }
        }
        assert get_base_number(result, 1, 10) == 42

    def test_zero_value(self):
        """Test get_base_number with a base that has zero as the number."""
        result = {
            1: {
                "name": "Org A",
                "bases": {10: {"name": "Base X", "number": 0}},
            }
        }
        assert get_base_number(result, 1, 10) == 0


class TestFormatAsTable:
    """Tests for the format_as_table function."""

    def test_empty_data(self):
        """Test format_as_table with empty datasets."""
        result_30 = {}
        result_90 = {}
        result_365 = {}
        trends = [0.0, 0.0, 0.0]

        table = format_as_table(result_30, result_90, result_365, trends=trends)

        # Should have headers, separator, separator before totals, and totals/trend rows
        lines = table.split("\n")
        assert len(lines) == 5  # header + separator + separator + TOTAL + TREND
        assert "organisation" in lines[0]
        assert "base" in lines[0]
        assert "30 days" in lines[0]
        assert "90 days" in lines[0]
        assert "365 days" in lines[0]
        assert "TOTAL" in lines[3]
        assert "TREND" in lines[4]

    def test_single_org_single_base(self):
        """Test format_as_table with single organization and base."""
        result_30 = {
            1: {
                "name": "Org A",
                "bases": {10: {"name": "Base X", "number": 42}},
            }
        }
        result_90 = {
            1: {
                "name": "Org A",
                "bases": {10: {"name": "Base X", "number": 50}},
            }
        }
        result_365 = {
            1: {
                "name": "Org A",
                "bases": {10: {"name": "Base X", "number": 100}},
            }
        }
        trends = [5.5, 10.2, -3.7]

        table = format_as_table(result_30, result_90, result_365, trends=trends)

        lines = table.split("\n")
        # header + separator + 1 data row + separator + TOTAL + TREND
        assert len(lines) == 6
        assert "Org A" in lines[2]
        assert "Base X" in lines[2]
        assert "42" in lines[2]
        assert "50" in lines[2]
        assert "100" in lines[2]
        assert "42" in lines[4]  # Total for 30 days
        assert "50" in lines[4]  # Total for 90 days
        assert "100" in lines[4]  # Total for 365 days
        assert "+5.5%" in lines[5]
        assert "+10.2%" in lines[5]
        assert "-3.7%" in lines[5]

    def test_multiple_orgs_multiple_bases(self):
        """Test format_as_table with multiple organizations and bases."""
        result_30 = {
            1: {
                "name": "Org A",
                "bases": {
                    10: {"name": "Base X", "number": 42},
                    11: {"name": "Base Y", "number": 33},
                },
            },
            2: {
                "name": "Org B",
                "bases": {20: {"name": "Base Z", "number": 100}},
            },
        }
        result_90 = {
            1: {
                "name": "Org A",
                "bases": {
                    10: {"name": "Base X", "number": 50},
                    11: {"name": "Base Y", "number": 40},
                },
            },
            2: {
                "name": "Org B",
                "bases": {20: {"name": "Base Z", "number": 120}},
            },
        }
        result_365 = {
            1: {
                "name": "Org A",
                "bases": {
                    10: {"name": "Base X", "number": 200},
                    11: {"name": "Base Y", "number": 150},
                },
            },
            2: {
                "name": "Org B",
                "bases": {20: {"name": "Base Z", "number": 300}},
            },
        }
        trends = [0.0, 5.0, -2.5]

        table = format_as_table(result_30, result_90, result_365, trends=trends)

        lines = table.split("\n")
        # header + separator + 3 data rows + separator + TOTAL + TREND
        assert len(lines) == 8

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
        assert "175" in lines[6]
        assert "210" in lines[6]
        assert "650" in lines[6]

    def test_missing_data_in_some_windows(self):
        """Test format_as_table when some bases are missing in certain time windows."""
        result_30 = {
            1: {
                "name": "Org A",
                "bases": {10: {"name": "Base X", "number": 42}},
            }
        }
        result_90 = {
            1: {
                "name": "Org A",
                "bases": {
                    10: {"name": "Base X", "number": 50},
                    11: {"name": "Base Y", "number": 25},
                },
            }
        }
        result_365 = {
            1: {
                "name": "Org A",
                "bases": {11: {"name": "Base Y", "number": 100}},
            }
        }
        trends = [0.0, 0.0, 0.0]

        table = format_as_table(result_30, result_90, result_365, trends=trends)

        lines = table.split("\n")
        # Should have 2 data rows (one for each unique base)
        assert (
            len(lines) == 7
        )  # header + separator + 2 data rows + separator + TOTAL + TREND

        # Base X should have 42, 50, 0
        base_x_line = [line for line in lines if "Base X" in line][0]
        base_x_parts = [p.strip() for p in base_x_line.split("|")]
        # Format: org | base | 30 days | 90 days | 365 days
        assert base_x_parts[2] == "42"  # 30 days
        assert base_x_parts[3] == "50"  # 90 days
        assert base_x_parts[4] == "0"  # 365 days

        # Base Y should have 0, 25, 100
        base_y_line = [line for line in lines if "Base Y" in line][0]
        base_y_parts = [p.strip() for p in base_y_line.split("|")]
        # Format: org | base | 30 days | 90 days | 365 days
        assert base_y_parts[2] == "0"  # 30 days
        assert base_y_parts[3] == "25"  # 90 days
        assert base_y_parts[4] == "100"  # 365 days

    def test_trend_formatting(self):
        """Test that trends are formatted correctly with sign and percentage."""
        result = {
            1: {
                "name": "Org A",
                "bases": {10: {"name": "Base X", "number": 10}},
            }
        }
        trends = [12.345, -5.678, 0.0]

        table = format_as_table(result, result, result, trends=trends)

        lines = table.split("\n")
        trend_line = lines[-1]
        assert "+12.3%" in trend_line  # Positive with +
        assert "-5.7%" in trend_line  # Negative with -
        assert "+0.0%" in trend_line  # Zero with +

    def test_column_alignment(self):
        """Test that columns are properly aligned using | separators."""
        result_30 = {
            1: {
                "name": "Organization with Long Name",
                "bases": {10: {"name": "Base", "number": 1}},
            }
        }
        result_90 = result_30
        result_365 = result_30
        trends = [0.0, 0.0, 0.0]

        table = format_as_table(result_30, result_90, result_365, trends=trends)

        lines = table.split("\n")
        # All lines should have the same number of | separators
        separator_counts = [line.count("|") for line in lines if "|" in line]
        assert len(set(separator_counts)) == 1  # All counts should be the same
        assert separator_counts[0] == 4  # 5 columns = 4 separators

        # Check that separator line uses - characters
        separator_line = lines[1]
        assert all(c in "-+|" for c in separator_line)
