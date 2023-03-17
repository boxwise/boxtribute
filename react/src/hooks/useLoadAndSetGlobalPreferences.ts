import { useContext, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { gql, useLazyQuery } from "@apollo/client";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { BasesQuery } from "types/generated/graphql";

export const useLoadAndSetGlobalPreferences = () => {
  const { isAuthenticated, user, isLoading: isAuth0Loading } = useAuth0();
  const { globalPreferences, dispatch } = useContext(GlobalPreferencesContext);

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
    if (globalPreferences.availableBases == null && isAuthenticated && isAuth0Loading) {
      runBaseQuery();
    }
  }, [runBaseQuery, globalPreferences.availableBases, isAuthenticated, isAuth0Loading]);

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
