import React from "react";
import { useParams, Link } from "react-router-dom";

export default function Base() {
  const { orgId, baseId } = useParams<{ orgId: string; baseId: string }>();
  return (
    <div>
      <h3>Requested organization: {orgId}</h3>
      <h3>Requested base: {baseId}</h3>
      <h3>Objects in this base:</h3>
      <ul>
        <li>...</li>
      </ul>
      <Link to="/">Go Home</Link>
    </div>
  );
}
