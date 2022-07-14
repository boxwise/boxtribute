import { useApolloClient } from "@apollo/client";
import {
  Modal,
  ModalOverlay,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { BOX_DETAILS_FOR_MOBILE_DISTRO_QUERY } from "views/Distributions/queries";
import { BoxData, IPackingListEntry } from "views/Distributions/types";
import {
  BoxDetailsQuery,
  BoxDetailsQueryVariables,
} from "types/generated/graphql";
import PackingBoxDetailsOverlayContent from "./PackingBoxDetailsOverlayContent";
import PackingScanBoxOrFindByLabelOverlayContent from "./PackingScanBoxOrFindByLabelOverlayContent";

interface PackingScanBoxOrFindByLabelOverlayProps {
  packingListEntry: IPackingListEntry;
  isOpen: boolean;
  onClose: () => void;
  onAddBoxToDistributionEvent: (boxId: string) => void;
  // TODO: add correct signature / type here
  onAddUnboxedItemsToDistributionEvent: (boxId: string, numberOfItemsToMove: number) => void;
}

type ValidateBoxByLabelForMatchingPackingListEntry = (
  boxLabel: string
) => Promise<{ isValid: boolean; boxData?: BoxData | null }>;
const useValidateBoxByLabelMatchingPackingListEntry = (
  packingListEntry: IPackingListEntry
): ValidateBoxByLabelForMatchingPackingListEntry => {
  const apolloClient = useApolloClient();
  return (boxLabel: string) => {
    return apolloClient
      .query<BoxDetailsQuery, BoxDetailsQueryVariables>({
        query: BOX_DETAILS_FOR_MOBILE_DISTRO_QUERY,
        variables: {
          labelIdentifier: boxLabel,
        },
      })
      .then(({ data }) => {
        const box = data?.box;
        if (box != null) {
          if (
            box.product?.id === packingListEntry.product.id &&
            box.size.id === packingListEntry.size?.id
          ) {
            return {
              isValid: true,
              boxData: {
                ...box,
                numberOfItems: box.items,
              },
            };
          }
        }
        return {
          isValid: false,
          boxData: null,
        };
      });
  };
};

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
          onFoundMatchingBox={onFoundMatchingBox}
        />
      )}

      {showPackingBoxDetails && boxData != null && (
        <PackingBoxDetailsOverlayContent
                  targetNumberOfItemsToPack={packingListEntry.numberOfItems}
                  boxData={boxData}
                  onAddBoxToDistributionEvent={onAddBoxToDistributionEvent}
                  onAddIndividualItemsToDistribution={onAddUnboxedItemsToDistributionEvent}                  />
      )}
    </Modal>
  );
};

export default PackingAddBoxOrItemsForPackingListEntryOverlay;
