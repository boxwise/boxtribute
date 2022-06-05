import { gql, useMutation } from "@apollo/client";
import { Box, Button, Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Text } from "@chakra-ui/react";
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

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "white",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  logoImage: {
    width: "250px",
    height: "250px",
  },
});

const QrLabelSection = ({ qrCodeDataUri }: { qrCodeDataUri: string }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.section}>
      <View>
        <PdfText>Number of items</PdfText>
        <Image src={qrCodeDataUri} style={styles.logoImage} />
        <PdfText>Box Number</PdfText>
      </View>
      <PdfText>Contents</PdfText>
      <View>
        <PdfText>Gender</PdfText>
        <Image src={qrLabelBtLogo} style={styles.logoImage} />
        <PdfText>Size</PdfText>
      </View>
    </View>
  </Page>
);
const MyDoc = (qrCodeDataUris: string[]) => {
  return (
    <Document>
      {qrCodeDataUris.map((qrCodeDataUri, index) => (
        <QrLabelSection key={index} qrCodeDataUri={qrCodeDataUri} />
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
      // console.log("FOO", qrCodeDataUri);
      qrCodeCanvasList.push(qrCodeDataUri);
    });

    // alert(qrCodeDataUri);
    setQrCodeDataUris(qrCodeCanvasList);
  }, []);

  return (
    <>
      {qrCodeDataUris?.length > 0 && (
        <PdfGenerator qrCodeDataUris={qrCodeDataUris} />
      )}
      <RenderedQRCodes qrCodes={qrCodes} />
      {/* <Box>qrCodeDataUris: {JSON.stringify(qrCodeDataUris)}</Box> */}
    </>
  );
};

const AutomaticDownloadLink = ({ url }: { url: string }) => {
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    console.log("FOO-url", url);
    if (linkRef.current) {
      linkRef.current.click();
    }
  }, [url]);

  return (
    <a href={url} download="test.pdf" ref={linkRef} style={{display: "none"}}>
      Download
    </a>
  );
};

const PdfGenerator = ({ qrCodeDataUris }: { qrCodeDataUris: string[] }) => {
  console.log("PdfGenerator#qrCodeDataUris", qrCodeDataUris);

  const [instance, updateInstance] = usePDF({
    document: MyDoc(qrCodeDataUris),
  });

  // updateInstance();

  useEffect(() => {
    console.log("PdfGenerator#useEffect");
    updateInstance();
  }, [qrCodeDataUris, updateInstance]);

  // const navigate = useNavigate();

  if (instance.loading) return <div>Loading ...</div>;

  if (instance.error) return <div>Something went wrong: {instance.error}</div>;

  if (instance.url != null) {
    // navigate(instance.url);
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
  // const qrCodes = ["1", "2", "3", "4"].map(boxtributeQRCodeFormatter);

  const [createMultipleQrCodesMutation, createMultipleQrCodesMutationStatus] = useMutation<
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
      {/* <QRGenerator /> */}
      {/* <PDFViewer>
          <MyDocument />
        </PDFViewer> */}
    </Box>
  );
};

export default QRLabelGeneratorView;
