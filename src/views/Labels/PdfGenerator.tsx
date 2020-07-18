/* eslint-disable no-return-assign */
/* eslint-disable react/button-has-type */
/* eslint-disable react/no-string-refs */
import React, { Component } from "react"
import { Link } from "react-router-dom"
import { PDFExport } from "@progress/kendo-react-pdf"
import QRUpper from "../../public/Boxtribute_QR_Label_Upper.jpg"
import QRLower from "../../public/Boxtribute_QR_Label_Lower.jpg"

// eslint-disable-next-line no-unused-vars
class PdfGenerator extends Component<PdfGeneratorProps> {
  page
  imageUpper
  imageLower
  canvLoaded: boolean

  constructor(props: PdfGeneratorProps) {
    super(props)
    this.canvLoaded = false
  }

  exportPDF = () => {
    this.page.save()
  }

  render() {
    return (
      <div
        style={{
          height: "112vh",
          width: "100vw",
          paddingTop: 20,
          backgroundColor: "gray",
        }}
      >
        {!this.canvLoaded && (
          <canvas ref="canvas" style={{ display: "none" }} />
        )}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={this.exportPDF}
            style={{ margin: "auto", marginBottom: "15px" }}
          >
            Download QR Code
          </button>
        </div>
        <PDFExport
          paperSize="Letter"
          fileName="boxwise_QR.pdf"
          title=""
          subject=""
          keywords=""
          ref={(p) => (this.page = p)}
        >
          <div
            style={{
              height: 792,
              width: 600,
              padding: "none",
              backgroundColor: "white",
              boxShadow: "5px 5px 5px black",
              margin: "auto",
              overflowX: "hidden",
              overflowY: "hidden",
            }}
          >
            <img
              ref={(image) => (this.imageUpper = image)}
              src={QRUpper}
              width="550px"
              height="483px"
              alt="Boxtribute Logo"
            />
            <div
              style={{ display: "flex", flexDirection: "row", width: "600px" }}
            >
              <img
                ref={(image) => (this.imageLower = image)}
                src={QRLower}
                alt="Boxtribute Logo"
              />
              <p>
                This is where the database query for the QR code would happen in
                the code
              </p>
            </div>
          </div>
        </PDFExport>
        <Link to="/">Go Home</Link>
      </div>
    )
  }
}

export default PdfGenerator

interface PdfGeneratorProps {
  authObject: any
}
