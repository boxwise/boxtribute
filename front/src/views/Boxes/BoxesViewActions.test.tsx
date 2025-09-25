import { vi, beforeEach, it, expect } from "vitest";
import { basicShipment, generateMockShipment } from "mocks/shipments";
import { location1 } from "mocks/locations";
import { generateMockBox } from "mocks/boxes";
import { shipmentDetail1 } from "mocks/shipmentDetail";
import { tag1, tag2 } from "mocks/tags";
import { useAuth0 } from "@auth0/auth0-react";
import { mockAuthenticatedUser } from "mocks/hooks";
import { cache, tableConfigsVar } from "queries/cache";
import { render, screen, waitFor, within } from "tests/test-utils";
import { userEvent } from "@testing-library/user-event";
import { ASSIGN_BOXES_TO_SHIPMENT } from "hooks/useAssignBoxesToShipment";
import { graphql } from "../../../../graphql/graphql";
import { AlertWithoutAction } from "components/Alerts";
import { TableSkeleton } from "components/Skeletons";
import { Suspense } from "react";
import { ErrorBoundary } from "@sentry/react";
import { mockedCreateToast, mockedTriggerError } from "tests/setupTests";
import Boxes, { ACTION_OPTIONS_FOR_BOXESVIEW_QUERY, BOXES_FOR_BOXESVIEW_QUERY } from "./BoxesView";
import { FakeGraphQLError, FakeGraphQLNetworkError } from "mocks/functions";
import { DELETE_BOXES } from "hooks/useDeleteBoxes";
import { ASSIGN_TAGS_TO_BOXES } from "hooks/useAssignTags";
import { UNASSIGN_TAGS_FROM_BOXES } from "hooks/useUnassignTags";
import { MOVE_BOXES_TO_LOCATION } from "hooks/useMoveBoxes";
import { TadaDocumentNode } from "gql.tada";

const boxesQuery = ({
  state = "InStock",
  stateFilter = ["InStock"],
  shipmentDetail = null as any,
  labelIdentifier = "123",
  paginationInput = 20,
}) => ({
  request: {
    query: BOXES_FOR_BOXESVIEW_QUERY,
    variables: {
      baseId: "1",
      filterInput: stateFilter.length ? { states: stateFilter } : {},
      paginationInput: paginationInput,
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
        tags: [tag1],
      },
      shipments: [generateMockShipment({ hasBoxes: false })],
    },
  },
});

