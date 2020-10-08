from datetime import date, datetime

from playhouse.shortcuts import model_to_dict

from boxwise_flask.models.base import Base
from boxwise_flask.models.box import Box
from boxwise_flask.models.box_state import BoxState
from boxwise_flask.models.location import Location
from boxwise_flask.models.organisation import Organisation
from boxwise_flask.models.user import User


def test_box_model():
    user = {
        "name": "a",
        "email": "a@b.com",
        "valid_firstday": date.today(),
        "valid_lastday": date.today(),
        "lastlogin": datetime.now(),
        "lastaction": datetime.now(),
        "pass_": "pass",
        "is_admin": 0,
        "created": datetime.now(),
        "created_by": None,
        "modified": None,
        "modified_by": None,
        "resetpassword": None,
        "language": None,
        "deleted": None,
        "usergroup": None,
    }

    user_id = User.create(**user)

    box_state = {"id": 1, "label": 1}

    BoxState.create(**box_state)

    orginisation = {
        "id": 1,
        "label": 1,
        "created_by": user_id,
        # WHY CAN THIS NOT BE NULL AND ALL THE OTHER MODELS CAN BE?,
        "modified_by": user_id,
    }

    Organisation.create(**orginisation)
    Base.create(id=1, seq=1, organisation_id=orginisation["id"])
    location = {
        "box_state": box_state["id"],
        "base": 1,
        "container_stock": 0,
        "deleted": None,
        "is_donated": 0,
        "is_lost": 0,
        "is_market": 0,
        "is_scrap": 0,
        "label": 1,
        "seq": 1,
        "visible": 1,
    }

    Location.create(**location)

    new_box = {
        "id": 2,
        "box_id": "abc",
        "box_state": 1,
        "comments": "",
        "created": datetime.now(),
        "created_by": None,
        "deleted": datetime.now(),
        "items": "None",
        "location": 1,
    }

    created_box = Box.create(**new_box)
    queried_box = Box.get_box(created_box.box_id)
    queried_box_dict = model_to_dict(queried_box)
    if queried_box_dict != new_box:
        print("queried_box ", queried_box_dict)
        print()
        print()
        print()
        print()
        print()
        print("created_box ", new_box)

    assert queried_box_dict["id"] == new_box["id"]
    assert queried_box_dict["box_id"] == new_box["box_id"]
    assert queried_box_dict["box_state"]["id"] == new_box["box_state"]
    assert queried_box_dict["comments"] == new_box["comments"]
    assert queried_box_dict["created"] == new_box["created"]
    assert queried_box_dict["created_by"] == new_box["created_by"]
    assert queried_box_dict["deleted"] == new_box["deleted"]
    assert queried_box_dict["items"] == new_box["items"]
    assert queried_box_dict["location"]["id"] == new_box["location"]
    assert queried_box_dict["created_by"] == new_box["created_by"]
