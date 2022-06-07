import { gql, useMutation } from "@apollo/client";
import {
  Box,
  Button,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
} from "@chakra-ui/react";
import {
  Document,
  Page,
  Text as PdfText,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { PDFViewer, PDFDownloadLink, usePDF } from "@react-pdf/renderer";
import QRCode, { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreateMultipleQrCodesMutation,
  CreateMultipleQrCodesMutationVariables,
} from "types/generated/graphql";
import { boxtributeQRCodeFormatter } from "utils/helpers";
import qrLabelBtLogo from "./qr-label-bt-logo.png";

import { chunk } from "lodash";

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "white",
  },
  sectionOfTwoLabels: {
    flexDirection: "column",
    margin: 10,
    padding: 10,
    // flexGrow: 1,
  },
  qrLabelSection: {
    flex: "1", 
  }, 
  logoImage: {
    width: "60px",
    height: "60px",
  },
});

const QrLabelSection = ({ qrCodeDataUri }: { qrCodeDataUri: string }) => (
  <View style={styles.sectionOfTwoLabels} debug={true}>
    <View>
      <PdfText>Box Number</PdfText>
      <PdfText>Contents</PdfText>
      <View style={{ flexDirection: "row" }}>
        <PdfText>Gender</PdfText>
        <PdfText>Size</PdfText>
      </View>
      <View style={{ flexDirection: "row" }}>
        <View style={{ flexDirection: "column" }}>
          <PdfText>Number of items</PdfText>
          <Image src={qrLabelBtLogo} style={styles.logoImage} />
        </View>
        <Image src={qrCodeDataUri} style={styles.logoImage} />
      </View>
    </View>
  </View>
);

const PdfPageWithFourQrCodes = ({
  groupOfFourQrCodeUris,
}: {
  groupOfFourQrCodeUris: string[];
}) => {
  const groupsOfTwoQrCodeUris = chunk(groupOfFourQrCodeUris, 2);
  return (
    <Page wrap={false} size="A4" style={styles.page} orientation="portrait">
      {groupsOfTwoQrCodeUris.map((groupOfTwoQrCodeUris, index) => {
        return (
          <View style={styles.sectionOfTwoLabels}>
            {groupOfTwoQrCodeUris.map((qrCodeDataUri, index) => (
              <QrLabelSection key={index} qrCodeDataUri={qrCodeDataUri} />
            ))}
          </View>
        );
      })}
    </Page>
  );
};

const MyDoc = (qrCodeDataUris: string[]) => {
  const groupsOfFourQrCodeUris = chunk(qrCodeDataUris, 4);
  return (
    <Document>
      {groupsOfFourQrCodeUris.map((groupOfFourQrCodeUris, index) => (
        <PdfPageWithFourQrCodes
          groupOfFourQrCodeUris={groupOfFourQrCodeUris}
          key={index}
        />
      ))}
    </Document>
  );
};

const RenderedQRCodes = ({ qrCodes }: { qrCodes: string[] }) => {
  return (
    <div style={{ display: "none" }}>
      {qrCodes.map((qrCode, index) => (
        <QRCode key={index} data-qr-code={index} value={qrCode} size={300} />
      ))}
    </div>
  );
};

interface QRCodeGeneratorProps {
  qrCodes: string[];
}

const QRGenerator = ({ qrCodes }: QRCodeGeneratorProps) => {
  const [qrCodeDataUris, setQrCodeDataUris] = useState<string[]>([]);

  useEffect(() => {
    const qrCodeCanvasList: string[] = [];

    (
      document.querySelectorAll(
        "[data-qr-code]"
      ) as NodeListOf<HTMLCanvasElement>
    ).forEach((qrCodeCanvas: HTMLCanvasElement) => {
      const qrCodeDataUri = qrCodeCanvas.toDataURL("image/png");
      qrCodeCanvasList.push(qrCodeDataUri);
    });

    setQrCodeDataUris(qrCodeCanvasList);
  }, []);

  return (
    <>
      {qrCodeDataUris?.length === qrCodes.length && (
        <PdfGenerator qrCodeDataUris={qrCodeDataUris} />
      )}
      <RenderedQRCodes qrCodes={qrCodes} />
    </>
  );
};

const AutomaticDownloadLink = ({ url }: { url: string }) => {
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (linkRef.current && url != null) {
      linkRef.current.click();
    }
  }, [url]);

  var d = new Date();

  var dateTimeString = `${d.getFullYear()}_${d.getMonth()}_${d.getDate()}__${d.getHours()}_${d.getMinutes()}_${d.getSeconds()}`;

  return (
    <a
      href={url}
      download={`bt-qr-codes-${dateTimeString}.pdf`}
      ref={linkRef}
      style={{ display: "none" }}
    >
      Download
    </a>
  );
};

const PdfGenerator = ({ qrCodeDataUris }: { qrCodeDataUris: string[] }) => {
  const [instance] = usePDF({
    document: MyDoc(qrCodeDataUris),
  });

  if (instance.loading) return <div>Loading ...</div>;

  if (instance.error) return <div>Something went wrong: {instance.error}</div>;

  if (instance.url != null) {
    return <AutomaticDownloadLink url={instance.url} />;
  }

  return <div>Loading...</div>;
};

export const CREATE_MULTIPLE_QR_CODES_MUTATION = gql`
  mutation CreateMultipleQrCodes($amount: Int!) {
    createMultipleQrCodes(amount: $amount) {
      id
      code
    }
  }
`;

const QRLabelGeneratorView = () => {
  const [createMultipleQrCodesMutation, createMultipleQrCodesMutationStatus] =
    useMutation<
      CreateMultipleQrCodesMutation,
      CreateMultipleQrCodesMutationVariables
    >(CREATE_MULTIPLE_QR_CODES_MUTATION);

  const [amountOfQrCodes, setAmountOfQrCodes] = useState<string>("1");

  return (
    <Box>
      <Text
        fontSize={{ base: "16px", lg: "18px" }}
        // color={useColorModeValue('yellow.500', 'yellow.300')}
        fontWeight={"500"}
        textTransform={"uppercase"}
        mb={"4"}
      >
        QR Generator
      </Text>
      <NumberInput
        value={amountOfQrCodes}
        min={1}
        max={20}
        onChange={(e) => {
          setAmountOfQrCodes(e);
        }}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
      <Button
        onClick={() =>
          createMultipleQrCodesMutation({
            variables: {
              amount: parseInt(amountOfQrCodes),
            },
          })
        }
      >
        Generate QR Code PDFs
      </Button>
      {createMultipleQrCodesMutationStatus.data?.createMultipleQrCodes && (
        <QRGenerator
          qrCodes={createMultipleQrCodesMutationStatus.data?.createMultipleQrCodes.map(
            (qrCode) => boxtributeQRCodeFormatter(qrCode.code)
          )}
        />
      )}
    </Box>
  );
};

export default QRLabelGeneratorView;
