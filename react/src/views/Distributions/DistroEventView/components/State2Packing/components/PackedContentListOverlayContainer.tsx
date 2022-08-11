import { BoxData, IPackingListEntryForPackingState, UnboxedItemsCollectionData } from "views/Distributions/types";
import PackedContentListOverlay from "./PackedContentListOverlay";

export interface PackedContentListOverlayContainerProps {
  // packingListEntryId: string;
  packingListEntry: IPackingListEntryForPackingState;
  onDeleteBoxFromDistribution: (boxId: string) => void;
}

const PackedContentListOverlayContainer = ({
  packingListEntry,
}: PackedContentListOverlayContainerProps) => {
//   const { data, loading, error } = useQuery<
//   MatchingPackedItemsCollectionsForPackingListEntryQuery,
//   MatchingPackedItemsCollectionsForPackingListEntryQueryVariables
// >  (MATCHING_PACKED_ITEMS_COLLECTIONS_FOR_PACKING_LIST_ENTRY, {
//     variables: {
//       packingListEntryId: packingListEntry.id,
//     },
//   });

//   if (loading) {
//     return <APILoadingIndicator />;
//   }

//   if (error) {
//     console.error(error);
//     return <div>Error!</div>;
//   }

  // const transformedMatchingPackedItemsCollectionsData = data?.packingListEntry?.matchingPackedItemsCollections
  // .map(el => ({
  //   ...el,
  //   numberOfItems: el.numberOfItems ?? 0
  // }));

  const boxesData = (packingListEntry?.matchingPackedItemsCollections.filter(
      (el) => el.__typename === "Box"
    ) as BoxData[]) ?? [];

  const unboxedItemCollectionData = (packingListEntry?.matchingPackedItemsCollections?.filter(
    (el) => el.__typename === "UnboxedItemsCollection"
  ) as UnboxedItemsCollectionData[]) ?? [];

  return (
    <PackedContentListOverlay
      boxesData={boxesData}
      unboxedItemCollectionData={unboxedItemCollectionData}
      packingListEntry={packingListEntry}
    />
  );
};

export default PackedContentListOverlayContainer;
