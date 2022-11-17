"""Definition of ariadne bindables (special types for binding Python callables and
values to the GraphQL schema).
"""
from ariadne import InterfaceType, ObjectType, UnionType

from ..models.definitions.box import Box

# Container for QueryTypes
query_types = tuple()

# Container for MutationTypes
mutation_types = tuple()

# Container for ObjectTypes (public as immutable tuple)
_object_types = []


def _register_object_type(name):
    object_type = ObjectType(name)
    _object_types.append(object_type)
    return object_type


# ObjectTypes
base = _register_object_type("Base")
beneficiary = _register_object_type("Beneficiary")
box = _register_object_type("Box")
distribution_event = _register_object_type("DistributionEvent")
distribution_spot = _register_object_type("DistributionSpot")
distribution_events_tracking_group = _register_object_type(
    "DistributionEventsTrackingGroup"
)
classic_location = _register_object_type("ClassicLocation")
metrics = _register_object_type("Metrics")
organisation = _register_object_type("Organisation")
packing_list_entry = _register_object_type("PackingListEntry")
product = _register_object_type("Product")
product_category = _register_object_type("ProductCategory")
qr_code = _register_object_type("QrCode")
shipment = _register_object_type("Shipment")
shipment_detail = _register_object_type("ShipmentDetail")
size_range = _register_object_type("SizeRange")
tag = _register_object_type("Tag")
transfer_agreement = _register_object_type("TransferAgreement")
unboxed_items_collection = _register_object_type("UnboxedItemsCollection")
user = _register_object_type("User")

object_types = tuple(_object_types)


# UnionTypes and InterfaceTypes
def resolve_taggable_resource_type(obj, *_):
    if isinstance(obj, Box):
        return "Box"
    return "Beneficiary"


def resolve_location_type(obj, *_):
    return obj.type.name


def resolve_items_collection_type(obj, *_):
    return obj.items_collection_type


union_types = (UnionType("TaggableResource", resolve_taggable_resource_type),)
interface_types = (
    InterfaceType("Location", resolve_location_type),
    InterfaceType("ItemsCollection", resolve_items_collection_type),
)
