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

const MyDocument = () => {
    const qrCodeCanvas = document.querySelectorAll(
      "[qr-code-1]"
    )[0] as HTMLCanvasElement;
    const qrCodeDataUri = qrCodeCanvas.toDataURL("image/png");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <PdfText>Section #1</PdfText>
        </View>
        <View style={styles.section}>
          <PdfText>Section #2</PdfText>
          <Image src={qrCodeDataUri} style={styles.logoImage} />
        </View>
      </Page>
    </Document>
  );
};

const MyDoc = (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <PdfText>Section #1</PdfText>
      </View>
      <View style={styles.section}>
        <PdfText>Section #2</PdfText>
        <Image src={"dasd"} style={styles.logoImage} />
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

const QRGeneratorView = () => {
  //   const FOO = (
  //     <QRCodeSVG
  //       value={boxtributeQRCodeFormatter("adsdasdsd")}
  //       size={128}
  //       bgColor={"#ffffff"}
  //       fgColor={"#000000"}
  //       level={"L"}
  //       includeMargin={false}
  //     />
  //   );

//   const [instance, updateInstance] = usePDF({ document: MyDoc });

  //   if (instance.loading) return <div>Loading ...</div>;

  //   if (instance.error) return <div>Something went wrong: {instance.error}</div>;

  //   if (instance.url != null) {
  //     return (
  //       <>
  //         {instance.url != null && (<QRCodeSVG
  //           value={boxtributeQRCodeFormatter("adsdasdsd")}
  //           size={128}
  //           bgColor={"#ffffff"}
  //           fgColor={"#000000"}
  //           level={"L"}
  //           includeMargin={false}
  //           data-qr="qr-code-1"
  //         />
  //   )}
  //         {instance.url}
  //         <br />
  //         <a href={instance.url} download="test.pdf">
  //           Download
  //         </a>
  return (
    <>
      <QRCodeSVG
        value={boxtributeQRCodeFormatter("adsdasdsd")}
        size={128}
        bgColor={"#ffffff"}
        fgColor={"#000000"}
        level={"L"}
        includeMargin={false}
        data-qr="qr-code-1"
      />
      <PDFDownloadLink
        document={<MyDocument />}
        fileName="movielist.pdf"
        style={{
          textDecoration: "none",
          padding: "10px",
          color: "#4a4a4a",
          backgroundColor: "#f2f2f2",
          border: "1px solid #4a4a4a",
        }}
      />
    </>
  );

  // );
  //   }

  return <>PDF Generator Error</>;

  //   return (
  //     <Box>
  //       <Text
  //         fontSize={{ base: "16px", lg: "18px" }}
  //         // color={useColorModeValue('yellow.500', 'yellow.300')}
  //         fontWeight={"500"}
  //         textTransform={"uppercase"}
  //         mb={"4"}
  //       >
  //         QR Generator
  //       </Text>
  //       {/* <QRGenerator /> */}
  //       {/* <PDFViewer>
  //         <MyDocument />
  //       </PDFViewer> */}


  //     </Box>
  //   );
};

export default QRGeneratorView;
