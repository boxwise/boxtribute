import { Navigate, useLocation } from "react-router-dom";

function NotFoundView() {
  const location = useLocation();
  return <Navigate to="/" replace state={{ origin: location.pathname }} />;
}

export default NotFoundView;
