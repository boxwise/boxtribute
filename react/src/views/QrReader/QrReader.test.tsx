import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { screen, render, waitFor } from "tests/test-utils";
import { useAuth0 } from "@auth0/auth0-react";
import { QrReaderScanner } from "components/QrReader/components/QrReaderScanner";
import { mockMatchMediaQuery } from "mocks/functions";
import { mockAuthenticatedUser } from "mocks/hooks";
import { mockImplementationOfQrReader } from "mocks/components";
import { generateMockBox } from "mocks/boxes";
import { useErrorHandling } from "hooks/useErrorHandling";
import { useNotification } from "hooks/useNotification";
import { GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE } from "queries/queries";
import { BoxState } from "types/generated/graphql";
import QrReaderView from "./QrReaderView";

const mockSuccessfulQrQuery = ({
  query = GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
  hash = "abc",
  isBoxAssociated = true,
  labelIdentifier = "123",
  state = BoxState.InStock,
}) => ({
  request: {
    query,
    variables: { qrCode: hash },
  },
  result: {
    data: {
      qrCode: {
        _typename: "QrCode",
        code: hash,
        box: isBoxAssociated ? generateMockBox({ labelIdentifier, state }) : null,
      },
    },
  },
});

// Toasts are persisting throughout the tests since they are rendered in the wrapper and not in the render.
// Therefore, we need to mock them since otherwise we easily get false negatives
// Everywhere where we have more than one occation of a toast we should do this.
const mockedTriggerError = jest.fn();
const mockedCreateToast = jest.fn();
jest.mock("hooks/useErrorHandling");
jest.mock("hooks/useNotification");
jest.mock("@auth0/auth0-react");
jest.mock("components/QrReader/components/QrReaderScanner");

// .mocked() is a nice helper function from jest for typescript support
// https://jestjs.io/docs/mock-function-api/#typescript-usage
const mockedUseAuth0 = jest.mocked(useAuth0);
const mockedQrReader = jest.mocked(QrReaderScanner);

beforeEach(() => {
  // setting the screensize to
  mockMatchMediaQuery(true);
  mockAuthenticatedUser(mockedUseAuth0, "dev_volunteer@boxaid.org");
  const mockedUseErrorHandling = jest.mocked(useErrorHandling);
  mockedUseErrorHandling.mockReturnValue({ triggerError: mockedTriggerError });
  const mockedUseNotification = jest.mocked(useNotification);
  mockedUseNotification.mockReturnValue({ createToast: mockedCreateToast });
});

const qrScanningInMultiBoxTabTests = [
  {
    name: "3.4.3.2 - user scans QR code of same org with associated box",
    hash: "QrWithBoxFromSameBase",
    mocks: [mockSuccessfulQrQuery({ hash: "QrWithBoxFromSameBase" })],
    boxCount: 1,
    toasts: [{ message: /Box 123 was added/i, isError: false }],
  },
  {
    name: "3.4.3.3 - user scans QR code of same org with associated box twice",
    hash: "QrWithBoxFromSameBase",
    mocks: [
      mockSuccessfulQrQuery({ hash: "QrWithBoxFromSameBase" }),
      mockSuccessfulQrQuery({ hash: "QrWithBoxFromSameBase" }),
    ],
    boxCount: 1,
    toasts: [
      { message: /Box 123 was added/i, isError: false },
      { message: /Box 123 is already on the list/i, isError: false },
    ],
  },
  {
    name: "3.4.3.4 - user scans QR code of same org without previously associated box",
    hash: "QrWithoutBox",
    mocks: [mockSuccessfulQrQuery({ hash: "QrWithoutBox", isBoxAssociated: false })],
    boxCount: 0,
    toasts: [{ message: /no box associated to this Q/i, isError: true }],
  },
];

qrScanningInMultiBoxTabTests.forEach(({ name, hash, mocks, boxCount, toasts }) => {
  it(name, async () => {
    const user = userEvent.setup();
    mockImplementationOfQrReader(mockedQrReader, hash, true, true);
    render(<QrReaderView />, {
      routePath: "/bases/:baseId/qrreader",
      initialUrl: "/bases/1/qrreader",
      mocks,
    });

    // go to the MultiBox Tab
    const multiBoxTab = await screen.findByRole("tab", { name: /multi box/i });
    expect(multiBoxTab).toBeInTheDocument();
    user.click(multiBoxTab);

    // 3.4.3.1 - no QR-codes were successfully scanned yet.
    const boxesSelectedStatus = await screen.findByText(/boxes selected: 0/i);
    expect(boxesSelectedStatus).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /delete list of scanned boxes/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /undo last scan/i })).not.toBeInTheDocument();

    // Click a button to trigger the event of scanning a QR-Code in mockImplementationOfQrReader
    const scanButton = await screen.findByTestId("ReturnScannedQr");
    await user.click(scanButton);

    // toast shown
    await waitFor(() =>
      expect(toasts[0].isError ? mockedTriggerError : mockedCreateToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(toasts[0].message),
        }),
      ),
    );

    // second scan?
    if (toasts.length === 2) {
      await user.click(scanButton);
      // toast shown
      await waitFor(() =>
        expect(toasts[1].isError ? mockedTriggerError : mockedCreateToast).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringMatching(toasts[1].message),
          }),
        ),
      );
    }

    // Boxes Selected After
    const boxesSelectedStatus2 = await screen.findByText(
      new RegExp(`boxes selected: ${boxCount}`, "i"),
    );
    expect(boxesSelectedStatus2).toBeInTheDocument();
    if (boxCount) {
      const deleteScannedBoxesButton = screen.getByRole("button", {
        name: /delete list of scanned boxes/i,
      });
      expect(deleteScannedBoxesButton).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /undo last scan/i })).toBeInTheDocument();
      // 3.4.4.1 - Pressing the delete button
      user.click(deleteScannedBoxesButton);
      expect(await screen.findByText(/boxes selected: 0/i)).toBeInTheDocument();
    }
  });
});
