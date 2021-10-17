import React from "react";
import { Switch, Route } from "react-router-dom";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Home from "views/Home";
import Boxes from "views/boxes/Boxes";
import HeaderMenu from "components/HeaderMenu";
import Locations from "views/locations/Locations";
import TMPQueryPlayground from "views/TMP-query-playground/TMP-query-playground";
import BTLocation from "views/locations/BTLocation";

const PrivateRoute = ({ component, ...args }) => (
  <Route
    component={withAuthenticationRequired(component, {
      onRedirecting: () => <p>Loading ...</p>,
    })}
    {...args}
  />
);

export default function App() {
  const { isLoading: auth0Loading } = useAuth0();

  if (auth0Loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <HeaderMenu />
      <div>
        <Switch>
          <PrivateRoute path="/boxes" component={Boxes} />
          <PrivateRoute path="/locations/:locationId" component={BTLocation} />
          <PrivateRoute path="/locations" component={Locations} />
          <PrivateRoute path="/query-playground" component={TMPQueryPlayground} />
          <Route path="/" component={Home} />
        </Switch>
      </div>
    </>
  );
}
