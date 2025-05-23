import importlib
import os
import pathlib

from boxtribute_server.db import db

from .base import another_base, default_base, default_bases, deleted_base
from .beneficiary import (
    another_beneficiary,
    another_relative_beneficiary,
    default_beneficiaries,
    default_beneficiary,
    relative_beneficiary,
)
from .box import (
    another_box,
    another_in_transit_box,
    another_marked_for_shipment_box,
    another_not_delivered_box,
    box_without_qr_code,
    default_box,
    default_boxes,
    default_location_boxes,
    in_transit_box,
    lost_box,
    marked_for_shipment_box,
    measure_product_box,
    not_delivered_box,
)
from .box_state import default_box_state
from .distribution_event import (
    default_distribution_event,
    distro_spot5_distribution_events,
    distro_spot5_distribution_events_before_return_state,
    distro_spot5_distribution_events_in_return_state,
)
from .distribution_event_tracking_group import default_tracking_group
from .history import default_history
from .location import (
    another_location,
    base1_classic_locations,
    base1_undeleted_classic_locations,
    default_location,
    deleted_location,
    distribution_spot,
    non_default_box_state_location,
    null_box_state_location,
    yet_another_location,
)
from .log import default_log
from .organisation import (
    another_organisation,
    default_organisation,
    inactive_organisation,
    organisations,
)
from .packing_list_entry import packing_list_entry
from .product import (
    another_product,
    base1_products,
    base1_undeleted_products,
    base3_products,
    default_product,
    disabled_standard_product,
    products,
)
from .product_category import default_product_category, product_categories
from .product_gender import default_product_gender
from .qr_code import (
    another_qr_code_with_box,
    default_qr_code,
    qr_code_for_in_transit_box,
    qr_code_for_not_delivered_box,
    qr_code_without_box,
)
from .shareable_link import expired_link, shareable_link, stock_overview_link
from .shipment import (
    another_shipment,
    canceled_shipment,
    completed_shipment,
    default_shipment,
    intra_org_shipment,
    receiving_shipment,
    sent_shipment,
    shipments,
)
from .shipment_detail import (
    another_shipment_detail,
    default_shipment_detail,
    prepared_shipment_detail,
    removed_shipment_detail,
)
from .size import another_size, default_size
from .size_range import another_size_range, default_size_range, size_ranges
from .standard_product import (
    another_standard_product,
    default_standard_product,
    measure_standard_product,
    newest_standard_product,
    standard_products,
    superceding_measure_standard_product,
)
from .tag import base1_active_tags, tags
from .transaction import another_transaction, default_transaction, relative_transaction
from .transfer_agreement import (
    default_transfer_agreement,
    expired_transfer_agreement,
    receiving_transfer_agreement,
    reviewed_transfer_agreement,
    transfer_agreements,
    unidirectional_transfer_agreement,
)
from .unit import gram_unit, liter_unit, mass_units, pound_unit, units
from .user import another_user, default_user, default_users, god_user

__all__ = [
    "another_base",
    "another_beneficiary",
    "another_box",
    "another_in_transit_box",
    "another_location",
    "another_marked_for_shipment_box",
    "another_not_delivered_box",
    "another_organisation",
    "another_product",
    "another_qr_code_with_box",
    "another_relative_beneficiary",
    "another_shipment",
    "another_shipment_detail",
    "another_size",
    "another_size_range",
    "another_standard_product",
    "another_transaction",
    "another_user",
    "base1_active_tags",
    "base1_classic_locations",
    "base1_products",
    "base1_undeleted_classic_locations",
    "base1_undeleted_products",
    "base3_products",
    "box_without_qr_code",
    "canceled_shipment",
    "completed_shipment",
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
    "default_location_boxes",
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
    "default_standard_product",
    "default_tracking_group",
    "default_transaction",
    "default_transfer_agreement",
    "default_user",
    "default_users",
    "deleted_base",
    "deleted_location",
    "disabled_standard_product",
    "distribution_spot",
    "distro_spot5_distribution_events",
    "distro_spot5_distribution_events_before_return_state",
    "distro_spot5_distribution_events_in_return_state",
    "expired_link",
    "expired_transfer_agreement",
    "god_user",
    "gram_unit",
    "in_transit_box",
    "inactive_organisation",
    "intra_org_shipment",
    "liter_unit",
    "lost_box",
    "marked_for_shipment_box",
    "mass_units",
    "measure_product_box",
    "measure_standard_product",
    "newest_standard_product",
    "non_default_box_state_location",
    "not_delivered_box",
    "null_box_state_location",
    "organisations",
    "packing_list_entry",
    "pound_unit",
    "prepared_shipment_detail",
    "product_categories",
    "products",
    "qr_code_for_in_transit_box",
    "qr_code_for_not_delivered_box",
    "qr_code_without_box",
    "receiving_shipment",
    "receiving_transfer_agreement",
    "relative_beneficiary",
    "relative_transaction",
    "removed_shipment_detail",
    "reviewed_transfer_agreement",
    "sent_shipment",
    "shareable_link",
    "shipments",
    "size_ranges",
    "standard_products",
    "stock_overview_link",
    "superceding_measure_standard_product",
    "tags",
    "transfer_agreements",
    "unidirectional_transfer_agreement",
    "units",
    "yet_another_location",
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
    "standard_product",
    "product",
    "size",
    "unit",
    "box",
    "beneficiary",
    "transfer_agreement",
    "shipment",
    "tag",
    "shareable_link",
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


# List of all Models in the database, cf. https://stackoverflow.com/a/43820902/3865876
MODELS = db.Model.__subclasses__()
