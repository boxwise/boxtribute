import "regenerator-runtime/runtime";
import React, { useContext, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Boxes from "views/Boxes/BoxesView";
import Layout from "components/Layout";
import TagsView from "views/Tags/TagsView";
import AutomaticBaseSwitcher from "views/AutomaticBaseSwitcher/AutomaticBaseSwitcher";
import { gql, useLazyQuery } from "@apollo/client";
import { BasesQuery } from "types/generated/graphql";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import BTBox from "views/Box/BoxView";
import BoxEditView from "views/BoxEdit/BoxEditView";
import { useAuth0 } from "@auth0/auth0-react";
import jwt from 'jwt-decode'
import BaseDashboardView from "views/BaseDashboard/BaseDashboardView";

const useLoadAndSetAvailableBases = () => {
  const BASES_QUERY = gql`
    query Bases {
      bases {
        id
        name
      }
    }
  `;

  const { getAccessTokenSilently } = useAuth0();

  const [runBaseQuery, { loading, data }] =
    useLazyQuery<BasesQuery>(BASES_QUERY);
  const { globalPreferences, dispatch } = useContext(GlobalPreferencesContext);

  useEffect(() => {
    if (globalPreferences.availableBases == null) {
      runBaseQuery();
    }
  }, [runBaseQuery, globalPreferences.availableBases]);

  useEffect(() => {
    if (!loading && data != null) {
      const bases = data.bases;
      dispatch({
        type: "setAvailableBases",
        payload: bases,
      });
    }
  }, [data, loading, dispatch]);


useEffect(() => {
  const getToken = async () => {
    const token = await getAccessTokenSilently();
    const decodedToken = jwt<{"https://www.boxtribute.com/organisation_id": string}>(token);
    const organisationId = decodedToken["https://www.boxtribute.com/organisation_id"];
    dispatch({
      type: "setOrganisationId",
      payload: organisationId,
    });
  }
  getToken();
}, [dispatch, getAccessTokenSilently]);

};

const App = () => {
  useLoadAndSetAvailableBases();
  return (
    <Routes>
      <Route path="/">
        <Route index element={<AutomaticBaseSwitcher />}></Route>
        <Route path="bases" element={<Layout />}>
          <Route index element={<AutomaticBaseSwitcher />}></Route>
          <Route path=":baseId">
            <Route path="tags" element={<TagsView />} />
            <Route index element={<BaseDashboardView />} />
            <Route path="boxes">
              <Route index element={<Boxes />} />
              <Route path=":labelIdentifier" element={<BTBox />} />
              <Route path=":labelIdentifier/edit" element={<BoxEditView />} />
            </Route>
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
