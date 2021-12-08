from boxtribute_server.enums import ShipmentState
from boxtribute_server.models.definitions.shipment import Shipment


def test_shipment(
    default_shipment, default_transfer_agreement, default_bases, default_user
):
    shipment = Shipment.get_by_id(default_shipment["id"])

    assert shipment.source_base.id == default_bases[1]["id"]
    assert shipment.source_base_id == default_bases[1]["id"]
    assert shipment.target_base.id == default_bases[3]["id"]
    assert shipment.transfer_agreement_id == default_transfer_agreement["id"]
    assert shipment.state == ShipmentState.PREPARING.value
    assert shipment.started_by_id == default_user["id"]
