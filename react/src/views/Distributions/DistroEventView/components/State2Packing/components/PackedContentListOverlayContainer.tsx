import PackedContentListOverlay from "./PackedContentListOverlay";

export interface PackedContentListOverlayContainerProps {
  packingListEntryId: string;
  onDeleteBoxFromDistribution: (boxId: string) => void;
}

const PackedContentListOverlayContainer = ({
  packingListEntryId,
}:
PackedContentListOverlayContainerProps) => {

  const boxesData = [];
  const unboxedItemCollectionData = undefined;
  return (
    <PackedContentListOverlay boxesData={boxesData} unboxedItemCollectionData={unboxedItemCollectionData} />
  );
};

export default PackedContentListOverlayContainer;
