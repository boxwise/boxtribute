import "regenerator-runtime/runtime";
import { ReactElement, Suspense, useEffect, useRef, useState, lazy } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { useLoadAndSetGlobalPreferences } from "hooks/useLoadAndSetGlobalPreferences";
import Layout from "components/Layout";
import QrReaderView from "views/QrReader/QrReaderView";
import NotFoundView from "views/NotFoundView/NotFoundView";
import { AuthorizeProps, useAuthorization } from "hooks/useAuthorization";
import ResolveHash from "views/QrReader/components/ResolveHash";
import { useErrorHandling } from "hooks/useErrorHandling";
import { TableSkeleton } from "components/Skeletons";
import { AlertWithoutAction } from "components/Alerts";
import { ErrorBoundary } from "@sentry/react";
import ErrorView from "views/ErrorView/ErrorView";
import { useAtomValue } from "jotai";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";

// Lazy load heavy components to reduce initial bundle size
const Dashboard = lazy(() => import("@boxtribute/shared-components/statviz/dashboard/Dashboard"));
const Boxes = lazy(() => import("views/Boxes/BoxesView"));
const BTBox = lazy(() => import("views/Box/BoxView"));
const BoxEditView = lazy(() => import("views/BoxEdit/BoxEditView"));
const BoxCreateView = lazy(() => import("views/BoxCreate/BoxCreateView"));
const TransferAgreementOverviewView = lazy(
  () => import("views/Transfers/TransferAgreementOverview/TransferAgreementOverviewView"),
);
const CreateTransferAgreementView = lazy(
  () => import("views/Transfers/CreateTransferAgreement/CreateTransferAgreementView"),
);
const CreateShipmentView = lazy(() => import("views/Transfers/CreateShipment/CreateShipmentView"));
const ShipmentsOverviewView = lazy(
  () => import("views/Transfers/ShipmentsOverview/ShipmentsOverviewView"),
);
const ShipmentView = lazy(() => import("views/Transfers/ShipmentView/ShipmentView"));
const Products = lazy(() => import("views/Products/ProductsView"));
const EnableStandardProductView = lazy(
  () => import("views/EnableStandardProduct/EnableStandardProductView"),
);
const CreateCustomProductView = lazy(
  () => import("views/CreateCustomProduct/CreateCustomProductView"),
);
const EditCustomProductView = lazy(() => import("views/EditCustomProduct/EditCustomProductView"));
const EditStandardProductView = lazy(
  () => import("views/EditStandardProduct/EditStandardProductView"),
);

type ProtectedRouteProps = {
  component: ReactElement;
  redirectPath: string | undefined;
  fallback?: ReactElement;
} & AuthorizeProps;

type DropappRedirectProps = {
  path: "/boxes/:boxId" | "/boxes/create/:qrCodeHash" | "/qrreader" | "/qrreader/:qrCodeHash";
};

function Protected({
  component,
  redirectPath,
  fallback = <TableSkeleton />,
  requiredAbps = [],
  minBeta = 0,
}: ProtectedRouteProps) {
  const { triggerError } = useErrorHandling();
  const { pathname: currentPath } = useLocation();
  const authorize = useAuthorization();
  const isAuthorized = authorize({ requiredAbps, minBeta });

  useEffect(() => {
    if (!isAuthorized)
      triggerError({ message: "Access to this page is not permitted for your user group." });
  }, [isAuthorized, triggerError]);

  if (isAuthorized) {
    return (
      <ErrorBoundary
        fallback={
          <AlertWithoutAction alertText="Could not load this page! Please try reloading." />
        }
      >
        <Suspense fallback={fallback}>{component}</Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <Navigate to={redirectPath && redirectPath !== currentPath ? redirectPath : "/error"} replace />
  );
}

/**
 * Handle Dropapp (Boxtribute V1 app) redirects whose paths don't start with `/bases/:baseId`.
 */
function DropappRedirect({ path }: DropappRedirectProps) {
  const selectedBaseId = useAtomValue(selectedBaseIdAtom);
  let pathToRedirect = "/";
  const baseURL = `/bases/${selectedBaseId}`;
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
    case "/qrreader/:qrCodeHash":
      pathToRedirect = `${baseURL}/qrreader/${urlParam}`;
      break;
    default:
      break;
  }

  return <Navigate to={pathToRedirect} replace />;
}

