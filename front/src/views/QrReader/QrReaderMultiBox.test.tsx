import { vi, beforeEach, it, expect } from "vitest";
import { userEvent } from "@testing-library/user-event";
import { screen, render, waitFor } from "tests/test-utils";
import { useAuth0 } from "@auth0/auth0-react";
import { QrReaderScanner } from "components/QrReader/components/QrReaderScanner";
import { mockAuthenticatedUser } from "mocks/hooks";
import { mockImplementationOfQrReader } from "mocks/components";
import { generateMockBox } from "mocks/boxes";
import {
  GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
  MULTI_BOX_ACTION_OPTIONS_FOR_LOCATIONS_TAGS_AND_SHIPMENTS_QUERY,
} from "queries/queries";
import { cache } from "queries/cache";
import { locations } from "mocks/locations";
import { mockedCreateToast, mockedTriggerError } from "tests/setupTests";
import QrReaderView from "./QrReaderView";
import { FakeGraphQLError, FakeGraphQLNetworkError } from "mocks/functions";

const mockSuccessfulQrQuery = ({
  query = GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
  hash = "abc",
  isBoxAssociated = true,
  labelIdentifier = "123",
  state = "InStock",
}) => ({
  request: {
    query,
    variables: { qrCode: hash },
  },
  result: {
    data: {
      qrCode: {
        __typename: "QrCode",
        code: hash,
        box: isBoxAssociated ? generateMockBox({ labelIdentifier, state }) : null,
      },
    },
  },
});

const mockEmptyLocationsTagsShipmentsQuery = {
  request: {
    query: MULTI_BOX_ACTION_OPTIONS_FOR_LOCATIONS_TAGS_AND_SHIPMENTS_QUERY,
    variables: { baseId: "1" },
  },
  result: {
    data: {
      shipments: [],
      base: { locations, tags: null },
    },
  },
};

vi.mock("@auth0/auth0-react");
vi.mock("components/QrReader/components/QrReaderScanner");
const mockedUseAuth0 = vi.mocked(useAuth0);
const mockedQrReader = vi.mocked(QrReaderScanner);

beforeEach(() => {
  mockAuthenticatedUser(mockedUseAuth0, "dev_volunteer@boxaid.org", [
    "be_user",
    "view_shipments",
  ]);
});

const qrScanningInMultiBoxTabTests = [
  {
    name: "3.4.3.2 - user scans QR code of same org with associated box",
    hash: "QrWithBoxFromSameBase",
    mocks: [
      mockSuccessfulQrQuery({ hash: "QrWithBoxFromSameBase" }),
      mockEmptyLocationsTagsShipmentsQuery,
    ],
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
      cache,
    });

    // go to the MultiBox Tab
    const multiBoxTab = await screen.findByRole("tab", { name: /multi box/i });
    expect(multiBoxTab).toBeInTheDocument();
    await user.click(multiBoxTab);

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
      await user.click(deleteScannedBoxesButton);
      expect(await screen.findByText(/boxes selected: 0/i)).toBeInTheDocument();
    }
  });
});

const mockFailedQrQuery = ({
  query = GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
  hash = "",
  graphQlError = false,
  networkError = false,
  returnedQrTypeName = "QrCode",
  returnedBoxTypeName = "Box",
}) => ({
  request: {
    query,
    variables: { qrCode: hash },
  },
  result: networkError
    ? undefined
    : graphQlError
      ? { errors: graphQlError ? undefined : [new FakeGraphQLError("Error")] }
      : {
          data:
            returnedQrTypeName === "InsufficientPermissionError"
              ? {
                  qrCode: {
                    __typename: returnedQrTypeName,
                    permissionName: "qr:read",
                  },
                }
              : returnedQrTypeName === "ResourceDoesNotExistError"
                ? {
                    qrCode: {
                      __typename: returnedQrTypeName,
                      resourceName: "qr",
                    },
                  }
                : {
                    qrCode: {
                      __typename: "QrCode",
                      code: hash,
                      box:
                        returnedBoxTypeName === "InsufficientPermissionError"
                          ? {
                              __typename: returnedBoxTypeName,
                              permissionName: "stock:read",
                            }
                          : returnedBoxTypeName === "UnauthorizedForBaseError"
                            ? {
                                __typename: returnedBoxTypeName,
                                baseName: "base",
                                organisationName: "org",
                              }
                            : null,
                    },
                  },
        },
  error: networkError ? new FakeGraphQLNetworkError() : undefined,
});

const qrScanningInMultiBoxTabTestsFailing = [
  {
    name: "3.4.3.5 - user scans QR code with associated box, but has no access",
    hash: "noStockReadPermission",
    isBoxtributeQr: true,
    mocks: [
      mockEmptyLocationsTagsShipmentsQuery,
      mockFailedQrQuery({
        hash: "noStockReadPermission",
        returnedBoxTypeName: "InsufficientPermissionError",
      }),
    ],
    toasts: [{ message: /have permission to access this box/i, isError: true }],
  },
  {
    name: "3.4.3.7 - user scans non Boxtribute QR code ",
    hash: "nonBoxtributeQr",
    isBoxtributeQr: false,
    mocks: [],
    toasts: [{ message: /This is not a Boxtribute QR code/i, isError: true }],
  },
  {
    name: "3.4.3.8 - user scans QR code where hash is not found in db",
    hash: "QrHashNotInDb",
    isBoxtributeQr: true,
    mocks: [
      mockFailedQrQuery({
        hash: "QrHashNotInDb",
        returnedQrTypeName: "ResourceDoesNotExistError",
      }),
    ],
    toasts: [{ message: /This is not a Boxtribute QR code/i, isError: true }],
  },
  {
    name: "3.4.3.9 - user scans QR code and server returns unexpected error",
    hash: "InternalServerError",
    isBoxtributeQr: true,
    mocks: [
      mockFailedQrQuery({
        hash: "InternalServerError",
        graphQlError: true,
      }),
    ],
    toasts: [{ message: /QR code lookup failed/i, isError: true }],
  },
  {
    name: "3.4.3.10 - user scans QR code and a network error is returned",
    hash: "NetworkError",
    isBoxtributeQr: true,
    mocks: [
      mockFailedQrQuery({
        hash: "NetworkError",
        networkError: true,
      }),
    ],
    toasts: [{ message: /QR code lookup failed/i, isError: true }],
  },
];

qrScanningInMultiBoxTabTestsFailing.forEach(({ name, hash, isBoxtributeQr, mocks, toasts }) => {
  it(name, async () => {
    const user = userEvent.setup();
    mockImplementationOfQrReader(mockedQrReader, hash, isBoxtributeQr, true);
    render(<QrReaderView />, {
      routePath: "/bases/:baseId/qrreader",
      initialUrl: "/bases/1/qrreader",
      mocks,
      cache,
    });

    // go to the MultiBox Tab
    const multiBoxTab = await screen.findByRole("tab", { name: /multi box/i });
    expect(multiBoxTab).toBeInTheDocument();
    await user.click(multiBoxTab);

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
  });
});
