/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from "react"
import { NumberPicker } from "react-widgets"
import { Link } from "react-router-dom"
import QRCode from 'qrcode.react';

const Labels = () => {
  const [labelState, setLabelState] = useState(0)
  var labels = []

  const generateCodes = (num) => {
    labels = []
    for(let i=0; i<num; i+=1){
      labels.push(<QRCode value="https://www.facebook.com" includeMargin size={128} key={i}/>)
    }
  }
  return (
    <div>
      <label>
        How many QR codes would you like to generate?
        <NumberPicker
          max={10}
          min={0}
          value={labelState}
          // eslint-disable-next-line react/jsx-no-bind
          onChange={(value) => setLabelState(value)}
        />
      </label>
      <Link to={`/generateLabel/${labelState}`}>Generate Full Box QR Labels</Link>
      <br />
      <button onClick={generateCodes(labelState)}>
        Generate QR Codes
      </button>
      <div>
        {labels}
      </div>
      <br />
      <Link to="/">Go Home</Link>
    </div>
  )
}

export default Labels
