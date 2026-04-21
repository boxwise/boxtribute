from .definitions.base import Base
from .definitions.beneficiary import Beneficiary
from .definitions.box import Box
from .definitions.box_state import BoxState
from .definitions.distribution_event import DistributionEvent
from .definitions.distribution_event_tracking_log_entry import (
    DistributionEventTrackingLogEntry,
)
from .definitions.distribution_events_tracking_group import (
    DistributionEventsTrackingGroup,
)
from .definitions.history import DbChangeHistory
from .definitions.language import Language
from .definitions.location import Location
from .definitions.organisation import Organisation
from .definitions.packing_list_entry import PackingListEntry
from .definitions.product import Product
from .definitions.product_category import ProductCategory
from .definitions.product_gender import ProductGender
from .definitions.qr_code import QrCode
from .definitions.service import Service
from .definitions.services_relation import ServicesRelation
from .definitions.shareable_link import ShareableLink
from .definitions.shipment import Shipment
from .definitions.shipment_detail import ShipmentDetail
from .definitions.size import Size
from .definitions.size_range import SizeRange
from .definitions.size_range_size import SizeRangeSize
from .definitions.standard_product import StandardProduct
from .definitions.tag import Tag
from .definitions.tags_relation import TagsRelation
from .definitions.transaction import Transaction
from .definitions.transfer_agreement import TransferAgreement
from .definitions.transfer_agreement_detail import TransferAgreementDetail
from .definitions.unboxed_items_collection import UnboxedItemsCollection
from .definitions.unit import Unit
from .definitions.user import User
from .definitions.x_beneficiary_language import XBeneficiaryLanguage

# All Model subclasses MUST be added to this list
# We use explicit listing rather than using Model.__subclasses__(). The latter has the
# side-effect of only becoming effective once all models derived from Model are imported
# into the current context. This is a surprising effect that we don't want to rely on.
# Example:
# - running Model.__subclasses__() in a REPL shows an empty list
# - importing any model definition and getting all subclasses will show the
#   imported definition and its dependencies
# - importing anything from the routes module and getting all subclasses will show all
#   definitions (because the module imports from graph_ql.schema and graph_ql.bindables
#   down the line)
MODELS = (
    Base,
    Beneficiary,
    Box,
    BoxState,
    DistributionEvent,
    DistributionEventTrackingLogEntry,
    DistributionEventsTrackingGroup,
    DbChangeHistory,
    Language,
    Location,
    Organisation,
    PackingListEntry,
    Product,
    ProductCategory,
    ProductGender,
    QrCode,
    Service,
    ServicesRelation,
    ShareableLink,
    Shipment,
    ShipmentDetail,
    Size,
    SizeRange,
    SizeRangeSize,
    StandardProduct,
    Tag,
    TagsRelation,
    Transaction,
    TransferAgreement,
    TransferAgreementDetail,
    UnboxedItemsCollection,
    Unit,
    User,
    XBeneficiaryLanguage,
)
