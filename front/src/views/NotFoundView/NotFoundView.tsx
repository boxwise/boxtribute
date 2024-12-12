import { useAuth0 } from "@auth0/auth0-react";
import { useErrorHandling } from "hooks/useErrorHandling";
import { Navigate, useLocation } from "react-router-dom";

function NotFoundView() {
  const { user } = useAuth0();
  const location = useLocation();
  const { triggerError } = useErrorHandling();

  if (!user || !user["https://www.boxtribute.com/base_ids"]) {
    triggerError({ message: "This requested page does not exist." });
    return <div>Not Found</div>;
  }

  // If the requested route was not found redirect to statviz
  const baseId = user["https://www.boxtribute.com/base_ids"][0];
  return <Navigate to={`/bases/${baseId}/statviz`} replace state={{ origin: location.pathname }} />;
}

export default NotFoundView;
