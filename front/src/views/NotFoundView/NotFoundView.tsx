import { useAuth0 } from "@auth0/auth0-react";
import { DESKTOP_OR_TABLET_SCREEN_MEDIA_QUERY } from "components/HeaderMenu/consts";
import { useErrorHandling } from "hooks/useErrorHandling";
import { useAtomValue } from "jotai";
import { Navigate, useLocation } from "react-router-dom";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";

function NotFoundView() {
  const selectedBaseId = useAtomValue(selectedBaseIdAtom);
  const { user } = useAuth0();
  const location = useLocation();
  const { triggerError } = useErrorHandling();
  const isLargeScreen = window.matchMedia(DESKTOP_OR_TABLET_SCREEN_MEDIA_QUERY);
  // somehow useMediaQuery always returns false, most likely because the width is measured somewhere during the rendering.
  // TODO: create a global state using useMediaQuery higher up in the DOM tree and use it here.
  // const [isLargeScreen] = useMediaQuery(DESKTOP_OR_TABLET_SCREEN_MEDIA_QUERY);

  if (!user || !user["https://www.boxtribute.com/base_ids"]) {
    triggerError({ message: "This requested page does not exist." });
    return <div>Not Found</div>;
  }

  // If the requested route was not found redirect to statviz

  const baseId = selectedBaseId || user["https://www.boxtribute.com/base_ids"][0];
  if (isLargeScreen.matches) {
    return (
      <Navigate to={`/bases/${baseId}/statviz`} replace state={{ origin: location.pathname }} />
    );
  }
  return (
    <Navigate to={`/bases/${baseId}/qrreader`} replace state={{ origin: location.pathname }} />
  );
}

export default NotFoundView;
