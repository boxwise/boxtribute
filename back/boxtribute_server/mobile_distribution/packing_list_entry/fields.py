from ariadne import ObjectType

from ...authz import authorize
from ...models.definitions.box import Box
from ...models.definitions.unboxed_items_collection import UnboxedItemsCollection

packing_list_entry = ObjectType("PackingListEntry")


@packing_list_entry.field("matchingPackedItemsCollections")
def resolve_packing_list_entry_matching_packed_items_collections(obj, *_):
    authorize(permission="stock:read", base_id=obj.product.base_id)
    distribution_event_id = obj.distribution_event
    boxes = Box.select().where(
        Box.distribution_event == distribution_event_id,
        Box.product == obj.product,
        Box.size == obj.size,
    )
    unboxed_items_colletions = UnboxedItemsCollection.select().where(
        UnboxedItemsCollection.distribution_event == distribution_event_id,
        UnboxedItemsCollection.product == obj.product,
        UnboxedItemsCollection.size == obj.size,
    )
    return list(boxes) + list(unboxed_items_colletions)
