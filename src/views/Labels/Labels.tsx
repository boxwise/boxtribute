/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from "react"
import { NumberPicker } from "react-widgets"
import { Link } from "react-router-dom"

// eslint-disable-next-line no-unused-vars
const Labels = (props: LabelProps) => {
  const [labelState, setLabelState] = useState(0)

  return (
    <form>
      <label>
        How many QR codes would you like to generate?
        <NumberPicker
          max={10}
          min={0}
          value={labelState}
          onChange={(value) => {
            if (value) setLabelState(value)
          }}
        />
      </label>
      <Link to="/generateLabel">Generate QR Codes</Link>
      <br />
      <Link to="/">Go Home</Link>
    </form>
  )
}

export default Labels

interface LabelProps {
  authObject: any
}
