import { gql, useMutation } from "@apollo/client";
import {
  background,
  Box,
  Button,
  color,
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
    flexWrap: "wrap",
    display: "flex",
    margin: "0 auto",
    justifyContent: "space-around",

  },
  // sectionOfTwoLabels: {
  //   flexDirection: "column",
  //   margin: 10,
  //   padding: 10,
  //   // flexGrow: 1,
  // },
  qrLabelSection: {
    display : "flex",
    minHeight: "420px", 
    minWidth: "290px",
    maxHeight: "420px",
    // backgroundColor: "red",
    // margin: "10px",
    padding: "10px",

  },
  logoImage: {
    width: "60px",
    height: "60px",
    // backgroundColor: "blue",
  },
  boxNumber: {  
    marginBottom: "70px",
    
  },
  contents: {  
    marginBottom: "30px",
    marginTop: "10px",
    
  },
  stripe: {
    alignSelf: "center",
  },
  qrImage: {
    width: "130px",
    height: "130px",
    marginTop: "20px",
    marginLeft: "10px",
  }
});

const QrLabelSection = ({ qrCodeDataUri }: { qrCodeDataUri: string }) => (
  <View style={styles.qrLabelSection} debug={true}>
    <PdfText style={styles.boxNumber}>Box Number</PdfText>
    <PdfText style={styles.stripe}>___________________________</PdfText>
    <PdfText style={styles.contents}>Contents</PdfText>
    <PdfText style={styles.stripe}>___________________________</PdfText>
    <View style={{ flexDirection: "row", marginBottom: "30px", marginTop: "10px" }}>
      <PdfText style={{width: "135px" }}>Gender</PdfText>
      <PdfText>Size</PdfText>
    </View>
    <View style={{ flexDirection: "row" }}>
      <View style={{ flexDirection: "column", justifyContent: "space-between", marginTop: "15px" }}>
        <PdfText>Number of items</PdfText>
        <Image src={qrLabelBtLogo} style={styles.logoImage} />
      </View>
      <Image src={qrCodeDataUri} style={styles.qrImage} />
    </View>
  </View>
);

const PdfPageWithFourQrCodes = ({
  groupOfFourQrCodeUris,
}: {
  groupOfFourQrCodeUris: string[];
}) => {
  // const groupsOfTwoQrCodeUris = chunk(groupOfFourQrCodeUris, 2);
  return (
    <Page wrap={false} size="A4" style={styles.page} orientation="portrait">
      {groupOfFourQrCodeUris.map((qrCodeDataUri, index) => {
        return <QrLabelSection key={index} qrCodeDataUri={qrCodeDataUri} />;
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
