import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { BASE } from "../../utils/queries";
import { OrganisationBaseRouteParams } from "../../utils/Types";

export default function SingleBase() {
  const baseId = parseInt(useParams<OrganisationBaseRouteParams>().baseId);
  const { loading, error, data } = useQuery(BASE, {
    variables: { baseId },
  });

  if (loading) return <p>Loading...</p>;
  if (error) {
    return (
      <div className="p-6">
        <h3>Requested base: {baseId}</h3>
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
      <h3 className="text-lg font-bold underline mb-4">Requested base ID: {baseId}</h3>
      <p className="mb-4">
        base ID {data.base.id}, belonging to the organisation {data.base.organisation.id}, has the
        name {data.base.name}, and uses the currency {data.base.currencyName}
      </p>
      <Link className="mt-6 text-blue-700 hover:bg-blue-200" to="/">
        {`->`} Go Home
      </Link>
    </div>
  );
}
