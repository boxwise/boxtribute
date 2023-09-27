/* eslint-disable */
import "@testing-library/jest-dom";
import { screen, render, waitFor } from "tests/test-utils";
import userEvent from "@testing-library/user-event";
import { cache } from "queries/cache";

import { useErrorHandling } from "hooks/useErrorHandling";
import { useNotification } from "hooks/useNotification";

import {
  BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
  SHIPMENT_BY_ID_WITH_PRODUCTS_AND_LOCATIONS_QUERY,
} from "queries/queries";
import { organisation1 } from "mocks/organisations";
import BTBox from "./BoxView";
import { generateMockLocationWithBase } from "mocks/locations";
import { products } from "mocks/products";
import { tag1, tag2 } from "mocks/tags";
import { generateMockShipment } from "mocks/shipments";
import { ShipmentState } from "types/generated/graphql";

const mockedTriggerError = jest.fn();
const mockedCreateToast = jest.fn();
jest.mock("hooks/useErrorHandling");
jest.mock("hooks/useNotification");

cache.reset();

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
      shipments: [generateMockShipment({ state: ShipmentState.Receiving })],
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
      shipment: generateMockShipment({ state: ShipmentState.Receiving }),
    },
  },
};

beforeEach(() => {
  // we need to mock matchmedia
  // https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
  const mockedUseErrorHandling = jest.mocked(useErrorHandling);
  mockedUseErrorHandling.mockReturnValue({ triggerError: mockedTriggerError });
  const mockedUseNotification = jest.mocked(useNotification);
  mockedUseNotification.mockReturnValue({ createToast: mockedCreateToast });
});

// Test case 4.7.4.1
it("4.7.4.1 - Reconciliation dialog automatically appears when box state equals Receiving", async () => {
  const user = userEvent.setup();

  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/1/boxes/123",
    additionalRoute: "/bases/1/shipment/1",
    mocks: [initialQueryForBoxInReceivingState, queryShipmentDetailForBoxReconciliation],
    addTypename: true,
    cache,
    globalPreferences: {
      dispatch: jest.fn(),
      globalPreferences: {
        organisation: { id: organisation1.id, name: organisation1.name },
        availableBases: organisation1.bases,
        selectedBase: organisation1.bases[0],
      },
    },
  });

  await waitFor(async () => {
    expect(await screen.getByRole("heading", { name: /box 123/i })).toBeInTheDocument();
  });

  await waitFor(async () => {
    expect(await screen.getByRole("banner")).toBeInTheDocument();
  });

  expect(screen.getByText(/match products/i)).toBeInTheDocument();
  expect(screen.getByText(/receive location/i)).toBeInTheDocument();
}, 10000);
