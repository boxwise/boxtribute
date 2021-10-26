import peewee
import pytest
from boxwise_flask.exceptions import BoxCreationFailed, RequestedResourceNotFound
from boxwise_flask.models.crud import (
    BOX_LABEL_IDENTIFIER_GENERATION_ATTEMPTS,
    create_box,
    create_qr_code,
)
from boxwise_flask.models.qr_code import QrCode


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
