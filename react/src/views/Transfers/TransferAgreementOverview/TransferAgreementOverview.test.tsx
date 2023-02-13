import { GraphQLError } from "graphql";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { screen, render } from "tests/test-utils";
import TransferAgreementOverviewView, {
  ALL_TRANSFER_AGREEMENTS_QUERY,
} from "./TransferAgreementOverviewView";

const queryTransferAgreementsGraphQLError = {
  request: {
    query: ALL_TRANSFER_AGREEMENTS_QUERY,
  },
  result: {
    data: {
      transferAgreements: [],
    },
    errors: [new GraphQLError("Error!")],
  },
};

it("4.2.2a - Failed to Fetch Initial Data (GraphQlError)", async () => {
  render(<TransferAgreementOverviewView />, {
    routePath: "/bases/:baseId/transfers/agreements",
    initialUrl: "/bases/1/transfers/agreements",
    mocks: [queryTransferAgreementsGraphQLError],
  });

  // 4.2.1.1 - Is the Loading State Shown First?
  expect(await screen.findByTestId("TableSkeleton")).toBeInTheDocument();

  // Check if Error is shown
  expect(await screen.findByTestId("ErrorAlert")).toBeInTheDocument();
  // Check if Table is not shown
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});

const queryTransferAgreementsNetworkError = {
  request: {
    query: ALL_TRANSFER_AGREEMENTS_QUERY,
  },
  result: {
    data: {
      transferAgreements: null,
    },
  },
  error: new Error(),
};

it("4.2.2b - Failed to Fetch Initial Data (GraphQlError)", async () => {
  render(<TransferAgreementOverviewView />, {
    routePath: "/bases/:baseId/transfers/agreements",
    initialUrl: "/bases/1/transfers/agreements",
    mocks: [queryTransferAgreementsNetworkError],
  });

  // Check if Error is shown
  expect(await screen.findByTestId("ErrorAlert")).toBeInTheDocument();
  // Check if Table is not shown
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});
