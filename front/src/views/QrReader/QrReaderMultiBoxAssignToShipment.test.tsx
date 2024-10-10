import { vi, beforeEach, it, expect } from "vitest";
import { userEvent } from "@testing-library/user-event";
import { screen, render, waitFor } from "tests/test-utils";
import { useAuth0 } from "@auth0/auth0-react";
import { QrReaderScanner } from "components/QrReader/components/QrReaderScanner";
import { mockAuthenticatedUser } from "mocks/hooks";
import { mockImplementationOfQrReader } from "mocks/components";
import { generateMockBox } from "mocks/boxes";
import {
  GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
  MULTI_BOX_ACTION_OPTIONS_FOR_LOCATIONS_TAGS_AND_SHIPMENTS_QUERY,
} from "queries/queries";
import { BoxState, ShipmentState } from "types/generated/graphql";
import { cache } from "queries/cache";
import { generateMockShipment, generateMockShipmentMinimal } from "mocks/shipments";
import { ASSIGN_BOXES_TO_SHIPMENT } from "hooks/useAssignBoxesToShipment";
import { locations } from "mocks/locations";
import { tags } from "mocks/tags";
import { selectOptionInSelectField } from "tests/helpers";
import { mockedCreateToast, mockedTriggerError } from "tests/setupTests";
import QrReaderView from "./QrReaderView";
import { FakeGraphQLError, FakeGraphQLNetworkError } from "mocks/functions";

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
  query = MULTI_BOX_ACTION_OPTIONS_FOR_LOCATIONS_TAGS_AND_SHIPMENTS_QUERY,
  state = ShipmentState.Preparing,
  iAmSource = true,
  networkError = false,
  graphQlError = false,
}) => ({
  request: {
    query,
    variables: { baseId: "1" },
  },
  result: networkError
    ? undefined
    : {
        data: graphQlError
          ? null
          : {
              shipments: [generateMockShipmentMinimal({ state, iAmSource })],
              base: { locations, tags },
            },
        errors: graphQlError ? [new FakeGraphQLError()] : undefined,
      },
  error: networkError ? new FakeGraphQLNetworkError() : undefined,
});

const mockAssignToShipmentMutation = ({
  networkError = false,
  graphQlError = false,
  errorCode = "",
  labelIdentifiers = ["123"],
}) => ({
  request: {
    query: ASSIGN_BOXES_TO_SHIPMENT,
    variables: {
      id: "1",
      labelIdentifiers,
    },
  },
  result: networkError
    ? undefined
    : {
        data: graphQlError ? null : { updateShipmentWhenPreparing: generateMockShipment({}) },
        errors: graphQlError ? [new FakeGraphQLError(errorCode)] : undefined,
      },
  error: networkError ? new FakeGraphQLNetworkError() : undefined,
});

vi.mock("@auth0/auth0-react");
vi.mock("components/QrReader/components/QrReaderScanner");
const mockedUseAuth0 = vi.mocked(useAuth0);
const mockedQrReader = vi.mocked(QrReaderScanner);

beforeEach(() => {
  mockAuthenticatedUser(mockedUseAuth0, "dev_volunteer@boxaid.org");
});

