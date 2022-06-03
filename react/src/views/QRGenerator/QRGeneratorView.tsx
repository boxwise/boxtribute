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

  useEffect(() => {
    const qrCodeCanvas = document.querySelectorAll(
      "[data-qr-code='1']"
    )[0] as HTMLCanvasElement;

    const qrCodeDataUri = qrCodeCanvas.toDataURL("image/png");
    setQrCodeDataUris([qrCodeDataUri]);
  }, []);

  return (
    <>
      <Box>qrCodeDataUris: {JSON.stringify(qrCodeDataUris)}</Box>
      <QRCode data-qr-code="1" value="https://www.google.com" size={300} />
    </>
  );
};

const PdfGenerator = () => {
  const MyDoc = () => {
    const base64Image =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAJUlEQVR42u3NQQEAAAQEsJNcdFLw2gqsMukcK4lEIpFIJBLJS7KG6yVo40DbTgAAAABJRU5ErkJggg==";
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <PdfText>Section #1</PdfText>
          </View>
          <View style={styles.section}>
            <PdfText>Section #2</PdfText>
            <Image src={base64Image} style={styles.logoImage} />
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
      <PdfGenerator />
      {/* <QRGenerator /> */}
      {/* <PDFViewer>
          <MyDocument />
        </PDFViewer> */}
    </Box>
  );
};

export default QRGeneratorView;
