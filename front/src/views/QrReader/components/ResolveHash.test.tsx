import { vi, beforeEach, it, expect } from "vitest";
import { useAuth0 } from "@auth0/auth0-react";
import { QrReaderScanner } from "components/QrReader/components/QrReaderScanner";
import { GraphQLError } from "graphql";
import { generateMockBox } from "mocks/boxes";
import { mockImplementationOfQrReader } from "mocks/components";
import { mockAuthenticatedUser } from "mocks/hooks";
import { cache } from "queries/cache";
import { GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE } from "queries/queries";
import { BoxState } from "types/generated/graphql";
import { render, screen, waitFor } from "tests/test-utils";
import { mockedTriggerError } from "tests/setupTests";
import ResolveHash from "./ResolveHash";

vi.mock("@auth0/auth0-react");
vi.mock("components/QrReader/components/QrReaderScanner");
const mockedUseAuth0 = vi.mocked(useAuth0);
const mockedQrReader = vi.mocked(QrReaderScanner);

beforeEach(() => {
  mockAuthenticatedUser(mockedUseAuth0, "dev_volunteer@boxaid.org");
});

const mockSuccessfulQrQuery = ({
  query = GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
  hash = "abc",
  isBoxAssociated = true,
  labelIdentifier = "123",
  state = BoxState.InStock,
}) => ({
  delay: 100,
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

const SuccessfulQrScanningTests = [
  {
    name: "3.4.8.2 - User scans QR code of same org without previously associated box",
    hash: "QrWithoutBox",
    mocks: [mockSuccessfulQrQuery({ hash: "QrWithoutBox", isBoxAssociated: false })],
    endRoute: "/bases/1/boxes/create/QrWithoutBox",
  },
  {
    name: "3.4.8.3 - User scans QR code of same org with associated box",
    hash: "QrWithBoxFromSameBase",
    mocks: [mockSuccessfulQrQuery({ hash: "QrWithBoxFromSameBase" })],
    endRoute: "/bases/1/boxes/123",
  },
];

SuccessfulQrScanningTests.forEach(({ name, hash, mocks, endRoute }) => {
  it(name, async () => {
    mockImplementationOfQrReader(mockedQrReader, hash, true, true);
    render(<ResolveHash />, {
      routePath: "/bases/1/qrreader/:hash",
      initialUrl: `/bases/1/qrreader/${hash}`,
      additionalRoute: endRoute,
      mocks,
      cache,
    });

    expect(screen.queryByTestId("ReturnScannedQr")).not.toBeInTheDocument();

    expect(await screen.findByTestId("box-sections", {}, { timeout: 5000 })).toBeInTheDocument();

    expect(screen.queryByTestId("ReturnScannedQr")).not.toBeInTheDocument();

    expect(await screen.findByRole("heading", { name: endRoute })).toBeInTheDocument();
  });
});

const mockFailedQrQuery = ({
  query = GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
  hash = "",
  errorCode = "",
  networkError = false,
}) => ({
  request: {
    query,
    variables: { qrCode: hash },
  },
  result: networkError
    ? undefined
    : {
        data: null,
        errors: [new GraphQLError("Error!", { extensions: { code: errorCode } })],
      },
  error: networkError ? new Error() : undefined,
});

const FailedQrScanningTests = [
  {
    name: "3.4.8.4 - User scans QR code of different org with associated box",
    hash: "QrWithBoxFromDifferentBase",
    mocks: [mockFailedQrQuery({ hash: "QrWithBoxFromDifferentBase", errorCode: "FORBIDDEN" })],
    toast: /You don't have permission to access this box/i,
  },
  {
    name: "3.4.8.7 - User scans QR code where hash is not found in db",
    hash: "NoBoxtributeQr",
    mocks: [mockFailedQrQuery({ hash: "NoBoxtributeQr", errorCode: "BAD_USER_INPUT" })],
    toast: /No box found for this QR code/i,
  },
  {
    name: "3.4.8.8 - User scans QR code and server returns unexpected error",
    hash: "QrServerFailure",
    mocks: [mockFailedQrQuery({ hash: "QrServerFailure", errorCode: "SERVER_ERROR" })],
    toast: /QR code lookup failed. Please wait a bit and try again./i,
  },
  {
    name: "3.4.8.9 - User scans QR code and a network error is returned",
    hash: "QrNetworkError",
    mocks: [mockFailedQrQuery({ hash: "QrNetworkError", networkError: true })],
    toast: /QR code lookup failed. Please wait a bit and try again./i,
  },
];

FailedQrScanningTests.forEach(({ name, hash, mocks, toast }) => {
  it(name, async () => {
    mockImplementationOfQrReader(mockedQrReader, hash, true, true);
    render(<ResolveHash />, {
      routePath: "/bases/1/qrreader/:hash",
      initialUrl: `/bases/1/qrreader/${hash}`,
      mocks,
      cache,
    });

    expect(await screen.findByTestId("ReturnScannedQr")).toBeInTheDocument();

    // toast shown
    await waitFor(() =>
      expect(mockedTriggerError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(toast),
        }),
      ),
    );
  });
});
