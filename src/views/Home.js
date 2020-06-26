import React from "react"
import { Link } from "react-router-dom"

function Home() {
  return (
    <div>
      <h2 className="w-screen flex justify-center p-2 bg-blue-500">
        Welcome to boxwise! Please log in.
      </h2>
      <Link to="/org/abc">Link for Volunteers</Link>
      <br />
      <Link to="/org/abc/base/base1">Link for Coordinators</Link>
      <br />
      <Link to="/org/abc/base/base1/pick-list">Link for Head of Operations</Link>
      <br />
      <Link to="/pdf">Generate QR Codes</Link>
    </div>
  )
}

export default Home
