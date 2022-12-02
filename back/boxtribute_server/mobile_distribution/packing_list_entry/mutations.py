from ariadne import MutationType, convert_kwargs_to_snake_case
from flask import g

from ...authz import authorize
from ...models.definitions.packing_list_entry import PackingListEntry
from ..crud import update_packing_list_entry

mutation = MutationType()


@mutation.field("updatePackingListEntry")
@convert_kwargs_to_snake_case
def resolve_update_packing_list_entry(*_, packing_list_entry_id, number_of_items):
    entry = PackingListEntry.get_by_id(packing_list_entry_id)
    authorize(permission="packing_list_entry:write", base_id=entry.product.base_id)
    return update_packing_list_entry(
        user_id=g.user.id,
        packing_list_entry_id=packing_list_entry_id,
        number_of_items=number_of_items,
    )
