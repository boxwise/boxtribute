import { vi, beforeEach, it, expect } from "vitest";
import { basicShipment, generateMockShipment } from "mocks/shipments";
import { location1 } from "mocks/locations";
import { generateMockBox } from "mocks/boxes";
import { BoxState } from "types/generated/graphql";
import { shipmentDetail1 } from "mocks/shipmentDetail";
import { useAuth0 } from "@auth0/auth0-react";
import { mockAuthenticatedUser } from "mocks/hooks";
import { cache, tableConfigsVar } from "queries/cache";
import { render, screen, waitFor } from "tests/test-utils";
import { userEvent } from "@testing-library/user-event";
import { ASSIGN_BOXES_TO_SHIPMENT } from "hooks/useAssignBoxesToShipment";
import { gql } from "@apollo/client";
import { AlertWithoutAction } from "components/Alerts";
import { TableSkeleton } from "components/Skeletons";
import { Suspense } from "react";
import { ErrorBoundary } from "@sentry/react";
import { mockedCreateToast, mockedTriggerError } from "tests/setupTests";
import Boxes, { ACTION_OPTIONS_FOR_BOXESVIEW_QUERY, BOXES_FOR_BOXESVIEW_QUERY } from "./BoxesView";
import { FakeGraphQLError, FakeGraphQLNetworkError } from "mocks/functions";
import { DELETE_BOXES } from "hooks/useDeleteBoxes";

const boxesQuery = ({
  state = BoxState.InStock,
  stateFilter = [BoxState.InStock],
  shipmentDetail = null as any,
  labelIdentifier = "123",
}) => ({
  request: {
    query: BOXES_FOR_BOXESVIEW_QUERY,
    variables: {
      baseId: "1",
      filterInput: stateFilter.length
        ? {
            states: stateFilter,
          }
        : {},
    },
  },
  result: {
    data: {
      boxes: {
        __typename: "BoxPage",
        elements: [
          generateMockBox({
            labelIdentifier,
            state,
            shipmentDetail,
          }),
        ],
        pageInfo: {
          __typename: "PageInfo",
          hasNextPage: false,
        },
        totalCount: 1,
      },
    },
  },
});

const actionsQuery = () => ({
  request: {
    query: ACTION_OPTIONS_FOR_BOXESVIEW_QUERY,
    variables: {
      baseId: "1",
    },
  },
  result: {
    data: {
      base: {
        __typename: "Base",
        id: "1",
        locations: [location1],
        tags: [],
      },
      shipments: [generateMockShipment({ hasBoxes: false })],
    },
  },
});

const mutation = ({
  gQLRequest = ASSIGN_BOXES_TO_SHIPMENT,
  variables = { id: "1", labelIdentifiers: ["123"] } as any,
  resultData = {
    updateShipmentWhenPreparing: { ...basicShipment, details: [shipmentDetail1()] },
  } as any,
  networkError = false,
  graphQlError = false,
  insufficientPermissionError = false,
}) => ({
  request: {
    query: gQLRequest,
    variables,
  },
  result: networkError
    ? undefined
    : {
        data: insufficientPermissionError
          ? {
              deleteBoxes: {
                __typename: "InsufficientPermissionError",
                name: "InsufficientPermissionError",
              },
            }
          : graphQlError
            ? null
            : resultData,
        errors: graphQlError ? [new FakeGraphQLError()] : undefined,
      },
  error: networkError ? new FakeGraphQLNetworkError() : undefined,
});

vi.mock("@auth0/auth0-react");
const mockedUseAuth0 = vi.mocked(useAuth0);

beforeEach(() => {
  mockAuthenticatedUser(mockedUseAuth0, "dev_volunteer@boxaid.org");
  tableConfigsVar(new Map());
});

const moveBoxesGQLRequest = gql`
  mutation MoveBoxes($newLocationId: Int!, $labelIdentifier0: String!) {
    moveBox123: updateBox(
      updateInput: { labelIdentifier: $labelIdentifier0, locationId: $newLocationId }
    ) {
      labelIdentifier
      state
      location {
        id
      }
      lastModifiedOn
    }
  }
`;

