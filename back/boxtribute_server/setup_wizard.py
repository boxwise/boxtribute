#!/usr/bin/env python

import argparse
import csv
import getpass

from boxtribute_server.db import create_db_interface, db
from boxtribute_server.models.definitions.product import Product

PRODUCT_COLUMN_NAMES = {
    "name",
    "category",
    "gender",
    "size_range",
    "base",
    "price",
    "in_shop",
    "comments",
}


# Expected column types for basic input validation
PRODUCT_COLUMN_TYPES = {
    "name": str,
    "category": int,
    "gender": int,
    "size_range": int,
    "base": int,
    "price": int,
    "in_shop": int,
    "comments": str,
}


def _parse_options(args=None):
    parser = argparse.ArgumentParser(
        description="Wizard for setting up a new organisation in the database"
    )
    parser.add_argument("-H", "--host", default="127.0.0.1", help="MySQL server host")
    parser.add_argument("-P", "--port", default=3386, help="MySQL port")
    parser.add_argument("-u", "--user", help="MySQL user")
    parser.add_argument("-p", "--password", help="MySQL password")
    parser.add_argument("-d", "--database", help="MySQL database name")

    subparsers = parser.add_subparsers(dest="command", metavar="command")
    subparsers.required = True

    import_products_parser = subparsers.add_parser("import-products")
    import_products_parser.add_argument("-f", "--data-filepath")

    return vars(parser.parse_args(args=args))


def _create_db_interface(**connection_parameters):
    password = connection_parameters.pop("password", None) or getpass.getpass(
        "MySQL password: "
    )
    return create_db_interface(password=password, **connection_parameters)


def _validate_row(*, row, types):
    """Validate field values of given row against types by attempting naive Python type
    casting. Collect invalid field names in a list and return it. An empty list
    indicates that the entire row has valid types.
    """
    invalid_fields = []
    for name, value in row.items():
        try:
            types[name](value)
        except ValueError:
            invalid_fields.append(name)
    return invalid_fields


def _validate_input(*, rows, types):
    """Validate several rows against given types. Collect indices of invalid rows
    (starting at 1), and the invalid fields therein, in a dict and return it. An empty
    dict indicates that all rows have valid types.
    """
    invalid_rows = {}
    for i, row in enumerate(rows):
        invalid_fields = _validate_row(row=row, types=types)
        if invalid_fields:
            invalid_rows[i + 1] = invalid_fields
    return invalid_rows


def _read_file(data_filepath):
    with open(data_filepath, newline="") as data_file:
        reader = csv.DictReader(data_file)
        rows = [row for row in reader]

    if not rows:
        raise RuntimeError(f"Empty file: {data_filepath}")

    input_column_names = set(rows[0].keys())
    if input_column_names != PRODUCT_COLUMN_NAMES:
        raise ValueError(f"Invalid CSV column names: {input_column_names}")

    invalid_rows = _validate_input(rows=rows, types=PRODUCT_COLUMN_TYPES)
    if invalid_rows:
        message = "\n".join(
            f"Row {r:3d}: {', '.join(f)}" for r, f in invalid_rows.items()
        )
        raise ValueError(f"Invalid fields:\n{message}")

    return rows


def _import_products(*, data_filepath):
    rows = _read_file(data_filepath)
    with db.database.atomic():
        Product.insert_many(rows).execute()


def main(args=None):
    options = _parse_options(args=args)

    db.database = _create_db_interface(
        **{n: options.pop(n) for n in ["host", "port", "password", "database", "user"]}
    )

    command = options.pop("command")
    if command == "import-products":
        _import_products(**options)
