import React from "react";
import { Switch, Route } from "react-router-dom";
import ScanBox from "../ScanBox";
import SingleOrg from "./SingleOrg";
import Base from "../Base";

export default function OrgTopLevel({ authObject }) {
  return (
    <div>
      <h2>Organization</h2>
      {/* The Orgs page has its own <Switch> with more routes
          that build on the /org URL path. You can think of the
          2nd <Route> here as an "index" page for all orgs, or
          the page that is shown when no specific org is selected */}
      <Switch>
        <Route path={"/org/:orgId/base/:baseId/scan"}>
          <ScanBox authObject={authObject} />
        </Route>
        <Route path={"/org/:orgId/base/:baseId"}>
          <Base />
        </Route>
        <Route path={"/org/:orgId"}>
          <SingleOrg />
        </Route>
        <Route path={"/org"}>
          <h3>Please provide an organization in the url.</h3>
        </Route>
      </Switch>
    </div>
  );
}
