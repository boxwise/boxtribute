import { it, expect, vi, beforeEach } from "vitest";
import { screen, render } from "tests/test-utils";
import { mockGraphQLError, mockNetworkError } from "mocks/functions";
import { generateMockShipment } from "mocks/shipments";
import { ALL_SHIPMENTS_QUERY } from "queries/queries";
import ShipmentsOverviewView from "./ShipmentsOverviewView";
import userEvent from "@testing-library/user-event";
import { useAuth0 } from "@auth0/auth0-react";
import { mockAuthenticatedUser } from "mocks/hooks";

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
  user.click(screen.getByText(/Sending \(/i));
  // Data of Mock Transfer is shown correctly
  expect(await screen.findByRole("cell", { name: /thessaloniki boxcare/i })).toBeInTheDocument();
  // Display the filtered count for "Sending" shipments.
  expect(screen.getByText(/Sending \(1\)/i)).toBeInTheDocument();
  expect(screen.getByRole("cell", { name: /preparing/i })).toBeInTheDocument();
  expect(screen.getByRole("cell", { name: /2 boxes/i })).toBeInTheDocument();
  expect(screen.getByRole("cell", { name: /2\/1\/2023/i })).toBeInTheDocument();
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
