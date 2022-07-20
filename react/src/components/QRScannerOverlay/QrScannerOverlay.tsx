import { useCallback, useEffect, useState } from "react";
import { QrReader } from "react-qr-reader";
import { Container, useDisclosure } from "@chakra-ui/react";
import { gql, useApolloClient, useLazyQuery } from "@apollo/client";
import {
  GetBoxLabelIdentifierForQrCodeQuery,
  GetBoxLabelIdentifierForQrCodeQueryVariables,
} from "types/generated/graphql";
import { useNavigate, useParams } from "react-router-dom";
import QrScanner, { IQrValueWrapper, QrResolvedValue } from "components/QrScanner/QrScanner";

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

interface QrScannerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onScanningDone: (qrValueWrappers: QrResolvedValue[]) => void;
}
const QrScannerOverlay = ({
  isOpen,
  onClose,
  onScanningDone,
}: QrScannerOverlayProps) => {
  // const [getBoxLabelIdentifierByQrCode, { data }] = useLazyQuery<
  //   GetBoxLabelIdentifierForQrCodeQuery,
  //   GetBoxLabelIdentifierForQrCodeQueryVariables
  // >(GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE);

  const apolloClient = useApolloClient();

  const resetState = useCallback(() => {
    // apolloClient.resetStore();

  }
  , []);

  // useEffect(() => {
  //   data?.qrCode?.box?.labelIdentifier &&
  //     navigate(`/bases/${baseId}/boxes/${data.qrCode.box.labelIdentifier}`);
  // }, [baseId, data, navigate]);

  // const [isBulkModeActive, setIsBulkModeActive] = useState(false);

  const qrValueResolver = (
    qrValueWrapper: IQrValueWrapper
  ): Promise<IQrValueWrapper> => {
    // qrValueWrapper.isLoading = false;
    // qrValueWrapper.finalValue = extractQrCodeFromUrl(qrValueWrapper.key) || "Error";

    const extractedQrCodeFromUrl = extractQrCodeFromUrl(qrValueWrapper.key);

    if (extractedQrCodeFromUrl == null) {
      // TODO: ADD PROPER ERROR MESSAGE HANDLING HERE
      const resolvedQrValueWrapper = {
        ...qrValueWrapper,
        isLoading: false,
        finalValue: { kind: "noBoxtributeQr" },
      } as IQrValueWrapper;
      console.error("No Boxtribute QR Found");
      // throw new Error("No Boxtribute QR Found");
      return Promise.resolve(resolvedQrValueWrapper);
    }

    alert(extractedQrCodeFromUrl)

    return apolloClient
      .query<
        GetBoxLabelIdentifierForQrCodeQuery,
        GetBoxLabelIdentifierForQrCodeQueryVariables
      >({
        query: GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
        variables: { qrCode: extractedQrCodeFromUrl },
      })
      .then(({ data, error, errors }) => {
        alert(JSON.stringify(errors))
        alert(JSON.stringify(data))
        const boxLabelIdentifier = data?.qrCode?.box?.labelIdentifier;
        if (boxLabelIdentifier == null) {
          const resolvedQrValueWrapper = {
            ...qrValueWrapper,
            isLoading: false,
            finalValue: { kind: "noBoxtributeQr" },
          } as IQrValueWrapper;
          console.error("No Boxtribute QR Found");
          return Promise.resolve(resolvedQrValueWrapper);
        }
        const resolvedQrValueWrapper = {
          ...qrValueWrapper,
          isLoading: false,
          finalValue: {
            kind: "success",
            value: boxLabelIdentifier,
          },
        } as IQrValueWrapper;
        return resolvedQrValueWrapper;
      })
      // TODO: Handle Authorization / No Access To Box case

      // .catch((error) => {
      //   alert(error);
      //   console.error(error);
      //   const resolvedQrValueWrapper = {
      //     ...qrValueWrapper,
      //     isLoading: false,
      //     finalValue: { kind: "noBoxtributeQr" },
      //   } as IQrValueWrapper;
      //   return Promise.resolve(resolvedQrValueWrapper);
      // });

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
        if (qrCode == null) {
          console.error("No Boxtribute QR Found");
          onScanningDone([{ kind: "noBoxtributeQr" }]);
        }
        else {
          apolloClient
            .query<
              GetBoxLabelIdentifierForQrCodeQuery,
              GetBoxLabelIdentifierForQrCodeQueryVariables
            >({
              query: GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
              variables: { qrCode },
            })
            .then(({ data }) => {
              // TODO: instead of directly navigating to the box,
              // call a prop callback and let the parent component handle
              // the navigation or operation
              const boxLabelIdentifier = data?.qrCode?.box?.labelIdentifier;
              if(boxLabelIdentifier == null) {
                onScanningDone([{ kind: "noBoxtributeQr" }]);
                console.error("No Box yet assigned to QR Code");
              }
              else {
                onScanningDone([{ kind: "success", value: boxLabelIdentifier }]);
              }
              // boxLabelIdentifier &&
              //   navigate(`/bases/${baseId}/boxes/${boxLabelIdentifier}`);
            });
        }
      }
    },
    [apolloClient, onScanningDone]
  );

  const onBulkScanningDone = (qrValueWrappers: IQrValueWrapper[]) => {
    const resolvedQrValues = qrValueWrappers.map(
      // TODO: improve typings/type handling here (to get rid of the `!`)
      (qrValueWrapper) => qrValueWrapper.finalValue!
    )
    onScanningDone(resolvedQrValues);
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
