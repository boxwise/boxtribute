import { DESKTOP_OR_TABLET_SCREEN_MEDIA_QUERY } from "components/HeaderMenu/consts";
import { useAtomValue } from "jotai";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthorization } from "hooks/useAuthorization";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";

function NotFoundView() {
  const selectedBaseId = useAtomValue(selectedBaseIdAtom);
  const authorize = useAuthorization();
  const hasSufficientPermissions = authorize({
    // ABPs of the /statviz route
    requiredAbps: [["view_inventory", "view_shipments", "view_beneficiary_graph"]],
    minBeta: 3,
  });
  const location = useLocation();
  const isLargeScreen = window.matchMedia(DESKTOP_OR_TABLET_SCREEN_MEDIA_QUERY);
  // somehow useMediaQuery always returns false, most likely because the width is measured somewhere during the rendering.
  // TODO: create a global state using useMediaQuery higher up in the DOM tree and use it here.
  // const [isLargeScreen] = useMediaQuery(DESKTOP_OR_TABLET_SCREEN_MEDIA_QUERY);

  // On desktop, if the requested route was not found and the user has sufficient permissions,
  // redirect to statviz
  if (isLargeScreen.matches && hasSufficientPermissions) {
    return (
      <Navigate
        to={`/bases/${selectedBaseId}/statviz`}
        replace
        state={{ origin: location.pathname }}
      />
    );
  }
  // On mobile, and/or no view_inventory permission
  return (
    <Navigate
      to={`/bases/${selectedBaseId}/qrreader`}
      replace
      state={{ origin: location.pathname }}
    />
  );
}

export default NotFoundView;
