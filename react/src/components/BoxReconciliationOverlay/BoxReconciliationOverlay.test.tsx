import "@testing-library/jest-dom";
import { screen, render } from "tests/test-utils";
import { useAuth0 } from "@auth0/auth0-react";
import { BoxReconciliationOverlay } from "components/BoxReconciliationOverlay/BoxReconciliationOverlay";
import { mockMatchMediaQuery } from "mocks/functions";
import { mockAuthenticatedUser } from "mocks/hooks";
import { SHIPMENT_BY_ID_WITH_PRODUCTS_AND_LOCATIONS_QUERY } from "queries/queries";
import { generateMockShipment } from "mocks/shipments";
import { ShipmentState } from "types/generated/graphql";
import { organisation1 } from "mocks/organisations";
import { GraphQLError } from "graphql";
import { cache, boxReconciliationOverlayVar, IBoxReconciliationOverlayVar } from "queries/cache";

jest.mock("@auth0/auth0-react");

// .mocked() is a nice helper function from jest for typescript support
// https://jestjs.io/docs/mock-function-api/#typescript-usage
const mockedUseAuth0 = jest.mocked(useAuth0);

beforeEach(() => {
  // setting the screensize to
  mockMatchMediaQuery(true);
  mockAuthenticatedUser(mockedUseAuth0, "dev_volunteer@boxaid.org");
});

const queryShipmentDetailForBoxReconciliation = {
  request: {
    query: SHIPMENT_BY_ID_WITH_PRODUCTS_AND_LOCATIONS_QUERY,
    variables: {
      labelIdentifier: "123456",
      shipmentId: "1",
    },
  },
  result: {
    data: {
      shipment: generateMockShipment({ state: ShipmentState.Receiving }),
    },
  },
};

const failedQueryShipmentDetailForBoxReconciliation = {
  request: {
    query: SHIPMENT_BY_ID_WITH_PRODUCTS_AND_LOCATIONS_QUERY,
    variables: {
      labelIdentifier: "123456",
      shipmentId: "1",
    },
  },
  result: {
    errors: [new GraphQLError("Error!")],
  },
};

// Test case 4.7.1
// eslint-disable-next-line max-len
it.skip("4.7.1 - Query for shipment, box, available products, sizes and locations is loading ", async () => {
  boxReconciliationOverlayVar({
    isOpen: true,
    labelIdentifier: "123456",
    shipmentId: "1",
  } as IBoxReconciliationOverlayVar);
  render(<BoxReconciliationOverlay />, {
    routePath: "/bases/:baseId",
    initialUrl: "/bases/1",
    mocks: [queryShipmentDetailForBoxReconciliation],
    additionalRoute: "/bases/1/boxes/123456",
    cache,
    globalPreferences: {
      dispatch: jest.fn(),
      globalPreferences: {
        selectedOrganisationId: organisation1.id,
        availableBases: organisation1.bases,
        selectedBaseId: organisation1.bases[0].id,
      },
    },
  });
});

// Test case 4.7.2
// eslint-disable-next-line max-len
it("4.7.2 - Query for shipment, box, available products, sizes and locations returns an error ", async () => {
  boxReconciliationOverlayVar({
    isOpen: true,
    labelIdentifier: "123456",
    shipmentId: "1",
  } as IBoxReconciliationOverlayVar);
  render(<BoxReconciliationOverlay />, {
    routePath: "/bases/:baseId",
    initialUrl: "/bases/1",
    mocks: [failedQueryShipmentDetailForBoxReconciliation],
    additionalRoute: "/bases/1/boxes/123456",
    globalPreferences: {
      dispatch: jest.fn(),
      globalPreferences: {
        selectedOrganisationId: organisation1.id,
        availableBases: organisation1.bases,
        selectedBaseId: organisation1.bases[0].id,
      },
    },
  });

  // error message appears
  expect(
    (await screen.findAllByText(/Could not fetch data! Please try reloading the page/i)).length,
  ).toBeGreaterThanOrEqual(1);
});
