import { PackingListEntriesForDistributionEventQuery } from "types/generated/graphql";
import { PackingListEntry } from "./types";

export const graphqlPackingListEntriesForDistributionEventTransformer = (
    queryResult: PackingListEntriesForDistributionEventQuery | undefined
  ): PackingListEntry[] => {
    // TODO: Do better (e.g. yup based) validation of the query result
    if (queryResult?.distributionEvent?.packingList == null) {
      throw new Error("packingList is null");
    }
    return queryResult?.distributionEvent?.packingList.entries.map((entry) => ({
      id: entry.id,
      // TODO: for productName, sizse and gender: remove the bangs again once we have proper (e.g. yup based) validation of query result
      productName: entry.product?.name!,
      size: entry.size!,
      gender: entry.product?.gender!,
      numberOfItems: entry.numberOfItems,
    }));
  };
