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
import { cache } from "queries/cache";
import { generateMockShipmentMinimal } from "mocks/shipments";
import { selectOptionInSelectField } from "tests/helpers";
import { locations } from "mocks/locations";
import { tags } from "mocks/tags";
import { mockedCreateToast, mockedTriggerError } from "tests/setupTests";
import { MOVE_BOXES_TO_LOCATION } from "hooks/useMoveBoxes";
import QrReaderView from "./QrReaderView";
import { FakeGraphQLError, FakeGraphQLNetworkError } from "mocks/functions";

const mockSuccessfulQrQuery = ({
  query = GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
  hash = "abc",
  labelIdentifier = "678",
  state = "InStock",
}) => ({
  request: {
    query,
    variables: { qrCode: hash },
  },
  result: {
    data: {
      qrCode: {
        __typename: "QrCode",
        code: hash,
        box: generateMockBox({ labelIdentifier, state }),
      },
    },
  },
});

const mockLocationsQuery = ({
  query = MULTI_BOX_ACTION_OPTIONS_FOR_LOCATIONS_TAGS_AND_SHIPMENTS_QUERY,
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
              shipments: [generateMockShipmentMinimal({ state: "Preparing", iAmSource: true })],
              base: { locations, tags },
            },
        errors: graphQlError ? [new FakeGraphQLError()] : undefined,
      },
  error: networkError ? new FakeGraphQLNetworkError() : undefined,
});

