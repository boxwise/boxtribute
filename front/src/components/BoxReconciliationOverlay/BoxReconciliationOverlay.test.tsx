import "@testing-library/jest-dom";
import { screen, render, waitFor } from "tests/test-utils";
import { useAuth0 } from "@auth0/auth0-react";
import { BoxReconciliationOverlay } from "components/BoxReconciliationOverlay/BoxReconciliationOverlay";
import { mockAuthenticatedUser } from "mocks/hooks";
import { generateMockShipment } from "mocks/shipments";
import { ShipmentState } from "types/generated/graphql";
import { organisation1 } from "mocks/organisations";
import { GraphQLError } from "graphql";
import { cache, boxReconciliationOverlayVar, IBoxReconciliationOverlayVar } from "queries/cache";
import { generateMockLocationWithBase } from "mocks/locations";
import { products } from "mocks/products";
import { tag1, tag2 } from "mocks/tags";
import userEvent from "@testing-library/user-event";
import { SHIPMENT_BY_ID_WITH_PRODUCTS_AND_LOCATIONS_QUERY } from "queries/queries";
import { UPDATE_SHIPMENT_WHEN_RECEIVING } from "queries/mutations";
import { useErrorHandling } from "hooks/useErrorHandling";
import { useNotification } from "hooks/useNotification";

// extracting a cacheObject to reset the cache correctly later
const emptyCache = cache.extract();

// Toasts are persisting throughout the tests since they are rendered in the wrapper and not in the render.
// Therefore, we need to mock them since otherwise we easily get false negatives
// Everywhere where we have more than one occation of a toast we should do this.
const mockedTriggerError = jest.fn();
const mockedCreateToast = jest.fn();
jest.mock("hooks/useErrorHandling");
jest.mock("hooks/useNotification");
jest.mock("@auth0/auth0-react");
window.scrollTo = jest.fn();

// .mocked() is a nice helper function from jest for typescript support
// https://jestjs.io/docs/mock-function-api/#typescript-usage
const mockedUseAuth0 = jest.mocked(useAuth0);

beforeEach(() => {
  mockAuthenticatedUser(mockedUseAuth0, "dev_volunteer@boxaid.org");
  const mockedUseErrorHandling = jest.mocked(useErrorHandling);
  mockedUseErrorHandling.mockReturnValue({ triggerError: mockedTriggerError });
  const mockedUseNotification = jest.mocked(useNotification);
  mockedUseNotification.mockReturnValue({ createToast: mockedCreateToast });
});

afterEach(() => {
  cache.restore(emptyCache);
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
        organisation: { id: organisation1.id, name: organisation1.name },
        availableBases: organisation1.bases,
        selectedBase: organisation1.bases[0],
      },
    },
  });

  // toast shown
  await waitFor(() =>
    expect(mockedTriggerError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/Could not fetch data! Please try reloading the page/i),
      }),
    ),
  );
});

const mockUpdateShipmentWhenReceivingMutation = ({
  networkError = false,
  graphQlError = false,
  shipmentId = "1",
  lostBoxLabelIdentifiers = ["123"],
}) => ({
  request: {
    query: UPDATE_SHIPMENT_WHEN_RECEIVING,
    variables: {
      id: shipmentId,
      lostBoxLabelIdentifiers,
    },
  },
  result: networkError
    ? undefined
    : {
        data: graphQlError
          ? null
          : {
              updateShipmentWhenReceiving: generateMockShipment({ state: ShipmentState.Receiving }),
            },
        errors: graphQlError ? [new GraphQLError("Error!")] : undefined,
      },
  error: networkError ? new Error() : undefined,
});

