import React, { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"

export default function SingleOrg({ authObject }) {
  const [data, setData] = useState({})
  useEffect(() => {
    async function fetchData() {
      // Send the access token to gain access to the API at all, send the id token to gain access to your specific org
      // TODO I think if we added roles and org to the user profile in auth0, we could skip that step and restrict routes on the frontend
      const result = await axios("http://localhost:5000/api/private", {
        headers: {
          Authorization: `Bearer ${authObject.accessToken}`,
          "X-Clacks-Overhead": "GNU Terry Pratchett",
          "X-Boxwise": authObject.idTokenPayload.email
        },
      })
      setData(result.data)
    }
    fetchData()
  }, [authObject])

  const { orgId } = useParams()
  return (
    <div>
      <h3>Requested organization: {orgId}</h3>
      <h3>Bases in this org:</h3>
      <ul>
        <p>{data.message}</p>
      </ul>
      <Link to="/">Go Home</Link>
    </div>
  )
}
