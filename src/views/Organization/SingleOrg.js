import React from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery } from "@apollo/react-hooks"
import { gql } from "apollo-boost"

const CAMPS = gql`
  {
    allCamps {
      id
      organisation_id
      name
    }
  }
`

export default function SingleOrg() {
  const { orgId } = useParams()
  const { loading, error, data } = useQuery(CAMPS)

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error :(</p>

  return (
    <div>
      <h3>Requested organization: {orgId}</h3>
      <h3>Bases in this org:</h3>
      <ul>
        {data.allCamps.map(({ id, organisation_id, name }) => (
          <div key={id}>
            <li>
              {organisation_id}: {name}
            </li>
          </div>
        ))}
      </ul>
      <Link to="/">Go Home</Link>
    </div>
  )
}
