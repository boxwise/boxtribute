def format_as_table(*results, column_names, trends=None, base_trends=None):
    """
    Format raw row data into aligned tabular text with one or more time windows.

    Args:
        *results: Variable number of result lists. Each result is a list of dicts
              with keys: organisation_id, organisation_name, base_id, base_name, number
        column_names: List of column names for the result columns
        trends: Optional list of trend percentages corresponding to each result
                (can be None which will be formatted as 'n/a')
        base_trends: Opt. list of dicts with per-base trend data, one for each result

    Returns:
        String with formatted table using | separators
    """
    if trends is None:
        trends = [None] * len(results)
    if base_trends is None:
        base_trends = [{}] * len(results)

    headers = ("Organisation", "Base", *column_names)

    # Collect all unique org_id, base_id combinations
    all_orgs = {}  # {org_id: {org_name, base_ids: {base_id: base_name}}}

    for result in results:
        for row in result:
            org_id = row["organisation_id"]
            base_id = row["base_id"]

            if org_id not in all_orgs:
                all_orgs[org_id] = {
                    "name": row["organisation_name"] or "n/a",
                    "bases": {},
                }

            if base_id not in all_orgs[org_id]["bases"]:
                all_orgs[org_id]["bases"][base_id] = row["base_name"] or "n/a"

    # Build rows with data from all datasets
    rows = []
    totals = [0] * len(results)

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
    widths = [col1_width, col2_width]

    # Calculate widths for result columns dynamically
    for i in range(len(results)):
        col_width = max(
            len(headers[2 + i]),
            len(format_cell(totals[i], trends[i])),
            max((len(format_cell(*row[2 + i])) for row in rows), default=0),
        )
        widths.append(col_width)

    # Format output
    lines = []
    aligns = ["<", "<"] + [">"] * len(results)

    def format_line(*parts, sep=" | "):
        cells = [
            f"{part:{align}{width}}"
            for part, align, width in zip(parts, aligns, widths)
        ]
        return sep.join(cells)

    # Header
    header_line = format_line(*headers)
    lines.append(header_line)

    # Separator
    separator = format_line(*["-" * w for w in widths], sep="-+-")
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
