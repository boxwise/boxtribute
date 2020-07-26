/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from "react"
import { NumberPicker } from "react-widgets"
import { Link } from "react-router-dom"

const Labels = () => {
  const [labelState, setLabelState] = useState(0)

  return (
    <form>
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
      <Link to={`/generateLabel/${labelState}`}>Generate QR Codes</Link>
      <br />
      <Link to="/">Go Home</Link>
    </form>
  )
}

export default Labels
