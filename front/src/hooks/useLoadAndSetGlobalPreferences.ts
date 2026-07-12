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

  // Set in localStore if current user can Share Public Dashboard Views
  localStorage.setItem(
    "canShareLink",
    authorize({ requiredAbps: ["create_shareable_link"] }).toString(),
  );

  const [
    runOrganisationAndBasesQuery,
    { loading: isOrganisationAndBasesQueryLoading, data: organisationAndBaseData },
  ] = useLazyQuery(ORGANISATION_AND_BASES_QUERY);

  const error = useMemo(() => {
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
    if (user && !selectedBase?.name && !error) {
      runOrganisationAndBasesQuery();
    }
  }, [runOrganisationAndBasesQuery, user, selectedBase?.name, error]);

  // setting auth atoms initially from auth0
  useEffect(() => {
    if (!error && user && (user[JWT_AVAILABLE_BASES] || isGod)) {
      // set available bases from auth0 id token only if they are not set yet.
      // Otherwise, it would overwrite the names queried from the BE.
      if (!availableBases.length && !isGod) {
        setAvailableBases(user[JWT_AVAILABLE_BASES].map((id: string) => ({ id })));
      }

      // extract the current/selected base ID from the URL, default to "0" until a valid base ID is set
      const urlBaseIdInput = location.pathname.match(/\/bases\/(\d+)(\/)?/);
      const urlBaseId = urlBaseIdInput?.length && urlBaseIdInput[1];

      // validate that
      // - the selected base ID is part of the available base IDs from Auth0 or
      // - that the user is a Boxtribute God
      if (urlBaseId) {
        if (isGod) {
          setSelectedBase({ id: urlBaseId });
        } else if (user[JWT_AVAILABLE_BASES].map(String).includes(urlBaseId)) {
          if (selectedBaseId !== urlBaseId) {
            // only overwrite the selected base ID if the id is different from the existing one.
            setSelectedBase({ id: urlBaseId });
          }
        }
      }
    }
  }, [
    availableBases.length,
    error,
    location.pathname,
    setAvailableBases,
    setSelectedBase,
    user,
    isGod,
    selectedBaseId,
  ]);

  // handle additional base information being returned from the query
  useEffect(() => {
    if (!isOrganisationAndBasesQueryLoading && organisationAndBaseData !== undefined) {
      const basesWithOrgData = organisationAndBaseData.bases;
      const bases = basesWithOrgData.map((base) => ({
        id: base.id,
        name: base.name,
      }));

      if (bases.length > 0) {
        setAvailableBases(bases);

        if (selectedBase?.id) {
          const matchingBase = basesWithOrgData.find((base) => base.id === selectedBase.id);

          if (matchingBase) {
            // set selected base
            setSelectedBase({ id: matchingBase.id, name: matchingBase.name });
            // set organisation for selected base
            setOrganisation(matchingBase.organisation);
          }
        }
      }
    }
  }, [
    isOrganisationAndBasesQueryLoading,
    organisationAndBaseData,
    selectedBase?.id,
    setAvailableBases,
    setOrganisation,
    setSelectedBase,
  ]);

  const finalError = useMemo(() => {
    const basesWithOrgData = organisationAndBaseData?.bases;
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

    return error;
  }, [error, organisationAndBaseData?.bases, selectedBase?.id]);

  const isLoading = !selectedBase?.name || isOrganisationAndBasesQueryLoading;

  const isInitialized = selectedBaseId !== "0";

  return { isLoading, finalError, isInitialized };
};
