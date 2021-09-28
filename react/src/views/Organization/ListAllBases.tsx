import React from "react";
import { Link } from "react-router-dom";
import { ALL_BASES } from "../../utils/queries";
import { useQuery } from "@apollo/client";

export default function ListAllBases() {
  const { loading, error, data } = useQuery(ALL_BASES);

  if (loading) return <p>Loading...</p>;
  if (error) {
    return (
      <div className="p-6">
        <p>Error :(</p>
        {error.graphQLErrors.map((item) => (
          <p key={item.message}>{item.message}</p>
        ))}
        <Link to="/">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-bold underline mb-4">List of All Bases:</h3>
      <ul className="mb-4">
        {data.bases.map(({ id, organisation, name }) => (
          <div key={id}>
            <li>
              {organisation.id}: {name}
            </li>
          </div>
        ))}
      </ul>
      <Link className="mt-6 text-blue-900 hover:bg-blue-200" to="/">
        {`->`} Go Home
      </Link>
    </div>
  );
}
