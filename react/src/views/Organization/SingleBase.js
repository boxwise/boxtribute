import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";

const BASE = gql`
  query Base($ordIdInt: Int!) {
    base(id: $ordIdInt) {
      id
      organisationId
      name
      currencyName
    }
  }
`;

export default function SingleOrg() {
  const { orgId } = useParams();
  const ordIdInt = parseInt(orgId);
  const { loading, error, data } = useQuery(BASE, {
    variables: { ordIdInt },
  });

  if (loading) return <p>Loading...</p>;
  if (error) {
    return (
      <div className="p-6">
        <h3>Requested base: {orgId}</h3>
        <p>Error :(</p>
        {error.graphQLErrors.map((item) => (
          <p key={item.message}>{item.message}</p>
        ))}
        <Link className="mt-6 text-blue-700 hover:bg-blue-200" to="/">
          {`->`} Go Home
        </Link>
      </div>
    );
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
  );
}
