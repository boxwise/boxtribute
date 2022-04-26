import { useEffect, useState } from "react";
import { QrReader } from "react-qr-reader";
import { Textarea } from "@chakra-ui/react";
import { Button, Container } from "@chakra-ui/react";
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

const QrScanner = (props) => {
  const [qrCode, setQrCode] = useState<string | undefined>("No result");
  const [qrOpen, setQrOpen] = useState(true);
  const [getBoxLabelIdentifierByQrCode, { loading, error, data }] = useLazyQuery<
  GetBoxLabelIdentifierForQrCodeQuery,
    GetBoxLabelIdentifierForQrCodeQueryVariables
  >(GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE);
  const navigate = useNavigate();
  const baseId = useParams<{ baseId: string }>().baseId!;

  useEffect(() => {
      data?.qrCode?.box?.labelIdentifier && navigate(`/bases/${baseId}/boxes/${data.qrCode.box.labelIdentifier}`);
  }, [baseId, data, navigate]);

  return (
    <>
      {/* <div>
        <div>Loading: {JSON.stringify(loading)}</div>
        <div>Error: {JSON.stringify(error)}</div>
        <div>Data: {JSON.stringify(data)}</div>
      </div>
      <Button
        onClick={() => setQrOpen(!qrOpen)}
        colorScheme="teal"
        variant="outline"
      >
        Scan QR Code
      </Button> */}
      {qrOpen ? (
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
                setQrCode(qrCode);
              }

              if (!!error) {
                console.info(error);
              }
            }}
          />
        </Container>
      ) : null}
      {/* <Textarea
        style={{ fontSize: 18, width: 320, height: 100, marginTop: 100 }}
        value={qrCode}
        readOnly
      /> */}
    </>
  );
};

export default QrScanner;
