import { useContext, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useLazyQuery } from "@apollo/client";
import { useLocation, useNavigate } from "react-router-dom";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { ORGANISATION_AND_BASES_QUERY } from "queries/queries";
import { useBaseIdParam } from "./useBaseIdParam";

export const useLoadAndSetGlobalPreferences = () => {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const { globalPreferences, dispatch } = useContext(GlobalPreferencesContext);
  const [error, setError] = useState<string>();

  const { baseId } = useBaseIdParam();

  const [runOrganisationAndBasesQuery, { loading: isOrganisationAndBasesQueryLoading, data: organisationAndBaseData }] =
    useLazyQuery(ORGANISATION_AND_BASES_QUERY);

  useEffect(() => {
    // run query only if the access token is in the request header from the apollo client and the base is not set
    if (user && !globalPreferences.selectedBase?.id) {
      runOrganisationAndBasesQuery();
    }
  }, [runOrganisationAndBasesQuery,
    user, globalPreferences.selectedBase?.id]);

  // set available bases
  useEffect(() => {
    if (!isOrganisationAndBasesQueryLoading && organisationAndBaseData != null) {
      const { bases } = organisationAndBaseData;

      if (bases.length > 0) {
        dispatch({
          type: "setAvailableBases",
          payload: bases,
        });

        // validate if requested base is in the array of available bases
        if (baseId !== "0") {
          const matchingBase = bases.find((base) => base.id === baseId);
          if (matchingBase) {
            // set selected base
            dispatch({
              type: "setSelectedBase",
              payload: matchingBase,
            });
            // set organisation for selected base
            dispatch({
              type: "setOrganisation",
              payload: matchingBase.organisation,
            });
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
  }, [organisationAndBaseData, isOrganisationAndBasesQueryLoading, dispatch, location.pathname, navigate, baseId, globalPreferences?.selectedBase?.id]);

  const isLoading = !globalPreferences.availableBases || !globalPreferences.selectedBase?.id;

  return { isLoading, error };
};
