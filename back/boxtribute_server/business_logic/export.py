import base64
import csv
import io


def rows_to_csv_base64(fieldnames, rows):
    """Serialize the given rows (dictionaries keyed by `fieldnames`) as CSV, and return
    the base64-encoded string.
    """
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)
    return base64.b64encode(output.getvalue().encode()).decode()
