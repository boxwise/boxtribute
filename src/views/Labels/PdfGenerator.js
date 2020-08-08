/* eslint-disable prefer-destructuring */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-return-assign */
/* eslint-disable react/button-has-type */
/* eslint-disable react/no-string-refs */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Label } from './Label';
import { PDFExport } from '@progress/kendo-react-pdf';


class PdfGenerator extends Component {
  pdfExportComponent;

  constructor(props) {
    super(props);
    this.canvLoaded = false;
  }

  exportPDF = () => {
    this.pdfExportComponent.save();
  };

  render() {
    var labels = [];
    for (let i = 0; i < this.props.match.params.num; i += 1) {
      labels.push(<Label url="https://www.facebook.com" key={i} />);
      if (i + 1 != this.props.match.params.num && (i + 1) % 4 === 0) {
        labels.push(<div className="page-break"></div>);
      }
    }
    return (
      <>
        <div>
          {!this.canvLoaded && (
            <canvas ref="canvas" style={{ display: 'none' }} />
          )}
          <div style={{ textAlign: 'center' }}>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={this.exportPDF}
              variant="contained" 
              color="primary"
              style={{ margin: 'auto', marginBottom: '15px', marginTop: '15px'}}
            >
              Download As PDF
            </button>
          </div>
          <div
            style={{
              paddingTop: 20,
              marginLeft: "30%",
              marginRight: "30%",
            }}
          >
            <PDFExport
              paperSize="A4"
              fileName="boxwise_QR.pdf"
              forcePageBreak=".page-break"
              ref={(p) => (this.pdfExportComponent = p)}
            >
                {labels}
            </PDFExport>
          </div>
        </div>
        <div style ={{display: 'inline'}}>
          <Link to="/">Go Home</Link>
        </div>
      </>
    );
  }
}

export default PdfGenerator;
