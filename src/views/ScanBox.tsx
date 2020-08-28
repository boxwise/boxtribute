import React, { useState } from "react";
import QrReader from "react-qr-reader";
import { Link } from "react-router-dom";
import { Button, Icon } from "semantic-ui-react";
import { Header } from "semantic-ui-react";

function ScanBox() {
  const [data, setData] = useState("");
  const [qrError, setQrError] = useState("");

  const displayReader = () => {
    if (data) {
      return (
        <div>
          <a href={data}>{data}</a>
          <br />
          <Button onClick={() => setData("")}>Scan again</Button>
        </div>
      );
    }
    if (qrError) {
      return (
        <div>
          <Header as="h2">Oh no!</Header>
          <p>
            There seems to be a problem! Your device or browser may not be compatible with scanning
            a QR code here. Please open your camera or other QR-reader and use that instead. If you
            are on iOS, you can also try using Safari.{" "}
          </p>
        </div>
      );
    }
    return (
      <QrReader
        delay={300}
        onError={(err) => setQrError(err)}
        onScan={setData}
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
