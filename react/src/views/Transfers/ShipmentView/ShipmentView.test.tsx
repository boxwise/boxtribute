import "@testing-library/jest-dom";
import { screen, render } from "tests/test-utils";
import { organisation1 } from "mocks/organisations";
// import { GraphQLError } from "graphql";
import { shipment1, shipment2 } from "mocks/shipments";
import ShipmentView, { SHIPMENT_BY_ID } from "./ShipmentView";

const initialQuery = {
  request: {
    query: SHIPMENT_BY_ID,
    variables: {
      id: "1",
    },
  },
  result: {
    data: {
      shipment: shipment1,
    },
  },
};

const initialQueryWithoutBox = {
  request: {
    query: SHIPMENT_BY_ID,
    variables: {
      id: "1",
    },
  },
  result: {
    data: {
      shipment: shipment2,
    },
  },
};

// const initialQueryNetworkError = {
//   request: {
//     query: SHIPMENT_BY_ID,
//     variables: {
//       id: "1",
//     },
//   },
//   result: {
//     errors: [new GraphQLError("Error!")],
//   },
// };

// Test case 4.5.1
it("4.5.1 - Initial load of Page", async () => {
  //   const user = userEvent.setup();
  render(<ShipmentView />, {
    routePath: "/bases/:baseId/transfers/shipments/:id",
    initialUrl: "/bases/1/transfers/shipments/1",
    mocks: [initialQuery],
    addTypename: true,
    globalPreferences: {
      dispatch: jest.fn(),
      globalPreferences: {
        selectedOrganisationId: organisation1.id,
        availableBases: organisation1.bases,
      },
    },
  });

  expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();

  const title = await screen.findByRole("heading", { name: "View Shipment" });
  expect(title).toBeInTheDocument();
  // Test case 4.5.1.1 - Content: Displays Shipment Source and Target Bases
  expect(screen.getByText(/lesvos/i)).toBeInTheDocument();
  expect(screen.getByText(/thessaloniki/i)).toBeInTheDocument();
  // Test case 4.5.1.2 - Content: Displays Shipment status
  expect(screen.getByText(/status:preparing/i)).toBeInTheDocument();
  // Test case 4.5.1.3 - Content: Displays total number of boxes
  expect(screen.getByText(/2 box/i)).toBeInTheDocument();
  // Test case 4.5.1.5 - Displays Content tab initially
  expect(screen.getByRole("tab", { name: /content/i, selected: true })).toHaveTextContent(
    "Content",
  );
});

// Test case 4.5.1.4
// eslint-disable-next-line max-len
it("4.5.1.4 - Content: When shipment does not contains any products display correct message", async () => {
  //   const user = userEvent.setup();
  render(<ShipmentView />, {
    routePath: "/bases/:baseId/transfers/shipments/:id",
    initialUrl: "/bases/1/transfers/shipments/1",
    mocks: [initialQueryWithoutBox],
    addTypename: true,
    globalPreferences: {
      dispatch: jest.fn(),
      globalPreferences: {
        selectedOrganisationId: organisation1.id,
        availableBases: organisation1.bases,
      },
    },
  });

  expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();

  const title = await screen.findByRole("heading", { name: "View Shipment" });
  expect(title).toBeInTheDocument();
  // Test case 4.5.1.4 - Content: When shipment does not contains any products display correct message
  expect(
    screen.getByText(/no boxes have been assigned to this shipment yet!/i),
  ).toBeInTheDocument();
});
