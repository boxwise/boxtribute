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
import Dashboard from "@boxtribute/shared-components/statviz/dashboard/Dashboard";

type ProtectedRouteProps = {
  component: ReactElement;
  redirectPath: string | undefined;
  requiredAbp?: string[];
  minBeta?: number;
};

type DropappRedirectProps = {
  path: "/boxes/:boxId" | "/boxes/create/:qrCodeHash" | "/qrreader" | "/qrreader:qrCodeHash";
};

function Protected({
  component,
  redirectPath,
  requiredAbp = [],
  minBeta = 0,
}: ProtectedRouteProps) {
  const { triggerError } = useErrorHandling();
  const { pathname: currentPath } = useLocation();
  const authorize = useAuthorization();
  const isAuthorized = authorize({ requiredAbp, minBeta });

  useEffect(() => {
    if (!isAuthorized)
      triggerError({ message: "Access to this page is not permitted for your user group." });
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

/**
 * Handle Dropapp (Boxtribute V1 app) redirects whose paths don't start with `/bases/:baseId`.
 *
 * Fetch first available base id from user JWT token from Auth0 to prepend `/bases/:baseId` with that id, if available.
 */
function DropappRedirect({ path }: DropappRedirectProps) {
  const { user } = useAuth0();
  let pathToRedirect = "/";

  if (!user || !user["https://www.boxtribute.com/base_ids"])
    return <Navigate to={pathToRedirect} replace />;

  const baseId = user["https://www.boxtribute.com/base_ids"][0];
  const baseURL = `/bases/${baseId}$`;
  const urlParam = location.pathname.split("/").at(-1);

  switch (path) {
    case "/boxes/:boxId":
      pathToRedirect = `${baseURL}/boxes/${urlParam}`;
      break;
    case "/boxes/create/:qrCodeHash":
      pathToRedirect = `${baseURL}/boxes/create/${urlParam}`;
      break;
    case "/qrreader":
      pathToRedirect = `${baseURL}/qrreader`;
      break;
    case "/qrreader:qrCodeHash":
      pathToRedirect = `${baseURL}/qrreader/${urlParam}`;
      break;
    default:
      break;
  }

  return <Navigate to={pathToRedirect} replace />;
}

function App() {
  const { logout } = useAuth0();
  const { error } = useLoadAndSetGlobalPreferences();
  const location = useLocation();
  const [prevLocation, setPrevLocation] = useState<string | undefined>(undefined);

  // store previous location to return to if you are not authorized
  useEffect(() => {
    const regex = /^\/bases\/\d+\//;
    // only store previous location if a base is selected
    if (regex.test(location.pathname)) setPrevLocation(location.pathname);
  }, [location]);

  if (error) {
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
          <Route path="statviz">
            <Route
              index
              element={
                <Protected component={<Dashboard />} redirectPath={prevLocation} minBeta={3} />
              }
            />
          </Route>
          <Route path="boxes">
            <Route
              index
              element={
                <Protected
                  component={
                    <ErrorBoundary
                      fallback={
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
      <Route path="boxes">
        <Route path=":boxId" element={<DropappRedirect path="/boxes/:boxId" />} />
        <Route path="create" element={<DropappRedirect path="/boxes/create/:qrCodeHash" />} />
      </Route>
      <Route path="qrreader">
        <Route index element={<DropappRedirect path="/qrreader" />} />
        <Route path=":qrCodeHash" element={<DropappRedirect path="/qrreader:qrCodeHash" />} />
      </Route>
      <Route path="/*" element={<NotFoundView />} />
    </Routes>
  );
}

export default App;
