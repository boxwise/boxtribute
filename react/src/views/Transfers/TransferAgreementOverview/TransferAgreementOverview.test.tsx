import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { screen, render } from "tests/test-utils";
import { generateMockTransferAgreement } from "mocks/transferAgreements";
import { mockGraphQLError, mockNetworkError } from "mocks/functions";
import { TransferAgreementState, TransferAgreementType } from "types/generated/graphql";
import TransferAgreementOverviewView, {
  ACCEPT_TRANSFER_AGREEMENT,
  ALL_TRANSFER_AGREEMENTS_QUERY,
  CANCEL_TRANSFER_AGREEMENT,
  REJECT_TRANSFER_AGREEMENT,
} from "./TransferAgreementOverviewView";

const mockSuccessfullTransferAgreementsQuery = ({
  query = ALL_TRANSFER_AGREEMENTS_QUERY,
  variables = {},
  state = TransferAgreementState.UnderReview,
  type = TransferAgreementType.Bidirectional,
  isInitiator = true,
}) => ({
  request: {
    query,
    variables,
  },
  result: {
    data: {
      transferAgreements: [generateMockTransferAgreement({ state, type, isInitiator })],
    },
  },
});

// Toasts are persisting throughout the tests since they are rendered in the wrapper and not in the render.
// Therefore, we need to close them after each test since we get easily false positives
// Everywhere where we have more than one occation of a toast we should do this.
afterEach(() => {
  const closeToastButtons = screen.queryAllByRole("button", { name: /close/i });
  closeToastButtons.forEach((button) => userEvent.click(button));
});

it("4.2.2a - Failed to Fetch Initial Data (GraphQlError)", async () => {
  render(<TransferAgreementOverviewView />, {
    routePath: "/bases/:baseId/transfers/agreements",
    initialUrl: "/bases/1/transfers/agreements",
    mocks: [mockGraphQLError(ALL_TRANSFER_AGREEMENTS_QUERY)],
  });

  // Check if Error is shown
  expect(await screen.findByTestId("ErrorAlert")).toBeInTheDocument();
  // Check if Table is not shown
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
}, 10000);

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
    mocks: [mockSuccessfullTransferAgreementsQuery({})],
  });

  // 4.2.1.1 - Is the Loading State Shown First?
  // expect(await screen.findByTestId("TableSkeleton")).toBeInTheDocument();

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
    name: "4.2.3.1a - Accept Transfer Agreement fails due to GraphQLError",
    mocks: [
      mockSuccessfullTransferAgreementsQuery({ isInitiator: false }),
      mockGraphQLError(ACCEPT_TRANSFER_AGREEMENT, { id: "1" }),
    ],
    stateButtonText: /request open/i,
    modalButtonText: /Accept/i,
    toastText: /could not accept/i,
  },
  {
    name: "4.2.3.1b - Accept Transfer Agreement fails due to NetworkError",
    mocks: [
      mockSuccessfullTransferAgreementsQuery({ isInitiator: false }),
      mockNetworkError(ACCEPT_TRANSFER_AGREEMENT, { id: "1" }),
    ],
    stateButtonText: /request open/i,
    modalButtonText: /Accept/i,
    toastText: /could not accept/i,
  },
  {
    name: "4.2.4.1a - Reject Transfer Agreement fails due to GraphQLError",
    mocks: [
      mockSuccessfullTransferAgreementsQuery({
        type: TransferAgreementType.SendingTo,
        isInitiator: false,
      }),
      mockGraphQLError(REJECT_TRANSFER_AGREEMENT, { id: "1" }),
    ],
    stateButtonText: /request open/i,
    modalButtonText: /Reject/i,
    toastText: /could not reject/i,
  },
  {
    name: "4.2.4.1b - Reject Transfer Agreement fails due to NetworkError",
    mocks: [
      mockSuccessfullTransferAgreementsQuery({
        type: TransferAgreementType.ReceivingFrom,
        isInitiator: false,
      }),
      mockNetworkError(REJECT_TRANSFER_AGREEMENT, { id: "1" }),
    ],
    stateButtonText: /request open/i,
    modalButtonText: /Reject/i,
    toastText: /could not reject/i,
  },
  {
    name: "4.2.5.1a - Cancel Transfer Agreement fails due to GraphQLError",
    mocks: [
      mockSuccessfullTransferAgreementsQuery({ state: TransferAgreementState.Accepted }),
      mockGraphQLError(CANCEL_TRANSFER_AGREEMENT, { id: "1" }),
    ],
    stateButtonText: /accepted/i,
    modalButtonText: /terminate/i,
    toastText: /could not cancel/i,
  },
  {
    name: "4.2.5.1b - Cancel Transfer Agreement fails due to NetworkError",
    mocks: [
      mockSuccessfullTransferAgreementsQuery({ state: TransferAgreementState.Accepted }),
      mockNetworkError(CANCEL_TRANSFER_AGREEMENT, { id: "1" }),
    ],
    stateButtonText: /accepted/i,
    modalButtonText: /terminate/i,
    toastText: /could not cancel/i,
  },
];

