from utils import assert_successful_request


def test_packing_list_entry(read_only_client, packing_list_entry):
    entry_id = str(packing_list_entry["id"])
    query = f"""query {{ packingListEntry(id: {entry_id}) {{
                id
                product {{ id }}
                size {{ id }}
                numberOfItems
                matchingPackedItemsCollections {{ id }}
                state
            }} }}"""
    entry = assert_successful_request(read_only_client, query)
    assert entry == {
        "id": entry_id,
        "product": {"id": str(packing_list_entry["product"])},
        "size": {"id": str(packing_list_entry["size"])},
        "numberOfItems": packing_list_entry["number_of_items"],
        "matchingPackedItemsCollections": [],
        "state": packing_list_entry["state"].name,
    }


def test_update_packing_list_entry(client, packing_list_entry):
    entry_id = str(packing_list_entry["id"])
    number_of_items = 50
    mutation = f"""mutation {{ updatePackingListEntry(
                    packingListEntryId: {entry_id}, numberOfItems: {number_of_items}) {{
                        numberOfItems }} }}"""
    entry = assert_successful_request(client, mutation)
    assert entry == {"numberOfItems": number_of_items}
