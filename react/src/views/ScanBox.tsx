import React, { useState } from "react";
import { useLazyQuery } from "@apollo/client";
import QrReader from "react-qr-reader";
import { Link } from "react-router-dom";
import { Button, Icon, Header } from "semantic-ui-react";
import { QR_EXISTS, QR_BOX_EXISTS } from "../utils/queries";
import { Redirect } from "react-router";

function ScanBox() {
  const [qr, setQR] = useState("");
  const [qrExists, setQrExists] = useState(null);
  const [qrBoxExists, setQrBoxExists] = useState(null);
  const [qrError, setQrError] = useState("");

  const [getQrExistsQuery] = useLazyQuery(QR_EXISTS, {
    onCompleted: (data) => {
      setQrExists(data);
    },
  });

  const [getQrBoxExistsQuery] = useLazyQuery(QR_BOX_EXISTS, {
    onCompleted: (data) => {
      setQrBoxExists(data);
    },
  });

  const retrieveBox = (code) => {
    if (code) {
      const myQR = code.split("barcode=")[1];
      setQR(myQR);
      try {
        getQrExistsQuery({
          variables: {
            qr_code: String(myQR),
          },
        });
        getQrBoxExistsQuery({
          variables: {
            qr_code: String(myQR),
          },
        });
      } catch (e) {
        setQrError(e);
      }
    }
  };

  const displayReader = () => {
    if (qrExists == null && qrBoxExists == null) {
      return (
        <QrReader
          delay={300}
          onError={(err) => setQrError(err)}
          onScan={retrieveBox}
          style={{ width: "100%" }}
        />
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
    } else if (!qrExists) {
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
    } else if (qrExists && !qrBoxExists) {
      return (
        <Redirect
          to={{
            pathname: "/create-box",
            state: { qr: qr },
          }}
        />
      );
    } else {
      return (
        <Redirect
          to={{
            pathname: "/box-info",
            state: { qrCode: qr },
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
