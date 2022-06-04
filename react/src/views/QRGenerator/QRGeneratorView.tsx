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

const RenderedQRCodes = ({ qrCodes }: QRCodeGeneratorProps) => {
  const [qrCodeDataUris, setQrCodeDataUris] = useState<string[]>([]);

  return (
    <>
      {qrCodeDataUris != null && <PdfGenerator />}
      {qrCodes.map((qrCode, index) => (
        <QRCode key={index} data-qr-code={index} value={qrCode} size={300} />
      ))}
      <Box>qrCodeDataUris: {JSON.stringify(qrCodeDataUris)}</Box>
    </>
  );
};

const PdfGenerator = () => {
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

    // alert(qrCodeDataUri);
    setQrCodeDataUris(qrCodeCanvasList);
  }, []);

  const QrLabelSection = ({ qrCodeDataUri }: { qrCodeDataUri: string }) => (
    <View style={styles.section}>
      <PdfText>Number of items</PdfText>
      <Image src={qrCodeDataUri} style={styles.logoImage} />
    </View>
  );
  const MyDoc = () => {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <PdfText>{JSON.stringify(qrCodeDataUris)}</PdfText>
            <PdfText>Still here!!</PdfText>
          </View>
          {qrCodeDataUris.map((qrCodeDataUri, index) => (
            <QrLabelSection key={index} qrCodeDataUri={qrCodeDataUri} />
          ))}

          <View style={styles.section}>
            <PdfText>{JSON.stringify(qrCodeDataUris)}</PdfText>
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

  const [instance, updateInstance] = usePDF({ document: MyDoc() });

  // updateInstance();

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

  return <>Error with generating PDF (instance.url == null)</>;
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
      <RenderedQRCodes qrCodes={qrCodes} />
      {/* <QRGenerator /> */}
      {/* <PDFViewer>
          <MyDocument />
        </PDFViewer> */}
    </Box>
  );
};

export default QRGeneratorView;
