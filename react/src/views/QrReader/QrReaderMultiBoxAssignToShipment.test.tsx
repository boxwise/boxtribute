import { GraphQLError } from "graphql";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { screen, render } from "tests/test-utils";
import { useAuth0 } from "@auth0/auth0-react";
import { QrReaderScanner } from "components/QrReader/components/QrReaderScanner";
import { mockMatchMediaQuery } from "mocks/functions";
import { mockAuthenticatedUser } from "mocks/hooks";
import { mockImplementationOfQrReader } from "mocks/components";
import { generateMockBox } from "mocks/boxes";
import { useErrorHandling } from "hooks/useErrorHandling";
import { useNotification } from "hooks/useNotification";
import { ALL_SHIPMENTS_QUERY, GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE } from "queries/queries";
import { BoxState, ShipmentState } from "types/generated/graphql";
import { cache } from "queries/cache";
import { generateMockShipment } from "mocks/shipments";
import { selectOptionInSelectField } from "tests/helpers";
import QrReaderView from "./QrReaderView";

// extracting a cacheObject to reset the cache correctly later
const emptyCache = cache.extract();

const mockSuccessfulQrQuery = ({
  query = GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
  hash = "abc",
  labelIdentifier = "678",
  state = BoxState.InStock,
}) => ({
  request: {
    query,
    variables: { qrCode: hash },
  },
  result: {
    data: {
      qrCode: {
        _typename: "QrCode",
        code: hash,
        box: generateMockBox({ labelIdentifier, state }),
      },
    },
  },
});

const mockShipmentsQuery = ({
  query = ALL_SHIPMENTS_QUERY,
  state = ShipmentState.Preparing,
  iAmSource = true,
  networkError = false,
  graphQlError = false,
}) => ({
  request: {
    query,
  },
  result: networkError
    ? undefined
    : {
        data: graphQlError
          ? null
          : {
              shipments: [generateMockShipment({ state, iAmSource })],
            },
        errors: graphQlError ? [new GraphQLError("Error!")] : undefined,
      },
  error: networkError ? new Error() : undefined,
});

// Toasts are persisting throughout the tests since they are rendered in the wrapper and not in the render.
// Therefore, we need to mock them since otherwise we easily get false negatives
// Everywhere where we have more than one occation of a toast we should do this.
const mockedTriggerError = jest.fn();
const mockedCreateToast = jest.fn();
jest.mock("hooks/useErrorHandling");
jest.mock("hooks/useNotification");
jest.mock("@auth0/auth0-react");
jest.mock("components/QrReader/components/QrReaderScanner");

// .mocked() is a nice helper function from jest for typescript support
// https://jestjs.io/docs/mock-function-api/#typescript-usage
const mockedUseAuth0 = jest.mocked(useAuth0);
const mockedQrReader = jest.mocked(QrReaderScanner);

beforeEach(() => {
  // setting the screensize to
  mockMatchMediaQuery(true);
  mockAuthenticatedUser(mockedUseAuth0, "dev_volunteer@boxaid.org");
  const mockedUseErrorHandling = jest.mocked(useErrorHandling);
  mockedUseErrorHandling.mockReturnValue({ triggerError: mockedTriggerError });
  const mockedUseNotification = jest.mocked(useNotification);
  mockedUseNotification.mockReturnValue({ createToast: mockedCreateToast });
});

afterEach(() => {
  cache.restore(emptyCache);
});

const failingShipmentsQueryTests = [
  {
    name: "3.4.5.3a - Query for shipments returns an error (Network)",
    hash: "QrWithBoxFromSameBase",
    mocks: [mockShipmentsQuery({ networkError: true })],
    alert: /Could not fetch shipments data/i,
  },
  {
    name: "3.4.5.3b - Query for shipments returns an error (GraphQL)",
    hash: "QrWithBoxFromSameBase",
    mocks: [mockShipmentsQuery({ graphQlError: true })],
    alert: /Could not fetch shipments data/i,
  },
  {
    name: "3.4.5.4 - Query for shipments returns no shipments in preparing state",
    hash: "QrWithBoxFromSameBase",
    mocks: [mockShipmentsQuery({ state: ShipmentState.Receiving })],
    alert: undefined,
  },
];

failingShipmentsQueryTests.forEach(({ name, hash, mocks, alert }) => {
  it(name, async () => {
    const user = userEvent.setup();
    mockImplementationOfQrReader(mockedQrReader, hash, true, true);
    render(<QrReaderView />, {
      routePath: "/bases/:baseId/qrreader",
      initialUrl: "/bases/1/qrreader",
      mocks,
      cache,
    });

    // go to the MultiBox Tab
    const multiBoxTab = await screen.findByRole("tab", { name: /multi box/i });
    expect(multiBoxTab).toBeInTheDocument();
    user.click(multiBoxTab);

    // alert shown
    if (alert) {
      expect(await screen.findByText(alert)).toBeInTheDocument();
    }
    // assign to Shipment Radio button is not shown
    expect(screen.queryByTestId("AssignShipment")).not.toBeInTheDocument();
    // submit button is not shown
    expect(screen.queryByRole("button", { name: /assign all/i })).not.toBeInTheDocument();
  });
});

it("3.4.5.1 - There are boxes in the list, but the state of some is not InStock", async () => {
  const user = userEvent.setup();
  mockImplementationOfQrReader(mockedQrReader, "LostBox", true, true);
  render(<QrReaderView />, {
    routePath: "/bases/:baseId/qrreader",
    initialUrl: "/bases/1/qrreader",
    mocks: [
      mockSuccessfulQrQuery({ hash: "LostBox", state: BoxState.Lost }),
      mockShipmentsQuery({}),
    ],
    cache,
  });

  // go to the MultiBox Tab
  const multiBoxTab = await screen.findByRole("tab", { name: /multi box/i });
  expect(multiBoxTab).toBeInTheDocument();
  user.click(multiBoxTab);

  // 3.4.3.1 - no QR-codes were successfully scanned yet.
  const boxesSelectedStatus = await screen.findByText(/boxes selected: 0/i);
  expect(boxesSelectedStatus).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /delete list of scanned boxes/i }),
  ).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /undo last scan/i })).not.toBeInTheDocument();

  // Click a button to trigger the event of scanning a QR-Code in mockImplementationOfQrReader
  const scanButton = await screen.findByTestId("ReturnScannedQr");
  await user.click(scanButton);

  // 3.4.5.5 - Query for shipments returns one or more shipments in preparing state
  const assignToShipmentOption = await screen.findByTestId("AssignShipment");
  await user.click(assignToShipmentOption);
  await selectOptionInSelectField(
    user,
    undefined,
    /thessaloniki - BoxCare/i,
    /please select a shipment/i,
  );

  // Alert appears and button is disabled
  expect(
    await screen.findByText(
      /a box must be in the instock state to be assigned to a shipment\. is not instock\./i,
    ),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /assign all/i })).toBeDisabled();

  // click link to remove all not InStock boxes
  await user.click(screen.getByText(/click here to remove all non instock boxes from the list\./i));
  expect(await screen.findByText(/boxes selected: 0/i)).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /assign all/i })).not.toBeInTheDocument();
});
