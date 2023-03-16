import { Navigate, useLocation } from "react-router-dom";

function NotFoundView() {
  const location = useLocation();
  // If the requested route was not found redirect to AutomaticBaseSwitcher
  if (!/^\/bases\/\d+\//.test(location.pathname)) {
    // Prepend /bases/:baseId to the request if it does not already start with /bases/:baseId
    return <Navigate to="/" replace state={{ origin: location.pathname }} />;
  }
  // Otherwise, just redirect to /
  return <Navigate to="/" replace />;
}

export default NotFoundView;
