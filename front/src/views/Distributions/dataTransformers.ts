import { ResultOf } from "gql.tada";
import { IPackingListEntryForPackingState } from "./types";
import { PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY } from "./queries";

export const graphqlPackingListEntriesForDistributionEventTransformer = (
  queryResult: ResultOf<typeof PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY> | undefined
): IPackingListEntryForPackingState[] | undefined => {
  // TODO: Do better (e.g. zod based) validation of the query result
  return queryResult?.distributionEvent?.packingListEntries.map((entry) => {

    const matchingPackedItemsCollections = entry.matchingPackedItemsCollections.map((el) => {
      return {
        ...el,
        numberOfItems: el.numberOfItems || 0,
      }
    });

    return {
      ...entry,
      id: entry.id,
      // TODO: for productName, sizse and gender: remove the bangs again once we have proper (e.g. zod based) validation of query result
      product: {
        id: entry.product?.id!,
        name: entry.product?.name!,
        gender: entry.product?.gender!,
      },
      size: entry.size!,
      numberOfItems: entry.numberOfItems,
      matchingPackedItemsCollections,
    };
  });
};
