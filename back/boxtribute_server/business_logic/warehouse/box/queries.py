from ariadne import QueryType

from ....authz import authorize
from ....enums import BoxState
from ....models.definitions.box import Box
from ....models.definitions.location import Location
from ....models.definitions.shipment import Shipment
from ....models.definitions.shipment_detail import ShipmentDetail

query = QueryType()


@query.field("box")
def resolve_box(*_, label_identifier):
    box = (
        Box.select(Box, Location)
        .join(Location)
        .where(Box.label_identifier == label_identifier)
        .get()
    )

    if box.state_id in [BoxState.InTransit, BoxState.Receiving]:
        # Users of both source and target base of the underlying shipment are allowed to
        # view InTransit or Receiving boxes
        detail = (
            ShipmentDetail.select(Shipment)
            .join(Shipment)
            .where(
                ShipmentDetail.box_id == box.id,
                ShipmentDetail.removed_on.is_null(),
                ShipmentDetail.received_on.is_null(),
            )
        ).get()
        authz_kwargs = {
            "base_ids": [detail.shipment.source_base_id, detail.shipment.target_base_id]
        }

    else:
        authz_kwargs = {"base_id": box.location.base_id}

    authorize(permission="stock:read", **authz_kwargs)
    return box
