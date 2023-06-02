import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { screen, render } from "tests/test-utils";
import { useAuth0 } from "@auth0/auth0-react";
import { BoxReconciliationOverlay } from "components/BoxReconciliationOverlay/BoxReconciliationOverlay";
import { mockMatchMediaQuery } from "mocks/functions";
import { mockAuthenticatedUser } from "mocks/hooks";
import { mockImplementationOfBoxReconciliation } from "mocks/components";
import { SHIPMENT_BY_ID_WITH_PRODUCTS_AND_LOCATIONS_QUERY } from "queries/queries";
import { generateMockShipment } from "mocks/shipments";
import { ShipmentState } from "types/generated/graphql";
import { organisation1 } from "mocks/organisations";
import { GraphQLError } from "graphql";

jest.mock("@auth0/auth0-react");
jest.mock("components/BoxReconciliationOverlay/BoxReconciliationOverlay");

// .mocked() is a nice helper function from jest for typescript support
// https://jestjs.io/docs/mock-function-api/#typescript-usage
const mockedUseAuth0 = jest.mocked(useAuth0);
const mockedBoxReconciliationOverlay = jest.mocked(BoxReconciliationOverlay);

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
      labelIdentifier: "1234",
      shipmentId: "1",
    },
  },
  result: {
    errors: [new GraphQLError("Error!")],
  },
};

// Test case 4.7.1
// eslint-disable-next-line max-len
it("4.7.1 - Query for shipment, box, available products, sizes and locations is loading ", async () => {
  const user = userEvent.setup();
  mockImplementationOfBoxReconciliation(mockedBoxReconciliationOverlay, "123456", "1");
  render(<BoxReconciliationOverlay />, {
    routePath: "/bases/:baseId",
    initialUrl: "/bases/1",
    mocks: [queryShipmentDetailForBoxReconciliation],
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

  const boxReconciliationButton = await screen.findByTestId("ReturnBoxReconciliationOverlay");
  await user.click(boxReconciliationButton);
});

// Test case 4.7.2
// eslint-disable-next-line max-len
it("4.7.2 - Query for shipment, box, available products, sizes and locations returns an error ", async () => {
  const user = userEvent.setup();
  mockImplementationOfBoxReconciliation(mockedBoxReconciliationOverlay, "1234", "1");
  render(<BoxReconciliationOverlay />, {
    routePath: "/bases/:baseId",
    initialUrl: "/bases/1",
    mocks: [failedQueryShipmentDetailForBoxReconciliation],
    additionalRoute: "/bases/1/boxes/1234",
    globalPreferences: {
      dispatch: jest.fn(),
      globalPreferences: {
        selectedOrganisationId: organisation1.id,
        availableBases: organisation1.bases,
        selectedBaseId: organisation1.bases[0].id,
      },
    },
  });

  const boxReconciliationButton = await screen.findByTestId("ReturnBoxReconciliationOverlay");
  await user.click(boxReconciliationButton);

  // error message appears
  // expect(
  //   (await screen.findAllByText(/Could not fetch data! Please try reloading the page/i)).length,
  // ).toBeGreaterThanOrEqual(1);
});
