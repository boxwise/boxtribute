import { it, expect, vi, beforeEach } from "vitest";
import { screen, render, waitFor } from "tests/test-utils";
import { mockGraphQLError, mockNetworkError } from "mocks/functions";
import { generateMockShipment } from "mocks/shipments";
import { ALL_SHIPMENTS_QUERY } from "queries/queries";
import ShipmentsOverviewView from "./ShipmentsOverviewView";
import userEvent from "@testing-library/user-event";
import { useAuth0 } from "@auth0/auth0-react";
import { mockAuthenticatedUser } from "mocks/hooks";
import { graphql } from "../../../../../graphql/graphql";
import { SHIPMENT_FIELDS_FRAGMENT } from "queries/fragments";

const SHIPMENT_DATA_FOR_EXPORT_QUERY = graphql(
  `
    query ShipmentDataForExport {
      shipments {
        ...ShipmentFields
      }
    }
  `,
  [SHIPMENT_FIELDS_FRAGMENT],
);

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
    mocks: [mockGraphQLError(ALL_SHIPMENTS_QUERY)],
  },
  {
    name: "4.4.1.2b - Accept Transfer Agreement fails due to NetworkError",
    mocks: [mockNetworkError(ALL_SHIPMENTS_QUERY)],
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
  expect(
    screen.getByRole("link", {
      name: /manage shipments/i,
    }),
  ).toBeInTheDocument();
});

it("4.4.1.5 - Export CSV Button Functionality", async () => {
  const mockShipment = generateMockShipment({});
  const mocks = [
    mockSuccessfulShipmentsQuery({}),
    {
      request: {
        query: SHIPMENT_DATA_FOR_EXPORT_QUERY,
      },
      result: {
        data: {
          shipments: [mockShipment],
        },
      },
    },
  ];

  render(<ShipmentsOverviewView />, {
    routePath: "/bases/:baseId/transfers/shipments",
    initialUrl: "/bases/1/transfers/shipments",
    mocks,
  });

  const user = userEvent.setup();

  // Wait for the page to load
  await screen.findByRole("table");

  // Check if Export CSV button exists
  const exportButton = screen.getByTestId("export-csv-button");
  expect(exportButton).toBeInTheDocument();
  expect(exportButton).toHaveTextContent("Export .csv");

  // Click the export button to open popover
  await user.click(exportButton);

  // Check if popover content is visible
  expect(screen.getByText("Include following shipments:")).toBeInTheDocument();

  // Check if checkboxes are present and checked by default
  const receivingCheckbox = screen.getByRole("checkbox", { name: /receiving/i });
  const sendingCheckbox = screen.getByRole("checkbox", { name: /sending/i });
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
});
