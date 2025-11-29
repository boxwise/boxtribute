import { Dialog, Portal } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { BoxData, IPackingListEntry } from "views/Distributions/types";
import PackingBoxDetailsOverlayContent from "./PackingBoxDetailsOverlayContent";
import PackingScanBoxOrFindByLabelOverlayContent from "./PackingScanBoxOrFindByLabelOverlayContent";

interface PackingScanBoxOrFindByLabelOverlayProps {
  packingListEntry: IPackingListEntry;
  open: boolean;
  onClose: () => void;
  onAddBoxToDistributionEvent: (boxId: string) => void;
  // TODO: add correct signature / type here
  onAddUnboxedItemsToDistributionEvent: (boxId: string, numberOfItemsToMove: number) => void;
}

const PackingAddBoxOrItemsForPackingListEntryOverlay = ({
  onAddBoxToDistributionEvent,
  onAddUnboxedItemsToDistributionEvent,
  open,
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
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) {
          resetState();
          onClose();
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop />
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
              onAddBoxToDistributionEvent(boxId);
            }}
            onAddIndividualItemsToDistribution={(boxId: string, numberOfItemsToMove: number) => {
              resetState();
              onAddUnboxedItemsToDistributionEvent(boxId, numberOfItemsToMove);
            }}
          />
        )}
      </Portal>
    </Dialog.Root>
  );
};

export default PackingAddBoxOrItemsForPackingListEntryOverlay;
