/* eslint-disable max-len */
import { GraphQLError } from "graphql";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { screen, render, waitFor } from "tests/test-utils";
import { useAuth0 } from "@auth0/auth0-react";
import { QrReaderScanner } from "components/QrReader/components/QrReaderScanner";
import { mockMatchMediaQuery } from "mocks/functions";
import { mockAuthenticatedUser } from "mocks/hooks";
import { mockImplementationOfQrReader } from "mocks/components";
import { generateMockBox } from "mocks/boxes";
import { useErrorHandling } from "hooks/useErrorHandling";
import { useNotification } from "hooks/useNotification";
import {
  GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
  MULTI_BOX_ACTION_OPTIONS_FOR_LOCATIONS_TAGS_AND_SHIPMENTS_QUERY,
} from "queries/queries";
import { BoxState, ShipmentState } from "types/generated/graphql";
import { cache } from "queries/cache";
import { generateMockShipmentMinimal } from "mocks/shipments";
import { selectOptionInSelectField } from "tests/helpers";
import { locations } from "mocks/locations";
import { generateAssignTagsRequest } from "queries/dynamic-mutations";
import { tagsArray } from "mocks/tags";
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

const mockTagsQuery = ({
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
              shipments: [
                generateMockShipmentMinimal({ state: ShipmentState.Preparing, iAmSource: true }),
              ],
              base: { locations, tags: tagsArray },
            },
        errors: graphQlError ? [new GraphQLError("Error!")] : undefined,
      },
  error: networkError ? new Error() : undefined,
});

const generateAssignTagsResponse = ({ labelIdentifiers, newTagId, failLabelIdentifier }) => {
  const response = {};
  labelIdentifiers.forEach((labelIdentifier) => {
    if (labelIdentifier !== failLabelIdentifier) {
      response[`assignTagsToBox${labelIdentifier}`] = {
        labelIdentifier,
        tags: [
          {
            id: newTagId,
          },
        ],
      };
    } else {
      response[`assignTagsToBox${labelIdentifier}`] = null;
    }
  });
  return response;
};

const mockAssignTagsMutation = ({
  networkError = false,
  graphQlError = false,
  labelIdentifiers = ["123"],
  newTagId = 1,
  failLabelIdentifier = "678",
}) => ({
  request: {
    query: generateAssignTagsRequest(labelIdentifiers, [newTagId]).gqlRequest,
    variables: generateAssignTagsRequest(labelIdentifiers, [newTagId]).variables,
  },
  result: networkError
    ? undefined
    : {
        data: graphQlError
          ? null
          : generateAssignTagsResponse({
              labelIdentifiers,
              newTagId,
              failLabelIdentifier,
            }),
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

const assignTagsMutationTests = [
  {
    name: "3.4.7.6 - Mutation to assign tags returns Network Error",
    mocks: [
      mockSuccessfulQrQuery({ hash: "InStockBox", labelIdentifier: "123" }),
      mockTagsQuery({}),
      mockAssignTagsMutation({ networkError: true }),
    ],
    toast: { isError: true, message: /Network issue: could not assign/i },
  },
  {
    name: "3.4.7.7 - Mutation to assign tags returns GraphQL Error",
    mocks: [
      mockSuccessfulQrQuery({ hash: "InStockBox", labelIdentifier: "123" }),
      mockTagsQuery({}),
      mockAssignTagsMutation({ graphQlError: true }),
    ],
    toast: { isError: true, message: /Could not assign/i },
  },
  {
    name: "3.4.7.10 - Boxes are successfully tagged",
    mocks: [
      mockSuccessfulQrQuery({ hash: "InStockBox", labelIdentifier: "123" }),
      mockTagsQuery({}),
      mockAssignTagsMutation({}),
    ],
    toast: { isError: false, message: /A Box was successfully assign/i },
  },
];

assignTagsMutationTests.forEach(({ name, mocks, toast }) => {
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

    const assignToShipmentOption = await screen.findByTestId("AssignTags");
    await user.click(assignToShipmentOption);
    await selectOptionInSelectField(user, undefined, /tag1/i, /please select tags/i);

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

it("3.4.7.8 - One Box of two or more Boxes fail for the assign tag Mutation", async () => {
  const user = userEvent.setup();
  mockImplementationOfQrReader(mockedQrReader, "InStockBox1", true, true);
  const { rerender } = render(<QrReaderView />, {
    routePath: "/bases/:baseId/qrreader",
    initialUrl: "/bases/1/qrreader",
    mocks: [
      mockSuccessfulQrQuery({ hash: "InStockBox1", labelIdentifier: "123" }),
      mockSuccessfulQrQuery({ hash: "InStockBox2", labelIdentifier: "678" }),
      mockTagsQuery({}),
      mockAssignTagsMutation({ labelIdentifiers: ["123", "678"] }),
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
  const assignTagsOption = await screen.findByTestId("AssignTags");
  await user.click(assignTagsOption);
  await selectOptionInSelectField(user, undefined, /tag1/i, /please select tags/i);

  // The submit button is shown
  const submitButton = await screen.findByRole("button", { name: /assign all/i });
  expect(submitButton).not.toBeDisabled();
  await user.click(submitButton);

  // selected boxes reduced by one
  expect(await screen.findByText(/boxes selected: 1/i)).toBeInTheDocument();

  // toast shown
  await waitFor(() =>
    expect(mockedCreateToast).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/A box was successfully assign/i),
      }),
    ),
  );

  // Alert appears
  expect(await screen.findByText(/The following boxes were not assign/i)).toBeInTheDocument();
  expect(screen.getByText(/678/i)).toBeInTheDocument();

  // click link to remove all not failed boxes
  await user.click(screen.getByText(/Click here to remove all failed boxes from the list/i));
  expect(await screen.findByText(/boxes selected: 0/i)).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /move all/i })).not.toBeInTheDocument();
}, 10000);
