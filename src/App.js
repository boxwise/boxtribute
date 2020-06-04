import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Auth0 from "./Auth0";
import Home from "./views/Home";
import OrgTopLevel from "./views/Organization";

export default function App() {
  const AuthContext = React.createContext({});

  const [loggedIn, setLoggedIn] = useState(false);
  const [authObject, setAuthObject] = useState({});

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
  }

  return (
    <AuthContext.Provider value={authObject}>
      <Router>
        <div>
          {/* "Nav-bar" */}

          {/* NOTE! 
        This works like a normal switch, so you have to put the specific routes the highest,
        and work your way down to least-specific */}
          <Switch>
            <PrivateRoute
              path="/org"
              pathNameRedirect="/"
              isLoggedIn={loggedIn}
            >
              <OrgTopLevel authObject={authObject} />
            </PrivateRoute>

            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </div>
        {loggedIn ? (
          <button onClick={() => handleLogOut()} className="log-in">
            Log Out
          </button>
        ) : (
          <button
            onClick={() => {
              // this will trigger a redirect
              Auth0.login();
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
          >
            Sign In
          </button>
        )}
      </Router>
    </AuthContext.Provider>
  );
}
