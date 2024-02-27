#!/usr/bin/env python
"""Wizard for setting up a new organisation in the database.

For establishing a connection to the database, all connection parameters must be given
as command line options: host, port, user, database. If the password is not specified,
you will be prompted for it. The options must be specified *before* the command:

    bwiz --user admin --database test-db import-products

Help for commands:

    bwiz <command> --help

Command: import-products
- the input CSV file must have the columns name, category, gender, size_range, base,
price, in_shop, comment. The order is not relevant
- the CSV file is to be formatted according to the 'csv.excel' dialect, i.e. comma as
delimiter and double-quote as quote char.
"""

import argparse
import getpass
import logging

from boxtribute_server.db import create_db_interface, db

from .products import clone_products, import_products

LOGGER = logging.getLogger(__name__)
LOGGER.addHandler(logging.StreamHandler())
LOGGER.setLevel(logging.INFO)


def _parse_options(args=None):
    parser = argparse.ArgumentParser(
        description=globals()["__doc__"],
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("-H", "--host", default="127.0.0.1", help="MySQL server host")
    parser.add_argument("-P", "--port", default=3386, type=int, help="MySQL port")
    parser.add_argument("-u", "--user", help="MySQL user")
    parser.add_argument("-p", "--password", help="MySQL password")
    parser.add_argument("-d", "--database", help="MySQL database name")
    parser.add_argument(
        "-v", "--verbose", action="store_true", help="show SQL queries run by peewee"
    )

    subparsers = parser.add_subparsers(dest="command", metavar="command")
    subparsers.required = True

    import_products_parser = subparsers.add_parser(
        "import-products", help="Import new products from CSV file"
    )
    import_products_parser.add_argument("-f", "--data-filepath")

    clone_products_parser = subparsers.add_parser(
        "clone-products", help="Clone products from one base to another"
    )
    clone_products_parser.add_argument(
        "-s", "--source-base-id", type=int, required=True
    )
    clone_products_parser.add_argument(
        "-t", "--target-base-id", type=int, required=True
    )

    return vars(parser.parse_args(args=args))


def _create_db_interface(**connection_parameters):
    password = connection_parameters.pop("password", None) or getpass.getpass(
        "MySQL password: "
    )
    return create_db_interface(password=password, **connection_parameters)


def main(args=None):
    options = _parse_options(args=args)

    verbose = options.pop("verbose")
    if verbose:  # pragma: no cover
        peewee_logger = logging.getLogger("peewee")
        peewee_logger.setLevel(logging.DEBUG)
        peewee_logger.parent = LOGGER  # propagate messages to module logger
        LOGGER.setLevel(logging.DEBUG)

    db.database = _create_db_interface(
        **{n: options.pop(n) for n in ["host", "port", "password", "database", "user"]}
    )

    command = options.pop("command")
    try:
        if command == "import-products":
            import_products(**options)
        elif command == "clone-products":
            clone_products(**options)
    except Exception as e:
        LOGGER.exception(e) if verbose else LOGGER.error(e)
        raise SystemExit("Exiting due to above error.")
