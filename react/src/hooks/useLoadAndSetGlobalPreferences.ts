import { useContext, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { gql, useLazyQuery } from "@apollo/client";
import { useLocation, useNavigate } from "react-router-dom";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import { ApolloAuth0WrapperContext } from "providers/ApolloAuth0Provider";
import { OrganisationAndBasesQuery } from "types/generated/graphql";

export const useLoadAndSetGlobalPreferences = () => {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const { globalPreferences, dispatch } = useContext(GlobalPreferencesContext);
  const { isAccessTokenInHeader } = useContext(ApolloAuth0WrapperContext);
  const [error, setError] = useState<string>();

  // load available bases
  const ORGANISATION_AND_BASES_QUERY = gql`
    query OrganisationAndBases($organisationId: ID!) {
      bases {
        id
        name
      }
      organisation(id: $organisationId) {
        id
        name
      }
    }
  `;
  const [runOrganisationAndBasesQuery, { loading: isOrganisationAndBasesQueryLoading, data }] =
    useLazyQuery<OrganisationAndBasesQuery>(ORGANISATION_AND_BASES_QUERY);

  useEffect(() => {
    // run query only if the access token is in the request header from the apollo client
    if (isAccessTokenInHeader && user) {
      runOrganisationAndBasesQuery({
        variables: { organisationId: user["https://www.boxtribute.com/organisation_id"] },
      });
    }
  }, [runOrganisationAndBasesQuery, globalPreferences.availableBases, isAccessTokenInHeader, user]);

  // set available bases
  useEffect(() => {
    if (!isOrganisationAndBasesQueryLoading && data != null) {
      const { bases, organisation } = data;
      if (organisation) {
        dispatch({
          type: "setOrganisation",
          payload: organisation,
        });
      }

      if (bases.length > 0) {
        dispatch({
          type: "setAvailableBases",
          payload: bases,
        });

        // retrieve base id from the url
        const baseId = location.pathname.match(/\/bases\/(\d+)(\/)?/);
        // validate if requested base is in the array of available bases
        if (baseId != null) {
          const matchingBase = bases.find((base) => base.id === baseId[1]);
          if (matchingBase) {
            // set selected base
            dispatch({
              type: "setSelectedBase",
              payload: matchingBase,
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
