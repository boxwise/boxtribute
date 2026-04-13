import { it, expect, vi, beforeEach } from "vitest";
import { screen, render, waitFor, within } from "tests/test-utils";
import { mockGraphQLError, mockNetworkError } from "mocks/functions";
import { generateMockShipment } from "mocks/shipments";
import { ALL_SHIPMENTS_QUERY, SHIPMENT_DATA_FOR_EXPORT_QUERY } from "queries/queries";
import ShipmentsOverviewView from "./ShipmentsOverviewView";
import userEvent from "@testing-library/user-event";
import { useAuth0 } from "@auth0/auth0-react";
import { mockAuthenticatedUser } from "mocks/hooks";
import { mockedCreateToast } from "tests/setupTests";

vi.mock("@auth0/auth0-react");
// .mocked() is a nice helper function from jest for typescript support
// https://jestjs.io/docs/mock-function-api/#typescript-usage
const mockedUseAuth0 = vi.mocked(useAuth0);

beforeEach(() => {
  mockAuthenticatedUser(mockedUseAuth0, "dev_volunteer@boxaid.org");
});

const mockSuccessfulShipmentsQuery = ({
  query = ALL_SHIPMENTS_QUERY,
  state = "Preparing",
  iAmSource = true,
}) => ({
  request: {
    query,
    variables: { baseId: "1" },
  },
  result: {
    data: {
      shipments: [generateMockShipment({ state, iAmSource })],
    },
  },
});

const failedQueryTests = [
  {
    name: "4.4.1.2a - Accept Transfer Agreement fails due to GraphQLError",
    mocks: [mockGraphQLError(ALL_SHIPMENTS_QUERY, { baseId: "1" })],
  },
  {
    name: "4.4.1.2b - Accept Transfer Agreement fails due to NetworkError",
    mocks: [mockNetworkError(ALL_SHIPMENTS_QUERY, { baseId: "1" })],
  },
];

failedQueryTests.forEach(({ name, mocks }) => {
  it(
    name,
    async () => {
      render(<ShipmentsOverviewView />, {
        routePath: "/bases/:baseId/transfers/shipments",
        initialUrl: "/bases/1/transfers/shipments",
        mocks,
      });

      // Check if Error is shown
      expect(await screen.findByTestId("ErrorAlert")).toBeInTheDocument();
      expect(screen.getByText(/Could not fetch shipment data/i)).toBeInTheDocument();
      // Check if Table is not shown
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    },
    10000,
  );
});

