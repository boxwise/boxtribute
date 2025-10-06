import { beforeEach, it, expect, vi } from "vitest";
import { screen, render } from "tests/test-utils";
import { useAuth0 } from "@auth0/auth0-react";
import { cache } from "queries/cache";
import {
  BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
  SHIPMENT_BY_ID_WITH_PRODUCTS_AND_LOCATIONS_QUERY,
} from "queries/queries";
import { generateMockLocationWithBase } from "mocks/locations";
import { products } from "mocks/products";
import { tag1, tag2 } from "mocks/tags";
import { generateMockShipment } from "mocks/shipments";
import { mockMatchMediaQuery } from "mocks/functions";
import { mockAuthenticatedUser } from "mocks/hooks";
import BTBox from "./BoxView";

vi.mock("@auth0/auth0-react");
const mockedUseAuth0 = vi.mocked(useAuth0);

beforeEach(() => {
  mockAuthenticatedUser(mockedUseAuth0, "dev_coordinator@boxaid.org", [
    "be_user",
    "view_shipments",
  ]);
});

const initialQueryForBoxInReceivingState = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
    variables: {
      labelIdentifier: "123",
    },
    notifyOnNetworkStatusChange: true,
  },
  result: {
    data: {
      box: {
        __typename: "Box",
        comment: null,
        distributionEvent: null,
        history: [],
        labelIdentifier: "123",
        location: null,
        numberOfItems: 10,
        product: null,
        shipmentDetail: {
          __typename: "ShipmentDetail",
          shipment: {
            __typename: "Shipment",
            details: [
              {
                __typename: "ShipmentDetail",
                box: {
                  __typename: "Box",
                  labelIdentifier: "123",
                  location: null,
                },
                sourceLocation: {
                  __typename: "ClassicLocation",
                  defaultBoxState: "InStock",
                  id: "18",
                  name: "WH2",
                  seq: 18,
                },
                sourceProduct: {
                  __typename: "Product",
                  gender: "UnisexBaby",
                  id: "399",
                  name: "baby gloves",
                },
                sourceQuantity: 10,
                sourceSize: {
                  __typename: "Size",
                  id: "52",
                  label: "Mixed",
                },
              },
            ],
            id: "1",
            state: "Receiving",
            targetBase: {
              __typename: "Base",
              id: "1",
              name: "Lesvos",
              organisation: {
                __typename: "Organisation",
                id: "1",
                name: "BoxAid",
              },
            },
          },
        },
        size: {
          __typename: "Size",
          id: "52",
          label: "Mixed",
        },
        state: "Receiving",
        tags: [],
      },
      shipments: [generateMockShipment({ state: "Receiving" })],
    },
  },
};

const queryShipmentDetailForBoxReconciliation = {
  request: {
    query: SHIPMENT_BY_ID_WITH_PRODUCTS_AND_LOCATIONS_QUERY,
    variables: {
      shipmentId: "1",
      baseId: "1",
    },
  },
  result: {
    data: {
      base: {
        locations: [generateMockLocationWithBase({})],
        products,
        tags: [tag1, tag2],
      },
      shipment: generateMockShipment({ state: "Receiving" }),
    },
  },
};

beforeEach(() => {
  // setting the screensize to
  mockMatchMediaQuery(true);
});

// Test case 4.7.4.1
it("4.7.4.1 - Reconciliation dialog automatically appears when box state equals Receiving", async () => {
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/1/boxes/123",
    additionalRoute: "/bases/1/shipment/1",
    mocks: [initialQueryForBoxInReceivingState, queryShipmentDetailForBoxReconciliation],
    addTypename: true,
    cache,
  });

  expect(await screen.findByRole("heading", { name: /box 123/i })).toBeInTheDocument();

  expect(screen.getByText(/match products/i)).toBeInTheDocument();
  expect(screen.getByText(/receive location/i)).toBeInTheDocument();
}, 20000);
