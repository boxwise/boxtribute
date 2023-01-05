from ariadne import QueryType

from ...authz import authorize, authorized_bases_filter
from ...models.definitions.shipment import Shipment

query = QueryType()


@query.field("shipment")
def resolve_shipment(*_, id):
    shipment = Shipment.get_by_id(id)
    authorize(
        permission="shipment:read",
        base_ids=[shipment.source_base_id, shipment.target_base_id],
    )
    return shipment


@query.field("shipments")
def resolve_shipments(*_):
    return Shipment.select().orwhere(
        authorized_bases_filter(Shipment, base_fk_field_name="source_base"),
        authorized_bases_filter(Shipment, base_fk_field_name="target_base"),
    )
