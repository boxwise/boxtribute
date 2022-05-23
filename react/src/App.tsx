import "regenerator-runtime/runtime";
import React, { useContext, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Boxes from "views/Boxes/BoxesView";
import BTLocations from "views/BTLocations/BTLocations";
import BTLocation from "views/BTLocations/BTLocation";
import Layout from "components/Layout";
import AutomaticBaseSwitcher from "views/AutomaticBaseSwitcher/AutomaticBaseSwitcher";
import { gql, useLazyQuery } from "@apollo/client";
import QrScanner from "components/QrScanner";
import { BasesQuery } from "types/generated/graphql";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import CreateTransferAgreementView from "views/Transfers/CreateTransferAgreementView";
import BTBox from "views/Box/BoxView";
import BoxEditView from "views/BoxEdit/BoxEditView";
import TransferAgreement from "views/Transfers/CreateTransferAgreementForm";
import TransferAgreementView from "views/Transfers/TransferAgreementView";

const useLoadAndSetAvailableBases = () => {
  const BASES_QUERY = gql`
    query Bases {
      bases {
        id
        name
      }
    }
  `;

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
            <Route path="scan-qrcode" element={<QrScanner />} />
            <Route
              path="transfers/new"
              element={<CreateTransferAgreementView />}
            />
            <Route
              path="transfers/:transferId"
              element={<TransferAgreementView />}
            />

            <Route path="boxes" element={<Boxes />} />
            <Route path="boxes">
              <Route index element={<Boxes />} />
              <Route path=":labelIdentifier" element={<BTBox />} />
              <Route path=":labelIdentifier/edit" element={<BoxEditView />} />
            </Route>
            <Route path="locations">
              <Route index element={<BTLocations />} />
              <Route path=":locationId" element={<BTLocation />}></Route>
            </Route>
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
