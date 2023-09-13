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
import csv
import getpass
import json
import logging
import time
from collections import namedtuple
from datetime import datetime

from boxtribute_server.db import create_db_interface, db

LOGGER = logging.getLogger(__name__)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter(fmt="%(created)f | %(message)s"))
LOGGER.addHandler(handler)
LOGGER.setLevel(logging.INFO)

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

    convert_parser = subparsers.add_parser("convert")
    convert_parser.add_argument("-l", "--location-id", type=int, required=True)
    convert_parser.add_argument("-y", "--oldest-creation-year", type=int)
    convert_parser.add_argument("-g", "--grouped-algorithm", action="store_true")

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
    """Open CSV file from given path and return contained rows as list of dicts.
    Raise RuntimeError if file is empty.
    """
    with open(data_filepath, newline="") as data_file:
        reader = csv.DictReader(data_file)
        rows = [row for row in reader]
    if not rows:
        raise RuntimeError(f"Empty file: {data_filepath}")
    return rows


def _import_products(*, data_filepath):
    """Read in CSV file. Validate column names and field types. If validation
    successful, add rows to the database in a single, atomic operation. Otherwise raise
    ValueError.
    """
    rows = _read_file(data_filepath)

    input_column_names = set(rows[0].keys())
    if input_column_names != PRODUCT_COLUMN_NAMES:
        raise ValueError(f"Invalid CSV column names: {input_column_names}")

    invalid_rows = _validate_input(rows=rows, types=PRODUCT_COLUMN_TYPES)
    if invalid_rows:
        message = "\n".join(
            f"Row {r:3d}: {', '.join(f)}" for r, f in invalid_rows.items()
        )
        raise ValueError(f"Invalid fields:\n{message}")

    # Import here such that patching of db.database in main() takes effect
    from boxtribute_server.models.definitions.product import Product

    with db.database.atomic():
        nr_rows = Product.insert_many(rows).execute()
        LOGGER.info(f"Imported {nr_rows} new product(s).")


def _clone_products(*, source_base_id, target_base_id):
    """Clone elements in Product model from given source to target base (relevant fields
    only). Validate that bases exist, otherwise raise ValueError.
    """
    # Import here such that patching of db.database in main() takes effect
    from boxtribute_server.models.definitions.base import Base
    from boxtribute_server.models.definitions.product import Product

    try:
        source_base = Base.get_by_id(source_base_id)
        target_base = Base.get_by_id(target_base_id)
    except Base.DoesNotExist:
        LOGGER.error("The specified source or target base do not exist.")
        raise ValueError

    source_base_products = list(
        Product.select(*[getattr(Product, column) for column in PRODUCT_COLUMN_NAMES])
        .where((Product.base == source_base_id) & (Product.deleted_on.is_null()))
        .dicts()
    )
    for product in source_base_products:
        product["base"] = target_base_id
        product["price"] = 0
    with db.database.atomic():
        Product.insert_many(source_base_products).execute()
        LOGGER.info(
            f"Cloned {len(source_base_products)} product(s) from base "
            f"'{source_base.name}' to base '{target_base.name}'."
        )


def _reconstruct(box, event):
    if event.changes == "Box was undeleted.":
        # The information about when the box was deleted is only available from the
        # "Record deleted" event. Insert dummy date for now
        box["deleted"] = "1970-01-01"
        return True

    if event.changes == "Record deleted":
        # The box version before the deletion is obviously not deleted
        box["deleted"] = None
        return True

    fields = {
        "box_state_id": "state",
        "location_id": "location",
        "product_id": "product",
        "size_id": "size",
        "items": "number_of_items",
    }
    field = fields.get(event.changes)
    if field is None:
        # No relevant change happened
        return False
    box[field] = event.from_int
    return True


Event = namedtuple("Event", ["changes", "from_int"])


