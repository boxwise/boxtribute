import React, { useState } from "react";
import { useLazyQuery } from "@apollo/client";
import QrReader from "react-qr-reader";
import { Link } from "react-router-dom";
import { Button, Icon, Header } from "semantic-ui-react";
import { BOX_BY_QR } from "../utils/queries";
import { Redirect } from "react-router";
import { emptyBox } from "../utils/emptyBox";

function ScanBox() {
  const [box, setBox] = useState(emptyBox);
  const [boxError, setBoxError] = useState("");
  const [qr, setQR] = useState("");
  const [qrError, setQrError] = useState("");

  const [getBoxQuery, { loading: queryLoading, error: queryError }] = useLazyQuery(BOX_BY_QR, {
    onCompleted: (data) => {
      var newBox = data.box;
      setBox({
        box_id: newBox.box_id,
        product_id: newBox.product_id,
        size_id: newBox.size_id,
        items: newBox.items,
        location_id: newBox.location_id,
        comments: newBox.comments,
        qr_id: newBox.qr_id,
        box_state_id: newBox.box_state_id,
      });
    },
    onError: (err) => {
      if (err.message.includes("Model: QRCode")) {
        // tell user that the QR code is not affiliated with Boxtribute
        setQrError(err.message);
      } else if (err.message.includes("Model: Box")) {
        // redirect the user to the CreateBox page, send the QR as state
        setBoxError(err.message);
      }
    },
  });

  const retrieveBox = (code) => {
    if (code) {
      const myQR = code.split("barcode=")[1];
      setQR(myQR);
      try {
        getBoxQuery({
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
    if (box.box_id) {
      return (
        <div>
          <h2>Box Found!</h2>
          <p>Box ID: {box.box_id}</p>
          <p>Items: {box.items}</p>
          <p>Product ID: {box.product_id}</p>
          <p>Location ID: {box.location_id}</p>
          <br />
          <Button onClick={() => setBox(emptyBox)}>Scan again</Button>
        </div>
      );
    }
    if (qrError) {
      return (
        <div>
          <Header as="h2">Oh no!</Header>
          <p>
            <br />
            There seems to be a problem! If you scanned a QR code, it does not appears to be
            associated with Boxtribute and therefore cannot be connected to a box in our system.
            Alternatively, your device or browser may not be compatible with scanning a QR code
            here. Please open your camera or other QR-reader and use that instead. If you are on
            iOS, you can also try using Safari.
            <br />
          </p>
        </div>
      );
    }
    if (boxError) {
      return (
        <Redirect
          to={{
            pathname: "/create-box",
            state: { qr: qr },
          }}
        />
      );
    }
    return (
      <QrReader
        delay={300}
        onError={(err) => setQrError(err)}
        onScan={retrieveBox}
        style={{ width: "100%" }}
      />
    );
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
