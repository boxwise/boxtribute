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
import { generateMockLocationWithBase } from "mocks/locations";
import { products } from "mocks/products";
import { tag1, tag2 } from "mocks/tags";
import userEvent from "@testing-library/user-event";

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

const failedQueryShipmentDetailForBoxReconciliation = {
  request: {
    query: SHIPMENT_BY_ID_WITH_PRODUCTS_AND_LOCATIONS_QUERY,
    variables: {
      shipmentId: "1",
      baseId: "1",
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
  boxReconciliationOverlayVar({
    isOpen: true,
    labelIdentifier: "123",
    shipmentId: "1",
  } as IBoxReconciliationOverlayVar);
  render(<BoxReconciliationOverlay />, {
    routePath: "/bases/:baseId",
    initialUrl: "/bases/1",
    mocks: [queryShipmentDetailForBoxReconciliation],
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

  expect((await screen.findAllByText(/box 123/i)).length).toBeGreaterThanOrEqual(1);

  expect(screen.getAllByText(/1\. match products/i)).toHaveLength(1);
  expect(screen.getAllByText(/2\. receive location/i)).toHaveLength(1);
  const matchProductButton = screen.getByRole("button", {
    name: /1\. match products/i,
  });
  user.click(matchProductButton);

  expect((await screen.findAllByText(/Long Sleeves/i)).length).toBeGreaterThanOrEqual(1);
  expect((await screen.findAllByText(/product & gender/i)).length).toBeGreaterThanOrEqual(1);
  const selectProductControlInput = screen.getByText(/select product & gender/i);
  await user.click(selectProductControlInput);
  [/Winter Jackets \(Men\)/, /Long Sleeves \(Women\)/].forEach((option) => {
    expect(screen.getByRole("button", { name: option })).toBeInTheDocument();
  });

  const receiveLocationButton = screen.getByRole("button", {
    name: /2\. receive location/i,
  });
  user.click(receiveLocationButton);

  expect((await screen.findAllByText(/select location/i)).length).toBeGreaterThanOrEqual(1);

  const selectLocationControlInput = screen.getByText(/select location/i);
  await user.click(selectLocationControlInput);
  [/WH Men/].forEach((option) => {
    expect(screen.getByRole("button", { name: option })).toBeInTheDocument();
  });
}, 10000);

// Test case 4.7.2
// eslint-disable-next-line max-len
it("4.7.2 - Query for shipment, box, available products, sizes and locations returns an error ", async () => {
  boxReconciliationOverlayVar({
    isOpen: true,
    labelIdentifier: "123",
    shipmentId: "1",
  } as IBoxReconciliationOverlayVar);
  render(<BoxReconciliationOverlay />, {
    routePath: "/bases/:baseId",
    initialUrl: "/bases/1",
    mocks: [failedQueryShipmentDetailForBoxReconciliation],
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

  // error message appears
  expect(
    (await screen.findAllByText(/Could not fetch data! Please try reloading the page/i)).length,
  ).toBeGreaterThanOrEqual(1);
});
