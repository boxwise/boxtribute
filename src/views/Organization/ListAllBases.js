import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";

const BASES = gql`
  {
    allBases {
      id
      organisation_id
      name
    }
  }
`;

export default function ListAllBases() {
  const { orgId } = useParams();
  const { loading, error, data } = useQuery(BASES);

  if (loading) return <p>Loading...</p>;
  if (error) {
    return (
      <div className="p-6">
        <h3>Requested base: {orgId}</h3>
        <p>Error :(</p>
        {error.graphQLErrors.map((item, index) => (
          <p key={index}>{item.message}</p>
        ))}
        <Link to="/">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-bold underline mb-4">List of All Bases:</h3>
      <ul className="mb-4">
        {data.allBases.map(({ id, organisation_id, name }) => (
          <div key={id}>
            <li>
              {organisation_id}: {name}
            </li>
          </div>
        ))}
      </ul>
      <Link  className="mt-6 text-blue-900 hover:bg-blue-200" to="/">{`->`} Go Home</Link>
    </div>
  );
}
