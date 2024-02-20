import { useContext, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useLazyQuery } from "@apollo/client";
import { useLocation, useNavigate } from "react-router-dom";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { OrganisationAndBasesQuery } from "types/generated/graphql";
import { ORGANISATION_AND_BASES_QUERY } from "queries/queries";

export const useLoadAndSetGlobalPreferences = () => {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const { globalPreferences, dispatch } = useContext(GlobalPreferencesContext);
  const [error, setError] = useState<string>();

  const [runOrganisationAndBasesQuery, { loading: isOrganisationAndBasesQueryLoading, data }] =
    useLazyQuery<OrganisationAndBasesQuery>(ORGANISATION_AND_BASES_QUERY);

  useEffect(() => {
    // run query only if the access token is in the request header from the apollo client and the base is not set
    if (user && !globalPreferences.selectedBase?.id) {
      runOrganisationAndBasesQuery();
    }
  }, [runOrganisationAndBasesQuery, user, globalPreferences.selectedBase?.id]);

  // set available bases
  useEffect(() => {
    if (!isOrganisationAndBasesQueryLoading && data != null) {
      const { bases } = data;

      if (bases.length > 0) {
        dispatch({
          type: "setAvailableBases",
          payload: bases,
        });

        // retrieve base id from the url
        const baseIdInput = location.pathname.match(/\/bases\/(\d+)(\/)?/);
        // validate if requested base is in the array of available bases
        if (baseIdInput != null) {
          const matchingBase = bases.find((base) => base.id === baseIdInput[1]);
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
        } else {
          // handle the case if the url does not start with "/bases/<number>"
          // prepend /bases/<newBaseId>
          const newBaseId = globalPreferences?.selectedBase?.id ?? bases[0].id;
          navigate(`/bases/${newBaseId}${location.pathname}`);
        }
      } else {
        // this error is set if the bases query returned an empty array for bases
        setError("There are no available bases.");
      }
    }
  }, [
    data,
    isOrganisationAndBasesQueryLoading,
    dispatch,
    location.pathname,
    globalPreferences?.selectedBase?.id,
    navigate,
  ]);

  const isLoading = !globalPreferences.availableBases || !globalPreferences.selectedBase?.id;

  return { isLoading, error };
};
