#!/usr/bin/env python
"""Command-line tool for various operations on the database and/or Auth0.

For establishing a connection to the database, all connection parameters must be given
as command line options: host, port, user, database. If the password is not specified,
you will be prompted for it. The options must be specified *before* the command:

    bwiz --user admin --database test-db import-products

Help for commands:

    bwiz <command> --help

"""

import argparse
import getpass
import logging

from boxtribute_server.db import create_db_interface, db

from .products import clone_products, import_products
from .remove_base_access import LOGGER as RBA_LOGGER
from .remove_base_access import remove_base_access
from .service import LOGGER as SERVICE_LOGGER
from .service import Auth0Service
from .utils import setup_logger

LOGGER = setup_logger(__name__)


def _parse_options(args=None):
    parser = argparse.ArgumentParser(
        description=globals()["__doc__"],
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "-H",
        "--host",
        default="127.0.0.1",
        help="MySQL server host (default: 127.0.0.1)",
    )
    parser.add_argument(
        "-P", "--port", default=3386, type=int, help="MySQL port (default: 3386)"
    )
    parser.add_argument("-u", "--user", help="MySQL user")
    parser.add_argument("-p", "--password", help="MySQL password")
    parser.add_argument("-d", "--database", help="MySQL database name")
    parser.add_argument(
        "-v", "--verbose", action="store_true", help="show SQL queries run by peewee"
    )

    subparsers = parser.add_subparsers(dest="command", metavar="command")
    subparsers.required = True

    import_products_parser = subparsers.add_parser(
        "import-products",
        help="Import new products from CSV file",
        description="""
- the input CSV file must have the columns name, category, gender, size_range, base,
price, in_shop, comment. The order is not relevant
- the CSV file is to be formatted according to the 'csv.excel' dialect, i.e. comma as
delimiter and double-quote as quote char.
""",
        formatter_class=argparse.RawDescriptionHelpFormatter,
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

    remove_base_access_parser = subparsers.add_parser(
        "remove-base-access", help="Remove access to base from users"
    )
    remove_base_access_parser.add_argument("-b", "--base-id", type=int, required=True)
    remove_base_access_parser.add_argument(
        "--force", action="store_true", help="actually execute the operations"
    )
    remove_base_access_parser.add_argument(
        "-D", "--auth0-management-api-domain", dest="domain", required=True
    )
    remove_base_access_parser.add_argument(
        "-i", "--auth0-management-api-client-id", dest="client_id", required=True
    )
    remove_base_access_parser.add_argument(
        "-S",
        "--auth0-management-api-client-secret",
        dest="secret",
    )
    return vars(parser.parse_args(args=args))


def _create_db_interface(**connection_parameters):
    password = connection_parameters.pop("password", None) or getpass.getpass(
        "MySQL password: "
    )
    return create_db_interface(password=password, **connection_parameters)


def _connect_to_auth0(**connection_parameters):
    domain = connection_parameters["domain"]
    client_id = connection_parameters["client_id"]
    secret = connection_parameters.pop("secret", None) or getpass.getpass(
        "Auth0 Management API secret: "
    )
    return Auth0Service.connect(domain=domain, client_id=client_id, secret=secret)


def _confirm_removal(base_id):
    from ..models.definitions.base import Base

    # Validate that base exists
    base = Base.select(Base.name).where(Base.id == base_id).get_or_none()
    if base is None:
        raise ValueError(f"Base {base_id} does not exist.")

    reply = input(
        f"Type YES to confirm removing access to base '{base.name}' (ID: {base_id}) "
        "for all affected users: "
    )
    if reply != "YES":
        raise RuntimeError("Operation was not confirmed, cancelling.")


def main(args=None):
    options = _parse_options(args=args)

    verbose = options.pop("verbose")
    if verbose:  # pragma: no cover
        peewee_logger = logging.getLogger("peewee")
        peewee_logger.setLevel(logging.DEBUG)
        peewee_logger.parent = LOGGER  # propagate messages to module logger
        urllib_logger = logging.getLogger("urllib3")
        urllib_logger.setLevel(logging.DEBUG)
        urllib_logger.parent = LOGGER
        LOGGER.setLevel(logging.DEBUG)
        RBA_LOGGER.setLevel(logging.DEBUG)
        SERVICE_LOGGER.setLevel(logging.DEBUG)

    # The following patches the `database` attribute of the DatabaseManager which is
    # necessary for using the `db.Model` inheritance in all peewee model classes.
    # NOTE: if importing model definitions in a sibling file, do so ONLY inside of the
    # function that uses the model, otherwise the "database" patch is ineffective, and
    # the "Cannot use uninitialized Proxy" error occurs.
    db.database = _create_db_interface(
        **{n: options.pop(n) for n in ["host", "port", "password", "database", "user"]}
    )

    command = options.pop("command")
    try:
        if command == "import-products":
            import_products(**options)
        elif command == "clone-products":
            clone_products(**options)
        elif command == "remove-base-access":
            _confirm_removal(options["base_id"])
            service = _connect_to_auth0(
                **{n: options.pop(n) for n in ["domain", "client_id", "secret"]}
            )
            remove_base_access(**options, service=service)
    except Exception as e:
        LOGGER.exception(e) if verbose else LOGGER.error(e)
        raise SystemExit("Exiting due to above error.")
