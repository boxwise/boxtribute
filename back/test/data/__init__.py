import importlib
import os
import pathlib

from boxtribute_server.db import db

from .base import default_base, default_bases
from .beneficiary import (
    another_beneficiary,
    default_beneficiaries,
    default_beneficiary,
    relative_beneficiary,
)
from .box import (
    another_box,
    another_marked_for_shipment_box,
    box_without_qr_code,
    default_box,
    default_boxes,
    lost_box,
    marked_for_shipment_box,
)
from .box_state import default_box_state
from .distribution_event import default_distribution_event
from .history import default_history
from .location import (
    another_location,
    base1_classic_locations,
    default_location,
    non_default_box_state_location,
    null_box_state_location,
)
from .log import default_log
from .organisation import another_organisation, default_organisation, organisations
from .product import another_product, default_product, products
from .product_category import default_product_category
from .product_gender import default_product_gender
from .qr_code import default_qr_code, qr_code_without_box
from .shipment import (
    another_shipment,
    canceled_shipment,
    default_shipment,
    sent_shipment,
    shipments,
)
from .shipment_detail import (
    another_shipment_detail,
    default_shipment_detail,
    prepared_shipment_detail,
)
from .size import another_size, default_size
from .size_range import default_size_range
from .tag import tags
from .transaction import default_transaction, relative_transaction
from .transfer_agreement import (
    default_transfer_agreement,
    expired_transfer_agreement,
    reviewed_transfer_agreement,
    transfer_agreements,
    unidirectional_transfer_agreement,
)
from .user import default_user, default_users

__all__ = [
    "another_beneficiary",
    "another_box",
    "another_location",
    "another_marked_for_shipment_box",
    "another_organisation",
    "another_product",
    "another_shipment",
    "another_shipment_detail",
    "another_size",
    "base1_classic_locations",
    "box_without_qr_code",
    "canceled_shipment",
    "default_beneficiary",
    "default_beneficiaries",
    "default_base",
    "default_bases",
    "default_box",
    "default_boxes",
    "default_box_state",
    "default_distribution_event",
    "default_history",
    "default_location",
    "default_log",
    "default_organisation",
    "default_product",
    "default_product_category",
    "default_product_gender",
    "default_qr_code",
    "default_shipment",
    "default_shipment_detail",
    "default_size",
    "default_size_range",
    "default_transaction",
    "default_transfer_agreement",
    "default_user",
    "default_users",
    "expired_transfer_agreement",
    "lost_box",
    "marked_for_shipment_box",
    "non_default_box_state_location",
    "null_box_state_location",
    "organisations",
    "prepared_shipment_detail",
    "products",
    "qr_code_without_box",
    "relative_beneficiary",
    "relative_transaction",
    "reviewed_transfer_agreement",
    "sent_shipment",
    "shipments",
    "tags",
    "transfer_agreements",
    "unidirectional_transfer_agreement",
]

MODULE_DIRECTORY = pathlib.Path(__file__).resolve().parent
# List of models that others depend on
_NAMES = [
    # Models that don't have any dependencies
    "box_state",
    "product_category",
    "product_gender",
    "size_range",
    "language",
    "qr_code",
    # Models that have dependencies, and are dependency of others
    "user",
    "organisation",
    "base",
    "location",
    "product",
    "size",
    "box",
    "beneficiary",
    "transfer_agreement",
    "shipment",
    "tag",
]


def setup_models():
    """Import all submodules of the `data` module and execute their `create()` functions
    to create test data.
    """
    # List all files (exclude directories)
    file_names = [
        f for f in os.listdir(MODULE_DIRECTORY) if os.path.isfile(MODULE_DIRECTORY / f)
    ]
    file_names.remove("__init__.py")
    module_names = [f.replace(".py", "") for f in file_names]

    # Populate models such that independent ones are set up first; then the ones with
    # FKs referring to the independent ones
    for module_name in _NAMES:
        module_names.remove(module_name)
        module = importlib.import_module(f"data.{module_name}")
        module.create()

    # Set up remaining models; order is now irrelevant
    for module_name in module_names:
        module = importlib.import_module(f"data.{module_name}")
        module.create()


def setup_box_transfer_models():
    """Like `setup_models()` above but only for models related to box-transfer (not
    present in production database dump). Return relevant model classes.
    """
    models = []
    for module_name in [
        "transfer_agreement",
        "shipment",
        "transfer_agreement_detail",
        "shipment_detail",
    ]:
        module = importlib.import_module(f"data.{module_name}")
        module.create()

        module = importlib.import_module(
            f"boxtribute_server.models.definitions.{module_name}"
        )
        model_name = "".join(p.capitalize() for p in module_name.split("_"))
        models.append(getattr(module, model_name))
    return models


# List of all Models in the database, cf. https://stackoverflow.com/a/43820902/3865876
MODELS = db.Model.__subclasses__()
