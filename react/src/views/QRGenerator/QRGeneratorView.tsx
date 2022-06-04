import { Box, Text } from "@chakra-ui/react";
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
import { useEffect, useState } from "react";
import { boxtributeQRCodeFormatter } from "utils/helpers";

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#E4E4E4",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  logoImage: {
    width: "25%",
    height: "25%",
  },
});

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
      {qrCodeDataUris != null && (
        <PdfGenerator qrCodeDataUris={qrCodeDataUris} />
      )}
      {qrCodes.map((qrCode, index) => (
        <QRCode key={index} data-qr-code={index} value={qrCode} size={300} />
      ))}
      <Box>qrCodeDataUris: {JSON.stringify(qrCodeDataUris)}</Box>
    </>
  );
};

const QrLabelSection = ({ qrCodeDataUri }: { qrCodeDataUri: string }) => (
  <View style={styles.section}>
    <PdfText>Number of items</PdfText>
    <Image src={qrCodeDataUri} style={styles.logoImage} />
  </View>
);
const MyDoc = (qrCodeDataUris: string[]) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          {/* <PdfText>{JSON.stringify(qrCodeDataUris)}</PdfText> */}
          <PdfText>qrCodeDataUris.length: {qrCodeDataUris.length}</PdfText>
        </View>
        {qrCodeDataUris.map((qrCodeDataUri, index) => (
          <QrLabelSection key={index} qrCodeDataUri={qrCodeDataUri} />
        ))}

        <View style={styles.section}>
          {/* <PdfText>{JSON.stringify(qrCodeDataUris)}</PdfText> */}
          <PdfText>Section #2</PdfText>
          {/* <Image src={qrCodeDataUris[0]} style={styles.logoImage} /> */}
          {/* <QRCodeSVG
        value={boxtributeQRCodeFormatter("adsdasdsd")}
        size={128}
        bgColor={"#ffffff"}
        fgColor={"#000000"}
        level={"L"}
        includeMargin={false}
      /> */}
        </View>
      </Page>
    </Document>
  );
};

const PdfGenerator = ({ qrCodeDataUris }: { qrCodeDataUris: string[] }) => {
  console.log("PdfGenerator#qrCodeDataUris", qrCodeDataUris);

  const [instance, updateInstance] = usePDF({ document: MyDoc(qrCodeDataUris) });

  // updateInstance();

  useEffect(() => {
    console.log("PdfGenerator#useEffect");
    updateInstance();
  }, [qrCodeDataUris, updateInstance]);

  if (instance.loading) return <div>Loading ...</div>;

  if (instance.error) return <div>Something went wrong: {instance.error}</div>;

  if (instance.url != null) {
    return (
      <>
        {instance.url != null && (
          <>
            {instance.url}
            <br />
            <a href={instance.url} download="test.pdf">
              Download
            </a>
          </>
        )}
      </>
    );
  }

  return <>Loading...</>;
};

const QRGeneratorView = () => {
  const qrCodes = ["1", "2", "3", "4"];

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
      <QRGenerator qrCodes={qrCodes} />
      {/* <QRGenerator /> */}
      {/* <PDFViewer>
          <MyDocument />
        </PDFViewer> */}
    </Box>
  );
};

export default QRGeneratorView;
