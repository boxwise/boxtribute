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
import { gql } from "@apollo/client";
import { tagsArray } from "mocks/tags";
import { mockedCreateToast, mockedTriggerError } from "tests/setupTests";
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
              shipments: [generateMockShipmentMinimal({ state: "Preparing", iAmSource: true })],
              base: { locations, tags: tagsArray },
            },
        errors: graphQlError ? [new FakeGraphQLError()] : undefined,
      },
  error: networkError ? new FakeGraphQLNetworkError() : undefined,
});

const ASSIGN_TAGS_TO_BOXES_MUTATION = gql`
  mutation AssignTagsToBoxes($labelIdentifiers: [String!]!, $tagIds: [Int!]!) {
    assignTagsToBoxes(updateInput: { labelIdentifiers: $labelIdentifiers, tagIds: $tagIds }) {
      updatedBoxes {
        labelIdentifier
      }
      invalidBoxLabelIdentifiers
    }
  }
`;

const generateAssignTagsResponse = ({ labelIdentifiers, failLabelIdentifier }) => ({
  assignTagsToBoxes: {
    __typename: "BoxesTagsOperationResult",
    updatedBoxes: labelIdentifiers
      .filter((id) => id !== failLabelIdentifier)
      .map((labelIdentifier) => ({ __typename: "Box", labelIdentifier })),
    invalidBoxLabelIdentifiers: labelIdentifiers.filter((id) => id === failLabelIdentifier),
  },
});

const mockAssignTagsMutation = ({
  networkError = false,
  graphQlError = false,
  labelIdentifiers = ["123"],
  newTagId = 1,
  failLabelIdentifier = "678",
}) => ({
  request: {
    query: ASSIGN_TAGS_TO_BOXES_MUTATION,
    variables: { labelIdentifiers, tagIds: [newTagId] },
  },
  result: networkError
    ? undefined
    : {
        data: graphQlError
          ? null
          : generateAssignTagsResponse({
              labelIdentifiers,
              failLabelIdentifier,
            }),
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

  // selected boxes remains the same
  expect(await screen.findByText(/boxes selected: 2/i)).toBeInTheDocument();

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
  expect(await screen.findByText(/boxes selected: 1/i)).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: /assign all/i })).toBeInTheDocument();
}, 10000);
