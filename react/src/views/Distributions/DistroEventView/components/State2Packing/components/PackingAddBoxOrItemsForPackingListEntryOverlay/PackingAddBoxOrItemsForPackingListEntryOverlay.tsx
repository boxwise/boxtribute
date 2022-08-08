import { Modal, ModalOverlay } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { BoxData, IPackingListEntry } from "views/Distributions/types";
import PackingBoxDetailsOverlayContent from "./PackingBoxDetailsOverlayContent";
import PackingScanBoxOrFindByLabelOverlayContent from "./PackingScanBoxOrFindByLabelOverlayContent";

interface PackingScanBoxOrFindByLabelOverlayProps {
  packingListEntry: IPackingListEntry;
  isOpen: boolean;
  onClose: () => void;
  onAddBoxToDistributionEvent: (boxId: string) => void;
  // TODO: add correct signature / type here
  onAddUnboxedItemsToDistributionEvent: (
    boxId: string,
    numberOfItemsToMove: number
  ) => void;
}

const PackingAddBoxOrItemsForPackingListEntryOverlay = ({
  onAddBoxToDistributionEvent,
  onAddUnboxedItemsToDistributionEvent,
  isOpen,
  onClose,
  packingListEntry,
}: PackingScanBoxOrFindByLabelOverlayProps) => {
  const [showPackingBoxDetails, setShowPackingBoxDetails] = useState(false);

  const [boxData, setBoxData] = useState<BoxData | null>();

  const onFoundMatchingBox = useCallback((boxData: BoxData) => {
    setBoxData(boxData);
    setShowPackingBoxDetails(true);
  }, []);

  const resetState = useCallback(() => {
    setShowPackingBoxDetails(false);
    setBoxData(null);
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetState();
        onClose();
      }}
    >
      <ModalOverlay />

      {!showPackingBoxDetails && (
        <PackingScanBoxOrFindByLabelOverlayContent
          packingListEntry={packingListEntry}
          onFoundMatchingBox={(box: BoxData) => {
            resetState();
            onFoundMatchingBox(box);
          }}
        />
      )}

      {showPackingBoxDetails && boxData != null && (
        <PackingBoxDetailsOverlayContent
          targetNumberOfItemsToPack={packingListEntry.numberOfItems}
          boxData={boxData}
          onAddBoxToDistributionEvent={(boxId: string) => {
            resetState();
            onAddBoxToDistributionEvent(boxId)
          }}
          onAddIndividualItemsToDistribution={(boxId: string, numberOfItemsToMove: number) => {
            resetState();
            onAddUnboxedItemsToDistributionEvent(boxId, numberOfItemsToMove);
          }}
        />
      )}
    </Modal>
  );
};

export default PackingAddBoxOrItemsForPackingListEntryOverlay;
