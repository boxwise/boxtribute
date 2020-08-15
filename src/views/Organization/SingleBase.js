import React from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery } from "@apollo/react-hooks"
import { gql } from "apollo-boost"

const BASE = gql`
  query Base($orgId: String!) {
    base(id: $orgId) {
      id
      organisation_id
      name
      currencyname
    }
  }
`

export default function SingleOrg() {
  const { orgId } = useParams()
  const { loading, error, data } = useQuery(BASE, {
    variables: { orgId },
  })

  if (loading) return <p>Loading...</p>
  if (error) {
    return (
      <div className="p-6">
        <h3>Requested base: {orgId}</h3>
        <p>Error :(</p>
        {error.graphQLErrors.map((item, index) => (
          <p key={index}>{item.message}</p>
        ))}
        <Link className="mt-6 text-blue-700 hover:bg-blue-200" to="/">
          {`->`} Go Home
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-bold underline mb-4">Requested base: {orgId}</h3>
      <p className="mb-4">
        base ID {data.base.organisation_id} has the name {data.base.name}, and uses the currency{" "}
        {data.base.currencyname}
      </p>
      <Link className="mt-6 text-blue-700 hover:bg-blue-200" to="/">
        {`->`} Go Home
      </Link>
    </div>
  )
}
