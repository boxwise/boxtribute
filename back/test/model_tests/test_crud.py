from datetime import date, datetime

import pytest
from boxtribute_server.enums import (
    BoxState,
    ShipmentState,
    TransferAgreementState,
    TransferAgreementType,
)
from boxtribute_server.exceptions import (
    BoxCreationFailed,
    InvalidTransferAgreement,
    RequestedResourceNotFound,
)
from boxtribute_server.models.crud import (
    BOX_LABEL_IDENTIFIER_GENERATION_ATTEMPTS,
    create_box,
    create_qr_code,
    create_shipment,
    create_transfer_agreement,
    update_beneficiary,
    update_box,
    update_shipment,
)
from boxtribute_server.models.definitions.box import Box
from boxtribute_server.models.definitions.qr_code import QrCode
from boxtribute_server.models.definitions.shipment import Shipment
from boxtribute_server.models.definitions.shipment_detail import ShipmentDetail
from boxtribute_server.models.definitions.transfer_agreement import TransferAgreement
from boxtribute_server.models.definitions.transfer_agreement_detail import (
    TransferAgreementDetail,
)


def test_create_qr_code_for_nonexisting_box():
    nr_qr_codes = len(QrCode.select())

    with pytest.raises(RequestedResourceNotFound):
        create_qr_code({"box_label_identifier": "zzz"})

    # The nr of rows in the QrCode table should be unchanged
    assert nr_qr_codes == len(QrCode.select())


def test_box_label_identifier_generation(
    mocker, default_box, default_location, default_product, default_user
):
    rng_function = mocker.patch("random.choices")
    data = {
        "items": 10,
        "location_id": default_location["id"],
        "product_id": default_product["id"],
        "created_by_id": default_user["id"],
    }

    # Verify that create_box() fails after several attempts if newly generated
    # identifier is never unique
    rng_function.return_value = default_box["label_identifier"]
    with pytest.raises(BoxCreationFailed):
        create_box(**data)
    assert rng_function.call_count == BOX_LABEL_IDENTIFIER_GENERATION_ATTEMPTS

    # Verify that create_box() succeeds even if an existing identifier happens to be
    # generated once
    new_identifier = "11112222"
    side_effect = [default_box["label_identifier"], new_identifier]
    rng_function.reset_mock(return_value=True)
    rng_function.side_effect = side_effect
    new_box = create_box(**data)
    assert rng_function.call_count == len(side_effect)
    assert new_box.label_identifier == new_identifier


def test_create_transfer_agreement(
    default_user, default_organisation, another_organisation
):
    data = {
        "source_organisation_id": default_organisation["id"],
        "target_organisation_id": another_organisation["id"],
        "valid_from": None,
        "valid_until": None,
        "requested_by": default_user["id"],
        "type": TransferAgreementType.Unidirectional.value,
        "source_base_ids": None,
    }
    agreement = create_transfer_agreement(data.copy())

    def fetch_agreement(id):
        return (
            TransferAgreement.select().where(TransferAgreement.id == id).dicts().get()
        )

    agreement = fetch_agreement(agreement.id)  # fetch for effective timestamp fields

    def fetch_details(agreement):
        return list(
            TransferAgreementDetail.select()
            .where(TransferAgreementDetail.transfer_agreement == agreement["id"])
            .dicts()
        )

    details = fetch_details(agreement)

    assert (
        agreement.items()
        >= {
            "source_organisation": default_organisation["id"],
            "target_organisation": another_organisation["id"],
            "state": TransferAgreementState.UnderReview.value,
            "type": TransferAgreementType.Unidirectional.value,
            "requested_by": default_user["id"],
            "accepted_by": None,
            "accepted_on": None,
            "terminated_by": None,
            "terminated_on": None,
            "valid_until": None,
            "comment": "",
        }.items()
    )
    assert agreement["requested_on"] == agreement["valid_from"]
    assert len(details) == 1
    detail = details[0]
    assert (
        detail.items()
        >= {
            "transfer_agreement": agreement["id"],
            "source_base": None,
            "target_base": None,
        }.items()
    )

    comment = "important"
    data["valid_from"] = date(2021, 11, 1)
    data["valid_until"] = date(2021, 12, 31)
    data["timezone"] = "America/New_York"
    data["comment"] = comment
    data["source_base_ids"] = [1, 2]
    data["target_base_ids"] = [3]
    agreement = create_transfer_agreement(data)
    agreement = fetch_agreement(agreement.id)
    details = fetch_details(agreement)

    assert agreement["valid_from"] == datetime(2021, 11, 1, 4)
    assert agreement["valid_until"] == datetime(2022, 1, 1, 4, 59, 59)
    assert agreement["comment"] == comment
    assert len(details) == 2
    detail = details[-1]
    assert (
        detail.items()
        >= {
            "transfer_agreement": agreement["id"],
            "source_base": 2,
            "target_base": 3,
        }.items()
    )


def test_create_shipment(
    default_user, default_bases, default_transfer_agreement, default_box
):
    data = {
        "source_base_id": default_bases[1]["id"],
        "target_base_id": default_bases[3]["id"],
        "transfer_agreement_id": default_transfer_agreement["id"],
        "started_by": default_user["id"],
    }
    shipment = create_shipment(data)
    shipment = Shipment.select().where(Shipment.id == shipment.id).dicts().get()
    assert (
        shipment.items()
        >= {
            "source_base": default_bases[1]["id"],
            "target_base": default_bases[3]["id"],
            "transfer_agreement": default_transfer_agreement["id"],
            "state": ShipmentState.Preparing.value,
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
        "created_by": default_user["id"],
    }
    shipment = update_shipment(data)
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


def test_create_shipment_from_expired_agreement(
    default_user, default_bases, expired_transfer_agreement
):
    data = {
        "source_base_id": default_bases[1]["id"],
        "target_base_id": default_bases[3]["id"],
        "transfer_agreement_id": expired_transfer_agreement["id"],
        "started_by": default_user["id"],
    }
    with pytest.raises(InvalidTransferAgreement):
        create_shipment(data)


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


def test_boxstate_update(
    default_user,
    default_product,
    null_box_state_location,
    non_default_box_state_location,
):
    box = create_box(
        product_id=default_product["id"],
        created_by_id=default_user["id"],
        location_id=null_box_state_location["id"],
    )

    assert box.state.id == BoxState.InStock

    box = update_box(
        {
            "location_id": non_default_box_state_location["id"],
            "label_identifier": box.label_identifier,
        }
    )
    assert box.state.id == non_default_box_state_location["box_state"]

    box = update_box(
        {
            "location_id": null_box_state_location["id"],
            "label_identifier": box.label_identifier,
        }
    )
    assert box.state.id != BoxState.InStock
    assert box.state.id == non_default_box_state_location["box_state"]

    box2 = create_box(
        product_id=default_product["id"],
        created_by_id=default_user["id"],
        location_id=non_default_box_state_location["id"],
    )

    assert box2.state.id == non_default_box_state_location["box_state"]
