import { useEffect, useState } from "react";
import { useAtom, useSetAtom } from "jotai";
import { useAuth0 } from "@auth0/auth0-react";
import { useLazyQuery } from "@apollo/client";
import { useLocation, useNavigate } from "react-router-dom";
import { ORGANISATION_AND_BASES_QUERY } from "queries/queries";
import {
  availableBasesAtom,
  organisationAtom,
  selectedBaseAtom,
} from "stores/globalPreferenceStore";

export const useLoadAndSetGlobalPreferences = () => {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string>();
  const setOrganisation = useSetAtom(organisationAtom);
  const [selectedBase, setSelectedBase] = useAtom(selectedBaseAtom);
  const [availableBases, setAvailableBases] = useAtom(availableBasesAtom);

  const [
    runOrganisationAndBasesQuery,
    { loading: isOrganisationAndBasesQueryLoading, data: organisationAndBaseData },
  ] = useLazyQuery(ORGANISATION_AND_BASES_QUERY);

  useEffect(() => {
    // run query only if the access token is in the request header from the apollo client and the base is not set
    if (user && !selectedBase?.name) runOrganisationAndBasesQuery();
  }, [runOrganisationAndBasesQuery, user, selectedBase?.name]);

  useEffect(() => {
    // validate if base Ids are set in auth0 id token
    if (!user || !user["https://www.boxtribute.com/base_ids"]?.length) {
      setError("You do not have access to any bases.");
    } else {
      // set available bases from auth0 id token only if they are not set yet.
      // Otherwise, it would overwrite the names queried from the BE.
      if (!availableBases.length)
        setAvailableBases(
          user["https://www.boxtribute.com/base_ids"].map((id: string) => ({ id })),
        );

      // extract the current/selected base ID from the URL, default to "0" until a valid base ID is set
      const urlBaseIdInput = location.pathname.match(/\/bases\/(\d+)(\/)?/);
      const urlBaseId = (urlBaseIdInput?.length && urlBaseIdInput[1]) || "0";

      // If no base ID is set in the URL, redirect to the first available base
      if (urlBaseId === "0") {
        const firstBaseId = user["https://www.boxtribute.com/base_ids"][0];
        navigate(`/bases/${firstBaseId}`);
      }

      // validate that the selected base ID is part of the available base IDs from Auth0
      if (!user["https://www.boxtribute.com/base_ids"].includes(urlBaseId)) {
        setError("The requested base is not available to you.");
      } else {
        setSelectedBase({ id: urlBaseId });
      }
    }
  }, [
    availableBases.length,
    location.pathname,
    navigate,
    setAvailableBases,
    setSelectedBase,
    user,
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

        const matchingBase = basesWithOrgData.find((base) => base.id === selectedBase.id);

        if (matchingBase) {
          // set selected base
          setSelectedBase({ id: matchingBase.id, name: matchingBase.name });
          // set organisation for selected base
          setOrganisation(matchingBase.organisation);
        } else {
          // this error is set if the requested base is not part of the available bases
          setError("The requested base is not available to you.");
        }
      } else {
        // this error is set if the bases query returned an empty array for bases
        setError("There are no available bases.");
      }
    }
  }, [
    organisationAndBaseData,
    isOrganisationAndBasesQueryLoading,
    location.pathname,
    navigate,
    selectedBase.id,
    setSelectedBase,
    setOrganisation,
    setAvailableBases,
  ]);

  const isLoading = !selectedBase?.name || isOrganisationAndBasesQueryLoading;

  return { isLoading, error };
};
