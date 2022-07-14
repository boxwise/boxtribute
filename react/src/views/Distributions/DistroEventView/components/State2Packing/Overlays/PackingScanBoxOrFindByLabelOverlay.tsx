import { useApolloClient, useLazyQuery } from "@apollo/client";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  Flex,
  useDisclosure,
} from "@chakra-ui/react";
import QrScanner from "components/QrScanner";
import { useCallback, useEffect, useState } from "react";
import { BOX_DETAILS_FOR_MOBILE_DISTRO_QUERY } from "views/Distributions/queries";
import { BoxData, IPackingListEntry } from "views/Distributions/types";
import {
  BoxDetailsQuery,
  BoxDetailsQueryVariables,
} from "types/generated/graphql";
import PackingBoxDetailsOverlay from "./PackingBoxDetailsOverlay";
import { useToggle } from "utils/hooks";

interface PackingScanBoxOrFindByLabelOverlayProps {
  packingListEntry: IPackingListEntry;
  isOpen: boolean;
  onClose: () => void;
  onAddBoxToDistributionEvent: (boxId: string) => void;
  // TODO: add correct signature / type here
  onAddUnboxedItemsToDistributionEvent: () => void;
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

//   const [boxId, setBoxId] = useState<string>("");
//   const [isScanOpen, setIsScanOpen] = useState<boolean>(false);

const PackingScanBoxOrFindByLabelOverlay = ({
  onAddBoxToDistributionEvent,
  onAddUnboxedItemsToDistributionEvent,
  isOpen,
  onClose,
  packingListEntry,
}: PackingScanBoxOrFindByLabelOverlayProps) => {
  const [showFindBoxByLabelForm, setShowFindBoxByLabelForm] = useState(false);
  const [manualBoxLabelValue, setManualBoxLabelValue] = useState(0);

  const [showPackingBoxDetails, setShowPackingBoxDetails] = useState(false);

  const [boxData, setBoxData] = useState<BoxData | null>();

  const validateBoxByLabelMatchingPackingListEntry =
    useValidateBoxByLabelMatchingPackingListEntry(packingListEntry);

    const resetState = useCallback(() => {
            setShowPackingBoxDetails(false);
            setShowFindBoxByLabelForm(false);
            setBoxData(null);
    }, []);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          resetState();
          onClose();
          setShowFindBoxByLabelForm(false);
        }}
      >
        <ModalOverlay />

        {showPackingBoxDetails && boxData != null && (
          <PackingBoxDetailsOverlay
            // {...packingBoxDetailsOverlayModalState}
            targetNumberOfItemsToPack={packingListEntry.numberOfItems}
            // modalProps={{
            //   isBoxDetailOpen: isBoxDetailOpen,
            //   onBoxDetailClose: onBoxDetailClose,
            // }}
            boxData={boxData}
            // packingActionProps={packingActionProps}
            // itemsForPackingNumberOfItems={chosenPackingNumberOfItems}
            // stateProps={{
            //   isMovingItems,
            //   setIsMovingItems,
            // }}
          />
        )}

        {!showPackingBoxDetails && (
          <ModalContent top="0">
            <ModalHeader pb={0}>Scan the box</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <QrScanner />
            </ModalBody>
            <Button
              onClick={() => {
                onClose();
                onAddBoxToDistributionEvent("728798");
                setShowFindBoxByLabelForm(false);
              }}
              colorScheme="blue"
              mx={10}
              mb={4}
            >
              Mocked scanned box
            </Button>
            <Button
              onClick={() => setShowFindBoxByLabelForm(true)}
              colorScheme="blue"
              variant="outline"
              mx={10}
              mb={4}
            >
              Find Box by Label
            </Button>
            {showFindBoxByLabelForm ? (
              <Flex mx={10} mb={4} justifyContent="space-between">
                <Input
                  type="number"
                  mr={2}
                  w="50%"
                  placeholder="Box Label"
                  name="inputData"
                  onChange={(e) => {
                    setManualBoxLabelValue(parseInt(e.target.value));
                  }}
                />
                <Button
                  onClick={() => {
                    validateBoxByLabelMatchingPackingListEntry(
                      manualBoxLabelValue.toString()
                    ).then(({ isValid, boxData }) => {
                      if (isValid) {
                        // onAddBoxToDistributionEvent(
                        //   manualBoxLabelValue.toString()
                        // );

                        setBoxData(boxData);
                        setShowFindBoxByLabelForm(false);
                        setShowPackingBoxDetails(true);
                        // onClose();
                      } else {
                        alert(
                          "Box not found or doesn't match the needed product and size"
                        );
                      }
                    });
                    // onScanClose();
                    // modalProps.onBoxDetailOpen();
                    // setShowFindBoxByLabelForm(false);
                  }}
                  colorScheme="blue"
                >
                  Search
                </Button>
              </Flex>
            ) : null}
            <Button colorScheme="blue" variant="outline" mx={10}>
              Other source
            </Button>
            <ModalFooter />
          </ModalContent>
        )}
      </Modal>
    </>
  );
};

export default PackingScanBoxOrFindByLabelOverlay;
