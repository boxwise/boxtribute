import React from "react";
import { Switch, Route } from "react-router-dom";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Home from "views/Home";
import Boxes from "views/boxes/Boxes";

const PrivateRoute = ({ component, ...args }) => (
  <Route
    component={withAuthenticationRequired(component, {
      onRedirecting: () => <p>Loading ...</p>,
    })}
    {...args}
  />
);

export default function App() {
  const { isLoading: auth0Loading, isAuthenticated, loginWithRedirect, logout } = useAuth0();

  if (auth0Loading) {
    return <p>Loading...</p>;
  }

  return (
    <Switch>
      <PrivateRoute path="/boxes" component={Boxes} />
      <Route path="/" component={Home} />
    </Switch>
  );
}
