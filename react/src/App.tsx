import React from "react";
import { Switch, Route } from "react-router-dom";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

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

  return <>Test</>;
}