it("4.4.1.4 - Initial Load of Page", async () => {
  render(<ShipmentsOverviewView />, {
    routePath: "/bases/:baseId/transfers/shipments",
    initialUrl: "/bases/1/transfers/shipments",
    mocks: [mockSuccessfulShipmentsQuery({})],
  });

  // 4.4.1.1 - Is the Loading State Shown First?
  //   expect(await screen.findByTestId("TableSkeleton")).toBeInTheDocument();

  const user = userEvent.setup();
  await user.click(screen.getByText(/Sending \(/i));
  // Data of Mock Transfer is shown correctly
  expect(await screen.findByRole("cell", { name: /thessaloniki boxcare/i })).toBeInTheDocument();
  // Display the filtered count for "Sending" shipments.
  expect(screen.getByText(/Sending \(1\)/i)).toBeInTheDocument();
  expect(screen.getByRole("cell", { name: /preparing/i })).toBeInTheDocument();
  expect(screen.getByRole("cell", { name: /2 boxes/i })).toBeInTheDocument();
  expect(screen.getByRole("cell", { name: /Wed, 01 Feb 2023, 17:24/i })).toBeInTheDocument();
  // Breadcrumbs are there
  expect(
    screen.getByRole("link", {
      name: /aid transfers/i,
    }),
  ).toBeInTheDocument();
});

it("4.4.1.5 - Export CSV Button Functionality", async () => {
  const mockShipment = generateMockShipment({});

  // Create a mock for the export query with a flag to track if it was called
  let exportQueryCalled = false;
  const exportQueryMock = {
    request: {
      query: SHIPMENT_DATA_FOR_EXPORT_QUERY,
    },
    result: () => {
      exportQueryCalled = true;
      return {
        data: {
          shipments: [mockShipment],
        },
      };
    },
  };

  const mocks = [mockSuccessfulShipmentsQuery({}), exportQueryMock];

  // Mock the HTMLAnchorElement.click method to verify CSV download is triggered
  const mockClick = vi.fn();
  const originalCreateElement = document.createElement.bind(document);
  vi.spyOn(document, "createElement").mockImplementation((tagName) => {
    const element = originalCreateElement(tagName);
    if (tagName === "a") {
      element.click = mockClick;
    }
    return element;
  });

  render(<ShipmentsOverviewView />, {
    routePath: "/bases/:baseId/transfers/shipments",
    initialUrl: "/bases/1/transfers/shipments",
    mocks,
  });

  const user = userEvent.setup();

  // Wait for the table to render — we stay on the default Receiving tab.
  // The only shipment is Sending (iAmSource: true), so no rows are shown in the table,
  // but the export button should still be enabled because direction is not part of
  // the export filtering (it's handled by the popover checkboxes).
  await screen.findByRole("table");

  // Check if Export CSV button exists and is enabled after data loads
  const exportButton = screen.getByTestId("export-csv-button");
  expect(exportButton).toBeInTheDocument();
  expect(exportButton).toHaveTextContent("Export .csv");
  expect(exportButton).not.toBeDisabled();

  // Click the export button to open popover
  await user.click(exportButton);

  // Check if popover content is visible
  expect(screen.getByText(/include the following shipments/i)).toBeInTheDocument();

  // Check if checkboxes are present and checked by default
  const popoverContent = await screen.findByTestId("export-popover-content");
  const receivingCheckbox = await within(popoverContent).findByRole("checkbox", {
    name: /receiving/i,
  });
  const sendingCheckbox = await within(popoverContent).findByRole("checkbox", { name: /sending/i });
  expect(receivingCheckbox).toBeInTheDocument();
  expect(sendingCheckbox).toBeInTheDocument();
  expect(receivingCheckbox).toBeChecked();
  expect(sendingCheckbox).toBeChecked();

  // Check if export button in popover is enabled
  const popoverExportButton = screen.getByTestId("export-button");
  expect(popoverExportButton).toBeInTheDocument();
  expect(popoverExportButton).not.toBeDisabled();

  // Uncheck both checkboxes to test disabled state
  await user.click(receivingCheckbox);
  await user.click(sendingCheckbox);

  // Export button should be disabled
  await waitFor(() => {
    expect(popoverExportButton).toBeDisabled();
  });

  // Re-check sending checkbox
  await user.click(sendingCheckbox);

  // Export button should be enabled again
  await waitFor(() => {
    expect(popoverExportButton).not.toBeDisabled();
  });

  // Click the export button to trigger the export
  await user.click(popoverExportButton);

  // Wait for the backend request to be made
  await waitFor(
    () => {
      expect(exportQueryCalled).toBe(true);
    },
    { timeout: 3000 },
  );

  // Wait for CSV download to be triggered
  await waitFor(
    () => {
      expect(mockClick).toHaveBeenCalled();
    },
    { timeout: 3000 },
  );
});

it("4.4.1.6 - Export Button Disabled When No Data", async () => {
  const mocks = [
    {
      request: {
        query: ALL_SHIPMENTS_QUERY,
      },
      result: {
        data: {
          shipments: [],
        },
      },
    },
  ];

  render(<ShipmentsOverviewView />, {
    routePath: "/bases/:baseId/transfers/shipments",
    initialUrl: "/bases/1/transfers/shipments",
    mocks,
  });

  // Wait for the page to load
  await waitFor(() => {
    expect(screen.queryByTestId("TableSkeleton")).not.toBeInTheDocument();
  });

  // Check if Export CSV button is disabled when there's no data
  const exportButton = screen.getByTestId("export-csv-button");
  expect(exportButton).toBeInTheDocument();
  expect(exportButton).toBeDisabled();
});

it("4.4.1.7 - Warning When No Shipments Match Filters", async () => {
  // Create a Receiving mock shipment (iAmSource: false, visible on the default Receiving tab)
  const mockShipment = generateMockShipment({ iAmSource: false });

  const exportQueryMock = {
    request: {
      query: SHIPMENT_DATA_FOR_EXPORT_QUERY,
    },
    result: {
      data: {
        shipments: [mockShipment],
      },
    },
  };

  const mocks = [mockSuccessfulShipmentsQuery({ iAmSource: false }), exportQueryMock];

  render(<ShipmentsOverviewView />, {
    routePath: "/bases/:baseId/transfers/shipments",
    initialUrl: "/bases/1/transfers/shipments",
    mocks,
  });

  const user = userEvent.setup();

  // Wait for the page to load — the Receiving shipment is visible on the default tab
  await screen.findByRole("table");

  // Click the export button to open popover
  const exportButton = screen.getByTestId("export-csv-button");
  await user.click(exportButton);

  const popoverContent = await screen.findByTestId("export-popover-content");
  const receivingCheckbox = await within(popoverContent).findByRole("checkbox", {
    name: /receiving/i,
  });

  // Uncheck the receiving checkbox so no shipments match (the only shipment is Receiving)
  await user.click(receivingCheckbox);

  // Click export with only sending checked
  const popoverExportButton = screen.getByTestId("export-button");
  await user.click(popoverExportButton);

  // Wait for the warning to appear
  await waitFor(() =>
    expect(mockedCreateToast).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/no shipments to export/i),
      }),
    ),
  );
});

