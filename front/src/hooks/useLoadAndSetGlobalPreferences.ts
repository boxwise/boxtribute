import { useEffect, useState } from "react";
import { useAtom, useSetAtom } from "jotai";
import { useAuth0 } from "@auth0/auth0-react";
import { useLazyQuery } from "@apollo/client";
import { useLocation, useNavigate } from "react-router-dom";
import { OrganisationAndBasesQuery } from "types/generated/graphql";
import { ORGANISATION_AND_BASES_QUERY } from "queries/queries";
import { availableBasesAtom, organisationAtom, selectedBaseAtom } from "stores/globalPreferenceStore";

export const useLoadAndSetGlobalPreferences = () => {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string>();
  const setOrganisation = useSetAtom(organisationAtom);
  const [availableBases, setAvailableBases] = useAtom(availableBasesAtom);
  const [selectedBase, setSelectedBase] = useAtom(selectedBaseAtom);

  // extract the current/selected base ID from the URL, default to "0" until a valid base ID is set
  const baseIdInput = location.pathname.match(/\/bases\/(\d+)(\/)?/);
  const baseId = baseIdInput?.length && baseIdInput[1] || "0";

  const [runOrganisationAndBasesQuery, { loading: isOrganisationAndBasesQueryLoading, data: organisationAndBaseData }] =
    useLazyQuery<OrganisationAndBasesQuery>(ORGANISATION_AND_BASES_QUERY);

  useEffect(() => {
    // run query only if the access token is in the request header from the apollo client and the base is not set
    if (user && !selectedBase?.id) runOrganisationAndBasesQuery();
  }, [runOrganisationAndBasesQuery,
    user, selectedBase?.id]);

  // set available bases
  useEffect(() => {
    if (!isOrganisationAndBasesQueryLoading && organisationAndBaseData !== undefined) {
      const { bases } = organisationAndBaseData;

      if (bases.length > 0) {
        setAvailableBases(bases);
        // validate if requested base is in the array of available bases
        if (baseId !== "0") {
          const matchingBase = bases.find((base) => base.id === baseId);

          if (matchingBase) {
            // set selected base
            setSelectedBase(matchingBase);
            // set organisation for selected base
            setOrganisation(matchingBase.organisation);
          } else {
            // this error is set if the requested base is not part of the available bases
            setError("The requested base is not available to you.");
          }
        }
      } else {
        // this error is set if the bases query returned an empty array for bases
        setError("There are no available bases.");
      }
    }
  }, [organisationAndBaseData, isOrganisationAndBasesQueryLoading, location.pathname, navigate, selectedBase?.id, setSelectedBase, setOrganisation, setAvailableBases, baseId]);

  const isLoading = !availableBases.length || !selectedBase?.id;

  return { isLoading, error, urlBaseId: baseId };
};
