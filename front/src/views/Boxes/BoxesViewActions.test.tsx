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
import { graphql } from "../../../../graphql";
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
}) => ({
  request: {
    query: gQLRequest,
    variables,
  },
  result: networkError
    ? undefined
    : {
        data: graphQlError ? null : resultData,
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

const moveBoxesGQLRequest = graphql(`
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
`);

const unassignFromShipmentGQLRequest = graphql(`
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
`);

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
                  __typename: "BoxesResult",
                  updatedBoxes: labelIdentifiers.map((id) => ({
                    labelIdentifier: id,
                    deletedOn: new Date().toISOString(),
                  })),
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
    clicks: [/delete box/i],
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
    clicks: [/delete box/i],
    triggerError: /Could not delete boxes./i,
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
    clicks: [/delete box/i],
    triggerError: /Could not delete boxes./i,
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
    clicks: [/delete box/i],
    triggerError: /The deletion failed for: 456/i,
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
    clicks: [/delete box/i],
    triggerError: /You don't have the permissions to delete these boxes/i,
  },
];

boxesViewActionsTests.forEach(({ name, mocks, clicks, toast, searchParams, triggerError }) => {
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

      if (clicks.length > 0) {
        // Select the first box
        const checkboxes = await screen.findAllByRole(
          "checkbox",
          { name: /toggle row selected/i },
          { timeout: 5000 },
        );
        expect(checkboxes.length).toBe(1);
        await user.click(checkboxes[0]);
        await waitFor(() => expect(checkboxes[0]).toBeChecked());

        // Conditional check for delete action confirmation
        if (name.toLowerCase().includes("delete")) {
          // Check for "Remove Box" button visibility
          const deleteBoxButton = await screen.findByTestId("delete-boxes-button");
          expect(deleteBoxButton).toBeInTheDocument();
          await user.click(deleteBoxButton);
          const confirmDialogButton = await screen.findByRole("button", { name: /delete/i });
          expect(confirmDialogButton).toBeInTheDocument();
          await user.click(confirmDialogButton);
        } else {
          // Perform action based on the `clicks` parameter
          const actionButton = await screen.findByRole("button", { name: clicks[0] });
          expect(actionButton).toBeInTheDocument();
          await user.click(actionButton);
        }

        if (clicks[1]) {
          // For other actions, click the sub-action button if specified
          const subButton = await screen.findByText(clicks[1]);
          expect(subButton).toBeInTheDocument();
          await user.click(subButton);
        }

        // Only confirm deletion if the action is a delete operation
        if (name.toLowerCase().includes("delete")) {
          const confirmButton = await screen.findByRole("button", { name: /delete/i });
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
});
