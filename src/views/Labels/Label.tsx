import React from "react";
import QRCode from "qrcode.react";
import QRUpper from "../../public/Boxtribute_QR_Label_Upper.jpg";
import QRLower from "../../public/Boxtribute_QR_Label_Lower.jpg";

const Label = (props) => (
  <div
    style={{
      display: "float",
      float: "left",
      marginLeft: "20px",
    }}
  >
    <img src={QRUpper} width={275} alt="Boxtribute Logo" />
    <div style={{ display: "flex", marginBottom: "20px" }}>
      <img src={QRLower} width={155} alt="Boxtribute Logo" />
      <QRCode value={props.url} includeMargin size={105} />
    </div>
  </div>
);

export default Label;
