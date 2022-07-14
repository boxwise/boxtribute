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
} from "@chakra-ui/react";
import QrScanner from "components/QrScanner";
import { useState } from "react";
import { BOX_DETAILS_FOR_MOBILE_DISTRO_QUERY } from "views/Distributions/queries";
import { IPackingListEntry } from "views/Distributions/types";
import {
  BoxDetailsQuery,
  BoxDetailsQueryVariables,
} from "types/generated/graphql";

interface PackingScanBoxOrFindByLabelOverlayProps {
  packingListEntry: IPackingListEntry;
  isScanOpen: boolean;
  onScanClose: () => void;
  onBoxSelect: (boxId: string) => void;
}

type ValidateBoxByLabelForMatchingPackingListEntry = (
  boxLabel: string,
) => Promise<boolean>;
const useValidateBoxByLabelMatchingPackingListEntry =
  (packingListEntry: IPackingListEntry): ValidateBoxByLabelForMatchingPackingListEntry => {
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
              return true;
            }
          }
          return false;
        });
    };
  };

//   const [boxId, setBoxId] = useState<string>("");
//   const [isScanOpen, setIsScanOpen] = useState<boolean>(false);

const PackingScanBoxOrFindByLabelOverlay = ({
  onBoxSelect,
  isScanOpen,
  onScanClose,
  packingListEntry
}: PackingScanBoxOrFindByLabelOverlayProps) => {
  const [showFindBoxByLabelForm, setShowFindBoxByLabelForm] = useState(false);
  const [manualBoxLabelValue, setManualBoxLabelValue] = useState(0);
  const validateBoxByLabelMatchingPackingListEntry = useValidateBoxByLabelMatchingPackingListEntry(packingListEntry);
  return (
    <Modal
      isOpen={isScanOpen}
      onClose={() => {
        onScanClose();
        setShowFindBoxByLabelForm(false);
      }}
    >
      <ModalOverlay />
      <ModalContent top="0">
        <ModalHeader pb={0}>Scan the box</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <QrScanner />
        </ModalBody>
        <Button
          onClick={() => {
            onScanClose();
            onBoxSelect("728798");
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
                validateBoxByLabelMatchingPackingListEntry(manualBoxLabelValue.toString()).then(isValid => {
                  if (isValid) {
                    onBoxSelect(manualBoxLabelValue.toString());
                    setShowFindBoxByLabelForm(false);
                  }
                  else {
                    alert("Box not found or doesn't match the needed product and size");
                  }
                })
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
    </Modal>
  );
};

export default PackingScanBoxOrFindByLabelOverlay;