def _grouped_convert(*, location_id, start):
    from boxtribute_server.models.definitions.box import Box
    from boxtribute_server.models.definitions.history import DbChangeHistory
    from boxtribute_server.models.utils import convert_ids
    from peewee import fn

    def convert_str(concat_strings):
        return convert_ids(concat_strings, new_type=str)

    query = (
        DbChangeHistory.select(
            fn.GROUP_CONCAT(DbChangeHistory.changes)
            .python_value(convert_str)
            .alias("changes"),
            fn.GROUP_CONCAT(DbChangeHistory.change_date)
            .python_value(convert_str)
            .alias("change_dates"),
            fn.GROUP_CONCAT(fn.IFNULL(DbChangeHistory.from_int, ""))
            .python_value(convert_ids)
            .alias("from_ints"),
            Box.id,
            Box.state,
            Box.created_on,
            Box.deleted,
            Box.number_of_items,
            Box.location,
            Box.product,
            Box.size,
        )
        .join(
            Box,
            on=(
                (DbChangeHistory.table_name == "stock")
                & (DbChangeHistory.record_id == Box.id)
                & (DbChangeHistory.change_date >= start)
                & (~DbChangeHistory.changes.startswith("comments"))
                & (Box.created_on > start)
                & (Box.location == location_id)
            ),
        )
        .group_by(Box.id)
    )

    LOGGER.debug(f"Selected {len(query)} boxes.")
    LOGGER.debug("Starting reconstruction...")
    start_time = time.perf_counter()

    all_boxes_versions = {e.box.id: [] for e in query}
    for entry in query:
        box_versions = all_boxes_versions[entry.box.id]
        # Most recent version of box is the data from the box table
        box_versions.append(
            {
                "id": entry.box.id,
                "state": entry.box.state_id,
                "created_on": entry.box.created_on,
                "deleted": entry.box.deleted,
                "number_of_items": entry.box.number_of_items,
                "location": entry.box.location_id,
                "product": entry.box.product_id,
                "size": entry.box.size_id,
            }
        )

        # Walk back in history
        for change, change_date, from_int in reversed(
            list(zip(entry.changes, entry.change_dates, entry.from_ints))
        ):
            # For the previous version, copy the current version, and reverse the change
            # logged in the history table
            event = Event(change, from_int)
            previous_version = box_versions[-1].copy()
            if not _reconstruct(previous_version, event):
                continue

            box_versions[-1]["effective_from"] = change_date
            box_versions.append(previous_version)

        box_versions[-1]["effective_from"] = box_versions[-1]["created_on"]
        box_versions.sort(key=lambda v: str(v["effective_from"]))

    LOGGER.debug(
        f"""Reconstruction completed after {round(time.perf_counter() -
    start_time, ndigits=1)}s."""
    )
    filename = "box_versions_grouped.json"
    with open(filename, "w") as f:
        json.dump(all_boxes_versions, f, default=str, indent=2)
    LOGGER.debug(f"Exported result to '{filename}'.")


def _convert(*, location_id, grouped_algorithm, oldest_creation_year=2020):
    from boxtribute_server.models.definitions.box import Box
    from boxtribute_server.models.definitions.history import DbChangeHistory

    LOGGER.debug("Starting program")
    start = datetime(oldest_creation_year, 1, 1)

    if grouped_algorithm:
        _grouped_convert(location_id=location_id, start=start)
        return

    boxes = Box.select(
        Box.id,
        Box.state,
        Box.created_on,
        Box.deleted,
        Box.number_of_items,
        Box.location,
        Box.product,
        Box.size,
    ).where(
        Box.created_on > start,
        Box.location == location_id,
    )
    LOGGER.debug(f"Selected {len(boxes)} boxes.")

    # Obtain history entries for selected boxes
    box_ids = {b.id for b in boxes}
    history = (
        DbChangeHistory.select(
            DbChangeHistory.changes,
            DbChangeHistory.change_date,
            DbChangeHistory.from_int,
            DbChangeHistory.record_id,
        )
        .where(
            DbChangeHistory.table_name == "stock",
            DbChangeHistory.record_id << box_ids,
            DbChangeHistory.change_date >= start,
            ~DbChangeHistory.changes.startswith("comments"),
        )
        .order_by(DbChangeHistory.change_date.desc())
        .namedtuples()
    )
    LOGGER.debug(f"Selected {len(history)} history entries.")
    LOGGER.debug("Starting reconstruction...")
    start_time = time.perf_counter()

    # Reconstruct box versions grouped by box ID
    all_boxes_versions = {box.id: [] for box in boxes.namedtuples()}
    for box in boxes.namedtuples():
        box_versions = all_boxes_versions[box.id]
        # Most recent version of box is the data from the box table
        box_versions.append(box._asdict())

        # Walk back in history
        for event in history:
            if event.record_id != box.id:
                continue

            # For the previous version, copy the current version, and reverse the change
            # logged in the history table
            previous_version = box_versions[-1].copy()
            if not _reconstruct(previous_version, event):
                continue

            box_versions[-1]["effective_from"] = event.change_date
            box_versions.append(previous_version)

        box_versions[-1]["effective_from"] = box_versions[-1]["created_on"]
        box_versions.sort(key=lambda v: v["effective_from"])

    LOGGER.debug(
        f"""Reconstruction completed after {round(time.perf_counter() -
    start_time, ndigits=1)}s."""
    )
    filename = "box_versions.json"
    with open(filename, "w") as f:
        json.dump(all_boxes_versions, f, default=str, indent=2)
    LOGGER.debug(f"Exported result to '{filename}'.")


def main(args=None):
    options = _parse_options(args=args)

    verbose = options.pop("verbose")
    if verbose:  # pragma: no cover
        peewee_logger = logging.getLogger("peewee")
        peewee_logger.setLevel(logging.DEBUG)
        # peewee_logger.parent = LOGGER  # propagate messages to module logger
        LOGGER.setLevel(logging.DEBUG)

    db.database = _create_db_interface(
        **{n: options.pop(n) for n in ["host", "port", "password", "database", "user"]}
    )

    command = options.pop("command")
    try:
        if command == "import-products":
            _import_products(**options)
        elif command == "clone-products":
            _clone_products(**options)
        elif command == "convert":
            _convert(**options)
    except Exception as e:
        LOGGER.exception(e) if verbose else LOGGER.error(e)
        raise SystemExit("Exiting due to above error.")
