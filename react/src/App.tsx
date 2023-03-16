/* eslint-disable import/no-extraneous-dependencies */
import "regenerator-runtime/runtime";
import { useContext, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Boxes from "views/Boxes/BoxesView";
import Layout from "components/Layout";
import AutomaticBaseSwitcher from "views/AutomaticBaseSwitcher/AutomaticBaseSwitcher";
import { gql, useLazyQuery } from "@apollo/client";
import { BasesQuery } from "types/generated/graphql";
import { GlobalPreferencesContext } from "providers/GlobalPreferencesProvider";
import BTBox from "views/Box/BoxView";
import BoxEditView from "views/BoxEdit/BoxEditView";
import { useAuth0 } from "@auth0/auth0-react";
import jwt from "jwt-decode";
import DistroSpotsView from "views/Distributions/DistroSpotsView/DistroSpotsView";
import DistrosDashboardView from "views/Distributions/DistrosDashboardView/DistrosDashboardView";
import DistroEventView from "views/Distributions/DistroEventView/DistroEventView";
import DistroSpotView from "views/Distributions/DistroSpotView/DistroSpotView";
import CreateDistributionEventView from "views/Distributions/CreateDistributionEventView/CreateDistributionEventView";
import CreateDistributionSpotView from "views/Distributions/CreateDistributionSpotView/CreateDistributionSpotView";
import BaseDashboardView from "views/BaseDashboard/BaseDashboardView";
import DistrosReturnTrackingGroupView from "views/Distributions/DistributionReturnTrackings/DistrosReturnTrackingGroupView/DistrosReturnTrackingGroupView";
import DistributionReturnTrackingsView from "views/Distributions/DistributionReturnTrackings/DistributionReturnTrackingsView/DistributionReturnTrackingsView";
import CreateDirectDistributionEventView from "views/Distributions/CreateDirectDistributionEventView/CreateDirectDistributionEventView";
import BoxCreateView from "views/BoxCreate/BoxCreateView";
import TransferAgreementOverviewView from "views/Transfers/TransferAgreementOverview/TransferAgreementOverviewView";
import CreateTransferAgreementView from "views/Transfers/CreateTransferAgreement/CreateTransferAgreementView";
import CreateShipmentView from "views/Transfers/CreateShipment/CreateShipmentView";
import ShipmentsOverviewView from "views/Transfers/ShipmentsOverview/ShipmentsOverviewView";
import ShipmentView from "views/Transfers/ShipmentView/ShipmentView";
import QrReaderView from "views/QrReader/QrReaderView";
import NotFoundView from "views/NotFoundView/NotFoundView";

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

  const [runBaseQuery, { loading, data }] = useLazyQuery<BasesQuery>(BASES_QUERY);
  const { globalPreferences, dispatch } = useContext(GlobalPreferencesContext);

  useEffect(() => {
    if (globalPreferences.availableBases == null) {
      runBaseQuery();
    }
  }, [runBaseQuery, globalPreferences.availableBases]);

  useEffect(() => {
    if (!loading && data != null) {
      const { bases } = data;
      dispatch({
        type: "setAvailableBases",
        payload: bases,
      });
    }
  }, [data, loading, dispatch]);

  useEffect(() => {
    const getToken = async () => {
      const token = await getAccessTokenSilently();
      const decodedToken = jwt<{
        "https://www.boxtribute.com/organisation_id": string;
      }>(token);
      const organisationId = decodedToken["https://www.boxtribute.com/organisation_id"];
      dispatch({
        type: "setOrganisationId",
        payload: organisationId ?? 1,
      });
    };
    getToken();
  }, [dispatch, getAccessTokenSilently]);
};

function App() {
  useLoadAndSetAvailableBases();
  return (
    <Routes>
      <Route path="/">
        <Route index element={<AutomaticBaseSwitcher />} />
        <Route path="bases" element={<Layout />}>
          <Route index element={<AutomaticBaseSwitcher />} />
          <Route path=":baseId">
            <Route index element={<BaseDashboardView />} />
            <Route path="transfers">
              <Route path="agreements">
                <Route index element={<TransferAgreementOverviewView />} />
                <Route path="create" element={<CreateTransferAgreementView />} />
              </Route>
              <Route path="shipments">
                <Route index element={<ShipmentsOverviewView />} />
                <Route path="create" element={<CreateShipmentView />} />
                <Route path=":id" element={<ShipmentView />} />
              </Route>
            </Route>
            <Route path="boxes">
              <Route index element={<Boxes />} />
              <Route path="create">
                <Route path=":qrCode" element={<BoxCreateView />} />
              </Route>
              <Route path=":labelIdentifier">
                <Route index element={<BTBox />} />
                <Route path="edit" element={<BoxEditView />} />
              </Route>
            </Route>
            <Route path="distributions">
              <Route index element={<DistrosDashboardView />} />
              <Route path="return-trackings">
                <Route index element={<DistributionReturnTrackingsView />} />
                <Route path=":trackingGroupId" element={<DistrosReturnTrackingGroupView />} />
              </Route>
              <Route path="events">
                <Route path="create" element={<CreateDirectDistributionEventView />} />
                <Route path=":eventId">
                  <Route index element={<DistroEventView />} />
                </Route>
              </Route>
              <Route path="spots">
                <Route index element={<DistroSpotsView />} />
                <Route path="create" element={<CreateDistributionSpotView />} />
                <Route path=":distributionSpotId">
                  <Route index element={<DistroSpotView />} />
                  <Route path="events">
                    <Route path=":eventId">
                      <Route index element={<DistroEventView />} />
                    </Route>
                    <Route path="create" element={<CreateDistributionEventView />} />
                  </Route>
                </Route>
              </Route>
            </Route>
            <Route path="qrreader" element={<QrReaderView />} />
          </Route>
        </Route>
      </Route>
      <Route path="/*" element={<NotFoundView />} />
    </Routes>
  );
}

export default App;
