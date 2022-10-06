from boxtribute_server.enums import BoxState
from utils import assert_successful_request


def test_location_query(read_only_client, default_boxes, default_location):
    # Test case 8.1.6, 8.1.10
    query = f"""query {{
                location(id: "{default_location['id']}") {{
                    id
                    base {{ id }}
                    name
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
        "isShop": default_location["is_shop"],
        "isStockroom": default_location["is_stockroom"],
        "boxes": {"elements": [{"id": str(b["id"])} for b in default_boxes[1:]]},
        "defaultBoxState": BoxState(default_location["box_state"]).name,
        "createdOn": None,
        "createdBy": {"id": str(default_location["created_by"])},
    }


def test_locations_query(read_only_client, base1_classic_locations):
    # Test case 8.1.9
    query = """query { locations { name } }"""
    locations = assert_successful_request(read_only_client, query)
    assert locations == [{"name": loc["name"]} for loc in base1_classic_locations]
