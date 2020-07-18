import React from "react"
import { Switch, Route } from "react-router-dom"
import ScanBox from "../ScanBox"
import Placeholder from "../Placeholder"
import SingleOrg from "./SingleOrg"
import Base from "../Base"

// eslint-disable-next-line no-unused-vars
export default function OrgTopLevel(props: IProps) {
  return (
    <div>
      <h2>Organization</h2>
      {/* The Orgs page has its own <Switch> with more routes
          that build on the /org URL path. You can think of the
          generic <Route> here as an "index" page for all orgs, or
          the page that is shown when no specific org is selected */}
      <Switch>
        <Route path="/org/:orgId/base/:baseId/pick-list">
          <Placeholder />
        </Route>
        <Route path="/org/:orgId/base/:baseId/find-box">
          <ScanBox />
        </Route>
        <Route path="/org/:orgId/base/:baseId/create-box">
          <Placeholder />
        </Route>
        <Route path="/org/:orgId/base/:baseId/box/:boxId">
          <Placeholder />
        </Route>
        <Route path="/org/:orgId/base/:baseId/box/:boxId/edit">
          <Placeholder />
        </Route>
        <Route path="/org/:orgId/base/:baseId/box/:boxId/history">
          <Placeholder />
        </Route>
        <Route path="/org/:orgId/base/:baseId">
          <Base />
        </Route>
        <Route path="/org/:orgId">
          <SingleOrg />
        </Route>
        <Route path="/org">
          <h3>Please provide an organization in the url.</h3>
        </Route>
      </Switch>
    </div>
  )
}

interface IProps {
  authObject: any
}
