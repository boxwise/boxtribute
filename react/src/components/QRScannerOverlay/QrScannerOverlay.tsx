import { useCallback, useEffect, useState } from "react";
import { QrReader } from "react-qr-reader";
import { Container, useDisclosure } from "@chakra-ui/react";
import { gql, useApolloClient, useLazyQuery } from "@apollo/client";
import {
  GetBoxLabelIdentifierForQrCodeQuery,
  GetBoxLabelIdentifierForQrCodeQueryVariables,
} from "types/generated/graphql";
import { useNavigate, useParams } from "react-router-dom";
import QrScanner, { QrValueWrapper } from "components/QrScanner/QrScanner";

const extractQrCodeFromUrl = (url) => {
  const rx = /.*barcode=(.*)/g;
  const arr = rx.exec(url);
  return arr?.[1];
};

const GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE = gql`
  query GetBoxLabelIdentifierForQrCode($qrCode: String!) {
    qrCode(qrCode: $qrCode) {
      box {
        id
        labelIdentifier
      }
    }
  }
`;

const QrScannerOverlay = () => {
  // const [getBoxLabelIdentifierByQrCode, { data }] = useLazyQuery<
  //   GetBoxLabelIdentifierForQrCodeQuery,
  //   GetBoxLabelIdentifierForQrCodeQueryVariables
  // >(GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE);
  const navigate = useNavigate();
  const baseId = useParams<{ baseId: string }>().baseId!;
  const apolloClient = useApolloClient();

  const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });

  // useEffect(() => {
  //   data?.qrCode?.box?.labelIdentifier &&
  //     navigate(`/bases/${baseId}/boxes/${data.qrCode.box.labelIdentifier}`);
  // }, [baseId, data, navigate]);

  // const [isBulkModeActive, setIsBulkModeActive] = useState(false);

  const qrValueResolver = (
    qrValueWrapper: QrValueWrapper
  ): Promise<QrValueWrapper> => {
    // qrValueWrapper.isLoading = false;
    // qrValueWrapper.finalValue = extractQrCodeFromUrl(qrValueWrapper.key) || "Error";

    const extractedQrCodeFromUrl = extractQrCodeFromUrl(qrValueWrapper.key);
    const resolvedQrValueWrapper = {
      ...qrValueWrapper,
      isLoading: false,
      finalValue: extractedQrCodeFromUrl,
    } as QrValueWrapper;

    if (extractedQrCodeFromUrl == null) {
      // TODO: ADD PROPER ERROR MESSAGE HANDLING HERE
      console.error("No Boxtribute QR Found");
      throw new Error("No Boxtribute QR Found");
    }

    return apolloClient
    .query<
      GetBoxLabelIdentifierForQrCodeQuery,
      GetBoxLabelIdentifierForQrCodeQueryVariables
    >({
      query: GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
      variables: { qrCode: extractedQrCodeFromUrl },
    })
    .then(({ data }) => {
      const boxLabelIdentifier = data?.qrCode?.box?.labelIdentifier;
      const resolvedQrValueWrapper = {
        ...qrValueWrapper,
        isLoading: false,
        finalValue: boxLabelIdentifier,
      } as QrValueWrapper;
      return resolvedQrValueWrapper;
    });


    // return getBoxLabelIdentifierByQrCode({
    //   variables: {
    //     qrCode: extractedQrCodeFromUrl,
    //   },
    // });
  };

  const onSingleScanDone = useCallback(
    (result: string) => {
      if (!!result) {
        const qrCode = extractQrCodeFromUrl(result);
        if (qrCode != null) {
          apolloClient
            .query<
              GetBoxLabelIdentifierForQrCodeQuery,
              GetBoxLabelIdentifierForQrCodeQueryVariables
            >({
              query: GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
              variables: { qrCode },
            })
            .then(({ data }) => {
              const boxLabelIdentifier = data?.qrCode?.box?.labelIdentifier;
              boxLabelIdentifier &&
                navigate(`/bases/${baseId}/boxes/${boxLabelIdentifier}`);
            });
        }
      }
    },
    [apolloClient, baseId, navigate]
  );

  const onBulkScanningDone = (qrValues: QrValueWrapper[]) => {
    console.debug("Bulk Scanning Done");
    console.debug(qrValues);
  };

  return (
    <QrScanner
      isBulkModeSupported={true}
      onSingleScanDone={onSingleScanDone}
      qrValueResolver={qrValueResolver}
      onBulkScanningDone={onBulkScanningDone}
      isOpen={isOpen}
      // onOpen={onOpen}
      onClose={onClose}
      // bulkModeActive={isBulkModeActive}
      // onToggleBulkMode={() => setIsBulkModeActive(prev => !prev)}
    />
  );
};

export default QrScannerOverlay;
