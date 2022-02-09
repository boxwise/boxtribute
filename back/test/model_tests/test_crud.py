import pytest
from boxtribute_server.enums import BoxState
from boxtribute_server.exceptions import BoxCreationFailed, RequestedResourceNotFound
from boxtribute_server.models.crud import (
    BOX_LABEL_IDENTIFIER_GENERATION_ATTEMPTS,
    create_box,
    create_qr_code,
    update_box,
)
from boxtribute_server.models.definitions.qr_code import QrCode


def test_create_qr_code_for_nonexisting_box():
    nr_qr_codes = len(QrCode.select())

    with pytest.raises(RequestedResourceNotFound):
        create_qr_code(box_label_identifier="zzz")

    # The nr of rows in the QrCode table should be unchanged
    assert nr_qr_codes == len(QrCode.select())


def test_box_label_identifier_generation(
    mocker, default_box, default_location, default_product, default_user, default_size
):
    rng_function = mocker.patch("random.choices")
    data = {
        "items": 10,
        "location_id": default_location["id"],
        "product_id": default_product["id"],
        "size": default_size["id"],
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
