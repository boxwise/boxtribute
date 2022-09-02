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

    distribution_spot_1 = assert_successful_request(
        read_only_client, create_distribution_spot_1_mutation
    )
    assert int(distribution_spot_1["base"]["id"]) == default_base["id"]

    create_distribution_event_1_mutation = f"""mutation {{
      createDistributionEvent(
        creationInput: {{
          distributionSpotId: {distribution_spot_1['id']}
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
        read_only_client, create_distribution_event_1_mutation
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

    create_distribution_spot_2_mutation = f"""mutation {{
      createDistributionSpot(
        creationInput: {{
          baseId: {default_base['id']}
          name: "Horgos River"
          comment: "Test Comment 2"
        }}
      ){{
          id
          base {{
            id
          }}
        }}
    }}"""

    distribution_spot_2 = assert_successful_request(
        read_only_client, create_distribution_spot_2_mutation
    )
    assert int(distribution_spot_2["base"]["id"]) == default_base["id"]

    create_distribution_event_2_mutation = f"""mutation {{
      createDistributionEvent(
        creationInput: {{
          distributionSpotId: {distribution_spot_2['id']}
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

    distribution_event_2 = assert_successful_request(
        read_only_client, create_distribution_event_2_mutation
    )

    assign_box_to_distro_event_2_mutation = f"""mutation {{
    assignBoxToDistributionEvent(
      boxLabelIdentifier: {default_box['label_identifier']}
      distributionEventId: {distribution_event_2['id']}
    ) {{
        id
        distributionEvent {{
          id
          name
          distributionSpot {{
            name
          }}
        }}
      }}
    }}"""

    assert_successful_request(read_only_client, assign_box_to_distro_event_2_mutation)

    # TODO: expect (and implement) that the state of the
    # box is "assigned_to_distribution_event"

    move_distro_event_1_to_state_return_to_base = f"""mutation {{
      changeDistributionEventState(
        distributionEventId: {distribution_event_1['id']}
        newState: ReturnedFromDistribution
      ) {{
        id
        state
      }}
    }}"""

    assert_successful_request(
        read_only_client, move_distro_event_1_to_state_return_to_base
    )

    move_distro_event_2_to_state_return_to_base = f"""mutation {{
      changeDistributionEventState(
        distributionEventId: {distribution_event_2['id']}
        newState: ReturnedFromDistribution
      ) {{
        id
        state
      }}
    }}"""

    assert_successful_request(
        read_only_client, move_distro_event_2_to_state_return_to_base
    )

    # (TODO: expect that there are exactly two distro events available
    # for return trackings)

    start_distribution_events_tracking_group_mutation = f"""mutation {{
    startDistributionEventsTrackingGroup(
      distributionEventIds: ["{distribution_event_1['id']}",
      "{distribution_event_2['id']}"]
      baseId: {default_base['id']}
    ) {{
        id
        distributionEvents {{
          id
          distributionSpot {{
            id
            name
          }}
        }}
      }}
    }}"""

    distro_reterun_tracking_group = assert_successful_request(
        read_only_client, start_distribution_events_tracking_group_mutation
    )

    # TODO: expect that the state of the distro events is "ReturnTrackingInProgress"
    # TODO: expect that the items (UnboxedItemsCollections) and Boxes in all involved
    # distro events have zero numberOfItems

    # TODO: try to track more items as returned than that were actually
    # in the distribution events

    set_returned_number_of_items_of_distro_return_tracking_group_mutation = f"""mutation {{
      setReturnedNumberOfItemsForDistributionEventsTrackingGroup(
        distributionEventsTrackingGroupId: {distro_reterun_tracking_group['id']}
        productId: {default_box['product']}
        sizeId: {default_box['size']}
        numberOfItems: 3
      ) {{
        id
      }}
    }}"""

    assert_successful_request(
        read_only_client,
        set_returned_number_of_items_of_distro_return_tracking_group_mutation,
    )

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
