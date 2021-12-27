import peewee
import pytest
from boxtribute_server.enums import BoxState, ShipmentState
from boxtribute_server.exceptions import BoxCreationFailed, RequestedResourceNotFound
from boxtribute_server.models.crud import (
    BOX_LABEL_IDENTIFIER_GENERATION_ATTEMPTS,
    create_box,
    create_qr_code,
    create_shipment,
    update_beneficiary,
    update_shipment,
)
from boxtribute_server.models.definitions.box import Box
from boxtribute_server.models.definitions.qr_code import QrCode
from boxtribute_server.models.definitions.shipment import Shipment
from boxtribute_server.models.definitions.shipment_detail import ShipmentDetail


def test_create_qr_code_for_nonexisting_box():
    nr_qr_codes = len(QrCode.select())

    with pytest.raises(RequestedResourceNotFound):
        create_qr_code({"box_label_identifier": "zzz"})

    # The nr of rows in the QrCode table should be unchanged
    assert nr_qr_codes == len(QrCode.select())


def test_create_box_with_insufficient_data():
    with pytest.raises(peewee.IntegrityError, match="foreign key constraint fails"):
        create_box({"created_by": 1})


def test_box_label_identifier_generation(
    mocker, default_box, default_location, default_product, default_user
):
    rng_function = mocker.patch("random.choices")
    data = {
        "items": 10,
        "location": default_location["id"],
        "product": default_product["id"],
        "created_by": default_user["id"],
        "comment": "",
    }

    # Verify that create_box() fails after several attempts if newly generated
    # identifier is never unique
    rng_function.return_value = default_box["label_identifier"]
    with pytest.raises(BoxCreationFailed):
        create_box(data)
    assert rng_function.call_count == BOX_LABEL_IDENTIFIER_GENERATION_ATTEMPTS

    # Verify that create_box() succeeds even if an existing identifier happens to be
    # generated once
    new_identifier = "11112222"
    side_effect = [default_box["label_identifier"], new_identifier]
    rng_function.reset_mock(return_value=True)
    rng_function.side_effect = side_effect
    new_box = create_box(data)
    assert rng_function.call_count == len(side_effect)
    assert new_box.label_identifier == new_identifier


def test_create_shipment(
    default_user, default_bases, default_transfer_agreement, default_box
):
    data = {
        "source_base_id": default_bases[1]["id"],
        "target_base_id": default_bases[3]["id"],
        "transfer_agreement_id": default_transfer_agreement["id"],
    }
    shipment = create_shipment(
        data,
        started_by={
            "id": default_user["id"],
            "organisation_id": default_transfer_agreement["source_organisation"],
        },
    )
    shipment = Shipment.select().where(Shipment.id == shipment.id).dicts().get()
    assert (
        shipment.items()
        >= {
            "source_base": default_bases[1]["id"],
            "target_base": default_bases[3]["id"],
            "transfer_agreement": default_transfer_agreement["id"],
            "state": ShipmentState.Preparing,
            "canceled_on": None,
            "canceled_by": None,
            "sent_on": None,
            "sent_by": None,
            "completed_on": None,
            "completed_by": None,
        }.items()
    )
    assert shipment["started_on"] is not None

    data = {
        "prepared_box_label_identifiers": [default_box["label_identifier"]],
        "id": shipment["id"],
        "user_id": default_user["id"],
    }
    shipment = update_shipment(**data)
    details = list(
        ShipmentDetail.select().where(ShipmentDetail.shipment == shipment.id).dicts()
    )
    assert len(details) == 1
    detail = details[0]
    assert (
        detail.items()
        >= {
            "shipment": shipment.id,
            "box": default_box["id"],
            "source_product": default_box["product"],
            "target_product": None,
            "source_location": default_box["location"],
            "target_location": None,
            "created_by": default_user["id"],
            "deleted_by": None,
            "deleted_on": None,
        }.items()
    )
    assert detail["created_on"] is not None

    box = Box.get_by_id(detail["box"])
    assert box.state_id == BoxState.MarkedForShipment.value


def test_update_beneficiary(default_beneficiary, default_bases):
    """Complement anything not yet covered by endpoint tests."""
    base_id = default_bases[2]["id"]
    data = {
        "id": default_beneficiary["id"],
        "base_id": base_id,
        "family_head_id": default_beneficiary["id"],
    }
    beneficiary = update_beneficiary(data)
    assert beneficiary.id == beneficiary.family_head_id
    assert beneficiary.base_id == base_id
