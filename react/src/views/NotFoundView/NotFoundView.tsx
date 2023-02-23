import { Navigate, useLocation } from "react-router-dom";

function NotFoundView() {
  const location = useLocation();
  // If the requested route was not found redirect to AutomaticBaseSwitcher
  // to prepend /bases/:baseId
  return <Navigate to="/" replace state={{ origin: location.pathname }} />;
}

export default NotFoundView;
