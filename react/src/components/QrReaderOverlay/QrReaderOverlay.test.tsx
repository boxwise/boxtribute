import { GraphQLError } from "graphql";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { screen, render } from "tests/test-utils";
import HeaderMenuContainer from "components/HeaderMenu/HeaderMenuContainer";
import { useAuth0 } from "@auth0/auth0-react";
import { QrReaderScanner } from "components/QrReader/components/QrReaderScanner";
import { mockMatchMediaQuery } from "mocks/functions";
import { mockAuthenticatedUser } from "mocks/hooks";
import { mockImplementationOfQrReader } from "mocks/components";
import {
  BOX_DETAILS_BY_LABEL_IDENTIFIER_QUERY,
  GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
} from "queries/queries";
import { generateMockBox } from "mocks/boxes";

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
});

const queryFindNoBoxAssociated = {
  request: {
    query: BOX_DETAILS_BY_LABEL_IDENTIFIER_QUERY,
    variables: {
      labelIdentifier: "123456",
    },
  },
  result: {
    data: {
      box: null,
    },
    errors: [new GraphQLError("Error!", { extensions: { code: "BAD_USER_INPUT" } })],
  },
};

it("3.4.1.2 - Mobile: Enter invalid box identifier and click on Find button", async () => {
  const user = userEvent.setup();
  mockImplementationOfQrReader(mockedQrReader, "NoBoxAssociatedWithQrCode");
  // mock scanning a QR code
  render(<HeaderMenuContainer />, {
    routePath: "/bases/:baseId",
    initialUrl: "/bases/1",
    mocks: [queryFindNoBoxAssociated],
    additionalRoute: "/bases/1/boxes/123456",
  });

  // 3.4.1.1 - Open QROverlay
  const qrButton = await screen.findByRole("button", { name: /scan qr code/i });
  await user.click(qrButton);

  // Find Box
  const findBoxButton = await screen.findByRole("button", { name: /find/i });
  await user.type(screen.getByRole("textbox"), "123456");
  await user.click(findBoxButton);

  // error message appears
  expect(
    await screen.findByText(/A box with this label number doesn't exist/i),
  ).toBeInTheDocument();
  // QrOverlay stays open
  expect(screen.getByRole("button", { name: /find/i })).toBeInTheDocument();
});

const queryFindBox = {
  request: {
    query: BOX_DETAILS_BY_LABEL_IDENTIFIER_QUERY,
    variables: {
      labelIdentifier: "123456",
    },
  },
  result: {
    data: {
      box: generateMockBox({ labelIdentifier: "123456" }),
    },
  },
};

it("3.4.1.3 - Mobile: Enter valid box identifier and click on Find button", async () => {
  const user = userEvent.setup();
  mockImplementationOfQrReader(mockedQrReader, "BoxAssociatedWithQrCode");
  // mock scanning a QR code
  render(<HeaderMenuContainer />, {
    routePath: "/bases/:baseId",
    initialUrl: "/bases/1",
    mocks: [queryFindBox],
    additionalRoute: "/bases/1/boxes/123456",
  });

  // 3.4.1.1 - Open QROverlay
  const qrButton = await screen.findByRole("button", { name: /scan qr code/i });
  await user.click(qrButton);

  // Find Box
  const findBoxButton = await screen.findByRole("button", { name: /find/i });
  await user.type(screen.getByRole("textbox"), "123456");
  await user.click(findBoxButton);

  // Click a button to trigger the event of scanning a QR-Code in mockImplementationOfQrReader
  expect(await screen.findByRole("heading", { name: "/bases/1/boxes/123456" })).toBeInTheDocument();
}, 10000);

const queryFindBoxFromOtherOrg = {
  request: {
    query: BOX_DETAILS_BY_LABEL_IDENTIFIER_QUERY,
    variables: {
      labelIdentifier: "123456",
    },
  },
  result: {
    data: {
      box: null,
    },
    errors: [new GraphQLError("Error!", { extensions: { code: "FORBIDDEN" } })],
  },
};

// eslint-disable-next-line max-len
it("3.4.1.4 - Mobile: Enter valid box identifier from unauthorized bases and click on Find button", async () => {
  const user = userEvent.setup();
  mockImplementationOfQrReader(mockedQrReader, "NoBoxAssociatedWithQrCode");
  // mock scanning a QR code
  render(<HeaderMenuContainer />, {
    routePath: "/bases/:baseId",
    initialUrl: "/bases/1",
    mocks: [queryFindBoxFromOtherOrg],
    additionalRoute: "/bases/1/boxes/123456",
  });

  // 3.4.1.1 - Open QROverlay
  const qrButton = await screen.findByRole("button", { name: /scan qr code/i });
  await user.click(qrButton);

  // Find Box
  const findBoxButton = await screen.findByRole("button", { name: /find/i });
  await user.type(screen.getByRole("textbox"), "123456");
  await user.click(findBoxButton);

  // error message appears
  expect(
    await screen.findByText(/You don't have permission to access this box/i),
  ).toBeInTheDocument();
  // QrOverlay stays open
  expect(screen.getByRole("button", { name: /find/i })).toBeInTheDocument();
});

const queryNoBoxAssociatedWithQrCode = {
  request: {
    query: GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
    variables: {
      qrCode: "NoBoxAssociatedWithQrCode",
    },
  },
  result: {
    data: {
      qrCode: {
        box: null,
      },
    },
  },
};

// eslint-disable-next-line max-len
it("3.4.2.1 - Mobile: User scans QR code of same org without previously associated box", async () => {
  const user = userEvent.setup();
  // mock scanning a QR code
  mockImplementationOfQrReader(mockedQrReader, "NoBoxAssociatedWithQrCode");
  render(<HeaderMenuContainer />, {
    routePath: "/bases/:baseId",
    initialUrl: "/bases/1",
    mocks: [queryNoBoxAssociatedWithQrCode],
    additionalRoute: "/bases/1/boxes/create/NoBoxAssociatedWithQrCode",
  });

  // 3.4.1.1 - Open QROverlay
  const qrButton = await screen.findByRole("button", { name: /scan qr code/i });
  await user.click(qrButton);

  // Click a button to trigger the event of scanning a QR-Code in mockImplementationOfQrReader
  await user.click(screen.getByTestId("ReturnScannedQr"));
  expect(
    await screen.findByRole("heading", { name: "/bases/1/boxes/create/NoBoxAssociatedWithQrCode" }),
  ).toBeInTheDocument();
});

const queryBoxAssociatedWithQrCode = {
  request: {
    query: GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
    variables: {
      qrCode: "BoxAssociatedWithQrCode",
    },
  },
  result: {
    data: {
      qrCode: {
        box: generateMockBox({}),
      },
    },
  },
};

it("3.4.2.2 - Mobile: user scans QR code of same org with associated box", async () => {
  const user = userEvent.setup();
  // mock scanning a QR code
  mockImplementationOfQrReader(mockedQrReader, "BoxAssociatedWithQrCode");
  render(<HeaderMenuContainer />, {
    routePath: "/bases/:baseId",
    initialUrl: "/bases/1",
    mocks: [queryBoxAssociatedWithQrCode],
    additionalRoute: "/bases/1/boxes/123",
  });

  // 3.4.1.1 - Open QROverlay
  const qrButton = await screen.findByRole("button", { name: /scan qr code/i });
  await user.click(qrButton);

  // Click a button to trigger the event of scanning a QR-Code in mockImplementationOfQrReader
  await user.click(screen.getByTestId("ReturnScannedQr"));
  expect(await screen.findByRole("heading", { name: "/bases/1/boxes/123" })).toBeInTheDocument();
});

const queryBoxFromOtherOrganisation = {
  request: {
    query: GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
    variables: {
      qrCode: "BoxFromOtherOrganisation",
    },
  },
  result: {
    data: {
      qrCode: {
        box: null,
      },
    },
    errors: [new GraphQLError("Error!", { extensions: { code: "FORBIDDEN" } })],
  },
};

it("3.4.2.3 - Mobile: user scans QR code of different org with associated box", async () => {
  const user = userEvent.setup();
  // mock scanning a QR code
  mockImplementationOfQrReader(mockedQrReader, "BoxFromOtherOrganisation");
  render(<HeaderMenuContainer />, {
    routePath: "/bases/:baseId",
    initialUrl: "/bases/1",
    mocks: [queryBoxFromOtherOrganisation],
  });

  // 3.4.1.1 - Open QROverlay
  const qrButton = await screen.findByRole("button", { name: /scan qr code/i });
  await user.click(qrButton);

  // Click a button to trigger the event of scanning a QR-Code in mockImplementationOfQrReader
  await user.click(screen.getByTestId("ReturnScannedQr"));

  // error message appears
  expect(
    (await screen.findAllByText(/You don't have permission to access this box/i)).length,
  ).toBeGreaterThanOrEqual(1);
  // QrOverlay stays open
  expect(screen.getByTestId("ReturnScannedQr")).toBeInTheDocument();
});

it("3.4.2.5a - Mobile: User scans non Boxtribute QR code", async () => {
  const user = userEvent.setup();
  // mock scanning a QR code
  mockImplementationOfQrReader(mockedQrReader, "NonBoxtributeQr", false);
  render(<HeaderMenuContainer />, {
    routePath: "/bases/:baseId",
    initialUrl: "/bases/1",
    mocks: [queryBoxFromOtherOrganisation],
  });

  // 3.4.1.1 - Open QROverlay
  const qrButton = await screen.findByRole("button", { name: /scan qr code/i });
  await user.click(qrButton);

  // Click a button to trigger the event of scanning a QR-Code in mockImplementationOfQrReader
  await user.click(screen.getByTestId("ReturnScannedQr"));

  // error message appears
  expect(await screen.findByText("This is not a Boxtribute QR-Code")).toBeInTheDocument();
  // QrOverlay stays open
  expect(screen.getByTestId("ReturnScannedQr")).toBeInTheDocument();
});

const queryHashNotInDb = {
  request: {
    query: GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
    variables: {
      qrCode: "HashNotInDb",
    },
  },
  result: {
    data: {
      qrCode: {
        box: null,
      },
    },
    errors: [new GraphQLError("Error!", { extensions: { code: "BAD_USER_INPUT" } })],
  },
};

it("3.4.2.5b - Mobile: User scans non Boxtribute QR code", async () => {
  const user = userEvent.setup();
  // mock scanning a QR code
  mockImplementationOfQrReader(mockedQrReader, "HashNotInDb");
  render(<HeaderMenuContainer />, {
    routePath: "/bases/:baseId",
    initialUrl: "/bases/1",
    mocks: [queryHashNotInDb],
  });

  // 3.4.1.1 - Open QROverlay
  const qrButton = await screen.findByRole("button", { name: /scan qr code/i });
  await user.click(qrButton);

  // Click a button to trigger the event of scanning a QR-Code in mockImplementationOfQrReader
  await user.click(screen.getByTestId("ReturnScannedQr"));

  // error message appears
  expect(
    (await screen.findAllByText("This is not a Boxtribute QR-Code")).length,
  ).toBeGreaterThanOrEqual(1);
  // QrOverlay stays open
  expect(screen.getByTestId("ReturnScannedQr")).toBeInTheDocument();
});

const queryInternalServerError = {
  request: {
    query: GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
    variables: {
      qrCode: "InternalServerError",
    },
  },
  result: {
    data: {
      qrCode: {
        box: null,
      },
    },
    errors: [new GraphQLError("Error!", { extensions: { code: "INTERNAL_SERVER_ERROR" } })],
  },
};

it("3.4.2.5c - Internal Server Error", async () => {
  const user = userEvent.setup();
  // mock scanning a QR code
  mockImplementationOfQrReader(mockedQrReader, "InternalServerError");
  render(<HeaderMenuContainer />, {
    routePath: "/bases/:baseId",
    initialUrl: "/bases/1",
    mocks: [queryInternalServerError],
  });

  // 3.4.1.1 - Open QROverlay
  const qrButton = await screen.findByRole("button", { name: /scan qr code/i });
  await user.click(qrButton);

  // Click a button to trigger the event of scanning a QR-Code in mockImplementationOfQrReader
  await user.click(screen.getByTestId("ReturnScannedQr"));

  // error message appears
  expect(await screen.findByText(/The search for this QR-Code failed/i)).toBeInTheDocument();
  // QrOverlay stays open
  expect(screen.getByTestId("ReturnScannedQr")).toBeInTheDocument();
}, 10000);
