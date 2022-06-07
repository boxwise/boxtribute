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
import CreateTransferAgreementView from "views/TransferAgreements/CreateTransferAgreementView";
import BTBox from "views/Box/BoxView";
import BoxEditView from "views/BoxEdit/BoxEditView";
import TransferAgreementView from "views/TransferAgreements/TransferAgreementView";
import TransferAgreementsView from "views/TransferAgreements/TransferAgreementsView";
import CreateShipmentView from "views/Shipments/CreateShipmentView";
import ShipmentsView from "views/Shipments/ShipmentsView";
import { useAuth0 } from "@auth0/auth0-react";
import jwt from 'jwt-decode'
import ShipmentView from "views/Shipments/ShipmentView";
import ShipmentEditView from "views/ShipmentEdit/ShipmentEditView";

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
            <Route path="scan-qrcode" element={<QrScanner />} />
            <Route path="transfers">
              <Route index element={<TransferAgreementsView />} />
              <Route path="new" element={<CreateTransferAgreementView />} />
              <Route path=":transferAgreementId">
                <Route index element={<TransferAgreementView />} />
                <Route path="shipments">
                  <Route index element={<ShipmentsView />} />
                  <Route path=":shipmentId">
                    <Route index element={<ShipmentView />} />  
                    <Route path="edit" element={<ShipmentEditView />} />  
                  </Route>
                  <Route path="new" element={<CreateShipmentView />} />
                </Route>
              </Route>
            </Route>

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
