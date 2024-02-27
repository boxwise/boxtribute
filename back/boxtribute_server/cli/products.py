import csv
import logging

from boxtribute_server.db import db

LOGGER = logging.getLogger(__name__)
LOGGER.addHandler(logging.StreamHandler())
LOGGER.setLevel(logging.INFO)


PRODUCT_COLUMN_NAMES = {
    "name",
    "category",
    "gender",
    "size_range",
    "base",
    "price",
    "in_shop",
    "comment",
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
    "comment": str,
}


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


def import_products(*, data_filepath):
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


def clone_products(*, source_base_id, target_base_id):
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
