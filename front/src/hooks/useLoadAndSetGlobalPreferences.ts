import { useEffect, useMemo } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useAuth0 } from "@auth0/auth0-react";
import { useLazyQuery } from "@apollo/client";
import { useLocation } from "react-router-dom";
import { ORGANISATION_AND_BASES_QUERY } from "queries/queries";
import {
  availableBasesAtom,
  organisationAtom,
  selectedBaseAtom,
  selectedBaseIdAtom,
} from "stores/globalPreferenceStore";
import { JWT_AVAILABLE_BASES, JWT_ROLE } from "utils/constants";
import { useAuthorization } from "./useAuthorization";

export const useLoadAndSetGlobalPreferences = () => {
  const { user } = useAuth0();
  const authorize = useAuthorization();
  const location = useLocation();
  const setOrganisation = useSetAtom(organisationAtom);
  const [selectedBase, setSelectedBase] = useAtom(selectedBaseAtom);
  const [availableBases, setAvailableBases] = useAtom(availableBasesAtom);
  const selectedBaseId = useAtomValue(selectedBaseIdAtom);

  // Boxtribute God user
  const isGod: boolean = (user && user[JWT_ROLE]?.includes("boxtribute_god")) || false;

  useEffect(() => {
    // Set in localStore if current user can Share Public Dashboard Views
    localStorage.setItem(
      "canShareLink",
      authorize({ requiredAbps: ["create_shareable_link"] }).toString(),
    );
  }, [authorize]);

  const [
    runOrganisationAndBasesQuery,
    { loading: isOrganisationAndBasesQueryLoading, data: organisationAndBaseData, error, called },
  ] = useLazyQuery(ORGANISATION_AND_BASES_QUERY);

  const localError = useMemo(() => {
    if (!user || (!isGod && !user[JWT_AVAILABLE_BASES]?.length)) {
      return "You do not have access to any bases.";
    } else {
      const urlBaseIdInput = location.pathname.match(/\/bases\/(\d+)(\/)?/);
      const urlBaseId = urlBaseIdInput?.length && urlBaseIdInput[1];
      if (urlBaseId && !isGod && !user[JWT_AVAILABLE_BASES].map(String).includes(urlBaseId)) {
        return "The requested base is not available to you.";
      }
    }

    return undefined;
  }, [isGod, location.pathname, user]);

  // run query only if
  // - the access token is in the request header from the apollo client and
  // - the base Name is not set
  useEffect(() => {
    if (user && !selectedBase?.name && !localError) {
      runOrganisationAndBasesQuery();
    }
  }, [runOrganisationAndBasesQuery, user, selectedBase?.name, localError]);

  // setting auth atoms
  useEffect(() => {
    if (!isOrganisationAndBasesQueryLoading && organisationAndBaseData !== undefined) {
      if (!localError && user && (user[JWT_AVAILABLE_BASES] || isGod)) {
        const basesWithOrgData = organisationAndBaseData.bases;
        const bases = basesWithOrgData.map((base) => ({
          id: base.id,
          name: base.name,
        }));
        if (bases.length > 0) {
          if (JSON.stringify(availableBases) !== JSON.stringify(bases)) {
            setAvailableBases(bases);
          }

          // extract the current/selected base ID from the URL, default to "0" until a valid base ID is set
          const urlBaseIdInput = location.pathname.match(/\/bases\/(\d+)(\/)?/);
          const urlBaseId = urlBaseIdInput?.length ? urlBaseIdInput[1] : basesWithOrgData[0].id;

          // validate that
          // - the selected base ID is part of the available base IDs from Auth0 or
          // - that the user is a Boxtribute God
          if (urlBaseId) {
            if (!isGod && !user[JWT_AVAILABLE_BASES].map(String).includes(urlBaseId)) {
              return;
            } else {
              const matchingBase = basesWithOrgData.find((base) => base.id === urlBaseId);

              console.log("match", matchingBase);

              if (matchingBase) {
                // set selected base
                setSelectedBase({ id: matchingBase.id, name: matchingBase.name });
                // set organisation for selected base
                setOrganisation(matchingBase.organisation);
              }
            }
          }
        }
      }
    }
  }, [
    availableBases,
    localError,
    isGod,
    isOrganisationAndBasesQueryLoading,
    location.pathname,
    organisationAndBaseData,
    setAvailableBases,
    setOrganisation,
    setSelectedBase,
    user,
  ]);

  const finalError = useMemo(() => {
    if (organisationAndBaseData) {
      const basesWithOrgData = organisationAndBaseData.bases;
      const bases = basesWithOrgData?.map((base) => ({
        id: base.id,
        name: base.name,
      }));

      if (!bases || bases.length <= 0) {
        return "There are no available bases.";
      } else if (selectedBase?.id) {
        const matchingBase = basesWithOrgData?.find((base) => base.id === selectedBase.id);

        if (!matchingBase) {
          return "The requested base is not available to you.";
        }
      }

      return localError;
    } else if (error) {
      return "Failed getting information " + error.message;
    } else if (!isOrganisationAndBasesQueryLoading && called) {
      return "The requested base is not available to you";
    } else {
      return;
    }
  }, [
    called,
    error,
    isOrganisationAndBasesQueryLoading,
    localError,
    organisationAndBaseData,
    selectedBase?.id,
  ]);

  const isLoading = !selectedBase?.name || isOrganisationAndBasesQueryLoading;

  const isInitialized = !isLoading && selectedBaseId !== "0";

  return { isLoading, error: finalError, isInitialized };
};
