from ariadne import QueryType

from ....authz import authorize
from ....models.definitions.packing_list_entry import PackingListEntry
from ....models.definitions.product import Product

query = QueryType()


@query.field("packingListEntry")
def resolve_packing_list_entry(*_, id):
    entry = (
        PackingListEntry.select().join(Product).where(PackingListEntry.id == id).get()
    )
    authorize(permission="packing_list_entry:read", base_id=entry.product.base_id)
    return entry