it("4.4.1.8 - GlobalFilter searches BaseOrgCell fields", async () => {
  // iAmSource: true → Sending shipment, sourceBase = Lesvos/BoxAid, targetBase = Thessaloniki/BoxCare
  render(<ShipmentsOverviewView />, {
    routePath: "/bases/:baseId/transfers/shipments",
    initialUrl: "/bases/1/transfers/shipments",
    mocks: [mockSuccessfulShipmentsQuery({})],
  });

  const user = userEvent.setup();

  // Switch to Sending tab so the row is visible
  await user.click(screen.getByText(/Sending \(/i));
  expect(await screen.findByRole("cell", { name: /thessaloniki boxcare/i })).toBeInTheDocument();

  const searchInput = screen.getByPlaceholderText("Search");

  // Searching by target org should keep the row visible
  await user.type(searchInput, "BoxCare");
  expect(await screen.findByRole("cell", { name: /thessaloniki boxcare/i })).toBeInTheDocument();

  // Searching by a term that doesn't match anything should hide the row
  await user.clear(searchInput);
  await user.type(searchInput, "xyznonexistent");
  await waitFor(() =>
    expect(screen.queryByRole("cell", { name: /thessaloniki boxcare/i })).not.toBeInTheDocument(),
  );

  // Clearing the filter restores the row
  await user.clear(searchInput);
  expect(await screen.findByRole("cell", { name: /thessaloniki boxcare/i })).toBeInTheDocument();
});

it("4.4.1.9 - GlobalFilter searches BoxesCell text", async () => {
  // Mock shipment has 2 unique non-removed boxes (labelIdentifiers "123" and "124")
  render(<ShipmentsOverviewView />, {
    routePath: "/bases/:baseId/transfers/shipments",
    initialUrl: "/bases/1/transfers/shipments",
    mocks: [mockSuccessfulShipmentsQuery({})],
  });

  const user = userEvent.setup();

  // Switch to Sending tab
  await user.click(screen.getByText(/Sending \(/i));
  expect(await screen.findByRole("cell", { name: /2 boxes/i })).toBeInTheDocument();

  const searchInput = screen.getByPlaceholderText("Search");

  // Searching "2 boxes" should keep the row visible
  await user.type(searchInput, "2 boxes");
  expect(await screen.findByRole("cell", { name: /2 boxes/i })).toBeInTheDocument();

  // Searching "3 boxes" should hide the row (the shipment only has 2)
  await user.clear(searchInput);
  await user.type(searchInput, "3 boxes");
  await waitFor(() =>
    expect(screen.queryByRole("cell", { name: /2 boxes/i })).not.toBeInTheDocument(),
  );
});

it("4.4.1.10 - Tab counts reflect active GlobalFilter", async () => {
  // iAmSource: true → Sending shipment, sourceBase name contains "Lesvos"
  render(<ShipmentsOverviewView />, {
    routePath: "/bases/:baseId/transfers/shipments",
    initialUrl: "/bases/1/transfers/shipments",
    mocks: [mockSuccessfulShipmentsQuery({})],
  });

  const user = userEvent.setup();

  // Initial counts: Sending(1), Receiving(0)
  await screen.findByRole("table");
  expect(screen.getByText(/Sending \(1\)/i)).toBeInTheDocument();
  expect(screen.getByText(/Receiving \(0\)/i)).toBeInTheDocument();

  const searchInput = screen.getByPlaceholderText("Search");

  // A filter that matches the Sending shipment (sourceBase = "Lesvos") should keep the count
  await user.type(searchInput, "Lesvos");
  expect(await screen.findByText(/Sending \(1\)/i)).toBeInTheDocument();
  expect(screen.getByText(/Receiving \(0\)/i)).toBeInTheDocument();

  // A filter that matches nothing should drop the count to 0
  await user.clear(searchInput);
  await user.type(searchInput, "xyznonexistent");
  expect(await screen.findByText(/Sending \(0\)/i)).toBeInTheDocument();
  expect(screen.getByText(/Receiving \(0\)/i)).toBeInTheDocument();

  // Clearing the filter restores the original count
  await user.clear(searchInput);
  expect(await screen.findByText(/Sending \(1\)/i)).toBeInTheDocument();
});
