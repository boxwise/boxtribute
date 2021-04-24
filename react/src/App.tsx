import React from "react";
import { Switch, Route } from "react-router-dom";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

import { Button } from "semantic-ui-react";
import Home from "./views/Home";
import OrgTopLevel from "./views/Organization";
import PdfGenerator from "./views/Labels/PdfGenerator";
import Labels from "./views/Labels/Labels";
import TabBar from "./views/TabBar";
import Menu from "./views/NavMenu";
import Placeholder from "./views/Placeholder";
import ScanBox from "./views/ScanBox";
import CreateBox from "./views/CreateBox";
import "semantic-ui-less/semantic.less";
import "./App.css";
import BoxInfo from "./views/BoxInfo";

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
    <div>
      <Menu />
      {/* NOTE!
        This works like a normal switch, so you have to put the specific routes the highest,
        and work your way down to least-specific */}
      <Switch>
        <PrivateRoute path="/org" component={OrgTopLevel} />
        <PrivateRoute path="/create-box" component={CreateBox} />
        <PrivateRoute path="/box-info" component={BoxInfo} />
        <PrivateRoute path="/edit-box" component={Placeholder} />
        <PrivateRoute path="/generateLabel/:num" component={PdfGenerator} />
        <PrivateRoute path="/pdf" component={Labels} />
        <PrivateRoute path="/scan" component={ScanBox} />
        <PrivateRoute path="/warehouse" component={Placeholder} />
        <PrivateRoute path="/settings" component={Placeholder} />
        <Route path="/" component={Home} />
      </Switch>

      {isAuthenticated ? (
        // eslint-disable-next-line react/button-has-type
        <Button
          className="brandBlueButton"
          onClick={() =>
            logout({
              returnTo: process.env.REACT_APP_LOGOUT_URL,
            })
          }
        >
          Log Out
        </Button>
      ) : (
        <Button className="brandBlueButton" onClick={() => loginWithRedirect()}>
          Sign In
        </Button>
      )}
      <TabBar />
    </div>
  );
}
