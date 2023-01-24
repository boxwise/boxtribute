"""Definition of ariadne bindables (special types for binding Python callables and
values to the GraphQL schema).
"""
from ariadne import InterfaceType, UnionType

from ..business_logic.beneficiary.fields import beneficiary
from ..business_logic.beneficiary.mutations import mutation as beneficiary_mutation
from ..business_logic.beneficiary.queries import query as beneficiary_query
from ..business_logic.box_transfer.agreement.fields import transfer_agreement
from ..business_logic.box_transfer.agreement.mutations import (
    mutation as transfer_agreement_mutation,
)
from ..business_logic.box_transfer.agreement.queries import (
    query as transfer_agreement_query,
)
from ..business_logic.box_transfer.shipment.fields import shipment, shipment_detail
from ..business_logic.box_transfer.shipment.mutations import (
    mutation as shipment_mutation,
)
from ..business_logic.box_transfer.shipment.queries import query as shipment_query
from ..business_logic.core.base.fields import base
from ..business_logic.core.base.queries import query as base_query
from ..business_logic.core.organisation.fields import organisation
from ..business_logic.core.organisation.queries import query as organisation_query
from ..business_logic.core.product_category.fields import product_category
from ..business_logic.core.product_category.queries import (
    query as product_category_query,
)
from ..business_logic.core.size_range.fields import size_range
from ..business_logic.metrics.fields import metrics
from ..business_logic.metrics.queries import query as metrics_query
from ..business_logic.mobile_distribution.event.fields import distribution_event
from ..business_logic.mobile_distribution.event.mutations import (
    mutation as distribution_event_mutation,
)
from ..business_logic.mobile_distribution.event.queries import (
    query as distribution_event_query,
)
from ..business_logic.mobile_distribution.mutations import (
    mutation as mobile_distribution_mutation,
)
from ..business_logic.mobile_distribution.packing_list_entry.fields import (
    packing_list_entry,
)
from ..business_logic.mobile_distribution.packing_list_entry.mutations import (
    mutation as packing_list_entry_mutation,
)
from ..business_logic.mobile_distribution.packing_list_entry.queries import (
    query as packing_list_entry_query,
)
from ..business_logic.mobile_distribution.spot.fields import distribution_spot
from ..business_logic.mobile_distribution.spot.mutations import (
    mutation as distribution_spot_mutation,
)
from ..business_logic.mobile_distribution.spot.queries import (
    query as distribution_spot_query,
)
from ..business_logic.mobile_distribution.tracking_group.fields import (
    distribution_events_tracking_group,
)
from ..business_logic.mobile_distribution.tracking_group.queries import (
    query as distribution_events_tracking_group_query,
)
from ..business_logic.tag.fields import tag
from ..business_logic.tag.mutations import mutation as tag_mutation
from ..business_logic.tag.queries import query as tag_query
from ..business_logic.user.fields import user
from ..business_logic.user.queries import query as user_query
from ..business_logic.warehouse.box.fields import box, unboxed_items_collection
from ..business_logic.warehouse.box.mutations import mutation as box_mutation
from ..business_logic.warehouse.box.queries import query as box_query
from ..business_logic.warehouse.location.fields import classic_location
from ..business_logic.warehouse.location.queries import query as location_query
from ..business_logic.warehouse.product.fields import product
from ..business_logic.warehouse.product.queries import query as product_query
from ..business_logic.warehouse.qr_code.fields import qr_code
from ..business_logic.warehouse.qr_code.mutations import mutation as qr_code_mutation
from ..business_logic.warehouse.qr_code.queries import query as qr_code_query
from ..models.definitions.box import Box

# Container for QueryTypes
query_types = (
    base_query,
    beneficiary_query,
    box_query,
    distribution_spot_query,
    distribution_event_query,
    distribution_events_tracking_group_query,
    location_query,
    metrics_query,
    transfer_agreement_query,
    organisation_query,
    packing_list_entry_query,
    product_category_query,
    product_query,
    qr_code_query,
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
    qr_code_mutation,
    shipment_mutation,
    tag_mutation,
    transfer_agreement_mutation,
)

# Container for ObjectTypes
object_types = (
    base,
    beneficiary,
    box,
    classic_location,
    distribution_spot,
    distribution_event,
    distribution_events_tracking_group,
    metrics,
    organisation,
    packing_list_entry,
    product,
    product_category,
    qr_code,
    shipment,
    shipment_detail,
    size_range,
    tag,
    transfer_agreement,
    unboxed_items_collection,
    user,
)


# UnionTypes and InterfaceTypes
def resolve_taggable_resource_type(obj, *_):
    if isinstance(obj, Box):
        return "Box"
    return "Beneficiary"


def resolve_location_type(obj, *_):
    return obj.type.name


def resolve_items_collection_type(obj, *_):
    if isinstance(obj, Box):
        return "Box"
    return "UnboxedItemsCollection"


union_types = (UnionType("TaggableResource", resolve_taggable_resource_type),)
interface_types = (
    InterfaceType("Location", resolve_location_type),
    InterfaceType("ItemsCollection", resolve_items_collection_type),
)
