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
import TabBar from "./views/TabBar"

const { REACT_APP_GRAPHQL_SERVER } = process.env

const client = new ApolloClient({
  uri: REACT_APP_GRAPHQL_SERVER,
})

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [authObject, setAuthObject] = useState({})

  function handleLogIn() {
    // Auth0 returns the token in the params of the URL after successful login and redirect
    const totalHash = window.location.hash
    if (totalHash) {
      // remove leading # and split into components,
      // so now you have ['key1=value1', 'key2=value2']
      const hashArray = totalHash.substr(1).split("&")
      const authObject = {}
      hashArray.forEach((item) => {
        const keyValArray = item.split("=")
        // turns [key, value] into authObject={key: value}
        // eslint-disable-next-line prefer-destructuring
        authObject[keyValArray[0]] = keyValArray[1]
      })
      // the auth object has many items in it, we generally care about the access_token
      setAuthObject(authObject)
      // this is where you would also handle authorization errors from the API
      // eslint-disable-next-line no-unused-expressions
      authObject.access_token ? setLoggedIn(true) : setLoggedIn(false)
    }
  }

  useEffect(() => {
    handleLogIn()
  }, [])

  function handleLogOut() {
    setLoggedIn(false)
  }

  return (
    <ApolloProvider client={client}>
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

            <PrivateRoute
              path="/generateLabel"
              pathNameRedirect="/"
              isLoggedIn={loggedIn}
            >
              <PdfGenerator authObject={authObject} />
            </PrivateRoute>

            <PrivateRoute
              path="/pdf"
              pathNameRedirect="/"
              isLoggedIn={loggedIn}
            >
              <Labels authObject={authObject} />
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
              Auth0.login()
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
          >
            Sign In
          </button>
        )}
        <TabBar />
      </Router>
    </ApolloProvider>
  )
}
