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
price, in_shop, comments. The order is not relevant
- the CSV file is to be formatted according to the 'csv.excel' dialect, i.e. comma as
delimiter and double-quote as quote char.
"""

import argparse
import getpass
import logging
import pprint
from datetime import date

from boxtribute_server.db import create_db_interface, db
from peewee import SQL, fn

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

    return vars(parser.parse_args(args=args))


def _create_db_interface(**connection_parameters):
    password = connection_parameters.pop("password", None) or getpass.getpass(
        "MySQL password: "
    )
    return create_db_interface(password=password, **connection_parameters)


def run():
    from boxtribute_server.models.definitions.beneficiary import Beneficiary

    bin_width = 5
    gender = fn.IF(Beneficiary.gender == "", "D", Beneficiary.gender)
    created_on = db.database.truncate_date("day", Beneficiary.created_on)
    age = fn.FLOOR((date.today().year - Beneficiary.date_of_birth.year) / bin_width)

    demographics = (
        Beneficiary.select(
            gender.alias("gender"),
            created_on.alias("created_on"),
            age.alias("age"),
            fn.COUNT(Beneficiary.id).alias("count"),
        )
        .where(Beneficiary.deleted.is_null())  # add base IDs
        .group_by(SQL("gender"), SQL("age"), SQL("created_on"))
    )

    query, raw_parameters = demographics.sql()
    # db.database.execute_sql("DROP VIEW demographics")
    db.database.execute_sql(f"CREATE VIEW demographics AS {query}", raw_parameters)
    print(db.database.get_views())

    class Demographics(Beneficiary):
        class Meta:
            db_table = "demographics"

    demographics = Demographics.select(
        SQL("age"), SQL("gender"), SQL("created_on"), SQL("count")
    )

    demographics = demographics.dicts()
    LOGGER.debug(pprint.pformat(demographics[:3]))
    LOGGER.debug(len(demographics))


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

    try:
        run()
    except Exception as e:
        LOGGER.exception(e) if verbose else LOGGER.error(e)
        raise SystemExit("Exiting due to above error.")
