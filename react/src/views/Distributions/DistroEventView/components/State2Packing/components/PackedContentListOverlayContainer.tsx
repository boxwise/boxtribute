import { useQuery } from "@apollo/client";
import APILoadingIndicator from "components/APILoadingIndicator";
import {
  MatchingPackedItemsCollectionsForPackingListEntryQuery,
  MatchingPackedItemsCollectionsForPackingListEntryQueryVariables,
} from "types/generated/graphql";
import { MATCHING_PACKED_ITEMS_COLLECTIONS_FOR_PACKING_LIST_ENTRY } from "views/Distributions/queries";
import { BoxData, IPackingListEntry } from "views/Distributions/types";
import PackedContentListOverlay from "./PackedContentListOverlay";

export interface PackedContentListOverlayContainerProps {
  // packingListEntryId: string;
  packingListEntry: IPackingListEntry;
  onDeleteBoxFromDistribution: (boxId: string) => void;
}

const PackedContentListOverlayContainer = ({
  packingListEntry,
}: PackedContentListOverlayContainerProps) => {
  const { data, loading, error } = useQuery<
  MatchingPackedItemsCollectionsForPackingListEntryQuery,
  MatchingPackedItemsCollectionsForPackingListEntryQueryVariables
>  (MATCHING_PACKED_ITEMS_COLLECTIONS_FOR_PACKING_LIST_ENTRY, {
    variables: {
      packingListEntryId: packingListEntry.id,
    },
  });

  if (loading) {
    return <APILoadingIndicator />;
  }

  if (error) {
    console.error(error);
    return <div>Error!</div>;
  }

  const transformedMatchingPackedItemsCollectionsData = data?.packingListEntry?.matchingPackedItemsCollections
  .map(el => ({
    ...el,
    numberOfItems: el.numberOfItems ?? 0
  }));

  const boxesData = (transformedMatchingPackedItemsCollectionsData?.filter(
      (el) => el.__typename === "Box"
    ) as BoxData[]) ?? [];

  const unboxedItemCollectionData = (transformedMatchingPackedItemsCollectionsData?.filter(
    (el) => el.__typename === "UnboxedItemsCollection"
  ) as BoxData[]) ?? [];

  return (
    <PackedContentListOverlay
      boxesData={boxesData}
      unboxedItemCollectionData={unboxedItemCollectionData}
      packingListEntry={packingListEntry}
    />
  );
};

export default PackedContentListOverlayContainer;
