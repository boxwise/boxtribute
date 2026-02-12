#!/usr/bin/env python
"""Command-line tool for various operations on the database and/or Auth0.

For establishing a connection to the database, all connection parameters must be given
as command line options: host, port, user, database. If the password is not specified,
you will be prompted for it. The options must be specified *before* the command:

    bwiz --user admin --database test-db remove-base-access

Help for commands:

    bwiz <command> --help

"""

import argparse
import getpass
import logging

from ..db import create_db_interface
from ..models.definitions import Model
from ..models.definitions.base import Base
from ..models.definitions.organisation import Organisation
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


def _confirm_removal(*, force, base_id):
    # Validate that base exists
    base = (
        Base.select(Base.name, Organisation.name, Organisation.id)
        .join(Organisation)
        .where(Base.id == base_id)
        .get_or_none()
    )
    if base is None:
        raise ValueError(f"Base {base_id} does not exist.")

    LOGGER.info(
        f"Selected base: '{base.name}' from organisation '{base.organisation.name}'"
    )
    nr_active_bases = (
        Base.select()
        .where(Base.deleted_on.is_null(), Base.organisation == base.organisation.id)
        .count()
    )
    LOGGER.info(f"The organisation has {nr_active_bases} active bases in total")

    if not force:
        return  # skip confirmation

    extra = (
        f" (the organisation '{base.organisation.name}' will be soft-deleted)"
        if nr_active_bases == 1
        else ""
    )
    reply = input(
        f"Type YES to confirm removing access to base '{base.name}' (ID: {base_id}) "
        f"for all affected users{extra}: "
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

    database = _create_db_interface(
        **{n: options.pop(n) for n in ["host", "port", "password", "database", "user"]}
    )
    database.bind(Model.__subclasses__())

    command = options.pop("command")
    try:
        if command == "remove-base-access":
            _confirm_removal(base_id=options["base_id"], force=options["force"])
            service = _connect_to_auth0(
                **{n: options.pop(n) for n in ["domain", "client_id", "secret"]}
            )
            remove_base_access(**options, service=service)
    except Exception as e:
        LOGGER.exception(e) if verbose else LOGGER.error(e)
        raise SystemExit("Exiting due to above error.")
