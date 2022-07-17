import csv
import pathlib
import tempfile

import peewee
import pytest
from boxtribute_server.models.definitions.product import Product
from boxtribute_server.setup_wizard import (
    PRODUCT_COLUMN_NAMES,
    _clone_products,
    _create_db_interface,
    _import_products,
    _parse_options,
)


@pytest.fixture
def valid_data():
    return [
        {
            "name": "coats",
            "category": 6,
            "gender": 1,
            "size_range": 1,
            "base": 1,
            "price": 20,
            "in_shop": 0,
            "comments": "",
        },
        {
            "name": "umbrellas",
            "category": 13,
            "gender": 1,
            "size_range": 1,
            "base": 2,
            "price": 10,
            "in_shop": 0,
            "comments": "yellow color",
        },
    ]


def write_to_csv(*, filepath, data, fieldnames):
    with open(filepath, mode="w", newline="") as data_file:
        writer = csv.DictWriter(data_file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)


# Note that yielding the filepath prevents from exiting the tempfile context manager
# which would otherwise result in automatic deletion of the temporary directory before
# it is even used by the test
@pytest.fixture
def valid_data_filepath(valid_data):
    with tempfile.TemporaryDirectory() as tmpdir:
        filepath = pathlib.Path(tmpdir) / "valid_data.csv"
        write_to_csv(
            filepath=filepath, data=valid_data, fieldnames=PRODUCT_COLUMN_NAMES
        )
        yield filepath


@pytest.fixture
def empty_filepath():
    with tempfile.NamedTemporaryFile(mode="w", newline="", suffix=".csv") as tmpfile:
        yield tmpfile.name


@pytest.fixture
def only_header_filepath():
    with tempfile.TemporaryDirectory() as tmpdir:
        filepath = pathlib.Path(tmpdir) / "only_header.csv"
        write_to_csv(filepath=filepath, data=[], fieldnames=PRODUCT_COLUMN_NAMES)
        yield filepath


@pytest.fixture
def invalid_data_filepath():
    with tempfile.TemporaryDirectory() as tmpdir:
        filepath = pathlib.Path(tmpdir) / "invalid_data.csv"
        write_to_csv(filepath=filepath, data=[{"invalid": 0}], fieldnames=["invalid"])
        yield filepath


@pytest.fixture
def invalid_typed_data_filepath():
    with tempfile.TemporaryDirectory() as tmpdir:
        filepath = pathlib.Path(tmpdir) / "invalid_data.csv"
        write_to_csv(
            filepath=filepath,
            data=[
                {
                    "name": "coats",
                    "category": "Clothing",  # should be valid int
                    "gender": 1,
                    "size_range": 1,
                    "base": 1,
                    "price": 20,
                    "in_shop": 0,
                    "comments": "",
                }
            ],
            fieldnames=PRODUCT_COLUMN_NAMES,
        )
        yield filepath


def test_parse_options():
    assert _parse_options("import-products -f data.csv".split()) == {
        "command": "import-products",
        "data_filepath": "data.csv",
        "database": None,
        "password": None,
        "user": None,
        "host": "127.0.0.1",
        "port": 3386,
        "verbose": False,
    }

    assert _parse_options("clone-products -s 1 -t 2".split()) == {
        "command": "clone-products",
        "source_base_id": 1,
        "target_base_id": 2,
        "database": None,
        "password": None,
        "user": None,
        "host": "127.0.0.1",
        "port": 3386,
        "verbose": False,
    }

    assert isinstance(
        _create_db_interface(
            password="dropapp_root",
            host="127.0.0.1",
            port=32000,
            user="root",
            database="dropapp_dev",
        ),
        peewee.MySQLDatabase,
    )


def test_import_products(
    valid_data_filepath,
    valid_data,
    empty_filepath,
    only_header_filepath,
    invalid_data_filepath,
    invalid_typed_data_filepath,
):
    _import_products(data_filepath=valid_data_filepath)
    products = list(Product.select().dicts())

    # Verify that result is superset of original test data
    assert products[-2].items() >= valid_data[0].items()
    assert products[-1].items() >= valid_data[1].items()

    with pytest.raises(RuntimeError):
        _import_products(data_filepath=empty_filepath)

    with pytest.raises(RuntimeError):
        _import_products(data_filepath=only_header_filepath)

    with pytest.raises(ValueError):
        _import_products(data_filepath=invalid_data_filepath)

    with pytest.raises(ValueError) as exc_info:
        _import_products(data_filepath=invalid_typed_data_filepath)
    assert exc_info.value.args[0] == "Invalid fields:\nRow   1: category"


def test_clone_products(default_product):
    target_base_id = 2
    _clone_products(source_base_id=1, target_base_id=target_base_id)

    # Verify that source and target product are identical apart from ID, base, and price
    products = list(Product.select().dicts())
    cloned_products = products[-2:]
    original_products = products[:1]
    for cloned_product, original_product in zip(cloned_products, original_products):
        cloned_product.pop("id")
        for field in ["id", "base", "price"]:
            original_product.pop(field)
        assert cloned_product.pop("base") == target_base_id
        assert cloned_product.pop("price") == 0
        assert cloned_product == original_product
