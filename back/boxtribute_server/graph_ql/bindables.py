"""Definition of ariadne bindables (special types for binding Python callables and
values to the GraphQL schema).
"""
from ariadne import InterfaceType, ObjectType, UnionType

from ..beneficiary.fields import beneficiary
from ..beneficiary.mutations import mutation as beneficiary_mutation
from ..beneficiary.queries import query as beneficiary_query
from ..core.size_range.fields import size_range
from ..metrics.fields import metrics
from ..metrics.queries import query as metrics_query
from ..models.definitions.box import Box
from ..user.fields import user
from ..user.queries import query as user_query

# Container for QueryTypes
query_types = (beneficiary_query, metrics_query, user_query)

# Container for MutationTypes
mutation_types = (beneficiary_mutation,)

# Container for ObjectTypes (public as immutable tuple)
_object_types = [beneficiary, metrics, size_range, user]


def _register_object_type(name):
    object_type = ObjectType(name)
    _object_types.append(object_type)
    return object_type


# ObjectTypes
base = _register_object_type("Base")
box = _register_object_type("Box")
distribution_event = _register_object_type("DistributionEvent")
distribution_spot = _register_object_type("DistributionSpot")
distribution_events_tracking_group = _register_object_type(
    "DistributionEventsTrackingGroup"
)
classic_location = _register_object_type("ClassicLocation")
organisation = _register_object_type("Organisation")
packing_list_entry = _register_object_type("PackingListEntry")
product = _register_object_type("Product")
product_category = _register_object_type("ProductCategory")
qr_code = _register_object_type("QrCode")
shipment = _register_object_type("Shipment")
shipment_detail = _register_object_type("ShipmentDetail")
tag = _register_object_type("Tag")
transfer_agreement = _register_object_type("TransferAgreement")
unboxed_items_collection = _register_object_type("UnboxedItemsCollection")

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
