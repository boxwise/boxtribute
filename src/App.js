import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ApolloProvider } from "@apollo/react-hooks";
import ApolloClient from "apollo-boost";
import PrivateRoute from "./PrivateRoute";
import Auth0 from "./Auth0";
import Home from "./views/Home";
import OrgTopLevel from "./views/Organization";
import PdfGenerator from "./views/Labels/PdfGenerator";
import Labels from "./views/Labels/Labels";

const { REACT_APP_GRAPHQL_SERVER } = process.env;

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [authObject, setAuthObject] = useState({});

  const client = new ApolloClient({
    uri: REACT_APP_GRAPHQL_SERVER,
    request: (operation) => {
      operation.setContext({
        headers: {
          Authorization: `Bearer ${authObject.accessToken}`,
          "X-Boxwise": authObject.idToken,
          "X-Clacks-Overhead": "GNU Terry Pratchett",
        },
      });
    },
  });

  function handleLogIn() {
    // if the login was successful, there will be a hash in the url, so you can do all the parsing work in the Auth0 file
    Auth0.handleAuthentication()
      .then((authTokens) => {
        setAuthObject(authTokens);
        !!authTokens ? setLoggedIn(true) : setLoggedIn(false);
      })
      .catch((err) => {
        // TODO: better logging and error handling
        console.log(err);
      });
  }

  useEffect(() => {
    // on page load, see if I'm in a freshly-logged-in state back from the redirect
    handleLogIn();
  }, []);

  function handleLogOut() {
    window.location.hash = "";
    setLoggedIn(false);
    setAuthObject({});
    client.resetStore();
  }

  return (
    <ApolloProvider client={client}>
      <Router>
        <div>
          {/* NOTE! 
        This works like a normal switch, so you have to put the specific routes the highest,
        and work your way down to least-specific */}
          <Switch>
            <PrivateRoute
              path="/org"
              pathNameRedirect="/"
              isLoggedIn={loggedIn}
            >
              <OrgTopLevel />
            </PrivateRoute>

            <PrivateRoute
              path="/generateLabel"
              pathNameRedirect="/"
              isLoggedIn={loggedIn}
            >
              <PdfGenerator />
            </PrivateRoute>

            <PrivateRoute
              path="/pdf"
              pathNameRedirect="/"
              isLoggedIn={loggedIn}
            >
              <Labels />
            </PrivateRoute>

            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </div>
        {loggedIn ? (
          // eslint-disable-next-line react/button-has-type
          <button onClick={() => handleLogOut()} className="log-in">
            Log Out
          </button>
        ) : (
          <button
            onClick={() => {
              Auth0.login();
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
          >
            Sign In
          </button>
        )}
      </Router>
    </ApolloProvider>
  );
}