function App() {
  const { error, isInitialized } = useLoadAndSetGlobalPreferences();
  const location = useLocation();
  const [prevLocation, setPrevLocation] = useState<string | undefined>(undefined);
  // For BoxesView to reduce number of expensive Boxes queries
  // when navigating between boxes and other views.
  const hasExecutedInitialFetchOfBoxes = useRef(false);

  // store previous location to return to if you are not authorized
  useEffect(() => {
    const regex = /^\/bases\/\d+\//;
    // only store previous location if a base is selected
    if (regex.test(location.pathname)) setPrevLocation(location.pathname);
  }, [location]);

  if (error) {
    return <ErrorView error={error} />;
  }

  // selectedBaseId not set yet
  if (!isInitialized) {
    return;
  }

  return (
    <Routes>
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
                <Protected
                  component={<Dashboard />}
                  redirectPath={prevLocation}
                  minBeta={3}
                  requiredAbps={[["view_inventory", "view_shipments", "view_beneficiary_graph"]]}
                />
              }
            />
          </Route>
          <Route path="boxes">
            <Route
              index
              element={
                <Protected
                  component={
                    <Boxes hasExecutedInitialFetchOfBoxes={hasExecutedInitialFetchOfBoxes} />
                  }
                  redirectPath={prevLocation}
                  requiredAbps={["manage_inventory"]}
                />
              }
            />
            <Route path="create">
              <Route
                index
                element={
                  <Protected
                    component={<BoxCreateView />}
                    redirectPath={prevLocation}
                    requiredAbps={["manage_inventory"]}
                  />
                }
              />
              <Route
                path=":qrCode"
                element={
                  <Protected
                    component={<BoxCreateView />}
                    redirectPath={prevLocation}
                    requiredAbps={["manage_inventory"]}
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
                    requiredAbps={["view_inventory"]}
                  />
                }
              />
              <Route
                path="edit"
                element={
                  <Protected
                    component={<BoxEditView />}
                    redirectPath={prevLocation}
                    requiredAbps={["manage_inventory"]}
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
                    requiredAbps={["view_transfer_agreements"]}
                  />
                }
              />
              <Route
                path="create"
                element={
                  <Protected
                    component={<CreateTransferAgreementView />}
                    redirectPath={prevLocation}
                    requiredAbps={["create_transfer_agreement"]}
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
                    requiredAbps={["view_shipments"]}
                  />
                }
              />
              <Route
                path="create"
                element={
                  <Protected
                    component={<CreateShipmentView />}
                    redirectPath={prevLocation}
                    requiredAbps={["create_shipment"]}
                  />
                }
              />
              <Route
                path=":id"
                element={
                  <Protected
                    component={<ShipmentView />}
                    redirectPath={prevLocation}
                    requiredAbps={["view_shipments"]}
                  />
                }
              />
            </Route>
          </Route>
          <Route path="products">
            <Route
              index
              element={
                <Protected
                  component={<Products />}
                  redirectPath={prevLocation}
                  requiredAbps={["manage_products"]}
                  minBeta={4}
                />
              }
            />
            <Route path="enable">
              <Route
                index
                element={
                  <Protected
                    component={<EnableStandardProductView />}
                    redirectPath={prevLocation}
                    requiredAbps={["manage_products"]}
                  />
                }
              />
              <Route
                path=":standardProductId"
                element={
                  <Protected
                    component={<EnableStandardProductView />}
                    redirectPath={prevLocation}
                    requiredAbps={["manage_products"]}
                  />
                }
              />
            </Route>
            <Route
              path="create"
              element={
                <Protected
                  component={<CreateCustomProductView />}
                  redirectPath={prevLocation}
                  requiredAbps={["manage_products"]}
                />
              }
            />
            <Route path="edit">
              <Route
                path=":customProductId"
                element={
                  <Protected
                    component={<EditCustomProductView />}
                    redirectPath={prevLocation}
                    requiredAbps={["manage_products"]}
                  />
                }
              />
              <Route path="standard">
                <Route
                  path=":standardProductId"
                  element={
                    <Protected
                      component={<EditStandardProductView />}
                      redirectPath={prevLocation}
                      requiredAbps={["manage_products"]}
                    />
                  }
                />
              </Route>
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
        <Route path=":qrCodeHash" element={<DropappRedirect path="/qrreader/:qrCodeHash" />} />
      </Route>
      <Route path="error" element={<ErrorView error="Something went wrong!" />} />
      <Route path="/*" element={<NotFoundView />} />
    </Routes>
  );
}

export default App;
