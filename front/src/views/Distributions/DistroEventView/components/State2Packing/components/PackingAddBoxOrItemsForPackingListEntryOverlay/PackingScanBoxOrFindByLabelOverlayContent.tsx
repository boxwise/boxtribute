import { graphql } from "../../../../../../../../../graphql/graphql";
import { useApolloClient } from "@apollo/client";
import {
  Button,
  Flex,
  Input,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  useToast,
} from "@chakra-ui/react";
import { QrReaderScanner } from "components/QrReader/components/QrReaderScanner";

import { useCallback, useState } from "react";
import { extractQrCodeFromUrl } from "hooks/useQrResolver";
import { GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE } from "queries/queries";
import { BoxData, IPackingListEntry } from "views/Distributions/types";

interface PackingScanBoxOrFindByLabelOverlayProps {
  packingListEntry: IPackingListEntry;
  onFoundMatchingBox: (boxData: BoxData) => void;
  // open: boolean;
  // onClose: () => void;
  // onAddBoxToDistributionEvent: (boxId: string) => void;
  // TODO: add correct signature / type here
}

const BOX_DETAILS_BY_LABEL_IDENTIFIER_QUERY = graphql(
  `
    query BoxDetails($labelIdentifier: String!) {
      box(labelIdentifier: $labelIdentifier) {
        labelIdentifier
        product {
          id
        }
        size {
          id
        }
        numberOfItems
        }
      }
    }
  `,
);

type ValidateBoxByLabelForMatchingPackingListEntry = (
  boxLabel: string,
) => Promise<{ isValid: boolean; boxData?: BoxData | null }>;

const useValidateBoxByLabelMatchingPackingListEntry = (
  packingListEntry: IPackingListEntry,
): ValidateBoxByLabelForMatchingPackingListEntry => {
  const apolloClient = useApolloClient();
  return (boxLabel: string) => {
    return apolloClient
      .query({
        query: BOX_DETAILS_BY_LABEL_IDENTIFIER_QUERY,
        variables: {
          labelIdentifier: boxLabel,
        },
      })
      .then(({ data }) => {
        const box = data?.box;
        if (box != null) {
          if (
            box.product?.id === packingListEntry.product.id &&
            box.size?.id === packingListEntry.size?.id
          ) {
            return {
              isValid: true,
              boxData: {
                __typename: "Box",
                labelIdentifier: boxLabel,
                // ...box,
                // TODO: consider to make items non-nullable in GraphQL
                numberOfItems: box.numberOfItems || 0,
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
              title: "Box not found or doesn't match the needed product and size",
              status: "error",
              isClosable: true,
              duration: 2000,
              position: "top-right",
            });
          }
        },
      );
    },
    [onFoundMatchingBox, toast, validateBoxByLabelMatchingPackingListEntry],
  );

  // TODO: extract duplicated code from here and QrReaderOverlayContainer into a common component/custom hook

  const apolloClient = useApolloClient();

  const onQrResult = useCallback(
    (result: string) => {
      if (!result) {
        const qrCode = extractQrCodeFromUrl(result);
        if (qrCode == null) {
          console.error("Not a Boxtribute QR Code", qrCode);
          // TODO: use toast instead of alert here
          alert("This is not a Boxtribute QR Code");
          // onScanningDone([{ kind: "noBoxtributeQr" }]);
        } else {
          apolloClient
            .query({
              query: GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
              fetchPolicy: "no-cache",
              variables: { qrCode },
            })
            .then(({ data }) => {
              // @ts-ignore
              const boxLabelIdentifier = data?.qrCode?.box?.labelIdentifier;
              if (boxLabelIdentifier == null) {
                // onScanningDone([
                //   { kind: "notAssignedToBox", qrCodeValue: qrCode },
                // ]);
                console.error("No Box yet assigned to QR Code");
                // TODO: use toast instead of alert here
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
    [apolloClient, onFindAndValidateBoxLabelIdentifier],
  );

  return (
    <DialogContent top="0">
      <DialogHeader pb={0}>Scan the box</DialogHeader>
      <DialogCloseTrigger />
      <DialogBody>
        <QrReaderScanner
          multiScan={false}
          facingMode={"environment"}
          scanPeriod={1000}
          onResult={(result) => result?.["text"] != null && onQrResult(result["text"])}
        />
      </DialogBody>
      <Button
        onClick={() => setShowFindBoxByLabelForm(true)}
        colorPalette="blue"
        variant="outline"
        mx={10}
        mb={4}
      >
        Find Box by Label
      </Button>
      {showFindBoxByLabelForm ? (
        <Flex mx={10} justifyContent="space-between">
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
              onFindAndValidateBoxLabelIdentifier(manualBoxLabelValue.toString());
            }}
            colorPalette="blue"
          >
            Search
          </Button>
        </Flex>
      ) : null}
      <Button
        colorPalette="blue"
        variant="outline"
        my={4}
        mx={10}
        onClick={() => alert("Not yet implemented")}
      >
        Show fitting boxes
      </Button>
      <Button
        colorPalette="blue"
        variant="outline"
        mx={10}
        onClick={() => alert("Not yet implemented")}
      >
        Other source
      </Button>
      <DialogFooter />
    </DialogContent>
  );
};

export default PackingScanBoxOrFindByLabelOverlay;
