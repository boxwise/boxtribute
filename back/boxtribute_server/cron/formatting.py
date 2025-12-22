def format_as_table(result_30, result_90, result_365, *, trends, base_trends):
    """
    Format nested organization/base structure into aligned tabular text with multiple
    time windows.

    Args:
        result_30: Dict from transform_data for 30 days
        result_90: Dict from transform_data for 90 days
        result_365: Dict from transform_data for 365 days
        trends: List of three trend percentages [trend_30, trend_90, trend_365]
        base_trends: List of three dicts with per-base trend data

    Returns:
        String with formatted table using | separators
    """
    headers = ("organisation", "base", "30 days", "90 days", "365 days")

    # Collect all unique org_id, base_id combinations
    all_orgs = {}  # {org_id: {org_name, base_ids: {base_id: base_name}}}

    for result in [result_30, result_90, result_365]:
        for org_id, org_data in result.items():
            if org_id not in all_orgs:
                all_orgs[org_id] = {"name": org_data["name"], "bases": {}}

            for base_id, base_data in org_data["bases"].items():
                if base_id not in all_orgs[org_id]["bases"]:
                    all_orgs[org_id]["bases"][base_id] = base_data["name"]

    # Build rows with data from all three datasets
    rows = []
    totals = [0, 0, 0]  # For 30, 90, 365 days

    for org_id, org_info in sorted(all_orgs.items(), key=lambda e: e[1]["name"]):
        org_name = org_info["name"]
        bases = org_info["bases"]

        for idx, (base_id, base_name) in enumerate(bases.items()):
            # Get numbers from each dataset, default to 0 if missing
            num_30 = get_base_number(result_30, org_id, base_id)
            num_90 = get_base_number(result_90, org_id, base_id)
            num_365 = get_base_number(result_365, org_id, base_id)

            # Get trends for each base
            trend_30 = get_base_trend(base_trends[0], org_id, base_id)
            trend_90 = get_base_trend(base_trends[1], org_id, base_id)
            trend_365 = get_base_trend(base_trends[2], org_id, base_id)

            totals[0] += num_30
            totals[1] += num_90
            totals[2] += num_365

            # First base shows org name, subsequent bases have empty org column
            row_org = org_name if idx == 0 else ""
            rows.append(
                (
                    row_org,
                    base_name,
                    num_30,
                    trend_30,
                    num_90,
                    trend_90,
                    num_365,
                    trend_365,
                )
            )

    # Calculate column widths - need to account for "value (+trend%)" format in cells
    def format_cell(value, trend):
        if trend is None:
            return f"{value} ( n/a )"
        return f"{value} ({trend:+.1f}%)"

    col1_width = max(
        len(headers[0]),
        len("TOTAL"),
        max((len(row[0]) for row in rows), default=0),
    )
    col2_width = max(len(headers[1]), max((len(row[1]) for row in rows), default=0))
    col3_width = max(
        len(headers[2]),
        len(format_cell(totals[0], trends[0])),
        max((len(format_cell(row[2], row[3])) for row in rows), default=0),
    )
    col4_width = max(
        len(headers[3]),
        len(format_cell(totals[1], trends[1])),
        max((len(format_cell(row[4], row[5])) for row in rows), default=0),
    )
    col5_width = max(
        len(headers[4]),
        len(format_cell(totals[2], trends[2])),
        max((len(format_cell(row[6], row[7])) for row in rows), default=0),
    )

    # Format output
    lines = []

    def format_line(*parts, sep=" | "):
        cells = [
            f"{parts[0]:<{col1_width}}",
            f"{parts[1]:<{col2_width}}",
            f"{parts[2]:>{col3_width}}",
            f"{parts[3]:>{col4_width}}",
            f"{parts[4]:>{col5_width}}",
        ]
        return sep.join(cells)

    # Header
    header_line = format_line(*headers)
    lines.append(header_line)

    # Separator
    separator = format_line(
        "-" * col1_width,
        "-" * col2_width,
        "-" * col3_width,
        "-" * col4_width,
        "-" * col5_width,
        sep="-+-",
    )
    lines.append(separator)

    # Data rows
    for (
        org_name,
        base_name,
        num_30,
        trend_30,
        num_90,
        trend_90,
        num_365,
        trend_365,
    ) in rows:
        cell_30 = format_cell(num_30, trend_30)
        cell_90 = format_cell(num_90, trend_90)
        cell_365 = format_cell(num_365, trend_365)
        line = format_line(org_name, base_name, cell_30, cell_90, cell_365)
        lines.append(line)

    # Separator before totals
    lines.append(separator)

    # TOTAL row (with trends included in cells)
    total_30 = format_cell(totals[0], trends[0])
    total_90 = format_cell(totals[1], trends[1])
    total_365 = format_cell(totals[2], trends[2])
    total_line = format_line("TOTAL", "", total_30, total_90, total_365)
    lines.append(total_line)

    return "\n".join(lines)


def get_base_number(result, org_id, base_id):
    """Helper to get base number from result, returns 0 if not found."""
    if org_id not in result:
        return 0

    bases = result[org_id]["bases"]
    if base_id in bases:
        return bases[base_id]["number"]

    return 0


def get_base_trend(trends, org_id, base_id):
    """Helper to get base trend from trends dict, returns None if not found."""
    if org_id not in trends:
        return None

    bases = trends[org_id]["bases"]
    if base_id in bases:
        return bases[base_id]["trend"]

    return None


def transform_data(rows):
    """
    Transform tabular data into nested organization/base structure.

    Args:
        rows: List of dicts with keys: organisation_id, organisation_name,
              base_id, base_name, number

    Returns:
        Dict with structure: {org_id: {"name": org_name, "bases": {base_id: {...}}}}
    """
    result = {}

    for row in rows:
        org_id = row["organisation_id"]

        # Initialize organization if not exists
        if org_id not in result:
            result[org_id] = {"name": row["organisation_name"], "bases": {}}

        # Add base to organization
        result[org_id]["bases"][row["base_id"]] = {
            "name": row["base_name"],
            "number": row["number"],
        }

    return result
