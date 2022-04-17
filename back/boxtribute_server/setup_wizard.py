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


def _read_file(data_filepath):
    with open(data_filepath, newline="") as data_file:
        reader = csv.DictReader(data_file)
        rows = [row for row in reader]

    if not rows:
        raise RuntimeError(f"Empty file: {data_filepath}")

    input_column_names = set(rows[0].keys())
    if input_column_names != PRODUCT_COLUMN_NAMES:
        raise ValueError(f"Invalid CSV column names: {input_column_names}")

    return rows


def _import_products(*, data_filepath):
    rows = _read_file(data_filepath)
    Product.insert_many(rows).execute()


def main(args=None):
    options = _parse_options(args=args)

    db.database = _create_db_interface(
        **{n: options.pop(n) for n in ["host", "port", "password", "database", "user"]}
    )

    command = options.pop("command")
    if command == "import-products":
        _import_products(**options)


if __name__ == "__main__":
    main()
