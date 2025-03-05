import { beforeEach, it, describe, expect } from "vitest";
import { screen, render, waitFor } from "tests/test-utils";
import { generateMockShipment, generateMockShipmentWithCustomDetails } from "mocks/shipments";
import { generateMockBox } from "mocks/boxes";
import { userEvent } from "@testing-library/user-event";
import { FakeGraphQLError, mockMatchMediaQuery } from "mocks/functions";
import { generateMockShipmentDetail } from "mocks/shipmentDetail";
import ShipmentView, { SHIPMENT_BY_ID_QUERY } from "./ShipmentView";

const initialQuery = {
  request: {
    query: SHIPMENT_BY_ID_QUERY,
    variables: {
      id: "1",
    },
  },
  result: {
    data: {
      shipment: generateMockShipment({ state: "Preparing" }),
    },
  },
};

const initialWithGroupedItemQuery = {
  request: {
    query: SHIPMENT_BY_ID_QUERY,
    variables: {
      id: "1",
    },
  },
  result: {
    data: {
      shipment: generateMockShipmentWithCustomDetails({
        state: "Preparing",
        details: [
          generateMockShipmentDetail({ id: "1", box: generateMockBox({ labelIdentifier: "123" }) }),
          generateMockShipmentDetail({
            id: "2",
            box: generateMockBox({ labelIdentifier: "124", numberOfItems: 20 }),
            sourceQuantity: 20,
          }),
        ],
      }),
    },
  },
};

const initialWithoutBoxQuery = {
  request: {
    query: SHIPMENT_BY_ID_QUERY,
    variables: {
      id: "1",
    },
  },
  result: {
    data: {
      shipment: generateMockShipment({ state: "Preparing", hasBoxes: false }),
    },
  },
};

const initialCompletedShipemntQuery = {
  request: {
    query: SHIPMENT_BY_ID_QUERY,
    variables: {
      id: "1",
    },
  },
  result: {
    data: {
      shipment: generateMockShipmentWithCustomDetails({
        state: "Completed",
        details: [
          generateMockShipmentDetail({ id: "1", box: generateMockBox({ labelIdentifier: "123" }) }),
          generateMockShipmentDetail({
            id: "2",
            box: generateMockBox({ labelIdentifier: "124", numberOfItems: 20 }),
            sourceQuantity: 20,
          }),
          generateMockShipmentDetail({
            id: "3",
            box: generateMockBox({
              labelIdentifier: "125",
              numberOfItems: 20,
              state: "Lost",
            }),
            sourceQuantity: 20,
          }),
        ],
      }),
    },
  },
};

const initialQueryNetworkError = {
  request: {
    query: SHIPMENT_BY_ID_QUERY,
    variables: {
      id: "1",
    },
  },
  result: {
    errors: [new FakeGraphQLError()],
  },
};

const initialRecevingUIAsSourceOrgQuery = {
  request: {
    query: SHIPMENT_BY_ID_QUERY,
    variables: {
      id: "1",
    },
  },
  result: {
    data: {
      shipment: generateMockShipment({
        state: "Receiving",
        iAmSource: true,
        hasBoxes: true,
      }),
    },
  },
};

const initialRecevingUIAsTargetOrgQuery = {
  request: {
    query: SHIPMENT_BY_ID_QUERY,
    variables: {
      id: "1",
    },
  },
  result: {
    data: {
      shipment: generateMockShipment({
        state: "Receiving",
        iAmSource: false,
        hasBoxes: true,
      }),
    },
  },
};

beforeEach(() => {
  // setting the screensize to
  mockMatchMediaQuery(true);
});

