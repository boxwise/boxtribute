import React, { useState } from "react"
import QrReader from "react-qr-reader"
import { Link } from "react-router-dom"

function ScanBox() {
  const [data, setData] = useState("")
  const [qrError, setQrError] = useState("")

  const displayReader = () => {
    if (data) {
      return (
        <div>
          <a href={data}>{data}</a>
          <br />
          <button
            onClick={() => setData("")}
            className="m-1 bg-red-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
          >
            Scan again
          </button>
        </div>
      )
    }
    if (qrError) {
      return (
        <div>
          <h2>Oh no!</h2>
          <p>
            There seems to be a problem! Your device or browser may not be compatible with scanning
            a QR code here. Please open your camera or other QR-reader and use that instead. If you
            are on iOS, you can also try using Safari.{" "}
          </p>
        </div>
      )
    }
    return (
      <QrReader
        delay={300}
        onError={(err) => setQrError(err)}
        onScan={setData}
        style={{ width: "100%" }}
      />
    )
  }

  return (
    <div>
      <h2>Scan a box now:</h2>
      {displayReader()}

      <Link
        to="/"
        className="m-1 leading-loose bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        type="button"
      >
        Go Home
      </Link>
    </div>
  )
}

export default ScanBox