const mutation = ({
  gQLRequest = ASSIGN_BOXES_TO_SHIPMENT as TadaDocumentNode,
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

const assignTagsMutation = ({
  labelIdentifiers = ["123"],
  tagIds = [1],
  networkError = false,
  graphQlError = false,
}) => ({
  request: {
    query: ASSIGN_TAGS_TO_BOXES,
    variables: { labelIdentifiers, tagIds },
  },
  result: networkError
    ? undefined
    : {
        data: graphQlError
          ? null
          : {
              assignTagsToBoxes: {
                __typename: "BoxesTagsOperationResult",
                updatedBoxes: labelIdentifiers.map((label) => ({
                  __typename: "Box",
                  labelIdentifier: label,
                  lastModifiedOn: new Date().toISOString(),
                  tags: tagIds.map((id) => ({ id: id.toString(), __typename: "Tag" })),
                })),
                invalidBoxLabelIdentifiers: [],
              },
            },
        errors: graphQlError ? [new FakeGraphQLError()] : undefined,
      },
  error: networkError ? new FakeGraphQLNetworkError() : undefined,
});

const unassignTagsMutation = ({
  labelIdentifiers = ["123"],
  tagIds = [1],
  networkError = false,
  graphQlError = false,
}) => ({
  request: {
    query: UNASSIGN_TAGS_FROM_BOXES,
    variables: { labelIdentifiers, tagIds },
  },
  result: networkError
    ? undefined
    : {
        data: graphQlError
          ? null
          : {
              unassignTagsFromBoxes: {
                __typename: "BoxesTagsOperationResult",
                updatedBoxes: labelIdentifiers.map((label) => ({
                  __typename: "Box",
                  labelIdentifier: label,
                  lastModifiedOn: new Date().toISOString(),
                  tags: [],
                })),
                invalidBoxLabelIdentifiers: [],
                tagErrorInfo: [],
              },
            },
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

const moveBoxesMutation = ({
  labelIdentifiers = ["123"],
  locationId = 1,
  invalidBoxLabelIdentifiers = [] as string[],
  networkError = false,
  graphQlError = false,
  insufficientPermissionError = false,
  resourceDoesNotExistError = false,
  unauthorizedForBaseError = false,
  deletedLocationError = false,
}) => ({
  request: {
    query: MOVE_BOXES_TO_LOCATION,
    variables: { labelIdentifiers, locationId },
  },
  result: networkError
    ? undefined
    : {
        data: insufficientPermissionError
          ? {
              moveBoxesToLocation: {
                __typename: "InsufficientPermissionError",
                name: "InsufficientPermissionError",
              },
            }
          : resourceDoesNotExistError
            ? {
                moveBoxesToLocation: {
                  __typename: "ResourceDoesNotExistError",
                  name: "ResourceDoesNotExistError",
                },
              }
            : unauthorizedForBaseError
              ? {
                  moveBoxesToLocation: {
                    __typename: "UnauthorizedForBaseError",
                    name: "UnauthorizedForBaseError",
                  },
                }
              : deletedLocationError
                ? {
                    moveBoxesToLocation: {
                      __typename: "DeletedLocationError",
                      name: "DeletedLocationError",
                    },
                  }
                : graphQlError
                  ? null
                  : {
                      moveBoxesToLocation: {
                        __typename: "BoxesResult",
                        updatedBoxes: labelIdentifiers.map((labelIdentifier) => ({
                          labelIdentifier,
                          state: "InStock",
                          location: {
                            id: locationId.toString(),
                          },
                          lastModifiedOn: new Date().toISOString(),
                        })),
                        invalidBoxLabelIdentifiers,
                      },
                    },
        errors: graphQlError ? [new FakeGraphQLError()] : undefined,
      },
  error: networkError ? new FakeGraphQLNetworkError() : undefined,
});

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
      boxesQuery({ state: "Donated", stateFilter: ["Donated"] }),
      boxesQuery({ state: "Scrap", stateFilter: ["Scrap"] }),
      boxesQuery({ paginationInput: 100000 }),
      actionsQuery(),
      moveBoxesMutation({
        labelIdentifiers: ["123"],
        locationId: 1,
      }),
    ],
    clicks: [/move/i, /warehouse/i],
    toast: /A Box was successfully moved/i,
    searchParams: "?state_ids=1",
  },
  {
    name: "4.8.5.3 - MoveBoxes Action is failing due to GraphQL error",
    mocks: [
      boxesQuery({}),
      boxesQuery({ state: "Donated", stateFilter: ["Donated"] }),
      boxesQuery({ state: "Scrap", stateFilter: ["Scrap"] }),
      boxesQuery({ paginationInput: 100000 }),
      actionsQuery(),
      moveBoxesMutation({
        labelIdentifiers: ["123"],
        locationId: 1,
        graphQlError: true,
      }),
    ],
    clicks: [/move/i, /warehouse/i],
    triggerError: /Could not move box/i,
    searchParams: "?state_ids=1",
  },
  {
    name: "4.8.5.4 - MoveBoxes Action is failing due to Network error",
    mocks: [
      boxesQuery({}),
      boxesQuery({ state: "Donated", stateFilter: ["Donated"] }),
      boxesQuery({ state: "Scrap", stateFilter: ["Scrap"] }),
      boxesQuery({ paginationInput: 100000 }),
      actionsQuery(),
      moveBoxesMutation({
        labelIdentifiers: ["123"],
        locationId: 1,
        networkError: true,
      }),
    ],
    clicks: [/move/i, /warehouse/i],
    triggerError: /Network issue: could not move box/i,
    searchParams: "?state_ids=1",
  },
  {
    name: "4.8.5.6 - MoveBoxes Action fails due to insufficient permissions",
    mocks: [
      boxesQuery({}),
      boxesQuery({ state: "Donated", stateFilter: ["Donated"] }),
      boxesQuery({ state: "Scrap", stateFilter: ["Scrap"] }),
      boxesQuery({ paginationInput: 100000 }),
      actionsQuery(),
      moveBoxesMutation({
        labelIdentifiers: ["123"],
        locationId: 1,
        insufficientPermissionError: true,
      }),
    ],
    clicks: [/move/i, /warehouse/i],
    triggerError: /You don't have the permissions to move/i,
    searchParams: "?state_ids=1",
  },
  {
    name: "4.8.5.7 - MoveBoxes Action fails due to deleted location",
    mocks: [
      boxesQuery({}),
      boxesQuery({ state: "Donated", stateFilter: ["Donated"] }),
      boxesQuery({ state: "Scrap", stateFilter: ["Scrap"] }),
      boxesQuery({ paginationInput: 100000 }),
      actionsQuery(),
      moveBoxesMutation({
        labelIdentifiers: ["123"],
        locationId: 1,
        deletedLocationError: true,
      }),
    ],
    clicks: [/move/i, /warehouse/i],
    triggerError: /The target location has been deleted/i,
    searchParams: "?state_ids=1",
  },
  {
    name: "4.8.5.5 - MoveBoxes Action is not executing since box is in wrong state",
    mocks: [
      boxesQuery({}),
      boxesQuery({ state: "Donated", stateFilter: ["Donated"] }),
      boxesQuery({ state: "Scrap", stateFilter: ["Scrap"] }),
      boxesQuery({
        state: "MarkedForShipment",
        stateFilter: ["MarkedForShipment"],
        paginationInput: 100000,
      }),
      actionsQuery(),
    ],
    clicks: [/Move/, /warehouse/i],
    toast: /Cannot move a box in shipment states./i,
    searchParams: "?state_ids=3",
  },
  {
    name: "4.8.3.2 - Assign To Shipment Action is successful",
    mocks: [
      boxesQuery({}),
      boxesQuery({ state: "Donated", stateFilter: ["Donated"] }),
      boxesQuery({ state: "Scrap", stateFilter: ["Scrap"] }),
      boxesQuery({ paginationInput: 100000 }),
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
    clicks: [/transfer/i, /thessaloniki/i],
    toast: /A Box was successfully assigned/i,
    searchParams: "?state_ids=1",
  },
  {
    name: "4.8.3.3 - Assign To Shipment Action is failing due to GraphQL error",
    mocks: [
      boxesQuery({}),
      boxesQuery({ state: "Donated", stateFilter: ["Donated"] }),
      boxesQuery({ state: "Scrap", stateFilter: ["Scrap"] }),
      boxesQuery({ paginationInput: 100000 }),
      actionsQuery(),
      mutation({
        gQLRequest: ASSIGN_BOXES_TO_SHIPMENT,
        variables: { id: "1", labelIdentifiers: ["123"] },
        graphQlError: true,
      }),
    ],
    clicks: [/transfer/i, /thessaloniki/i],
    toast: /Could not assign a box/i,
    searchParams: "?state_ids=1",
  },
  {
    name: "4.8.3.4 - Assign To Shipment Action is failing due to Network error",
    mocks: [
      boxesQuery({}),
      boxesQuery({ state: "Donated", stateFilter: ["Donated"] }),
      boxesQuery({ state: "Scrap", stateFilter: ["Scrap"] }),
      boxesQuery({ paginationInput: 100000 }),
      actionsQuery(),
      mutation({
        gQLRequest: ASSIGN_BOXES_TO_SHIPMENT,
        variables: { id: "1", labelIdentifiers: ["123"] },
        networkError: true,
      }),
    ],
    clicks: [/transfer/i, /thessaloniki/i],
    toast: /Could not assign a box/i,
    searchParams: "?state_ids=1",
  },
  {
    name: "4.8.3.5 - Assign To Shipment Action is not executing since box is in wrong state",
    mocks: [
      boxesQuery({}),
      boxesQuery({ state: "Donated", stateFilter: ["Donated"] }),
      boxesQuery({ state: "Scrap", stateFilter: ["Scrap"] }),
      boxesQuery({ state: "Donated", stateFilter: ["Donated"], paginationInput: 100000 }),
      actionsQuery(),
    ],
    clicks: [/transfer/i, /thessaloniki/i],
    toast: /Cannot assign a box/i,
    searchParams: "?state_ids=5",
  },
  {
    name: "4.8.4.2 - Unassign From Shipment Action is successful",
    mocks: [
      boxesQuery({}),
      boxesQuery({ state: "Donated", stateFilter: ["Donated"] }),
      boxesQuery({ state: "Scrap", stateFilter: ["Scrap"] }),
      boxesQuery({
        state: "MarkedForShipment",
        shipmentDetail: shipmentDetail1(),
        stateFilter: ["MarkedForShipment"],
        paginationInput: 100000,
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
    searchParams: "?state_ids=3",
  },
  {
    name: "4.8.4.3 - Unassign From Shipment Action is failing due to GraphQL error",
    mocks: [
      boxesQuery({}),
      boxesQuery({ state: "Donated", stateFilter: ["Donated"] }),
      boxesQuery({ state: "Scrap", stateFilter: ["Scrap"] }),
      boxesQuery({
        state: "MarkedForShipment",
        shipmentDetail: shipmentDetail1(),
        stateFilter: ["MarkedForShipment"],
        paginationInput: 100000,
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
    searchParams: "?state_ids=3",
  },
  {
    name: "4.8.4.4 - Unassign From Shipment Action is failing due to Network error",
    mocks: [
      boxesQuery({}),
      boxesQuery({ state: "Donated", stateFilter: ["Donated"] }),
      boxesQuery({ state: "Scrap", stateFilter: ["Scrap"] }),
      boxesQuery({
        state: "MarkedForShipment",
        shipmentDetail: shipmentDetail1(),
        stateFilter: ["MarkedForShipment"],
        paginationInput: 100000,
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
    searchParams: "?state_ids=3",
  },
  {
    name: "4.8.6.1 - DeleteBoxes Action is loading and shows Table skeleton",
    mocks: [
      boxesQuery({}),
      boxesQuery({ state: "Donated", stateFilter: ["Donated"] }),
      boxesQuery({ state: "Scrap", stateFilter: ["Scrap"] }),
      boxesQuery({ paginationInput: 100000 }),
      actionsQuery(),
    ],
    clicks: [], // No action clicks since we're just testing the initial load
    toast: null, // No toast message expected
    searchParams: "?state_ids=1",
  },
  {
    name: "4.8.6.2 - DeleteBoxes Action is successful",
    mocks: [
      boxesQuery({}),
      boxesQuery({ state: "Donated", stateFilter: ["Donated"] }),
      boxesQuery({ state: "Scrap", stateFilter: ["Scrap"] }),
      boxesQuery({ paginationInput: 100000 }),
      actionsQuery(),
      deleteBoxesMutation({
        labelIdentifiers: ["123"],
      }),
    ],
    clicks: [/delete box/i],
    toast: /A box was successfully deleted|Boxes successfully deleted/i,
    searchParams: "?state_ids=1",
  },
  {
    name: "4.8.6.3 - DeleteBoxes Action is failing due to GraphQL error",
    mocks: [
      boxesQuery({}),
      boxesQuery({ state: "Donated", stateFilter: ["Donated"] }),
      boxesQuery({ state: "Scrap", stateFilter: ["Scrap"] }),
      boxesQuery({ paginationInput: 100000 }),
      actionsQuery(),
      deleteBoxesMutation({
        labelIdentifiers: ["123"],
        graphQlError: true,
      }),
    ],
    clicks: [/delete box/i],
    triggerError: /Could not delete boxes./i,
    searchParams: "?state_ids=1",
  },
  {
    name: "4.8.6.4 - DeleteBoxes Action is failing due to Network error",
    mocks: [
      boxesQuery({}),
      boxesQuery({ state: "Donated", stateFilter: ["Donated"] }),
      boxesQuery({ state: "Scrap", stateFilter: ["Scrap"] }),
      boxesQuery({ paginationInput: 100000 }),
      actionsQuery(),
      deleteBoxesMutation({
        labelIdentifiers: ["123"],
        networkError: true,
      }),
    ],
    clicks: [/delete box/i],
    triggerError: /Could not delete boxes./i,
    searchParams: "?state_ids=1",
  },
  {
    name: "4.8.6.5 - DeleteBoxes Action fails due to invalid box identifier",
    mocks: [
      boxesQuery({
        labelIdentifier: "456",
      }),
      boxesQuery({ state: "Donated", stateFilter: ["Donated"] }),
      boxesQuery({ state: "Scrap", stateFilter: ["Scrap"] }),
      boxesQuery({ labelIdentifier: "456", paginationInput: 100000 }),
      actionsQuery(),
      deleteBoxesMutation({
        labelIdentifiers: ["456"],
        invalidBoxLabelIdentifiers: ["456"],
      }),
    ],
    clicks: [/delete box/i],
    triggerError: /The deletion failed for: 456/i,
    searchParams: "?state_ids=1",
  },
  {
    name: "4.8.6.6 - DeleteBoxes Action fails due to insufficient permissions",
    mocks: [
      boxesQuery({}),
      boxesQuery({ state: "Donated", stateFilter: ["Donated"] }),
      boxesQuery({ state: "Scrap", stateFilter: ["Scrap"] }),
      boxesQuery({ paginationInput: 100000 }),
      actionsQuery(),
      deleteBoxesMutation({
        labelIdentifiers: ["123"],
        insufficientPermissionError: true,
      }),
    ],
    clicks: [/delete box/i],
    triggerError: /You don't have the permissions to delete these boxes/i,
    searchParams: "?state_ids=1",
  },
  {
    name: "4.8.7.1 - Add tags Action is successful",
    mocks: [
      boxesQuery({}),
      boxesQuery({ state: "Donated", stateFilter: ["Donated"] }),
      boxesQuery({ state: "Scrap", stateFilter: ["Scrap"] }),
      boxesQuery({ paginationInput: 100000 }),
      actionsQuery(),
      assignTagsMutation({
        labelIdentifiers: ["123"],
        tagIds: [parseInt(tag1.id, 10)],
      }),
    ],
    clicks: [/add tags/i, "tag1", /apply/i],
    toast: /A Box was successfully assigned tags/i,
    searchParams: "?state_ids=1",
  },
  {
    name: "4.8.7.2 - Add tags Action is failing due to GraphQL error",
    mocks: [
      boxesQuery({}),
      boxesQuery({ state: "Donated", stateFilter: ["Donated"] }),
      boxesQuery({ state: "Scrap", stateFilter: ["Scrap"] }),
      boxesQuery({ paginationInput: 100000 }),
      actionsQuery(),
      assignTagsMutation({
        labelIdentifiers: ["123"],
        tagIds: [parseInt(tag1.id, 10)],
        graphQlError: true,
      }),
    ],
    clicks: [/add tags/i, "tag1", /apply/i],
    triggerError: /could not assign tags to box/i,
    searchParams: "?state_ids=1",
  },
  {
    name: "4.8.7.3 - Add tags Action is failing due to Network error",
    mocks: [
      boxesQuery({}),
      boxesQuery({ state: "Donated", stateFilter: ["Donated"] }),
      boxesQuery({ state: "Scrap", stateFilter: ["Scrap"] }),
      boxesQuery({ paginationInput: 100000 }),
      actionsQuery(),
      assignTagsMutation({
        labelIdentifiers: ["123"],
        tagIds: [parseInt(tag1.id, 10)],
        networkError: true,
      }),
    ],
    clicks: [/add tags/i, "tag1", /apply/i],
    triggerError: /network issue: could not assign tags to box/i,
    searchParams: "?state_ids=1",
  },
  {
    name: "4.8.7.4 - Remove tags Action is successful",
    mocks: (() => {
      const bq1 = boxesQuery({});
      bq1.result.data.boxes.elements[0].tags = [tag2];

      const bq2 = boxesQuery({ paginationInput: 100000 });
      bq2.result.data.boxes.elements[0].tags = [tag2];

      const aq = actionsQuery();
      aq.result.data.base.tags = [tag1, tag2];

      return [
        bq1,
        boxesQuery({ state: "Donated", stateFilter: ["Donated"] }),
        boxesQuery({ state: "Scrap", stateFilter: ["Scrap"] }),
        bq2,
        aq,
        unassignTagsMutation({
          labelIdentifiers: ["123"],
          tagIds: [parseInt(tag2.id, 10)],
        }),
      ];
    })(),
    clicks: [/remove tags/i, /remove test tag/i, /apply/i],
    toast: /A Box was successfully unassigned tags/i,
    searchParams: "?state_ids=1",
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
            <Boxes hasExecutedInitialFetchOfBoxes={{ current: false }} />
          </Suspense>
        </ErrorBoundary>,
        {
          routePath: "/bases/:baseId/boxes",
          initialUrl: `/bases/1/boxes${searchParams || ""}`,
          addTypename: true,
          mocks,
          cache,
        },
      );

      // Check loading state
      expect(await screen.findByTestId("TableSkeleton")).toBeInTheDocument();

      if (clicks.length > 0) {
        await screen.findByText(/1 box/i, {}, { timeout: 15000 });

        // Select the first box - wait for table to be fully loaded
        const row1 = await screen.findByRole("row", { name: /snow trousers/i }, { timeout: 10000 });
        const checkbox1 = within(row1).getByRole("checkbox", {
          name: /toggle row selected/i,
        });
        expect(checkbox1).not.toBeChecked();
        await user.click(checkbox1);
        await waitFor(() => expect(checkbox1).toBeChecked(), { timeout: 10000 });

        // Add a delay to ensure state propagation in CI environments
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Clicks logic
        if (name.toLowerCase().includes("deleteboxes")) {
          // Check for "Remove Box" button visibility
          const deleteBoxButton = await screen.findByTestId(
            "delete-boxes-button",
            {},
            { timeout: 10000 },
          );
          expect(deleteBoxButton).toBeInTheDocument();
          await user.click(deleteBoxButton);

          const confirmDialogButton = await screen.findByRole(
            "button",
            { name: /delete/i },
            { timeout: 10000 },
          );
          expect(confirmDialogButton).toBeInTheDocument();
          await user.click(confirmDialogButton);
        } else if (name.toLowerCase().includes("add tags")) {
          const addTagsButton = await screen.findByTestId(
            "assign-tags-button",
            {},
            { timeout: 10000 },
          );
          await user.click(addTagsButton);

          const selectInput = await screen.findByRole("combobox", {}, { timeout: 10000 });
          await user.click(selectInput);

          const tagOption = await screen.findByText(clicks[1], {}, { timeout: 10000 });
          await user.click(tagOption);

          const applyButton = await screen.findByTestId(
            "apply-assign-tags-button",
            {},
            { timeout: 10000 },
          );
          await user.click(applyButton);
        } else if (name.toLowerCase().includes("remove tags")) {
          const removeTagsButton = await screen.findByTestId(
            "remove-tags-button",
            {},
            { timeout: 10000 },
          );
          await user.click(removeTagsButton);

          const selectInput = await screen.findByRole("combobox", {}, { timeout: 10000 });
          await user.click(selectInput);

          const tagBadgeToRemove = await screen.findByLabelText(
            clicks[1] as string,
            {},
            { timeout: 10000 },
          );
          await user.click(tagBadgeToRemove);

          const applyButton = await screen.findByTestId(
            "apply-remove-tags-button",
            {},
            { timeout: 10000 },
          );
          await user.click(applyButton);
        } else {
          // Perform action based on the `clicks` parameter
          const actionButton = await screen.findByRole(
            "button",
            { name: clicks[0] },
            { timeout: 10000 },
          );
          expect(actionButton).toBeInTheDocument();
          await user.click(actionButton);

          if (clicks[1]) {
            // For other actions, click the sub-action button if specified
            const subButton = await screen.findByText(clicks[1], {}, { timeout: 10000 });
            expect(subButton).toBeInTheDocument();
            await user.click(subButton);
          }
        }
      }

      if (triggerError) {
        // error message appears
        await waitFor(
          () =>
            expect(mockedTriggerError).toHaveBeenCalledWith(
              expect.objectContaining({
                message: expect.stringMatching(triggerError),
              }),
            ),
          { timeout: 15000 },
        );
      }

      // Check for the expected toast message
      if (toast) {
        await waitFor(
          () =>
            expect(mockedCreateToast).toHaveBeenCalledWith(
              expect.objectContaining({
                message: expect.stringMatching(toast),
              }),
            ),
          { timeout: 15000 },
        );
      }
    },
    40000,
  );
});
