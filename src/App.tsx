import React, { useEffect, useState } from "react"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import { ApolloProvider } from "@apollo/react-hooks"
import ApolloClient from "apollo-boost"
import PrivateRoute from "./PrivateRoute"
import Auth0 from "./Auth0"
import Home from "./views/Home"
import OrgTopLevel from "./views/Organization"
import PdfGenerator from "./views/Labels/PdfGenerator"
import Labels from "./views/Labels/Labels"
import AuthContext from "./AuthContext"
import TabBar from "./views/TabBar"
import Placeholder from "./views/Placeholder"
import ScanBox from "./views/ScanBox"

const { REACT_APP_GRAPHQL_SERVER } = process.env

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [authObject, setAuthObject] = useState({
    accessToken: "",
    idToken: "",
    idTokenPayload: {
      at_hash: "",
      aud: "",
      email: "",
      email_verified: false,
      exp: null,
      iat: null,
      iss: "",
      name: "",
      nickname: "",
      nonce: "",
      picture: "",
      sub: "",
      updated_at: "",
    },
    appState: null,
    refreshToken: null,
    state: "",
    expiresIn: null,
    //   this won't change
    tokenType: "Bearer",
    scope: "",
  })

  const client = new ApolloClient({
    uri: REACT_APP_GRAPHQL_SERVER,
    request: (operation) => {
      operation.setContext({
        headers: {
          Authorization: `Bearer ${authObject.accessToken}`,
          "X-Clacks-Overhead": "GNU Terry Pratchett",
        },
      })
    },
  })

  function handleLogIn() {
    // if the login was successful, there will be a hash in the url,
    // so you can do all the parsing work in the Auth0 file
    Auth0.handleAuthentication()
      .then((authTokens) => {
        console.log("access token for the graphQL playground:", authTokens)
        setAuthObject(authTokens)
        authTokens ? setLoggedIn(true) : setLoggedIn(false)
      })
      .catch((err) => {
        // TODO: better logging and error handling
        console.log(err)
      })
  }

  useEffect(() => {
    // on page load, see if I'm in a freshly-logged-in state back from the redirect
    handleLogIn()
  }, [])

  function handleLogOut() {
    window.location.hash = ""
    setLoggedIn(false)
    setAuthObject({
      accessToken: "",
      idToken: "",
      idTokenPayload: {
        at_hash: "",
        aud: "",
        email: "",
        email_verified: false,
        exp: null,
        iat: null,
        iss: "",
        name: "",
        nickname: "",
        nonce: "",
        picture: "",
        sub: "",
        updated_at: "",
      },
      appState: null,
      refreshToken: null,
      state: "",
      expiresIn: null,
      //   this won't change
      tokenType: "Bearer",
      scope: "",
    })
    client.resetStore()
  }

  return (
    <ApolloProvider client={client}>
      <AuthContext.Provider value={authObject}>
        <Router>
          <div>
            {/* NOTE!
        This works like a normal switch, so you have to put the specific routes the highest,
        and work your way down to least-specific */}
            <Switch>
              <PrivateRoute path="/org" pathNameRedirect="/">
                <OrgTopLevel />
              </PrivateRoute>

              <PrivateRoute path="/generateLabel/:num" pathNameRedirect="/">
                <PdfGenerator />
              </PrivateRoute>

              <PrivateRoute path="/pdf" pathNameRedirect="/">
                <Labels />
              </PrivateRoute>

              <PrivateRoute path="/scan" pathNameRedirect="/">
                <ScanBox />
              </PrivateRoute>
              <PrivateRoute path="/warehouse" pathNameRedirect="/">
                <Placeholder />
              </PrivateRoute>
              <PrivateRoute path="/settings" pathNameRedirect="/">
                <Placeholder />
              </PrivateRoute>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </div>
          {loggedIn ? (
            // eslint-disable-next-line react/button-has-type
            <button
              onClick={() => handleLogOut()}
              className="m-6 bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Log Out
            </button>
          ) : (
            <button
              onClick={() => {
                Auth0.login()
              }}
              className="m-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
            >
              Sign In
            </button>
          )}
          <TabBar />
        </Router>
      </AuthContext.Provider>
    </ApolloProvider>
  )
}