const failingShipmentsQueryTests = [
  {
    name: "3.4.5.3a - Query for shipments returns an error (Network)",
    hash: "QrWithBoxFromSameBase",
    mocks: [mockShipmentsQuery({ networkError: true })],
    alert: /Could not fetch/i,
  },
  {
    name: "3.4.5.3b - Query for shipments returns an error (GraphQL)",
    hash: "QrWithBoxFromSameBase",
    mocks: [mockShipmentsQuery({ graphQlError: true })],
    alert: /Could not fetch/i,
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
    /thessaloniki/i,
    /please select a shipment/i,
    false,
    "button",
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

const assignToShipmentMutationTests = [
  {
    name: "3.4.5.7 - Mutation to assign boxes to shipment returns Network Error",
    mocks: [
      mockSuccessfulQrQuery({ hash: "InStockBox", labelIdentifier: "123" }),
      mockShipmentsQuery({}),
      mockAssignToShipmentMutation({ networkError: true }),
    ],
    toast: { isError: true, message: /Could not assign boxes to shipment/i },
  },
  {
    name: "3.4.5.8 - Mutation to assign boxes to shipment returns General Server Error",
    mocks: [
      mockSuccessfulQrQuery({ hash: "InStockBox", labelIdentifier: "123" }),
      mockShipmentsQuery({}),
      mockAssignToShipmentMutation({ graphQlError: true, errorCode: "INTERNAL_SERVER_ERROR" }),
    ],
    toast: { isError: true, message: /Could not assign boxes to shipment/i },
  },
  {
    name: "3.4.5.9 - Mutation to assign boxes to shipment returns Authorization Error",
    mocks: [
      mockSuccessfulQrQuery({ hash: "InStockBox", labelIdentifier: "123" }),
      mockShipmentsQuery({}),
      mockAssignToShipmentMutation({ graphQlError: true, errorCode: "FORBIDDEN" }),
    ],
    toast: { isError: true, message: /have the permissions to assign boxes to this shipment/i },
  },
  {
    name: "3.4.5.10 - Mutation to assign boxes to shipment fails since shipment is not in the Preparing State anymore",
    mocks: [
      mockSuccessfulQrQuery({ hash: "InStockBox", labelIdentifier: "123" }),
      mockShipmentsQuery({}),
      mockAssignToShipmentMutation({ graphQlError: true, errorCode: "BAD_USER_INPUT" }),
    ],
    toast: { isError: true, message: /The shipment is not in the Preparing state/i },
  },
  {
    name: "3.4.5.12 - Boxes are successfully assigned to shipment",
    mocks: [
      mockSuccessfulQrQuery({ hash: "InStockBox", labelIdentifier: "123" }),
      mockShipmentsQuery({}),
      mockAssignToShipmentMutation({}),
    ],
    toast: { isError: false, message: /A Box was successfully assigned to the shipment/i },
  },
];

assignToShipmentMutationTests.forEach(({ name, mocks, toast }) => {
  it(name, async () => {
    const user = userEvent.setup();
    mockImplementationOfQrReader(mockedQrReader, "InStockBox", true, true);
    render(<QrReaderView />, {
      routePath: "/bases/:baseId/qrreader",
      initialUrl: "/bases/1/qrreader",
      mocks,
      cache,
      additionalRoute: "/bases/1/transfers/shipments/1",
    });

    // go to the MultiBox Tab
    const multiBoxTab = await screen.findByRole("tab", { name: /multi box/i });
    expect(multiBoxTab).toBeInTheDocument();
    user.click(multiBoxTab);

    // 3.4.5.5 - Query for shipments returns one or more shipments in preparing state
    const assignToShipmentOption = await screen.findByTestId("AssignShipment");
    await user.click(assignToShipmentOption);
    await selectOptionInSelectField(
      user,
      undefined,
      /thessaloniki/i,
      /please select a shipment/i,
      false,
      "button",
    );

    // The submit button is not yet shown
    expect(screen.queryByRole("button", { name: /assign all/i })).not.toBeInTheDocument();

    // Click a button to trigger the event of scanning a QR-Code in mockImplementationOfQrReader
    const scanButton = await screen.findByTestId("ReturnScannedQr");
    await user.click(scanButton);

    // The submit button is shown
    const submitButton = await screen.findByRole("button", { name: /assign all/i });
    expect(submitButton).not.toBeDisabled();
    await user.click(submitButton);

    // toast shown
    await waitFor(() =>
      expect(toast.isError ? mockedTriggerError : mockedCreateToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(toast.message),
        }),
      ),
    );
  });
});

it("3.4.5.11 - One Box of two or more Boxes fail for the Assign boxes to shipment Mutation", async () => {
  const user = userEvent.setup();
  mockImplementationOfQrReader(mockedQrReader, "InStockBox1", true, true);
  const { rerender } = render(<QrReaderView />, {
    routePath: "/bases/:baseId/qrreader",
    initialUrl: "/bases/1/qrreader",
    mocks: [
      mockSuccessfulQrQuery({ hash: "InStockBox1", labelIdentifier: "123" }),
      mockSuccessfulQrQuery({ hash: "InStockBox2", labelIdentifier: "678" }),
      mockShipmentsQuery({}),
      mockAssignToShipmentMutation({ labelIdentifiers: ["123", "678"] }),
    ],
    cache,
  });

  // go to the MultiBox Tab
  user.click(await screen.findByRole("tab", { name: /multi box/i }));
  expect(await screen.findByText(/boxes selected: 0/i)).toBeInTheDocument();

  // scan box 123
  await user.click(await screen.findByTestId("ReturnScannedQr"));
  expect(await screen.findByText(/boxes selected: 1/i)).toBeInTheDocument();

  // scan box 678
  mockImplementationOfQrReader(mockedQrReader, "InStockBox2", true, true);
  rerender(<QrReaderView />);
  await user.click(await screen.findByTestId("ReturnScannedQr"));
  expect(await screen.findByText(/boxes selected: 2/i)).toBeInTheDocument();

  // 3.4.5.5 - Query for shipments returns one or more shipments in preparing state
  const assignToShipmentOption = await screen.findByTestId("AssignShipment");
  await user.click(assignToShipmentOption);
  await selectOptionInSelectField(
    user,
    undefined,
    /thessaloniki/i,
    /please select a shipment/i,
    false,
    "button",
  );

  // The submit button is shown
  const submitButton = await screen.findByRole("button", { name: /assign all/i });
  expect(submitButton).not.toBeDisabled();
  await user.click(submitButton);

  // selected boxes remains the same
  expect(await screen.findByText(/boxes selected: 2/i)).toBeInTheDocument();

  // toast shown
  await waitFor(() =>
    expect(mockedCreateToast).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/A Box was successfully assigned to the shipment/i),
      }),
    ),
  );

  // Alert appears
  expect(
    await screen.findByText(/The following boxes were not assigned to the shipment/i),
  ).toBeInTheDocument();
  expect(screen.getByText(/678/i)).toBeInTheDocument();

  // click link to remove all not failed boxes
  await user.click(screen.getByText(/Click here to remove all failed boxes from the list/i));
  expect(await screen.findByText(/boxes selected: 1/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /assign all/i })).toBeInTheDocument();
  // Alert appears because box was assigned to shipment and thus not inStock.
  expect(screen.getByRole("alert")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /assign all/i })).toBeDisabled();
});
