import 'regenerator-runtime/runtime';
import React, { useContext, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Boxes from "views/boxes/Boxes";
import Locations from "views/locations/Locations";
import BTLocation from "views/locations/BTLocation";
import Layout from "Layout";
import AutomaticBaseSwitcher from "views/automatic-base-switcher/AutomaticBaseSwitcher";
import { gql, useLazyQuery } from "@apollo/client";
import { BasesQuery } from "generated/graphql";
import { GlobalPreferencesContext } from "GlobalPreferencesProvider";

const useLoadAndSetAvailableBases = () => {
  const BASES_QUERY = gql`
    query Bases {
      bases {
        id
        name
      }
    }
  `;

  const [runBaseQuery, { loading, data }] = useLazyQuery<BasesQuery>(BASES_QUERY);
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
            <Route path="locations">
              <Route index element={<Locations />} />
              <Route path=":locationId" element={<BTLocation />} />
            </Route>
            <Route path="boxes" element={<Boxes />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
