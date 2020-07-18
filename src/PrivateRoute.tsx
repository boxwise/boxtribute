import React from "react"
import { Route, Redirect } from "react-router-dom"
import PropTypes from "prop-types"

const PrivateRoute = ({ path, pathNameRedirect, isLoggedIn, children }) => {
  if (!isLoggedIn) return <Redirect to={pathNameRedirect} />
  return <Route path={path}>{children}</Route>
}

PrivateRoute.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
}

export default PrivateRoute
