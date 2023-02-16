import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { screen, render } from "tests/test-utils";
import { generateMockTransferAgreement } from "mocks/transferAgreements";
import { mockGraphQLError, mockNetworkError } from "mocks/functions";
import { TransferAgreementState } from "types/generated/graphql";
import TransferAgreementOverviewView, {
  ACCEPT_TRANSFER_AGREEMENT,
  ALL_TRANSFER_AGREEMENTS_QUERY,
} from "./TransferAgreementOverviewView";

const mockSuccessfullTransferAgreementsResponse = ({
  query = ALL_TRANSFER_AGREEMENTS_QUERY,
  variables = {},
  state = TransferAgreementState.UnderReview,
  isInitiator = true,
}) => ({
  request: {
    query,
  },
  variables,
  result: {
    data: {
      transferAgreements: [generateMockTransferAgreement({ state, isInitiator })],
    },
  },
});

it("4.2.2a - Failed to Fetch Initial Data (GraphQlError)", async () => {
  render(<TransferAgreementOverviewView />, {
    routePath: "/bases/:baseId/transfers/agreements",
    initialUrl: "/bases/1/transfers/agreements",
    mocks: [mockGraphQLError(ALL_TRANSFER_AGREEMENTS_QUERY)],
  });

  // 4.2.1.1 - Is the Loading State Shown First?
  expect(await screen.findByTestId("TableSkeleton")).toBeInTheDocument();

  // Check if Error is shown
  expect(await screen.findByTestId("ErrorAlert")).toBeInTheDocument();
  // Check if Table is not shown
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});

it("4.2.2b - Failed to Fetch Initial Data (GraphQlError)", async () => {
  render(<TransferAgreementOverviewView />, {
    routePath: "/bases/:baseId/transfers/agreements",
    initialUrl: "/bases/1/transfers/agreements",
    mocks: [mockNetworkError(ALL_TRANSFER_AGREEMENTS_QUERY)],
  });

  // Check if Error is shown
  expect(await screen.findByTestId("ErrorAlert")).toBeInTheDocument();
  // Check if Table is not shown
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});

it("4.2.1 - Initial Load of Page", async () => {
  render(<TransferAgreementOverviewView />, {
    routePath: "/bases/:baseId/transfers/agreements",
    initialUrl: "/bases/1/transfers/agreements",
    mocks: [mockSuccessfullTransferAgreementsResponse({})],
  });

  // Data of Mock Transfer is shown correctly
  expect(await screen.findByRole("cell", { name: /to \/ from/i })).toBeInTheDocument();
  expect(screen.getByRole("cell", { name: /boxcare/i })).toBeInTheDocument();
  expect(screen.getByRole("cell", { name: /pending/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /thessaloniki \(1\)/i })).toBeInTheDocument();
  expect(screen.getByRole("cell", { name: /Good Comment/i })).toBeInTheDocument();
  expect(screen.getByRole("cell", { name: /1\/1\/2024/i })).toBeInTheDocument();
});

const failedMutationTests = [
  {
    name: "4.2.3.1a - Accept Transfer Agreement fails due to NetworkError",
    mocks: [
      mockSuccessfullTransferAgreementsResponse({ isInitiator: false }),
      mockNetworkError(ACCEPT_TRANSFER_AGREEMENT),
    ],
  },
];

failedMutationTests.forEach(({ name, mocks }) => {
  it(name, async () => {
    const user = userEvent.setup();
    render(<TransferAgreementOverviewView />, {
      routePath: "/bases/:baseId/transfers/agreements",
      initialUrl: "/bases/1/transfers/agreements",
      mocks,
    });

    // click the button in the state column
    const stateButton = await screen.findByRole("button", { name: /request open/i });
    expect(stateButton).toBeInTheDocument();
    user.click(stateButton);

    // click the button in the modal
    const modalButton = await screen.findByRole("button", { name: /Accept/i });
    expect(modalButton).toBeInTheDocument();
    user.click(modalButton);

    // error toast shown and overlay is still open
    expect(await screen.findByText(/could not accept/i)).toBeInTheDocument();
    expect(modalButton).toBeInTheDocument();
  });
});
