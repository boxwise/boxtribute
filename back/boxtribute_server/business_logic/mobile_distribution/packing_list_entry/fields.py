from ariadne import ObjectType

from ....authz import authorize
from ....models.definitions.box import Box
from ....models.definitions.unboxed_items_collection import UnboxedItemsCollection

packing_list_entry = ObjectType("PackingListEntry")


@packing_list_entry.field("matchingPackedItemsCollections")
def resolve_packing_list_entry_matching_packed_items_collections(entry_obj, _):
    authorize(permission="stock:read", base_id=entry_obj.product.base_id)
    boxes = Box.select().where(
        Box.distribution_event == entry_obj.distribution_event,
        Box.product == entry_obj.product,
        Box.size == entry_obj.size,
    )
    unboxed_items_collections = UnboxedItemsCollection.select().where(
        UnboxedItemsCollection.distribution_event == entry_obj.distribution_event,
        UnboxedItemsCollection.product == entry_obj.product,
        UnboxedItemsCollection.size == entry_obj.size,
    )
    return list(boxes) + list(unboxed_items_collections)
