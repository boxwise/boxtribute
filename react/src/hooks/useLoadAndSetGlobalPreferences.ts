import { useContext, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { gql, useLazyQuery } from "@apollo/client";
import { useLocation } from "react-router-dom";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { ApolloAuth0WrapperContext } from "providers/ApolloAuth0Provider";
import { BasesQuery } from "types/generated/graphql";

export const useLoadAndSetGlobalPreferences = () => {
  const { user } = useAuth0();
  const { globalPreferences, dispatch } = useContext(GlobalPreferencesContext);
  const { isAccessTokenInHeader } = useContext(ApolloAuth0WrapperContext);
  const location = useLocation();

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
      dispatch({
        type: "setAvailableBases",
        payload: bases,
      });
    }
  }, [data, isBasesQueryLoading, dispatch]);

  const isLoading = isBasesQueryLoading || (globalPreferences.availableBases ?? true);

  return { isLoading };
};
