
import React, { Component } from 'react';
// / import { RouteProps } from 'react-router';
// eslint-disable-next-line import/no-extraneous-dependencies
import { RouteComponentProps } from "react-router";
import { withRouter, Link } from 'react-router-dom';
import { PDFExport } from '@progress/kendo-react-pdf';
import Label from './Label';

class PdfGenerator extends Component<PdfGeneratorProps & RouteComponentProps<{num}>> {
  page
  imageUpper
  imageLower
  canvLoaded: boolean
  pdfExportComponent!: PDFExport | null;

  constructor(props: PdfGeneratorProps & RouteComponentProps<{num}>) {
    super(props)
    this.canvLoaded = false
  }

  exportPDF = () => {
    if (this.pdfExportComponent !== null) this.pdfExportComponent.save();
  };

  render() {
    const labels : JSX.Element[] = []
    // eslint-disable-next-line radix
    const num = parseInt(this.props.match.params.num)
    for (let i = 0; i < num; i += 1) {
      labels.push(<Label url="https://www.facebook.com" key={i} />);
      if (i + 1 !== num && (i + 1) % 4 === 0) { // != vs !==
        labels.push(<div className="page-break" />);
      }
    }
    return (
      <>
        <div>
          {!this.canvLoaded && (
            // eslint-disable-next-line react/no-string-refs
            <canvas ref="canvas" style={{ display: 'none' }} />
          )}
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={this.exportPDF}
              // variant="contained"
              color="primary"
              style={{ margin: 'auto', marginBottom: '15px', marginTop: '15px' }}
            >
              Download As PDF
            </button>
          </div>
          <div
            style={{
              paddingTop: 20,
              marginLeft: "25%",
              marginRight: "25%",
            }}
          >
            <PDFExport
              paperSize="A4"
              fileName="boxwise_QR.pdf"
              forcePageBreak=".page-break"
              // eslint-disable-next-line no-return-assign
              ref={(p) => (this.pdfExportComponent = p)}
            >
              {labels}
            </PDFExport>
          </div>
        </div>
        <div style={{ display: 'inline' }}>
          <Link to="/">Go Home</Link>
        </div>
      </>
    );
  }
}

export default withRouter(PdfGenerator)

interface PdfGeneratorProps {
}
