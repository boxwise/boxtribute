import React, { useState } from "react";
import { useLazyQuery } from "@apollo/client";
import QrReader from "react-qr-reader";
import { Link } from "react-router-dom";
import { Button, Icon, Header } from "semantic-ui-react";
import { QR_EXISTS } from "../utils/queries";
import { Redirect } from "react-router";

function ScanBox() {
  const [qr, setQR] = useState("");
  const [qrInfo, setQrInfo] = useState({ qrExists: null, qrBoxExists: null });
  const [qrError, setQrError] = useState("");

  const [getQrExistsQuery] = useLazyQuery(QR_EXISTS, {
    onCompleted: (data) => {
      setQrInfo(data);
    },
  });

  const retrieveBox = (code) => {
    if (code) {
      const myQR = code.split("barcode=")[1];
      setQR(myQR);
      try {
        getQrExistsQuery({
          variables: {
            qrCode: String(myQR),
          },
        });
      } catch (e) {
        setQrError(e);
      }
    }
  };

  const TestQRSelector = () => {
    const testQRCodeGroups = [
      {
        groupName: "Codes connected to existing Boxes in the seed", 
        qrCodes: [
          "https://staging.boxwise.co/mobile.php?barcode=387b0f0f5e62cebcafd48383035a92a",
          "https://staging.boxwise.co/mobile.php?barcode=cba56d486db6d39209dbbf9e45353c4",
          "https://staging.boxwise.co/mobile.php?barcode=a61e0efe25b75032b91106372674c26",
          "https://staging.boxwise.co/mobile.php?barcode=f6f20e805192618def2cb400776a2aa",
          "https://staging.boxwise.co/mobile.php?barcode=12ca607ce60c484bdbb703def950c5b",
          "https://staging.boxwise.co/mobile.php?barcode=13f12820c8010f2f7349962930e6bf4",
          "https://staging.boxwise.co/mobile.php?barcode=d0e144a0a4dc0d8af55e2b686a2e97e",
          "https://staging.boxwise.co/mobile.php?barcode=69107b2e2b4157b5efe10415bc0bba0",
          "https://staging.boxwise.co/mobile.php?barcode=b8f0730d36571e4149ba3862379bb88",
          "https://staging.boxwise.co/mobile.php?barcode=e1fdfdd942db0e764c9bea06c03ba2b"
        ]
      }, 
      {
        groupName: "Codes not yet connected to Boxes in the seed", 
        qrCodes: [
          "https://staging.boxwise.co/mobile.php?barcode=149ff66629377f6404b5c8d32936855",
          "https://staging.boxwise.co/mobile.php?barcode=91c1def0b674d4e7cb92b61dbe00846",
          "https://staging.boxwise.co/mobile.php?barcode=f660f96618eaa81e16b7869aca8d67d",
          "https://staging.boxwise.co/mobile.php?barcode=98b51c8cd1a02e54ab47edcc5733139",
          "https://staging.boxwise.co/mobile.php?barcode=168842e6389b520d4b1836562aa1f05",
          "https://staging.boxwise.co/mobile.php?barcode=22324b7a180bdd31e125d5d50791d17"
        ]
      }, 
    ];
    const clickTestQRCode = (testQRCode) => {
      debugger; 
      retrieveBox(testQRCode);
    };
    return <div>
      <h2>Test QR Codes (only in non-production)</h2>
      <ul style={{listStyle: 'none'}}>
        {testQRCodeGroups.map(testQRCodeGroup => 
        <li>
          <h3>{testQRCodeGroup.groupName}</h3>
          <ul>
            {testQRCodeGroup.qrCodes.map(qrCode => <li><button key={qrCode} onClick={() => clickTestQRCode(qrCode)}>{qrCode}</button></li>)}
          </ul>
        </li>
        )}
      </ul>
    </div>; 
  }

  const displayReader = () => {
    if (qrInfo.qrExists == null) {

      const showTestQRSelector = process.env.NODE_ENV === "development";
      
      return (
        <>
        {showTestQRSelector && <TestQRSelector />}
        <QrReader
          delay={300}
          onError={(err) => setQrError(err)}
          onScan={retrieveBox}
          style={{ width: "100%" }}
        />
        </>
      );
    } else if (qrError) {
      return (
        <div>
          <Header as="h2">Oh no!</Header>
          <p>
            <br />
            There seems to be a problem! Your device or browser may not be compatible with scanning
            a QR code here. Please open your camera or other QR-reader and use that instead. If you
            are on iOS, you can also try using Safari.
            <br />
          </p>
        </div>
      );
    } else if (!qrInfo.qrExists) {
      return (
        <div>
          <Header as="h2">Oh no!</Header>
          <p>
            <br />
            There seems to be a problem! The QR code you scanned does not seem to be associated with
            Boxtribute and therefore cannot be connected to a box.
            <br />
          </p>
        </div>
      );
    } else {
      if (qrInfo.qrBoxExists)
        return (
          <Redirect
            to={{
              pathname: "/box-info",
              state: { qr: qr },
            }}
          />
        );
      else
        return (
          <Redirect
            to={{
              pathname: "/create-box",
              state: { qr: qr },
            }}
          />
        );
    }
  };

  return (
    <div>
      <h2>Scan a box now:</h2>
      {displayReader()}
      <Link to="/">
        <Button animated>
          <Button.Content visible>Go Home</Button.Content>
          <Button.Content hidden>
            <Icon name="arrow left" />
          </Button.Content>
        </Button>
      </Link>
    </div>
  );
}

export default ScanBox;
