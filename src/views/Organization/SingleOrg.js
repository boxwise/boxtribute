import React from "react";
import {
  useParams,
  Link,
} from "react-router-dom";

export default function SingleOrg() {
  let { orgId } = useParams();
  return (
    <div>
      <h3>Requested organization: {orgId}</h3>
      <h3>Bases in this org:</h3>
      <ul>
        <li>...</li>
      </ul>
      <Link to='/'>Go Home</Link>
    </div>
  );
}