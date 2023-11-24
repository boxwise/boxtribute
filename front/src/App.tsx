/* eslint-disable import/no-extraneous-dependencies */
import "regenerator-runtime/runtime";
import { ReactElement } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Alert, AlertIcon, Button } from "@chakra-ui/react";
import { useLoadAndSetGlobalPreferences } from "hooks/useLoadAndSetGlobalPreferences";
import Layout from "components/Layout";
import Boxes from "views/Boxes/BoxesView";
import BTBox from "views/Box/BoxView";
import BoxEditView from "views/BoxEdit/BoxEditView";
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
import { useAuthorization } from "hooks/useAuthorization";
import ResolveHash from "views/QrReader/components/ResolveHash";

interface IProtectedRouteProps {
  component: ReactElement;
  requiredAbp?: string[];
  minBeta?: number;
}

function Protected({ component, requiredAbp, minBeta }: IProtectedRouteProps) {
  const authorize = useAuthorization();

  if (authorize({ requiredAbp, minBeta })) {
    return component;
  }

  return <Navigate to="/qrreader" replace />;
}
Protected.defaultProps = {
  requiredAbp: [],
  minBeta: 0,
};

function App() {
  const { logout } = useAuth0();
  const { isLoading, error } = useLoadAndSetGlobalPreferences();
  if (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return (
      <>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
        <Button onClick={() => logout()}>Logout</Button>
      </>
    );
  }
  if (isLoading) {
    return <div />;
  }
  return (
    <Routes>
      <Route index />
      <Route path="bases">
        <Route index />
        <Route path=":baseId" element={<Layout />}>
          <Route index element={<BaseDashboardView />} />
          <Route path="qrreader">
            <Route index element={<QrReaderView />} />
            <Route path=":hash" element={<ResolveHash />} />
          </Route>
          <Route path="boxes">
            <Route
              index
              element={<Protected component={<Boxes />} requiredAbp={["manage_inventory"]} />}
            />
            <Route path="create">
              <Route
                path=":qrCode"
                element={
                  <Protected component={<BoxCreateView />} requiredAbp={["manage_inventory"]} />
                }
              />
            </Route>
            <Route path=":labelIdentifier">
              <Route
                index
                element={<Protected component={<BTBox />} requiredAbp={["view_inventory"]} />}
              />
              <Route
                path="edit"
                element={
                  <Protected component={<BoxEditView />} requiredAbp={["manage_inventory"]} />
                }
              />
            </Route>
          </Route>
          <Route path="transfers" element={<Protected component={<Outlet />} minBeta={2} />}>
            <Route path="agreements">
              <Route
                index
                element={
                  <Protected
                    component={<TransferAgreementOverviewView />}
                    requiredAbp={["view_transfer_agreements"]}
                  />
                }
              />
              <Route
                path="create"
                element={
                  <Protected
                    component={<CreateTransferAgreementView />}
                    requiredAbp={["create_transfer_agreement"]}
                  />
                }
              />
            </Route>
            <Route path="shipments">
              <Route
                index
                element={
                  <Protected
                    component={<ShipmentsOverviewView />}
                    requiredAbp={["view_shipments"]}
                  />
                }
              />
              <Route
                path="create"
                element={
                  <Protected component={<CreateShipmentView />} requiredAbp={["create_shipment"]} />
                }
              />
              <Route
                path=":id"
                element={
                  <Protected component={<ShipmentView />} requiredAbp={["view_shipments"]} />
                }
              />
            </Route>
          </Route>
          <Route path="distributions" element={<Protected component={<Outlet />} minBeta={999} />}>
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
        </Route>
      </Route>
      <Route path="/*" element={<NotFoundView />} />
    </Routes>
  );
}

export default App;
