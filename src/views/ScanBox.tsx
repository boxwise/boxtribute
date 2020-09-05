import React, { useState } from "react";
import QrReader from "react-qr-reader";
import { Link } from "react-router-dom";
import { Button, Icon } from "semantic-ui-react";
import { Header } from "semantic-ui-react";

function ScanBox() {
  const [data, setData] = useState("");
  const [qrError, setQrError] = useState("");
  const [next, setNext] = useState("");

  const displayReader = () => {
    if (data && next) {
      return (
        <div>
          <Link
            to={{
              pathname: `/${next}`,
              state: {
                qr: data,
              },
            }}
            className="m-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {next}
          </Link>
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
      {!next && (
        <div>
          <button
            onClick={() => setNext("create-box")}
            type="button"
            className={`border p-4 rounded ${next === "create-box" ? "bg-blue-500" : ""}`}
          >
            Make a new box
          </button>
          <button
            onClick={() => setNext("edit-box")}
            type="button"
            className={`border p-4 rounded ${next === "edit-box" ? "bg-blue-500" : ""}`}
          >
            Move or modify an existing box
          </button>
        </div>
      )}
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