const mockMoveBoxesMutation = ({
  networkError = false,
  graphQlError = false,
  permissionError = false,
  labelIdentifiers = ["123"],
  locationId = 2,
  newBoxState = "Donated",
  failLabelIdentifier = "678",
}) => ({
  request: {
    query: MOVE_BOXES_TO_LOCATION,
    variables: { labelIdentifiers, locationId },
  },
  result: networkError
    ? undefined
    : {
        data: graphQlError
          ? null
          : permissionError
            ? {
                moveBoxesToLocation: {
                  __typename: "InsufficientPermissionError",
                  name: "location:write",
                },
              }
            : {
                moveBoxesToLocation: {
                  __typename: "BoxesResult",
                  updatedBoxes: labelIdentifiers
                    .filter((id) => id !== failLabelIdentifier)
                    .map((labelIdentifier) => ({
                      labelIdentifier,
                      state: newBoxState,
                      location: {
                        id: locationId.toString(),
                      },
                      lastModifiedOn: new Date().toISOString(),
                    })),
                  invalidBoxLabelIdentifiers: failLabelIdentifier ? [failLabelIdentifier] : [],
                },
              },
        errors: graphQlError ? [new FakeGraphQLError()] : undefined,
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

const moveBoxesMutationTests = [
  {
    name: "3.4.6.2 - Mutation to move boxes returns Network Error",
    mocks: [
      mockSuccessfulQrQuery({ hash: "InStockBox", labelIdentifier: "123" }),
      mockLocationsQuery({}),
      mockMoveBoxesMutation({ networkError: true }),
    ],
    toast: { isError: true, message: /Network issue: could not move/i },
  },
  {
    name: "3.4.6.3 - Mutation to move boxes returns GraphQL Error",
    mocks: [
      mockSuccessfulQrQuery({ hash: "InStockBox", labelIdentifier: "123" }),
      mockLocationsQuery({}),
      mockMoveBoxesMutation({ graphQlError: true }),
    ],
    toast: { isError: true, message: /Could not move box/i },
  },
  {
    name: "3.4.6.5 - Boxes are successfully moved",
    mocks: [
      mockSuccessfulQrQuery({ hash: "InStockBox", labelIdentifier: "123" }),
      mockLocationsQuery({}),
      mockMoveBoxesMutation({}),
    ],
    toast: { isError: false, message: /A box was successfully moved/i },
  },
];

moveBoxesMutationTests.forEach(({ name, mocks, toast }) => {
  it(name, async () => {
    const user = userEvent.setup();
    mockImplementationOfQrReader(mockedQrReader, "InStockBox", true, true);
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

    // query for locations returns two options
    const assignToShipmentOption = await screen.findByTestId("MoveBox");
    await user.click(assignToShipmentOption);
    await selectOptionInSelectField(user, undefined, /shop/i, /please select a location/i);

    // The submit button is not yet shown
    expect(screen.queryByRole("button", { name: /move all/i })).not.toBeInTheDocument();

    // Click a button to trigger the event of scanning a QR-Code in mockImplementationOfQrReader
    const scanButton = await screen.findByTestId("ReturnScannedQr");
    await user.click(scanButton);

    // The submit button is shown
    const submitButton = await screen.findByRole("button", { name: /move all/i });
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

it("3.4.6.4 - One Box of two or more Boxes are already in the target location", async () => {
  const user = userEvent.setup();
  mockImplementationOfQrReader(mockedQrReader, "InStockBox1", true, true);
  const { rerender } = render(<QrReaderView />, {
    routePath: "/bases/:baseId/qrreader",
    initialUrl: "/bases/1/qrreader",
    mocks: [
      mockSuccessfulQrQuery({ hash: "InStockBox1", labelIdentifier: "123" }),
      mockSuccessfulQrQuery({ hash: "InStockBox2", labelIdentifier: "678" }),
      mockLocationsQuery({}),
      mockMoveBoxesMutation({ labelIdentifiers: ["123", "678"], locationId: 2 }),
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

  // 3.4.5.5 - Query for locations returns two locations
  const moveBoxesOption = await screen.findByTestId("MoveBox");
  await user.click(moveBoxesOption);
  await selectOptionInSelectField(user, undefined, /shop/i, /please select a location/i);

  // The submit button is shown
  const submitButton = await screen.findByRole("button", { name: /move all/i });
  expect(submitButton).not.toBeDisabled();
  await user.click(submitButton);

  // selected boxes remains the same
  expect(await screen.findByText(/boxes selected: 2/i)).toBeInTheDocument();

  // toasts shown
  await waitFor(() =>
    expect(mockedCreateToast).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/A box was successfully moved/i),
      }),
    ),
  );

  await waitFor(() =>
    expect(mockedCreateToast).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/One Box is already in the selected location./i),
      }),
    ),
  );
});

it("3.4.6.5 - Two Boxes fail for the move Box Mutation", async () => {
  const user = userEvent.setup();
  mockImplementationOfQrReader(mockedQrReader, "InStockBox1", true, true);
  const { rerender } = render(<QrReaderView />, {
    routePath: "/bases/:baseId/qrreader",
    initialUrl: "/bases/1/qrreader",
    mocks: [
      mockSuccessfulQrQuery({ hash: "InStockBox1", labelIdentifier: "123" }),
      mockSuccessfulQrQuery({ hash: "InStockBox2", labelIdentifier: "678" }),
      mockLocationsQuery({}),
      mockMoveBoxesMutation({
        labelIdentifiers: ["123", "678"],
        locationId: 2,
        permissionError: true,
      }),
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

  const moveBoxesOption = await screen.findByTestId("MoveBox");
  await user.click(moveBoxesOption);
  await selectOptionInSelectField(user, undefined, /shop/i, /please select a location/i);

  // The submit button is shown
  const submitButton = await screen.findByRole("button", { name: /move all/i });
  expect(submitButton).not.toBeDisabled();
  await user.click(submitButton);

  // selected boxes remains the same
  expect(await screen.findByText(/boxes selected: 2/i)).toBeInTheDocument();

  // Alert appears
  expect(await screen.findByText(/The following boxes were not moved/i)).toBeInTheDocument();
  expect(screen.getByText(/123/i)).toBeInTheDocument();
  expect(screen.getByText(/678/i)).toBeInTheDocument();

  // click link to remove all not failed boxes
  await user.click(screen.getByText(/Click here to remove all failed boxes from the list/i));
  expect(await screen.findByText(/boxes selected: 0/i)).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
