import React from "react"
import { Link } from "react-router-dom"
import { Grid } from 'semantic-ui-react'
import '../../src/App.css'

function Home() {
  return (
   <Grid columns= 'equal' centered>
      <h2 className="w-screen flex justify-center p-2 bg-blue-500">
        Welcome to boxwise! Please log in.
      </h2>
      <Link to="/org/abc" className="a">Org ABC</Link>
      <br />
      <Link to="/org/abc/base/base1">Org ABC, Base 1</Link>
      <br />
      <Link to="/org/abc/base/base1/pick-list">Org ABC, Base 1, pick list</Link>
      <br />
      <Link to="/pdf">Generate QR Codes</Link>
    
    </Grid >
  )
}

export default Home