failedMutationTests.forEach(({ name, mocks, stateButtonText, modalButtonText, toastText }) => {
  it(name, async () => {
    const user = userEvent.setup();
    render(<TransferAgreementOverviewView />, {
      routePath: "/bases/:baseId/transfers/agreements",
      initialUrl: "/bases/1/transfers/agreements",
      mocks,
    });

    // click the button in the state column
    const stateButton = await screen.findByRole("button", { name: stateButtonText });
    expect(stateButton).toBeInTheDocument();
    user.click(stateButton);

    // click the button in the modal
    const modalButton = await screen.findByRole("button", { name: modalButtonText });
    expect(modalButton).toBeInTheDocument();
    user.click(modalButton);

    // error toast shown and overlay is still open
    expect(await screen.findByText(toastText)).toBeInTheDocument();
    expect(modalButton).toBeInTheDocument();
  });
});

const mockSuccessfullMutation = ({
  mutation = ACCEPT_TRANSFER_AGREEMENT,
  mutationKey = "acceptTransferAgreement",
  state = TransferAgreementState.UnderReview,
  type = TransferAgreementType.Bidirectional,
  isInitiator = true,
}) => {
  const mockObject = {
    request: {
      query: mutation,
      variables: { id: "1" },
    },
    result: {
      data: {},
    },
  };
  mockObject.result.data[mutationKey] = generateMockTransferAgreement({ state, type, isInitiator });
  return mockObject;
};

const succesfullMutationTests = [
  {
    name: "4.2.3 - Accept Transfer Agreement",
    mocks: [
      mockSuccessfullTransferAgreementsQuery({ isInitiator: false }),
      mockSuccessfullMutation({ state: TransferAgreementState.Accepted, isInitiator: false }),
    ],
    stateButtonTextBefore: /request open/i,
    stateButtonTextAfter: "Accepted",
    modalButtonText: "Accept",
    toastText: /successfully accepted/i,
  },
  {
    name: "4.2.4 - Reject Transfer Agreement",
    mocks: [
      mockSuccessfullTransferAgreementsQuery({
        type: TransferAgreementType.ReceivingFrom,
        isInitiator: false,
      }),
      mockSuccessfullMutation({
        mutation: REJECT_TRANSFER_AGREEMENT,
        mutationKey: "rejectTransferAgreement",
        state: TransferAgreementState.Rejected,
        type: TransferAgreementType.ReceivingFrom,
        isInitiator: false,
      }),
    ],
    stateButtonTextBefore: /request open/i,
    stateButtonTextAfter: /declined/i,
    modalButtonText: "Reject",
    toastText: /successfully rejected/i,
  },
  {
    name: "4.2.5 - Cancel Transfer Agreement",
    mocks: [
      mockSuccessfullTransferAgreementsQuery({
        state: TransferAgreementState.Accepted,
        isInitiator: false,
      }),
      mockSuccessfullMutation({
        mutation: CANCEL_TRANSFER_AGREEMENT,
        mutationKey: "cancelTransferAgreement",
        state: TransferAgreementState.Canceled,
        isInitiator: false,
      }),
    ],
    stateButtonTextBefore: "Accepted",
    stateButtonTextAfter: "Ended",
    modalButtonText: "Terminate",
    toastText: /successfully canceled/i,
  },
];

succesfullMutationTests.forEach(
  ({ name, mocks, stateButtonTextBefore, stateButtonTextAfter, modalButtonText, toastText }) => {
    it(
      name,
      async () => {
        const user = userEvent.setup();
        render(<TransferAgreementOverviewView />, {
          routePath: "/bases/:baseId/transfers/agreements",
          initialUrl: "/bases/1/transfers/agreements",
          mocks,
        });

        // click the button in the state column
        const stateButton = await screen.findByRole("button", { name: stateButtonTextBefore });
        expect(stateButton).toBeInTheDocument();
        user.click(stateButton);

        // click the button in the modal
        const modalButton = await screen.findByRole("button", { name: modalButtonText });
        expect(modalButton).toBeInTheDocument();
        user.click(modalButton);

        // success toast is shown and state Button changed
        expect(await screen.findByText(toastText)).toBeInTheDocument();
        expect(
          await screen.findByRole("button", { name: stateButtonTextAfter }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: modalButtonText, hidden: true }),
        ).toBeInTheDocument();
      },
      10000,
    );
  },
);
