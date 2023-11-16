import { useAuth0 } from "@auth0/auth0-react";
import { QrReaderScanner } from "components/QrReader/components/QrReaderScanner";
// import { GraphQLError } from "graphql";
import { useErrorHandling } from "hooks/useErrorHandling";
import { generateMockBox } from "mocks/boxes";
import { mockImplementationOfQrReader } from "mocks/components";
import { mockAuthenticatedUser } from "mocks/hooks";
import { cache } from "queries/cache";
import { GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE } from "queries/queries";
import { BoxState } from "types/generated/graphql";
import { render, screen } from "tests/test-utils";
import ResolveHash from "./ResolveHash";

// extracting a cacheObject to reset the cache correctly later
const emptyCache = cache.extract();

// Toasts are persisting throughout the tests since they are rendered in the wrapper and not in the render.
// Therefore, we need to mock them since otherwise we easily get false negatives
// Everywhere where we have more than one occation of a toast we should do this.
const mockedTriggerError = jest.fn();
jest.mock("hooks/useErrorHandling");
jest.mock("@auth0/auth0-react");
jest.mock("components/QrReader/components/QrReaderScanner");

// .mocked() is a nice helper function from jest for typescript support
// https://jestjs.io/docs/mock-function-api/#typescript-usage
const mockedUseAuth0 = jest.mocked(useAuth0);
const mockedQrReader = jest.mocked(QrReaderScanner);

beforeEach(() => {
  mockAuthenticatedUser(mockedUseAuth0, "dev_volunteer@boxaid.org");
  const mockedUseErrorHandling = jest.mocked(useErrorHandling);
  mockedUseErrorHandling.mockReturnValue({ triggerError: mockedTriggerError });
});

afterEach(() => {
  cache.restore(emptyCache);
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

    expect(await screen.findByTestId("box-sections")).toBeInTheDocument();

    expect(await screen.findByRole("heading", { name: endRoute })).toBeInTheDocument();
  });
});

// const mockFailedQrQuery = ({
//   query = GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
//   hash = "",
//   errorCode = "",
//   resultQrCode = null as string | null | undefined,
//   networkError = false,
// }) => ({
//   request: {
//     query,
//     variables: { qrCode: hash },
//   },
//   result: networkError
//     ? undefined
//     : {
//         data:
//           resultQrCode != null
//             ? {
//                 qrCode: {
//                   _typename: "QrCode",
//                   code: hash,
//                   box: null,
//                 },
//               }
//             : null,
//         errors: [new GraphQLError("Error!", { extensions: { code: errorCode } })],
//       },
//   error: networkError ? new Error() : undefined,
// });
