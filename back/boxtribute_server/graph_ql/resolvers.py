"""GraphQL resolver functionality"""
from ariadne import MutationType, QueryType

from ..authz import authorize
from .bindables import beneficiary, unboxed_items_collection

query = QueryType()
mutation = MutationType()


@unboxed_items_collection.field("product")
def resolve_box_product(obj, info):
    return info.context["product_loader"].load(obj.product_id)


@beneficiary.field("base")
def resolve_resource_base(obj, _):
    authorize(permission="base:read", base_id=obj.base_id)
    return obj.base
