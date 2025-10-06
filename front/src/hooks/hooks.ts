import { useState, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";

// logout handler that redirect the v2 to dropapp related trello: https://trello.com/c/sbIJYHFF
export const useHandleLogout = () => {
  const { user, logout } = useAuth0();

  const handleLogout = () => {
    // Clear reconciliation view form input cache.
    localStorage.removeItem("reconciliationMatchProduct");
    localStorage.removeItem("reconciliationReceiveLocation");

    // only redirect in staging and production environments
    if (import.meta.env.FRONT_ENVIRONMENT !== "development") {
      window.location.href = `${import.meta.env.FRONT_OLD_APP_BASE_URL}/index.php?action=logoutfromv2`;
    } else {
      logout();
    }
    return null;
  };
  return { user, handleLogout };
};

export const useGetUrlForResourceHelpers = () => {
  const baseId = useAtomValue(selectedBaseIdAtom);
  if (baseId == null) {
    throw new Error("Could not extract baseId from URL");
  }

  const getBaseRootUrlForCurrentBase = () => `/bases/${baseId}`;

  const getDistroSpotDetailUrlById = (distroSpotId: string) =>
    `/bases/${baseId}/distributions/spots/${distroSpotId}`;

  const getDistroEventDetailUrlById = (distroEventId: string) =>
    `/bases/${baseId}/distributions/events/${distroEventId}`;

  const getBoxDetailViewUrlByLabelIdentifier = (labelIdentifier: string) =>
    `/bases/${baseId}/boxes/${labelIdentifier}`;

  return {
    getBaseId: () => baseId,
    getDistroSpotDetailUrlById,
    getDistroEventDetailUrlById,
    getBaseRootUrlForCurrentBase,
    getBoxDetailViewUrlByLabelIdentifier,
  };
};

export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => {
    setValue((v) => !v);
  }, []);
  return [value, toggle] as [boolean, () => void];
};

// TODO: Probably need to refactor to remove this, seems unnecessary.
export const useGlobalSiteState = () => {
  const currentBaseId = useAtomValue(selectedBaseIdAtom);
  const navigate = useNavigate();

  return {
    currentBaseId,
    navigate,
  };
};
