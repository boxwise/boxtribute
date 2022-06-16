import { useCallback, useEffect, useState } from "react";
import { QrReader } from "react-qr-reader";
import { Container, useDisclosure } from "@chakra-ui/react";
import { gql, useLazyQuery } from "@apollo/client";
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

const QrScannerOverlayView = () => {
  const [getBoxLabelIdentifierByQrCode, { data }] = useLazyQuery<
    GetBoxLabelIdentifierForQrCodeQuery,
    GetBoxLabelIdentifierForQrCodeQueryVariables
  >(GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE);
  const navigate = useNavigate();
  const baseId = useParams<{ baseId: string }>().baseId!;

  const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });

  useEffect(() => {
    data?.qrCode?.box?.labelIdentifier &&
      navigate(`/bases/${baseId}/boxes/${data.qrCode.box.labelIdentifier}`);
  }, [baseId, data, navigate]);

  // const [isBulkModeActive, setIsBulkModeActive] = useState(false);
  const [scannedQrValues, setScannedQrValues] = useState<QrValueWrapper[]>([]);

  const onResult = useCallback(
    (result: string) => {
      if (!!result) {
        const qrCode = extractQrCodeFromUrl(result);
        if (qrCode != null) {
          getBoxLabelIdentifierByQrCode({ variables: { qrCode } });
        }
      }
    },
    [getBoxLabelIdentifierByQrCode]
  );

  const onBulkScanningDone = () => {
    console.debug("Bulk Scanning Done");
  };

  return (
    <QrScanner
      isBulkModeSupported={true}
      scannedQrValues={scannedQrValues}
      setScannedQrValues={setScannedQrValues}
      onResult={onResult}
      onBulkScanningDone={onBulkScanningDone}
      isOpen={isOpen}
      // onOpen={onOpen}
      onClose={onClose}
      // bulkModeActive={isBulkModeActive}
      // onToggleBulkMode={() => setIsBulkModeActive(prev => !prev)}
    />
  );
};

export default QrScannerOverlayView;
