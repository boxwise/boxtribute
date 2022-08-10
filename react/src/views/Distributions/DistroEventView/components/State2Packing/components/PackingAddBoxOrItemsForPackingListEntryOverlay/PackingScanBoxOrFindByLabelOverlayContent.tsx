import { gql, useApolloClient, useLazyQuery } from "@apollo/client";
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
  useToast,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { BOX_DETAILS_FOR_MOBILE_DISTRO_QUERY } from "views/Distributions/queries";
import { BoxData, IPackingListEntry } from "views/Distributions/types";
import {
  BoxDetailsQuery,
  BoxDetailsQueryVariables,
  GetBoxLabelIdentifierForQrCodeQuery,
  GetBoxLabelIdentifierForQrCodeQueryVariables,
} from "types/generated/graphql";
import { useToggle } from "utils/hooks";
import { QrReader } from "components/QrReader/QrReader";
import {
  extractQrCodeFromUrl,
  GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
} from "components/QrReaderOverlay/QrReaderOverlayContainer";

interface PackingScanBoxOrFindByLabelOverlayProps {
  packingListEntry: IPackingListEntry;
  onFoundMatchingBox: (boxData: BoxData) => void;
  // isOpen: boolean;
  // onClose: () => void;
  // onAddBoxToDistributionEvent: (boxId: string) => void;
  // TODO: add correct signature / type here
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
                __typename: "Box",
                labelIdentifier: boxLabel,
                // ...box,
                // TODO: consider to make items non-nullable in GraphQL
                numberOfItems: box.items || 0,
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
  // onAddBoxToDistributionEvent,
  // isOpen,
  // onClose,
  packingListEntry,
  onFoundMatchingBox,
}: PackingScanBoxOrFindByLabelOverlayProps) => {
  const [showFindBoxByLabelForm, setShowFindBoxByLabelForm] = useState(false);
  const [manualBoxLabelValue, setManualBoxLabelValue] = useState(0);

  const toast = useToast();

  const validateBoxByLabelMatchingPackingListEntry =
    useValidateBoxByLabelMatchingPackingListEntry(packingListEntry);

  const onFindAndValidateBoxLabelIdentifier = useCallback(
    (boxLabelIdentifier: string) => {
      validateBoxByLabelMatchingPackingListEntry(boxLabelIdentifier).then(
        ({ isValid, boxData }) => {
          if (isValid && boxData != null) {
            setShowFindBoxByLabelForm(false);
            onFoundMatchingBox(boxData);
          } else {
            toast({
              title:
                "Box not found or doesn't match the needed product and size",
              status: "error",
              isClosable: true,
              duration: 2000,
            });
          }
        }
      );
    },
    [onFoundMatchingBox, toast, validateBoxByLabelMatchingPackingListEntry]
  );

  // TODO: extract duplicated code from here and QrReaderOverlayContainer into a common component/custom hook

  const apolloClient = useApolloClient();

  const onQrResult = useCallback(
    (result: string) => {
      if (!!result) {
        const qrCode = extractQrCodeFromUrl(result);
        if (qrCode == null) {
          console.error("Not a Boxtribute QR Code", qrCode);
          alert("This is not a Boxtribute QR Code");
          // onScanningDone([{ kind: "noBoxtributeQr" }]);
        } else {
          apolloClient
            .query<
              GetBoxLabelIdentifierForQrCodeQuery,
              GetBoxLabelIdentifierForQrCodeQueryVariables
            >({
              query: GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
              fetchPolicy: "no-cache",
              variables: { qrCode },
            })
            .then(({ data }) => {
              const boxLabelIdentifier = data?.qrCode?.box?.labelIdentifier;
              if (boxLabelIdentifier == null) {
                // onScanningDone([
                //   { kind: "notAssignedToBox", qrCodeValue: qrCode },
                // ]);
                console.error("No Box yet assigned to QR Code");
                alert("This QR code is not assigned to any box");
              } else {
                onFindAndValidateBoxLabelIdentifier(boxLabelIdentifier);
                // onScanningDone([
                //   { kind: "success", value: boxLabelIdentifier },
                // ]);
              }
            });
        }
      }
    },
    [apolloClient]
  );

  return (
    <ModalContent top="0">
      <ModalHeader pb={0}>Scan the box</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <QrReader
          facingMode={"environment"}
          zoom={1}
          scanPeriod={1000}
          onResult={(result) =>
            result?.["text"] != null && onQrResult(result["text"])
          }
        />
      </ModalBody>
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
              onFindAndValidateBoxLabelIdentifier(
                manualBoxLabelValue.toString()
              );
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
  );
};

export default PackingScanBoxOrFindByLabelOverlay;
