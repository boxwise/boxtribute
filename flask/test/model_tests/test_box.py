from datetime import datetime

from playhouse.shortcuts import model_to_dict

from boxwise_flask.models.box import Box


def test_box_model():

    new_box = {
        "id": 2,
        "box_id": "abc",
        "product_id": 1,
        "size_id": 2,
        "items": 3,
        "location_id": 4,
        "comments": "",
        "qr_id": 1,
        "created": datetime.now(),
        "created_by": "",
        "box_state_id": 1,
    }

    a = Box.create(**new_box)
    x = Box.get_box(a.box_id)
    as_dict = model_to_dict(x)
    if as_dict != new_box:
        print("output", as_dict)
        print("input", new_box)

    assert as_dict == new_box
