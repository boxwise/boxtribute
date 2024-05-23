from boxtribute_server.auth import CurrentUser
from boxtribute_server.business_logic.warehouse.location.crud import (
    create_location,
    update_location,
)
from boxtribute_server.db import db
from boxtribute_server.enums import BoxState
from utils import assert_successful_request


def test_location_query(
    read_only_client,
    default_boxes,
    default_location,
    default_location_boxes,
    distribution_spot,
):
    # Test case 8.1.6, 8.1.14
    query = f"""query {{
                location(id: "{default_location['id']}") {{
                    id
                    base {{ id }}
                    name
                    seq
                    isShop
                    isStockroom
                    boxes {{
                        elements {{ id }}
                    }}
                    defaultBoxState
                    createdOn
                    createdBy {{ id }}
                }}
            }}"""
    queried_location = assert_successful_request(read_only_client, query)
    assert queried_location == {
        "id": str(default_location["id"]),
        "base": {"id": str(default_location["base"])},
        "name": default_location["name"],
        "seq": default_location["seq"],
        "isShop": default_location["is_shop"],
        "isStockroom": default_location["is_stockroom"],
        "boxes": {"elements": [{"id": str(b["id"])} for b in default_location_boxes]},
        "defaultBoxState": BoxState(default_location["box_state"]).name,
        "createdOn": None,
        "createdBy": {"id": str(default_location["created_by"])},
    }

    query = f"""query {{ location(id: "{distribution_spot['id']}") {{ id }} }}"""
    queried_location = assert_successful_request(read_only_client, query)
    assert queried_location is None


def test_locations_query(read_only_client, base1_classic_locations):
    # Test case 8.1.13
    query = """query { locations { name } }"""
    locations = assert_successful_request(read_only_client, query)
    assert locations == [{"name": loc["name"]} for loc in base1_classic_locations]


def test_crud(client, default_base):
    from flask import g

    g.user = CurrentUser(id=8)
    name = "test location"
    base_id = default_base["id"]
    location = create_location(
        name=name,
        base_id=base_id,
        user_id=8,
    )
    # assert location.box_state == BoxState.InStock
    assert location.box_state_id == BoxState.InStock.value
    assert location.box_state_id == BoxState.InStock

    name = "new test location"
    location = update_location(id=location.id, name=name, user_id=8)
    assert location.name == name
    description = "new"
    location = update_location(id=location.id, description=description, user_id=8)
    assert location.description == description
    box_state = BoxState.Lost
    location = update_location(id=location.id, box_state=box_state, user_id=8)
    assert location.box_state_id == box_state
    is_stockroom = True
    location = update_location(id=location.id, is_stockroom=is_stockroom, user_id=8)
    assert location.is_stockroom
    is_shop = True
    location = update_location(id=location.id, is_shop=is_shop, user_id=8)
    assert location.is_shop
    db.database.close()

    query = f"""query {{ location(id: {location.id}) {{
                    name
                    base {{ id }}
                    defaultBoxState
                    isShop
                    createdBy {{ id }}
                }} }}"""
    location = assert_successful_request(client, query)
    assert location == {
        "name": name,
        "base": {"id": str(base_id)},
        "defaultBoxState": box_state.name,
        "isShop": is_shop,
        "createdBy": {"id": "8"},
    }
