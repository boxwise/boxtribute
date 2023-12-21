/* eslint-disable import/no-extraneous-dependencies */
import "regenerator-runtime/runtime";
import { ReactElement, Suspense, useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Alert, AlertIcon, Button } from "@chakra-ui/react";
import { useLoadAndSetGlobalPreferences } from "hooks/useLoadAndSetGlobalPreferences";
import Layout from "components/Layout";
import Boxes from "views/Boxes/BoxesView";
import BTBox from "views/Box/BoxView";
import BoxEditView from "views/BoxEdit/BoxEditView";
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
import { useErrorHandling } from "hooks/useErrorHandling";
import { TableSkeleton } from "components/Skeletons";
import { AlertWithoutAction } from "components/Alerts";
import { ErrorBoundary } from "@sentry/react";

interface IProtectedRouteProps {
  component: ReactElement;
  redirectPath: string | undefined;
  requiredAbp?: string[];
  minBeta?: number;
}

function Protected({ component, redirectPath, requiredAbp, minBeta }: IProtectedRouteProps) {
  const { triggerError } = useErrorHandling();
  const { pathname: currentPath } = useLocation();
  const authorize = useAuthorization();
  const isAuthorized = authorize({ requiredAbp, minBeta });

  useEffect(() => {
    if (!isAuthorized) {
      triggerError({ message: "Access to this page is not permitted for your user group." });
    }
  }, [isAuthorized, triggerError]);

  if (isAuthorized) {
    return component;
  }

  return (
    <Navigate
      to={redirectPath && redirectPath !== currentPath ? redirectPath : "/qrreader"}
      replace
    />
  );
}
Protected.defaultProps = {
  requiredAbp: [],
  minBeta: 0,
};

function App() {
  const { logout } = useAuth0();
  const { isLoading, error } = useLoadAndSetGlobalPreferences();
  const location = useLocation();
  const [prevLocation, setPrevLocation] = useState<string | undefined>(undefined);

  // store previous location to return to if you are not authorized
  useEffect(() => {
    const regex = /^\/bases\/\d+\//;
    // only store previous location if a base is selected
    if (regex.test(location.pathname)) {
      setPrevLocation(location.pathname);
    }
  }, [location]);

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
          <Route index element={<QrReaderView />} />
          <Route path="qrreader">
            <Route index element={<QrReaderView />} />
            <Route path=":hash" element={<ResolveHash />} />
          </Route>
          <Route path="boxes">
            <Route
              index
              element={
                <Protected
                  component={
                    <ErrorBoundary
                      fallback={
                        // eslint-disable-next-line max-len
                        <AlertWithoutAction alertText="Could not fetch boxes data! Please try reloading the page." />
                      }
                    >
                      <Suspense fallback={<TableSkeleton />}>
                        <Boxes />
                      </Suspense>
                    </ErrorBoundary>
                  }
                  redirectPath={prevLocation}
                  requiredAbp={["manage_inventory"]}
                />
              }
            />
            <Route path="create">
              <Route
                path=":qrCode"
                element={
                  <Protected
                    component={<BoxCreateView />}
                    redirectPath={prevLocation}
                    requiredAbp={["manage_inventory"]}
                  />
                }
              />
            </Route>
            <Route path=":labelIdentifier">
              <Route
                index
                element={
                  <Protected
                    component={<BTBox />}
                    redirectPath={prevLocation}
                    requiredAbp={["view_inventory"]}
                  />
                }
              />
              <Route
                path="edit"
                element={
                  <Protected
                    component={<BoxEditView />}
                    redirectPath={prevLocation}
                    requiredAbp={["manage_inventory"]}
                  />
                }
              />
            </Route>
          </Route>
          <Route
            path="transfers"
            element={<Protected component={<Outlet />} redirectPath={prevLocation} minBeta={2} />}
          >
            <Route path="agreements">
              <Route
                index
                element={
                  <Protected
                    component={<TransferAgreementOverviewView />}
                    redirectPath={prevLocation}
                    requiredAbp={["view_transfer_agreements"]}
                  />
                }
              />
              <Route
                path="create"
                element={
                  <Protected
                    component={<CreateTransferAgreementView />}
                    redirectPath={prevLocation}
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
                    redirectPath={prevLocation}
                    requiredAbp={["view_shipments"]}
                  />
                }
              />
              <Route
                path="create"
                element={
                  <Protected
                    component={<CreateShipmentView />}
                    redirectPath={prevLocation}
                    requiredAbp={["create_shipment"]}
                  />
                }
              />
              <Route
                path=":id"
                element={
                  <Protected
                    component={<ShipmentView />}
                    redirectPath={prevLocation}
                    requiredAbp={["view_shipments"]}
                  />
                }
              />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route path="/*" element={<NotFoundView />} />
    </Routes>
  );
}

export default App;
