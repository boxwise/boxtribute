# from boxtribute_server.enums import DistributionEventState
from auth import create_jwt_payload
from utils import assert_successful_request


def test_distribution_event_tracking_group_statistics(
    read_only_client,
    mocker,
    default_base,
    default_box,
    default_product,
):
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        base_ids=[1, 2],
        organisation_id=1,
        user_id=1,
        permissions=[
            "base_1/base:read",
            "base_1/location:write",
            "base_1/distro_event:write",
            "base_1/stock:write",
            "base_1/stock:read",
            "base_1/unboxed_items_collection:write",
        ],
    )

    put_items_into_box = f"""mutation {{
      updateBox(
        updateInput: {{
          labelIdentifier: "{default_box["label_identifier"]}"
          numberOfItems: 10
        }}
        ) {{
          numberOfItems
        }}
    }}"""

    default_box_with_number_of_items = assert_successful_request(
        read_only_client, put_items_into_box
    )
    assert default_box_with_number_of_items["numberOfItems"] == 10

    create_distribution_spot_1_mutation = f"""mutation {{
      createDistributionSpot(
        creationInput: {{
          baseId: {default_base['id']}
          name: "Subotica LIDL"
          comment: "Test Comment"
        }}
      ){{
          id
          base {{
            id
          }}
        }}
    }}"""

    distribution_spot = assert_successful_request(
        read_only_client, create_distribution_spot_1_mutation
    )
    assert int(distribution_spot["base"]["id"]) == default_base["id"]

    create_distribution_event_mutation = f"""mutation {{
      createDistributionEvent(
        creationInput: {{
          distributionSpotId: {distribution_spot['id']}
          name: "Test Event"
          plannedStartDateTime: "2022-08-30T14:00:00.023Z"
          plannedEndDateTime: "2022-08-30T16:00:00.023Z"
        }}
      ) {{
        id
        name
        plannedStartDateTime
        plannedEndDateTime
      }}
    }}"""

    distribution_event_1 = assert_successful_request(
        read_only_client, create_distribution_event_mutation
    )

    assign_items_from_box_to_distro_event_1_mutation = f"""mutation {{
      moveItemsFromBoxToDistributionEvent(
        boxLabelIdentifier: {default_box['label_identifier']}
        distributionEventId: {distribution_event_1['id']}
        numberOfItems: 6
        ) {{
        id
        numberOfItems
        distributionEvent {{
            id
            name
            boxes {{
              product {{
                  name
              }}
            }}
            distributionSpot {{
              id
              name
            }}
        }}
      }}
    }}"""

    assert_successful_request(
        read_only_client, assign_items_from_box_to_distro_event_1_mutation
    )

    get_new_number_of_items_of_box = f"""query {{
      box(labelIdentifier: "{default_box['label_identifier']}") {{
        numberOfItems
      }}
    }}"""

    box_with_number_of_items = assert_successful_request(
        read_only_client, get_new_number_of_items_of_box
    )

    assert box_with_number_of_items["numberOfItems"] == 4

    # TODO: expect that box has less number of items now
    # TODO: create distro event 2
    # TODO: assign box with items for product x, size a to distro event 2
    # TODO: move distro event 1 to "ReturntoBase"
    # TODO: move distro event 2 to "ReturntoBase"
    # TODO: start distro return tracking
    # TODO: track returns for product x, size a
    # TODO: close distro return tracking
    # TODO: query distribution event tracking group statistics and do expectations

    # assert distribution_spot[""] == default_base['id']

    # create_distribution_event_1_mutation = f"""mutation {{
    #     createDistributionEvent(
    #         name: "Test Distribution Event 1",

    #     distributionSpotId: Int!
    #     name: String
    #     plannedStartDateTime: Datetime!
    #     plannedEndDateTime: Datetime
    #     """

    # print(create_distribution_event_1_mutation)

    # test_id = 1
    # query = f"""query DistributionEvent {{
    #             distributionEvent(id: {test_id}) {{
    #                 id
    #                 name
    #                 state
    #             }}
    #         }}"""

    # distribution_event = assert_successful_request(read_only_client, query)
    # expected_distribution_event = default_distribution_event
    # assert int(distribution_event["id"]) == expected_distribution_event["id"]
    # assert distribution_event["name"] == expected_distribution_event["name"]
    # assert distribution_event["state"] == DistributionEventState.Planning.name


# def test_update_selected_products_for_distribution_event_packing_list(
#     client, default_distribution_event, default_product, default_size, another_size
# ):
#     distribution_event_id = default_distribution_event["id"]
#     product_id = str(default_product["id"])
#     mutation = f"""mutation {{
#         updateSelectedProductsForDistributionEventPackingList(
#         distributionEventId: {distribution_event_id},
#         productIdsToAdd: [{product_id}],
#         productIdsToRemove: []
#         ) {{
#             packingListEntries {{
#                 product {{ id }}
#                 size {{ id }}
#                 numberOfItems
#             }}
#         }}
#     }}"""

#     mutation_result = assert_successful_request(client, mutation)
#     assert mutation_result == {
#         "packingListEntries": [
#             {
#                 "product": {"id": str(default_product["id"])},
#                 "size": {"id": str(default_size["id"])},
#                 "numberOfItems": 0,
#             },
#             {
#                 "product": {"id": str(default_product["id"])},
#                 "size": {"id": str(another_size["id"])},
#                 "numberOfItems": 0,
#             },
#         ],
#     }

#     mutation = f"""mutation {{
#         updateSelectedProductsForDistributionEventPackingList(
#         distributionEventId: {distribution_event_id},
#         productIdsToAdd: [],
#         productIdsToRemove: [{default_product['id']}]
#         ) {{ packingListEntries {{ id }} }}
#     }}"""

#     mutation_result = assert_successful_request(client, mutation)
#     assert mutation_result == {"packingListEntries": []}