const unassignFromShipmentGQLRequest = gql`
  mutation UnassignBoxesFromShipments($shipment0: ID!, $labelIdentifiers0: [String!]!) {
    unassignBoxesFromShipment1: updateShipmentWhenPreparing(
      updateInput: {
        id: $shipment0
        preparedBoxLabelIdentifiers: []
        removedBoxLabelIdentifiers: $labelIdentifiers0
      }
    ) {
      id
      details {
        id
        removedOn
        removedBy {
          id
          __typename
        }
        box {
          labelIdentifier
          state
          shipmentDetail {
            id
            __typename
          }
          lastModifiedOn
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;

const deleteBoxesMutation = ({
  labelIdentifiers = ["123"],
  invalidBoxLabelIdentifiers = [] as string[],
  networkError = false,
  graphQlError = false,
  insufficientPermissionError = false,
}) => ({
  request: {
    query: DELETE_BOXES,
    variables: { labelIdentifiers },
  },
  result: networkError
    ? undefined
    : {
        data: insufficientPermissionError
          ? {
              deleteBoxes: {
                __typename: "InsufficientPermissionError",
                name: "InsufficientPermissionError",
              },
            }
          : graphQlError
            ? null
            : {
                deleteBoxes: {
                  __typename: "BoxResult",
                  updatedBoxes: labelIdentifiers.map((id) => ({ labelIdentifier: id })),
                  invalidBoxLabelIdentifiers: invalidBoxLabelIdentifiers,
                },
              },
        errors: graphQlError ? [new FakeGraphQLError()] : undefined,
      },
  error: networkError ? new FakeGraphQLNetworkError() : undefined,
});

const boxesViewActionsTests = [
  {
    name: "4.8.5.2 - MoveBoxes Action is successful",
    mocks: [
      boxesQuery({}),
      actionsQuery(),
      mutation({
        gQLRequest: moveBoxesGQLRequest,
        variables: { newLocationId: 1, labelIdentifier0: "123" },
        resultData: {
          moveBox123: {
            labelIdentifier: "123",
            state: BoxState.InStock,
            location: {
              id: "1",
            },
            lastModifiedOn: new Date().toISOString(),
          },
        },
      }),
    ],
    clicks: [/move to/i, /warehouse/i],
    toast: /A Box was successfully moved/i,
  },
  {
    name: "4.8.5.3 - MoveBoxes Action is failing due to GraphQL error",
    mocks: [
      boxesQuery({}),
      actionsQuery(),
      mutation({
        gQLRequest: moveBoxesGQLRequest,
        variables: { newLocationId: 1, labelIdentifier0: "123" },
        graphQlError: true,
      }),
    ],
    clicks: [/move to/i, /warehouse/i],
    toast: /Could not move a box/i,
  },
  {
    name: "4.8.5.4 - MoveBoxes Action is failing due to Network error",
    mocks: [
      boxesQuery({}),
      actionsQuery(),
      mutation({
        gQLRequest: moveBoxesGQLRequest,
        variables: { newLocationId: 1, labelIdentifier0: "123" },
        networkError: true,
      }),
    ],
    clicks: [/move to/i, /warehouse/i],
    toast: /Could not move a box/i,
  },
  {
    name: "4.8.5.5 - MoveBoxes Action is not executing since box is in wrong state",
    mocks: [boxesQuery({ state: BoxState.MarkedForShipment, stateFilter: [] }), actionsQuery()],
    clicks: [/move to/i, /warehouse/i],
    toast: /Cannot move a box in shipment states./i,
    searchParams: "?columnFilters=%5B%5D",
  },
  {
    name: "4.8.3.2 - Assign To Shipment Action is successful",
    mocks: [
      boxesQuery({}),
      actionsQuery(),
      mutation({
        gQLRequest: ASSIGN_BOXES_TO_SHIPMENT,
        variables: { id: "1", labelIdentifiers: ["123"] },
        resultData: {
          updateShipmentWhenPreparing: generateMockShipment({}),
        },
      }),
      boxesQuery({}),
    ],
    clicks: [/assign to shipment/i, /thessaloniki/i],
    toast: /A Box was successfully assigned/i,
  },
  {
    name: "4.8.3.3 - Assign To Shipment Action is failing due to GraphQL error",
    mocks: [
      boxesQuery({}),
      actionsQuery(),
      mutation({
        gQLRequest: ASSIGN_BOXES_TO_SHIPMENT,
        variables: { id: "1", labelIdentifiers: ["123"] },
        graphQlError: true,
      }),
    ],
    clicks: [/assign to shipment/i, /thessaloniki/i],
    toast: /Could not assign a box/i,
  },
  {
    name: "4.8.3.4 - Assign To Shipment Action is failing due to Network error",
    mocks: [
      boxesQuery({}),
      actionsQuery(),
      mutation({
        gQLRequest: ASSIGN_BOXES_TO_SHIPMENT,
        variables: { id: "1", labelIdentifiers: ["123"] },
        networkError: true,
      }),
    ],
    clicks: [/assign to shipment/i, /thessaloniki/i],
    toast: /Could not assign a box/i,
  },
  {
    name: "4.8.3.5 - Assign To Shipment Action is not executing since box is in wrong state",
    mocks: [boxesQuery({ state: BoxState.Donated, stateFilter: [] }), actionsQuery()],
    clicks: [/assign to shipment/i, /thessaloniki/i],
    toast: /Cannot assign a box/i,
    searchParams: "?columnFilters=%5B%5D",
  },
  {
    name: "4.8.4.2 - Unassign From Shipment Action is successful",
    mocks: [
      boxesQuery({
        state: BoxState.MarkedForShipment,
        shipmentDetail: shipmentDetail1(),
        stateFilter: [],
      }),
      actionsQuery(),
      mutation({
        gQLRequest: unassignFromShipmentGQLRequest,
        variables: { shipment0: "1", labelIdentifiers0: ["123"] },
        resultData: {
          unassignBoxesFromShipment1: generateMockShipment({ hasBoxes: false }),
        },
      }),
    ],
    clicks: [/remove from shipment/i],
    toast: /A Box was successfully unassigned/i,
    searchParams: "?columnFilters=%5B%5D",
  },
  {
    name: "4.8.4.3 - Unassign From Shipment Action is failing due to GraphQL error",
    mocks: [
      boxesQuery({
        state: BoxState.MarkedForShipment,
        shipmentDetail: shipmentDetail1(),
        stateFilter: [],
      }),
      actionsQuery(),
      mutation({
        gQLRequest: unassignFromShipmentGQLRequest,
        variables: { shipment0: "1", labelIdentifiers0: ["123"] },
        graphQlError: true,
      }),
    ],
    clicks: [/remove from shipment/i],
    toast: /Could not remove a box/i,
    searchParams: "?columnFilters=%5B%5D",
  },
  {
    name: "4.8.4.4 - Unassign From Shipment Action is failing due to Network error",
    mocks: [
      boxesQuery({
        state: BoxState.MarkedForShipment,
        shipmentDetail: shipmentDetail1(),
        stateFilter: [],
      }),
      actionsQuery(),
      mutation({
        gQLRequest: unassignFromShipmentGQLRequest,
        variables: { shipment0: "1", labelIdentifiers0: ["123"] },
        networkError: true,
      }),
    ],
    clicks: [/remove from shipment/i],
    toast: /Could not remove a box/i,
    searchParams: "?columnFilters=%5B%5D",
  },
  // 4.8.6 - DeleteBoxes Action
  {
    name: "4.8.6.1 - DeleteBoxes Action is loading and shows Table skeleton",
    mocks: [boxesQuery({}), actionsQuery()],
    clicks: [], // No action clicks since we're just testing the initial load
    toast: null, // No toast message expected
    checkButtonVisible: false, // Parameter to check if "Remove Box" button should be visible
  },
  {
    name: "4.8.6.2 - DeleteBoxes Action is successful",
    mocks: [
      boxesQuery({}),
      actionsQuery(),
      deleteBoxesMutation({
        labelIdentifiers: ["123"],
      }),
    ],
    clicks: [/remove box/i],
    toast: /A box was successfully deleted|Boxes successfully deleted/i,
  },
  {
    name: "4.8.6.3 - DeleteBoxes Action is failing due to GraphQL error",
    mocks: [
      boxesQuery({}),
      actionsQuery(),
      deleteBoxesMutation({
        labelIdentifiers: ["123"],
        graphQlError: true,
      }),
    ],
    clicks: [/remove box/i],
    toast: /Could not delete the boxes. Please try again/i,
  },
  {
    name: "4.8.6.4 - DeleteBoxes Action is failing due to Network error",
    mocks: [
      boxesQuery({}),
      actionsQuery(),
      deleteBoxesMutation({
        labelIdentifiers: ["123"],
        networkError: true,
      }),
    ],
    clicks: [/remove box/i],
    toast: /Could not delete the boxes. Please try again/i,
  },
  {
    name: "4.8.6.5 - DeleteBoxes Action fails due to invalid box identifier",
    mocks: [
      boxesQuery({
        labelIdentifier: "456",
      }),
      actionsQuery(),
      deleteBoxesMutation({
        labelIdentifiers: ["456"],
        invalidBoxLabelIdentifiers: ["456"],
      }),
    ],
    clicks: [/remove box/i],
    toast: /Could not delete the boxes. Please try again./i,
    triggerError: /Invalid box identifiers: 456/i,
  },
  {
    name: "4.8.6.6 - DeleteBoxes Action fails due to insufficient permissions",
    mocks: [
      boxesQuery({}),
      actionsQuery(),
      deleteBoxesMutation({
        labelIdentifiers: ["123"],
        insufficientPermissionError: true,
      }),
    ],
    clicks: [/remove box/i],
    toast: /Could not delete the boxes. Please try again/i,
    triggerError: /You don't have the permissions to delete these boxes/i,
  },
];

boxesViewActionsTests.forEach(
  ({ name, mocks, clicks, toast, searchParams, triggerError, checkButtonVisible }) => {
    it(
      name,
      async () => {
        const user = userEvent.setup();
        render(
          <ErrorBoundary
            fallback={
              <AlertWithoutAction alertText="Could not fetch boxes data! Please try reloading the page." />
            }
          >
            <Suspense fallback={<TableSkeleton />}>
              <Boxes />
            </Suspense>
          </ErrorBoundary>,
          {
            routePath: "/bases/:baseId/boxes",
            initialUrl: `/bases/1/boxes${searchParams || ""}`,
            mocks,
            cache,
          },
        );

        // Check loading state
        expect(await screen.findByTestId("TableSkeleton")).toBeInTheDocument();

        // // Ensure component renders
        // await screen.findByRole("table");

        // Check for "Remove Box" button visibility if specified in the test case
        const removeBoxButton = screen.queryByRole("button", { name: /remove box/i });
        if (checkButtonVisible === false) {
          expect(removeBoxButton).not.toBeInTheDocument();
        }

        if (clicks.length > 0) {
          // Select a checkbox and ensure button becomes visible
          const checkboxes = await screen.findAllByRole("checkbox");
          expect(checkboxes.length).toBeGreaterThan(0);
          await user.click(checkboxes[0]);
          await waitFor(() => expect(checkboxes[0]).toBeChecked());

          // Perform action based on the `clicks` parameter
          const actionButton = await screen.findByRole("button", { name: clicks[0] });
          expect(actionButton).toBeInTheDocument();
          await user.click(actionButton);

          // Conditional check for delete action confirmation
          if (
            typeof clicks[0] === "string" &&
            (clicks[0] as string).toLowerCase().includes("remove")
          ) {
            const confirmDialogButton = await screen.findByRole("button", { name: /remove/i });
            expect(confirmDialogButton).toBeInTheDocument();
            await user.click(confirmDialogButton);
          } else if (clicks[1]) {
            // For other actions, click the sub-action button if specified
            const subButton = await screen.findByText(clicks[1]);
            expect(subButton).toBeInTheDocument();
            await user.click(subButton);
          }

          // Only confirm deletion if the action is a delete operation
          if (name.toLowerCase().includes("delete") || name.toLowerCase().includes("remove")) {
            const confirmButton = await screen.findByRole("button", { name: /remove/i });
            await user.click(confirmButton);
          }
        }

        if (triggerError) {
          // error message appears
          await waitFor(() =>
            expect(mockedTriggerError).toHaveBeenCalledWith(
              expect.objectContaining({
                message: expect.stringMatching(triggerError),
              }),
            ),
          );
        }

        // Check for the expected toast message
        if (toast) {
          await waitFor(() =>
            expect(mockedCreateToast).toHaveBeenCalledWith(
              expect.objectContaining({
                message: expect.stringMatching(toast),
              }),
            ),
          );
        }
      },
      20000,
    );
  },
);
