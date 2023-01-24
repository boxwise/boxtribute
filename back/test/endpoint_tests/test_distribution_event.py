from utils import assert_successful_request


def test_distribution_event_query(
    read_only_client, default_distribution_event, packing_list_entry
):
    test_id = str(default_distribution_event["id"])
    query = f"""query {{ distributionEvent(id: {test_id}) {{
                    id
                    name
                    state
                    boxes {{ id }}
                    unboxedItemsCollections {{ id }}
                    packingListEntries {{ id }}
                    distributionEventsTrackingGroup {{ id }}
                }}
            }}"""

    distribution_event = assert_successful_request(read_only_client, query)
    assert distribution_event == {
        "id": test_id,
        "name": default_distribution_event["name"],
        "state": default_distribution_event["state"].name,
        "boxes": [],
        "unboxedItemsCollections": [],
        "packingListEntries": [{"id": str(packing_list_entry["id"])}],
        "distributionEventsTrackingGroup": None,
    }


def test_update_selected_products_for_distribution_event_packing_list(
    client, default_distribution_event, default_product, default_size, another_size
):
    distribution_event_id = default_distribution_event["id"]
    product_id = str(default_product["id"])
    mutation = f"""mutation {{
        updateSelectedProductsForDistributionEventPackingList(
        distributionEventId: {distribution_event_id},
        productIdsToAdd: [{product_id}],
        productIdsToRemove: []
        ) {{
            packingListEntries {{
                product {{ id }}
                size {{ id }}
                numberOfItems
            }}
        }}
    }}"""

    mutation_result = assert_successful_request(client, mutation)
    assert mutation_result == {
        "packingListEntries": [
            {
                "product": {"id": str(default_product["id"])},
                "size": {"id": str(default_size["id"])},
                "numberOfItems": 1,
            },
            {
                "product": {"id": str(default_product["id"])},
                "size": {"id": str(another_size["id"])},
                "numberOfItems": 0,
            },
        ],
    }

    mutation = f"""mutation {{
        updateSelectedProductsForDistributionEventPackingList(
        distributionEventId: {distribution_event_id},
        productIdsToAdd: [],
        productIdsToRemove: [{default_product['id']}]
        ) {{ packingListEntries {{ id }} }}
    }}"""

    mutation_result = assert_successful_request(client, mutation)
    assert mutation_result == {"packingListEntries": []}