describe("4.5 Test Cases", () => {
  beforeEach(() => {
    // setting the screensize to
    mockMatchMediaQuery(true);
  });

  // Test case 4.5.1
  it("4.5.1 - Initial load of Page", async () => {
    //   const user = userEvent.setup();
    render(<ShipmentView />, {
      routePath: "/bases/:baseId/transfers/shipments/:id",
      initialUrl: "/bases/1/transfers/shipments/1",
      mocks: [initialQuery],
      addTypename: true,
    });

    expect(screen.getByTestId("loader")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /content/i })).toBeInTheDocument();
    });

    const title = screen.getByText(/prepare shipment/i);
    expect(title).toBeInTheDocument();
    // // Test case 4.5.1.1 - Content: Displays Shipment Source and Target Bases
    expect(screen.getByText(/lesvos/i)).toBeInTheDocument();
    expect(screen.getByText(/thessaloniki/i)).toBeInTheDocument();
    // Test case 4.5.1.2 - Content: Displays Shipment status
    expect(screen.getByText(/PREPARING/)).toBeInTheDocument();
    // // Test case 4.5.1.3 - Content: Displays total number of boxes
    expect(screen.getByRole("heading", { name: /\b2\b/i })).toBeInTheDocument();
    // // Test case 4.5.1.5 - Displays Content tab initially
    expect(screen.getByRole("tab", { name: /content/i, selected: true })).toHaveTextContent(
      "Content",
    );
    // Breadcrumbs are there
    expect(screen.getByRole("link", { name: /back to manage shipments/i })).toBeInTheDocument();
  }, 10000);

  // Test case 4.5.1.4

  it("4.5.1.4 - Content: When shipment does not contains any products display correct message", async () => {
    render(<ShipmentView />, {
      routePath: "/bases/:baseId/transfers/shipments/:id",
      initialUrl: "/bases/1/transfers/shipments/1",
      mocks: [initialWithoutBoxQuery],
      addTypename: true,
    });

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /content/i })).toBeInTheDocument();
    });

    const title = await screen.findByText(/prepare shipment/i);
    expect(title).toBeInTheDocument();
    // Test case 4.5.1.4 - Content: When shipment does not contains any products display correct message
    expect(
      screen.getByText(/no boxes have been assigned to this shipment yet!/i),
    ).toBeInTheDocument();
  }, 10000);

  // Test case 4.5.1.6

  it("4.5.1.6 - Show the number of items per box and the sum of the items grouped together", async () => {
    const user = userEvent.setup();
    render(<ShipmentView />, {
      routePath: "/bases/:baseId/transfers/shipments/:id",
      initialUrl: "/bases/1/transfers/shipments/1",
      mocks: [initialWithGroupedItemQuery],
      addTypename: true,
    });

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /content/i })).toBeInTheDocument();
    });

    const title = screen.getByText(/prepare shipment/i);
    expect(title).toBeInTheDocument();

    // Test case 4.5.1.6 - Show the number of items per box and the sum of the items grouped together
    const groupItemNameWithCount = screen.getByTestId("shipment-grouped-item-name");
    expect(groupItemNameWithCount).toHaveTextContent("Long Sleeves Women (30x)");

    const groupedItemAccordionButton = screen.getByTestId("shipment-accordion-button-1");
    expect(groupedItemAccordionButton).toBeInTheDocument();
    // expanding the accordion
    user.click(groupedItemAccordionButton);

    // check if cell with number of items equals to 20 is displayed
    await screen.findByRole(
      "cell",
      {
        name: /20/i,
      },
      { timeout: 10000 },
    );
    // check if cell with number of items equals to 10 is displayed
    screen.getByRole("cell", {
      name: /10/i,
    });

    expect(screen.getByText(/30x/i)).toBeInTheDocument();
  }, 10000);

  // Test case 4.5.2
  it("4.5.2 - Failed to Fetch Initial Data", async () => {
    render(<ShipmentView />, {
      routePath: "/bases/:baseId/transfers/shipments/:id",
      initialUrl: "/bases/1/transfers/shipments/1",
      mocks: [initialQueryNetworkError],
      addTypename: true,
    });

    expect(
      await screen.findByText(/could not fetch Shipment data! Please try reloading the page./i),
    ).toBeInTheDocument();
  });

  // Test case 4.5.3
  it("4.5.3 - Initial load of Receiving UI As Target Organisation", async () => {
    //   const user = userEvent.setup();
    render(<ShipmentView />, {
      routePath: "/bases/:baseId/transfers/shipments/:id",
      initialUrl: "/bases/1/transfers/shipments/1",
      mocks: [initialRecevingUIAsTargetOrgQuery],
      addTypename: true,
    });

    expect(screen.getByTestId("loader")).toBeInTheDocument();

    await waitFor(() => {
      const title = screen.getByRole("heading", { name: /receiving shipment/i });
      expect(title);
    });

    expect(
      screen.getByRole("cell", { name: /124 long sleeves \(12x\) size: mixed/i }),
    ).toBeInTheDocument();
  }, 10000);

  // Test case 4.5.4
  it("4.5.4 - Initial load of Receiving UI As Source Organisation", async () => {
    //   const user = userEvent.setup();
    render(<ShipmentView />, {
      routePath: "/bases/:baseId/transfers/shipments/:id",
      initialUrl: "/bases/1/transfers/shipments/1",
      mocks: [initialRecevingUIAsSourceOrgQuery],
      addTypename: true,
    });

    expect(screen.getByTestId("loader")).toBeInTheDocument();

    await waitFor(() => {
      const title = screen.getByRole("heading", { name: /view shipment/i });
      expect(title);
    });
  }, 10000);
});

// Test case 4.5.5
it("4.5.5 - Shows total count of the boxes when shipment completed", async () => {
  //   const user = userEvent.setup();
  render(<ShipmentView />, {
    routePath: "/bases/:baseId/transfers/shipments/:id",
    initialUrl: "/bases/1/transfers/shipments/1",
    mocks: [initialCompletedShipemntQuery],
    addTypename: true,
  });

  expect(screen.getByTestId("loader")).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByRole("tab", { name: /content/i })).toBeInTheDocument();
  });

  const title = screen.getByText(/view shipment/i);
  expect(title).toBeInTheDocument();

  expect(screen.getByText(/COMPLETE/)).toBeInTheDocument();

  expect(screen.getByRole("heading", { name: /\b3\b/i })).toBeInTheDocument();

  expect(screen.getByRole("tab", { name: /content/i, selected: true })).toHaveTextContent(
    "Content",
  );
}, 10000);
