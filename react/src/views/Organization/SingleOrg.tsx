import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { ORG_BASES } from "../../utils/queries";
import { OrganisationBaseRouteParams } from "../../utils/Types";

export default function SingleOrg() {
  const orgId = parseInt(useParams<OrganisationBaseRouteParams>().orgId);
  const { loading, error, data } = useQuery(ORG_BASES, {
    variables: { orgId },
  });

  if (loading) return <p>Loading...</p>;
  if (error) {
    return (
      <div className="p-6">
        <h3>Requested organisation ID: {orgId}</h3>
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
      <h3 className="text-lg font-bold underline mb-4">List of All Bases belonging to this org:</h3>
      <ul className="mb-4">
        {data.organisation.bases.map(({ id, name }) => (
          <div key={id}>
            <li>
              {id}: {name}
            </li>
          </div>
        ))}
      </ul>
      <Link className="mt-6 text-blue-700 hover:bg-blue-200" to="/">
        {`->`} Go Home
      </Link>
    </div>
  );
}
