import { PackingListEntriesForDistributionEventQuery } from "types/generated/graphql";
import { IPackingListEntryForPackingState } from "./types";

export const graphqlPackingListEntriesForDistributionEventTransformer = (
  queryResult: PackingListEntriesForDistributionEventQuery | undefined
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
