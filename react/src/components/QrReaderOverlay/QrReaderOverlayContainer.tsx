import { useCallback } from "react";
import { gql, useApolloClient } from "@apollo/client";
import {
  GetBoxLabelIdentifierForQrCodeQuery,
  GetBoxLabelIdentifierForQrCodeQueryVariables,
} from "types/generated/graphql";
import QrReaderOverlay, {
  IQrValueWrapper,
  QrResolvedValue,
} from "./QrReaderOverlay";
const extractQrCodeFromUrl = (url): string | undefined => {
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

interface QrReaderOverlayContainerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanningDone: (qrValueWrappers: QrResolvedValue[]) => void;
}
const QrReaderOverlayContainer = ({
  isOpen,
  onClose,
  onScanningDone,
}: QrReaderOverlayContainerProps) => {
  const apolloClient = useApolloClient();

  const qrValueResolver = useCallback(
    (qrValueWrapper: IQrValueWrapper): Promise<IQrValueWrapper> => {
      const extractedQrCodeFromUrl = extractQrCodeFromUrl(qrValueWrapper.key);

      if (extractedQrCodeFromUrl == null) {
        // TODO: ADD PROPER ERROR MESSAGE HANDLING HERE
        const resolvedQrValueWrapper = {
          ...qrValueWrapper,
          isLoading: false,
          finalValue: { kind: "noBoxtributeQr" },
        } as IQrValueWrapper;
        console.error("Not a Boxtribute QR Code");
        return Promise.resolve(resolvedQrValueWrapper);
      }

      return apolloClient
        .query<
          GetBoxLabelIdentifierForQrCodeQuery,
          GetBoxLabelIdentifierForQrCodeQueryVariables
        >({
          query: GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
          variables: { qrCode: extractedQrCodeFromUrl },
        })
        .then(({ data, error, errors }) => {
          const boxLabelIdentifier = data?.qrCode?.box?.labelIdentifier;
          if (boxLabelIdentifier == null) {
            const resolvedQrValueWrapper = {
              ...qrValueWrapper,
              isLoading: false,
              finalValue: { kind: "notAssignedToBox" },
            } as IQrValueWrapper;
            console.debug("QR Code not assigned to any box yet");
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
        });
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
    },
    [apolloClient]
  );

  const onSingleScanDone = useCallback(
    (result: string) => {
      if (!!result) {
        const qrCode = extractQrCodeFromUrl(result);
        if (qrCode == null) {
          console.error("Not a Boxtribute QR Code");
          onScanningDone([{ kind: "noBoxtributeQr" }]);
        } else {
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
              if (boxLabelIdentifier == null) {
                onScanningDone([{ kind: "notAssignedToBox" }]);
                console.error("No Box yet assigned to QR Code");
              } else {
                onScanningDone([
                  { kind: "success", value: boxLabelIdentifier },
                ]);
              }
            });
        }
      }
    },
    [apolloClient, onScanningDone]
  );

  const onBulkScanningDone = useCallback(
    (qrValueWrappers: IQrValueWrapper[]) => {
      const resolvedQrValues = qrValueWrappers.map(
        // TODO: improve typings/type handling here (to get rid of the `!`)
        (qrValueWrapper) => qrValueWrapper.finalValue!
      );
      onScanningDone(resolvedQrValues);
    },
    [onScanningDone]
  );

  return (
    <>
      <QrReaderOverlay
        isBulkModeSupported={true}
        onSingleScanDone={onSingleScanDone}
        onBulkScanningDone={onBulkScanningDone}
        qrValueResolver={qrValueResolver}
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  );
};

export default QrReaderOverlayContainer;
