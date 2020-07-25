import React from "react"
import { Route, Redirect } from "react-router-dom"
import AuthContext from "./AuthContext";

const PrivateRoute = ({ path, pathNameRedirect, children }) => {
  const AuthObject = React.useContext(AuthContext)
  const isLoggedIn = AuthObject.accessToken
  if (!isLoggedIn) return <Redirect to={pathNameRedirect} />
  return <Route path={path}>{children}</Route>
}

export default PrivateRoute
