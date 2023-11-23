import { basicShipment, generateMockShipment } from "mocks/shipments";
import { location1 } from "mocks/locations";
import { generateMockBox } from "mocks/boxes";
import { BoxState } from "types/generated/graphql";
import { shipmentDetail1 } from "mocks/shipmentDetail";
import { useAuth0 } from "@auth0/auth0-react";
import { useNotification } from "hooks/useNotification";
import { mockAuthenticatedUser } from "mocks/hooks";
import { cache } from "queries/cache";
import { render, screen, waitFor } from "tests/test-utils";
import userEvent from "@testing-library/user-event";
import { ASSIGN_BOXES_TO_SHIPMENT } from "hooks/useAssignBoxesToShipment";
import { GraphQLError } from "graphql";
import { gql } from "@apollo/client";
import BoxesView, { BOXES_LOCATIONS_TAGS_SHIPMENTS_FOR_BASE_QUERY } from "./BoxesView";

const initialQuery = ({ state = BoxState.InStock, shipmentDetail = null as any }) => ({
  request: {
    query: BOXES_LOCATIONS_TAGS_SHIPMENTS_FOR_BASE_QUERY,
    variables: {
      baseId: "1",
    },
  },
  result: {
    data: {
      boxes: {
        __typename: "BoxPage",
        elements: [
          generateMockBox({
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
        errors: graphQlError ? [new GraphQLError("Error!")] : undefined,
      },
  error: networkError ? new Error() : undefined,
});

// extracting a cacheObject to reset the cache correctly later
const emptyCache = cache.extract();

// Toasts are persisting throughout the tests since they are rendered in the wrapper and not in the render.
// Therefore, we need to mock them since otherwise we easily get false negatives
// Everywhere where we have more than one occation of a toast we should do this.
const mockedCreateToast = jest.fn();
jest.mock("hooks/useNotification");
jest.mock("@auth0/auth0-react");

// .mocked() is a nice helper function from jest for typescript support
// https://jestjs.io/docs/mock-function-api/#typescript-usage
const mockedUseAuth0 = jest.mocked(useAuth0);

beforeEach(() => {
  mockAuthenticatedUser(mockedUseAuth0, "dev_volunteer@boxaid.org");
  const mockedUseNotification = jest.mocked(useNotification);
  mockedUseNotification.mockReturnValue({ createToast: mockedCreateToast });
});

afterEach(() => {
  cache.restore(emptyCache);
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
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;

const boxesViewActionsTests = [
  {
    name: "4.8.5.2 - MoveBoxes Action is successful",
    mocks: [
      initialQuery({}),
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
          },
        },
      }),
    ],
    clicks: [/move to/i, /warehouse/i],
    toast: /A Box was successfully moved/i,
    alert: undefined,
  },
  {
    name: "4.8.5.3 - MoveBoxes Action is failing due to GraphQL error",
    mocks: [
      initialQuery({}),
      mutation({
        gQLRequest: moveBoxesGQLRequest,
        variables: { newLocationId: 1, labelIdentifier0: "123" },
        graphQlError: true,
      }),
    ],
    clicks: [/move to/i, /warehouse/i],
    toast: undefined,
    alert: /Could not move a box/i,
  },
  {
    name: "4.8.5.4 - MoveBoxes Action is failing due to Network error",
    mocks: [
      initialQuery({}),
      mutation({
        gQLRequest: moveBoxesGQLRequest,
        variables: { newLocationId: 1, labelIdentifier0: "123" },
        networkError: true,
      }),
    ],
    clicks: [/move to/i, /warehouse/i],
    toast: undefined,
    alert: /Could not move a box/i,
  },
  {
    name: "4.8.5.5 - MoveBoxes Action is not executing since box is in wrong state",
    mocks: [initialQuery({ state: BoxState.MarkedForShipment })],
    clicks: [/move to/i, /warehouse/i],
    toast: undefined,
    alert: /Cannot move a box in shipment states./i,
  },
  {
    name: "4.8.3.2 - Assign To Shipment Action is successful",
    mocks: [
      initialQuery({}),
      mutation({
        gQLRequest: ASSIGN_BOXES_TO_SHIPMENT,
        variables: { id: "1", labelIdentifiers: ["123"] },
        resultData: {
          updateShipmentWhenPreparing: generateMockShipment({}),
        },
      }),
      initialQuery({}),
    ],
    clicks: [/assign to shipment/i, /thessaloniki/i],
    toast: /A Box was successfully assigned/i,
    alert: undefined,
  },
  {
    name: "4.8.3.3 - Assign To Shipment Action is failing due to GraphQL error",
    mocks: [
      initialQuery({}),
      mutation({
        gQLRequest: ASSIGN_BOXES_TO_SHIPMENT,
        variables: { id: "1", labelIdentifiers: ["123"] },
        graphQlError: true,
      }),
    ],
    clicks: [/assign to shipment/i, /thessaloniki/i],
    toast: undefined,
    alert: /Could not assign a box/i,
  },
  {
    name: "4.8.3.4 - Assign To Shipment Action is failing due to Network error",
    mocks: [
      initialQuery({}),
      mutation({
        gQLRequest: ASSIGN_BOXES_TO_SHIPMENT,
        variables: { id: "1", labelIdentifiers: ["123"] },
        networkError: true,
      }),
    ],
    clicks: [/assign to shipment/i, /thessaloniki/i],
    toast: undefined,
    alert: /Could not assign a box/i,
  },
  {
    name: "4.8.3.5 - Assign To Shipment Action is not executing since box is in wrong state",
    mocks: [initialQuery({ state: BoxState.Donated })],
    clicks: [/assign to shipment/i, /thessaloniki/i],
    toast: undefined,
    alert: /Cannot assign a box/i,
  },
  {
    name: "4.8.4.2 - Unassign From Shipment Action is successful",
    mocks: [
      initialQuery({ state: BoxState.MarkedForShipment, shipmentDetail: shipmentDetail1() }),
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
    alert: undefined,
  },
  {
    name: "4.8.4.3 - Unassign From Shipment Action is failing due to GraphQL error",
    mocks: [
      initialQuery({ state: BoxState.MarkedForShipment, shipmentDetail: shipmentDetail1() }),
      mutation({
        gQLRequest: unassignFromShipmentGQLRequest,
        variables: { shipment0: "1", labelIdentifiers0: ["123"] },
        graphQlError: true,
      }),
    ],
    clicks: [/remove from shipment/i],
    toast: undefined,
    alert: /Could not remove a box/i,
  },
  {
    name: "4.8.4.4 - Unassign From Shipment Action is failing due to Network error",
    mocks: [
      initialQuery({ state: BoxState.MarkedForShipment, shipmentDetail: shipmentDetail1() }),
      mutation({
        gQLRequest: unassignFromShipmentGQLRequest,
        variables: { shipment0: "1", labelIdentifiers0: ["123"] },
        networkError: true,
      }),
    ],
    clicks: [/remove from shipment/i],
    toast: undefined,
    alert: /Could not remove a box/i,
  },
];

boxesViewActionsTests.forEach(({ name, mocks, clicks, toast, alert }) => {
  it(name, async () => {
    const user = userEvent.setup();
    render(<BoxesView />, {
      routePath: "/bases/:baseId/boxes",
      initialUrl: "/bases/1/boxes",
      mocks,
      cache,
    });

    // Select the first box
    const checkboxes = await screen.findAllByRole("checkbox", { name: /toggle row selected/i });
    expect(checkboxes.length).toBe(1);
    user.click(checkboxes[0]);
    await waitFor(() => expect(checkboxes[0]).toBeChecked());

    // Click the action buttons
    const actionButton = await screen.findByRole("button", { name: clicks[0] });
    expect(actionButton).toBeInTheDocument();
    user.click(actionButton);

    if (clicks[1]) {
      const subButton = await screen.findByText(clicks[1]);
      expect(subButton).toBeInTheDocument();
      user.click(subButton);
    }

    if (toast) {
      // check toast
      await waitFor(() =>
        expect(mockedCreateToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringMatching(toast),
          }),
        ),
      );
    }

    if (alert) {
      // check alert
      const alertElement = await screen.findByText(alert);
      expect(alertElement).toBeInTheDocument();
      const closeButtons = await screen.findAllByRole("button", { name: /close/i });
      expect(closeButtons.length).toBe(1);
      user.click(closeButtons[0]);
      await waitFor(() => expect(alertElement).not.toBeInTheDocument());
    }
  });
});
