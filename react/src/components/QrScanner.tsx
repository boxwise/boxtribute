import { useEffect } from "react";
import { QrReader } from "react-qr-reader";
import {Container } from "@chakra-ui/react";
import { gql, useLazyQuery } from "@apollo/client";
import {
  GetBoxLabelIdentifierForQrCodeQuery,
  GetBoxLabelIdentifierForQrCodeQueryVariables,
} from "types/generated/graphql";
import { useNavigate, useParams } from "react-router-dom";

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

const QrScanner = () => {
  const [getBoxLabelIdentifierByQrCode, { data }] = useLazyQuery<
  GetBoxLabelIdentifierForQrCodeQuery,
    GetBoxLabelIdentifierForQrCodeQueryVariables
  >(GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE);
  const navigate = useNavigate();
  const baseId = useParams<{ baseId: string }>().baseId!;

  useEffect(() => {
      data?.qrCode?.box?.labelIdentifier && navigate(`/bases/${baseId}/boxes/${data.qrCode.box.labelIdentifier}`);
  }, [baseId, data, navigate]);

  return (
        <Container maxW="md">
          <QrReader
            constraints={{
              facingMode: "user",
            }}
            scanDelay={1000}
            onResult={(result, error) => {
              if (!!result) {
                const qrCode = extractQrCodeFromUrl(result["text"]);
                if (qrCode != null) {
                  getBoxLabelIdentifierByQrCode({ variables: { qrCode } });
                }
              }

              if (!!error) {
                console.info(error);
              }
            }}
          />
        </Container>
  );
};

export default QrScanner;
