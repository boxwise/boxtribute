/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from "react"
import { NumberPicker } from "react-widgets"
import { Link } from "react-router-dom"
import QRCode from 'qrcode.react';

// eslint-disable-next-line no-unused-vars
const Labels = (props: LabelProps) => {
  const [numState, setNumState] = useState(0)
  const [labelState, setLabelState] = useState<QRCode | undefined>(undefined)
  // let labels : QRCode[] = []

  const generateCodes = (num) => {
    const temp: QRCode[] = []
    for (let i = 0; i < num; i += 1) {
      temp.push(<QRCode value="https://www.facebook.com" includeMargin size={128} key={i} />)
    }
    setLabelState(temp)
  }
  return (
    <div>
      <label>
        How many QR codes would you like to generate?
        <NumberPicker
          max={10}
          min={0}
          value={numState}
          onChange={(value) => {
            if (value) setNumState(value)
          }}
        />
      </label>
      <Link to={`/generateLabel/${numState}`}>Generate Full Box QR Labels</Link>
      <br />
      <button type="button" onClick={() => generateCodes(numState)}>
        Generate QR Codes
      </button>
      <div>
        {labelState}
      </div>
      <br />
      <Link to="/">Go Home</Link>
    </div>
  )
}

export default Labels

interface LabelProps {}
