def format_as_table(result_30, result_90, result_365, *, trends, base_trends):
    """
    Format raw row data into aligned tabular text with multiple time windows.

    Args:
        result_30: List of dicts with keys: organisation_id, organisation_name,
                   base_id, base_name, number (for 30 days)
        result_90: List of dicts (for 90 days)
        result_365: List of dicts (for 365 days)
        trends: List of three trend percentages [trend_30, trend_90, trend_365]
                (can be None which will be formatted as 'n/a')
        base_trends: List of three dicts with per-base trend data

    Returns:
        String with formatted table using | separators
    """
    headers = ("Organisation", "Base", "30 days", "90 days", "365 days")

    # Collect all unique org_id, base_id combinations
    all_orgs = {}  # {org_id: {org_name, base_ids: {base_id: base_name}}}

    results = [result_30, result_90, result_365]
    for result in results:
        for row in result:
            org_id = row["organisation_id"]
            base_id = row["base_id"]

            if org_id not in all_orgs:
                all_orgs[org_id] = {"name": row["organisation_name"], "bases": {}}

            if base_id not in all_orgs[org_id]["bases"]:
                all_orgs[org_id]["bases"][base_id] = row["base_name"]

    # Build rows with data from all three datasets
    rows = []
    totals = [0, 0, 0]  # For 30, 90, 365 days

    for org_id, org_info in sorted(all_orgs.items(), key=lambda e: e[1]["name"]):
        org_name = org_info["name"]
        bases = org_info["bases"]

        for idx, (base_id, base_name) in enumerate(bases.items()):
            # Get numbers from each dataset, default to 0 if missing
            nums = [get_base_number(result, org_id, base_id) for result in results]

            # Get trends for each base
            trends_base = [get_base_trend(bt, org_id, base_id) for bt in base_trends]

            for i, num in enumerate(nums):
                totals[i] += num

            # First base shows org name, subsequent bases have empty org column
            row_org = org_name if idx == 0 else ""
            row_data = list(zip(nums, trends_base))
            rows.append((row_org, base_name, *row_data))

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
        max((len(format_cell(*row[2])) for row in rows), default=0),
    )
    col4_width = max(
        len(headers[3]),
        len(format_cell(totals[1], trends[1])),
        max((len(format_cell(*row[3])) for row in rows), default=0),
    )
    col5_width = max(
        len(headers[4]),
        len(format_cell(totals[2], trends[2])),
        max((len(format_cell(*row[4])) for row in rows), default=0),
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
    for (org_name, base_name, *row_data) in rows:
        cells = [format_cell(num, trend) for num, trend in row_data]
        line = format_line(org_name, base_name, *cells)
        lines.append(line)

    # Separator before totals
    lines.append(separator)

    # TOTAL row (with trends included in cells)
    total_cells = [format_cell(to, tr) for to, tr in zip(totals, trends)]
    total_line = format_line("TOTAL", "", *total_cells)
    lines.append(total_line)

    return "\n".join(lines)


def get_base_number(result, org_id, base_id):
    """Helper to get base number from result, returns 0 if not found."""
    for row in result:
        if row["organisation_id"] == org_id and row["base_id"] == base_id:
            return row["number"]
    return 0


def get_base_trend(trends, org_id, base_id):
    """Helper to get base trend from trends dict, returns None if not found."""
    if org_id not in trends:
        return None

    bases = trends[org_id]["bases"]
    if base_id in bases:
        return bases[base_id]["trend"]

    return None
