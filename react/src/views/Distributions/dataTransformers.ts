import { PackingListEntriesForDistributionEventQuery } from "types/generated/graphql";
import { IPackingListEntry } from "./types";

export const graphqlPackingListEntriesForDistributionEventTransformer = (
    queryResult: PackingListEntriesForDistributionEventQuery | undefined
  ): IPackingListEntry[] | undefined => {
    // TODO: Do better (e.g. zod based) validation of the query result
    return queryResult?.distributionEvent?.packingListEntries.map((entry) => ({
      id: entry.id,
      // TODO: for productName, sizse and gender: remove the bangs again once we have proper (e.g. zod based) validation of query result
      product: {
        id: entry.product?.id!,
        name: entry.product?.name!,
      },
      size: entry.size!,
      gender: entry.product?.gender!,
      numberOfItems: entry.numberOfItems,
    }));


  };
