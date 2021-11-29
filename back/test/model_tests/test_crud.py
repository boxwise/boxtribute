from datetime import datetime

import peewee
import pytest
from boxtribute_server.exceptions import BoxCreationFailed, RequestedResourceNotFound
from boxtribute_server.models.crud import (
    BOX_LABEL_IDENTIFIER_GENERATION_ATTEMPTS,
    create_box,
    create_qr_code,
    create_transfer_agreement,
)
from boxtribute_server.models.enums import TransferAgreementState, TransferAgreementType
from boxtribute_server.models.qr_code import QrCode
from boxtribute_server.models.transfer_agreement import TransferAgreement


def test_create_qr_code_for_nonexisting_box():
    nr_qr_codes = len(QrCode.select())

    with pytest.raises(RequestedResourceNotFound):
        create_qr_code({"box_label_identifier": "zzz"})

    # The nr of rows in the QrCode table should be unchanged
    assert nr_qr_codes == len(QrCode.select())


def test_create_box_with_insufficient_data():
    with pytest.raises(peewee.IntegrityError, match="NOT NULL constraint failed"):
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
    rng_function.return_value = default_box["box_label_identifier"]
    with pytest.raises(BoxCreationFailed):
        create_box(data)
    assert rng_function.call_count == BOX_LABEL_IDENTIFIER_GENERATION_ATTEMPTS

    # Verify that create_box() succeeds even if an existing identifier happens to be
    # generated once
    new_identifier = "11112222"
    side_effect = [default_box["box_label_identifier"], new_identifier]
    rng_function.reset_mock(return_value=True)
    rng_function.side_effect = side_effect
    new_box = create_box(data)
    assert rng_function.call_count == len(side_effect)
    assert new_box.box_label_identifier == new_identifier


def test_create_transfer_agreement(
    default_user, default_organisation, another_organisation
):
    data = {
        "source_organisation_id": default_organisation["id"],
        "target_organisation_id": another_organisation["id"],
        "valid_from": None,
        "valid_until": None,
        "requested_by": default_user["id"],
        "type": TransferAgreementType.UNIDIRECTIONAL.value,
    }
    agreement = create_transfer_agreement(data.copy())

    def fetch_agreement(id):
        return (
            TransferAgreement.select().where(TransferAgreement.id == id).dicts().get()
        )

    agreement = fetch_agreement(agreement.id)  # fetch for effective timestamp fields

    assert (
        agreement.items()
        >= {
            "source_organisation": default_organisation["id"],
            "target_organisation": another_organisation["id"],
            "state": TransferAgreementState.UNDER_REVIEW.value,
            "type": TransferAgreementType.UNIDIRECTIONAL.value,
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

    valid_from = datetime(2021, 11, 1)
    comment = "important"
    data["valid_from"] = valid_from
    data["valid_until"] = datetime(2021, 12, 31)
    data["comment"] = comment
    agreement = create_transfer_agreement(data)
    agreement = fetch_agreement(agreement.id)

    assert agreement["valid_from"] == valid_from
    assert agreement["valid_until"] is not None
    assert agreement["comment"] == comment
