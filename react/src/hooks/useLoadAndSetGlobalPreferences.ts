import { useContext, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { gql, useLazyQuery } from "@apollo/client";
import { useLocation, useNavigate } from "react-router-dom";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { ApolloAuth0WrapperContext } from "providers/ApolloAuth0Provider";
import { BasesQuery } from "types/generated/graphql";

export const useLoadAndSetGlobalPreferences = () => {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const { globalPreferences, dispatch } = useContext(GlobalPreferencesContext);
  const { isAccessTokenInHeader } = useContext(ApolloAuth0WrapperContext);
  const [error, setError] = useState<string>();

  // set organisation id
  useEffect(() => {
    if (user) {
      const organisationId = user["https://www.boxtribute.com/organisation_id"];
      dispatch({
        type: "setOrganisationId",
        payload: organisationId,
      });
    }
  }, [dispatch, user]);

  // load available bases
  const BASES_QUERY = gql`
    query Bases {
      bases {
        id
        name
      }
    }
  `;
  const [runBaseQuery, { loading: isBasesQueryLoading, data }] =
    useLazyQuery<BasesQuery>(BASES_QUERY);

  useEffect(() => {
    // run query only if the access token is in the request header from the apollo client
    if (isAccessTokenInHeader) {
      runBaseQuery();
    }
  }, [runBaseQuery, globalPreferences.availableBases, isAccessTokenInHeader]);

  // set available bases
  useEffect(() => {
    if (!isBasesQueryLoading && data != null) {
      const { bases } = data;
      if (bases.length > 0) {
        dispatch({
          type: "setAvailableBases",
          payload: bases,
        });

        // retrieve base id from the url
        const baseId = location.pathname.match(/\/bases\/(\d+)(\/)?/);
        // validate if requested base is in the array of available bases
        if (baseId != null) {
          if (bases.some((base) => base.id === baseId[1])) {
            // set selected base
            dispatch({
              type: "setSelectedBaseId",
              payload: baseId[1],
            });
          } else {
            // this error is set if the requested base is not part of the available bases
            setError("The requested base is not available to you.");
          }
        } else {
          // handle the case if the url does not start with "/bases/<number>"
          // prepend /bases/<newBaseId>
          const newBaseId = globalPreferences?.selectedBaseId ?? bases[0].id;
          navigate(`/bases/${newBaseId}${location.pathname}`);
        }
      } else {
        // this error is set if the bases query returned an empty array for bases
        setError("There are no available bases.");
      }
    }
  }, [
    data,
    isBasesQueryLoading,
    dispatch,
    location.pathname,
    globalPreferences?.selectedBaseId,
    navigate,
  ]);

  const isLoading = !globalPreferences.availableBases;

  return { isLoading, error };
};
