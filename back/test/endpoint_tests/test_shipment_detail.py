from utils import assert_bad_user_input


def assert_bad_user_input_when_updating_shipment_detail(
    client, *, detail_id, target_location_id=None, target_product_id=None
):
    update_input = f"id: {detail_id}"
    if target_location_id is not None:
        update_input += f", targetLocationId: {target_location_id}"
    if target_product_id is not None:
        update_input += f", targetProductId: {target_product_id}"
    mutation = f"""mutation {{ updateShipmentDetail(updateInput: {{ {update_input} }})
                {{ id }} }}"""
    assert_bad_user_input(client, mutation)
