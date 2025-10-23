import { beforeEach, it, expect, vi } from "vitest";
import { screen, render, waitFor } from "tests/test-utils";
import { useAuth0 } from "@auth0/auth0-react";
import { cache } from "queries/cache";
import {
  BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
  SHIPMENT_BY_ID_WITH_PRODUCTS_AND_LOCATIONS_QUERY,
} from "queries/queries";
import { generateMockLocationWithBase } from "mocks/locations";
import { products } from "mocks/products";
import { tag1, tag2 } from "mocks/tags";
import { generateMockShipment, generateMockShipmentMinimal } from "mocks/shipments";
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
        id: "1",
        qrCode: null,
        comment: null,
        distributionEvent: null,
        history: [],
        labelIdentifier: "123",
        location: null,
        numberOfItems: 10,
        product: null,
        createdOn: "2023-01-08T17:24:29+00:00",
        lastModifiedOn: "2024-01-08T17:24:29+00:00",
        deletedOn: null,
        shipmentDetail: {
          __typename: "ShipmentDetail",
          id: "1",
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
            type: "Custom",
            deletedOn: null,
            category: {
              id: "4",
              name: "Jackets / Outerwear",
              __typename: "ProductCategory",
            },
          },
          sourceQuantity: 10,
          sourceSize: {
            __typename: "Size",
            id: "52",
            label: "Mixed",
          },
          autoMatchingTargetProduct: null,
          shipment: {
            __typename: "Shipment",
            id: "1",
            labelIdentifier: "S001-231111-LExTH",
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
      shipments: [generateMockShipmentMinimal({ state: "Receiving" })],
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
        id: "1",
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
    cache,
  });

  expect(await screen.findByRole("heading", { name: /box 123/i })).toBeInTheDocument();
  expect(screen.getByText(/receiving/i)).toBeInTheDocument();

  await waitFor(
    () => {
      expect(screen.getByText(/match products/i)).toBeInTheDocument();
      expect(screen.getByText(/receive location/i)).toBeInTheDocument();
    },
    { timeout: 5000 },
  );
}, 20000);
