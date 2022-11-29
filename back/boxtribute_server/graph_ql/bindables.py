"""Definition of ariadne bindables (special types for binding Python callables and
values to the GraphQL schema).
"""
from ariadne import InterfaceType, ObjectType, UnionType

from ..beneficiary.fields import beneficiary
from ..beneficiary.mutations import mutation as beneficiary_mutation
from ..beneficiary.queries import query as beneficiary_query
from ..box_transfer.agreement.fields import transfer_agreement
from ..box_transfer.agreement.mutations import mutation as transfer_agreement_mutation
from ..box_transfer.agreement.queries import query as transfer_agreement_query
from ..box_transfer.shipment.fields import shipment, shipment_detail
from ..box_transfer.shipment.mutations import mutation as shipment_mutation
from ..box_transfer.shipment.queries import query as shipment_query
from ..core.base.fields import base
from ..core.base.queries import query as base_query
from ..core.organisation.fields import organisation
from ..core.organisation.queries import query as organisation_query
from ..core.product_category.fields import product_category
from ..core.product_category.queries import query as product_category_query
from ..core.size_range.fields import size_range
from ..metrics.fields import metrics
from ..metrics.queries import query as metrics_query
from ..mobile_distribution.event.fields import distribution_event
from ..mobile_distribution.event.mutations import (
    mutation as distribution_event_mutation,
)
from ..mobile_distribution.event.queries import query as distribution_event_query
from ..mobile_distribution.mutations import mutation as mobile_distribution_mutation
from ..mobile_distribution.packing_list_entry.fields import packing_list_entry
from ..mobile_distribution.packing_list_entry.mutations import (
    mutation as packing_list_entry_mutation,
)
from ..mobile_distribution.packing_list_entry.queries import (
    query as packing_list_entry_query,
)
from ..mobile_distribution.spot.fields import distribution_spot
from ..mobile_distribution.spot.mutations import mutation as distribution_spot_mutation
from ..mobile_distribution.spot.queries import query as distribution_spot_query
from ..mobile_distribution.tracking_group.fields import (
    distribution_events_tracking_group,
)
from ..mobile_distribution.tracking_group.queries import (
    query as distribution_events_tracking_group_query,
)
from ..models.definitions.box import Box
from ..tag.fields import tag
from ..tag.mutations import mutation as tag_mutation
from ..tag.queries import query as tag_query
from ..user.fields import user
from ..user.queries import query as user_query
from ..warehouse.box.fields import box
from ..warehouse.box.mutations import mutation as box_mutation
from ..warehouse.box.queries import query as box_query
from ..warehouse.product.fields import product
from ..warehouse.product.queries import query as product_query

# Container for QueryTypes
query_types = (
    base_query,
    beneficiary_query,
    box_query,
    distribution_spot_query,
    distribution_event_query,
    distribution_events_tracking_group_query,
    metrics_query,
    transfer_agreement_query,
    organisation_query,
    packing_list_entry_query,
    product_category_query,
    product_query,
    shipment_query,
    tag_query,
    user_query,
)

# Container for MutationTypes
mutation_types = (
    beneficiary_mutation,
    box_mutation,
    distribution_spot_mutation,
    distribution_event_mutation,
    mobile_distribution_mutation,
    packing_list_entry_mutation,
    shipment_mutation,
    tag_mutation,
    transfer_agreement_mutation,
)

# Container for ObjectTypes (public as immutable tuple)
_object_types = [
    base,
    beneficiary,
    box,
    distribution_spot,
    distribution_event,
    distribution_events_tracking_group,
    metrics,
    organisation,
    packing_list_entry,
    product,
    product_category,
    shipment,
    shipment_detail,
    size_range,
    tag,
    transfer_agreement,
    user,
]


def _register_object_type(name):
    object_type = ObjectType(name)
    _object_types.append(object_type)
    return object_type


# ObjectTypes
classic_location = _register_object_type("ClassicLocation")
qr_code = _register_object_type("QrCode")
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