const noDeliveryTests = [
  {
    name: "4.7.3.1 - Mark as Lost Mutation fails due to GraphQL error",
    mocks: [
      queryShipmentDetailForBoxReconciliation,
      mockUpdateShipmentWhenReceivingMutation({ graphQlError: true }),
    ],
    toast: { isError: true, message: /Could not change state of the box./i },
  },
  {
    name: "4.7.3.2 - Mark as Lost Mutation fails due to Network error",
    mocks: [
      queryShipmentDetailForBoxReconciliation,
      mockUpdateShipmentWhenReceivingMutation({ networkError: true }),
    ],
    toast: { isError: true, message: /Could not change state of the box./i },
  },
  {
    name: "4.7.3.3 - Mark as Lost Mutation is succesfull",
    mocks: [queryShipmentDetailForBoxReconciliation, mockUpdateShipmentWhenReceivingMutation({})],
    toast: { isError: false, message: /Box marked as undelivered/i },
  },
];

describe("No Delivery Tests", () => {
  noDeliveryTests.forEach(({ name, mocks, toast }) => {
    it(
      name,
      async () => {
        const user = userEvent.setup();
        boxReconciliationOverlayVar({
          isOpen: true,
          labelIdentifier: "123",
          shipmentId: "1",
        } as IBoxReconciliationOverlayVar);
        render(<BoxReconciliationOverlay />, {
          routePath: "/bases/:baseId",
          initialUrl: "/bases/1",
          mocks,
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

        // BoxReconciliation is visible
        expect(await screen.findByText(/box 123/i)).toBeInTheDocument();

        // Click trashIcon Button
        const noDeliveryIconButton = screen.getByTestId("NoDeliveryIcon");
        expect(noDeliveryIconButton).toBeInTheDocument();
        user.click(noDeliveryIconButton);

        // AYS is open
        expect(await screen.findByText(/box not delivered\?/i)).toBeInTheDocument();
        const noButton = screen.getByRole("button", { name: /nevermind/i });
        expect(noButton).toBeInTheDocument();
        user.click(noButton);

        // BoxReconciliation is visible
        expect(await screen.findByText(/box 123/i)).toBeInTheDocument();

        // 4.7.3 - Click NoDelivery Button
        const matchProductButton = await screen.findByRole("button", {
          name: /1\. match products/i,
        });
        expect(matchProductButton).toBeInTheDocument();
        user.click(matchProductButton);
        const noDeliveryButton = screen.getByTestId("NoDeliveryButton");
        expect(noDeliveryButton).toBeInTheDocument();
        user.click(noDeliveryButton);

        // AYS is open
        expect(await screen.findByText(/box not delivered\?/i)).toBeInTheDocument();
        const yesButton = screen.getByTestId("AYSRightButton");
        expect(yesButton).toBeInTheDocument();
        user.click(yesButton);

        // toast shown
        await waitFor(
          () =>
            expect(toast.isError ? mockedTriggerError : mockedCreateToast).toHaveBeenCalledWith(
              expect.objectContaining({
                message: expect.stringMatching(toast.message),
              }),
            ),
          { timeout: 5000 },
        );
      },
      20000,
    );
  });
});

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
        organisation: { id: organisation1.id, name: organisation1.name },
        availableBases: organisation1.bases,
        selectedBase: organisation1.bases[0],
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
  expect((await screen.findAllByText(/sender product & gender/i)).length).toBeGreaterThanOrEqual(1);
  const selectProductControlInput = screen.getByText(/save product as\.\.\./i);
  // check if source product renders correctly
  expect(screen.getByText(/Long Sleeves \(Women\)/i)).toBeInTheDocument();
  user.click(selectProductControlInput);
  [/Winter Jackets \(Men\)/, /Long Sleeves \(Women\)/].forEach(async (option) => {
    expect(await screen.findByRole("option", { name: option })).toBeInTheDocument();
  });

  const receiveLocationButton = screen.getByRole("button", {
    name: /2\. receive location/i,
  });
  user.click(receiveLocationButton);

  expect((await screen.findAllByText(/select location/i)).length).toBeGreaterThanOrEqual(1);

  const selectLocationControlInput = screen.getByText(/select location/i);
  user.click(selectLocationControlInput);
  [/WH Men/].forEach(async (option) => {
    expect(await screen.findByRole("option", { name: option })).toBeInTheDocument();
  });
}, 20000);
