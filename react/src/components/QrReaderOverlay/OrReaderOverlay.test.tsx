import { GraphQLError } from "graphql";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { screen, render, fireEvent } from "tests/test-utils";
import HeaderMenuContainer from "components/HeaderMenu/HeaderMenuContainer";
import { useAuth0 } from "@auth0/auth0-react";
import { QrReader } from "components/QrReader/QrReader";
import { mockMatchMediaQuery } from "mocks/functions";
import { mockAuthenticatedUser } from "mocks/hooks";
import { mockImplementationOfQrReader } from "mocks/components";
import { GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE } from "queries/queries";
import { generateMockBox } from "mocks/boxes";

jest.mock("@auth0/auth0-react");
jest.mock("components/QrReader/QrReader");

// .mocked() is a nice helper function from jest for typescript support
// https://jestjs.io/docs/mock-function-api/#typescript-usage
const mockedUseAuth0 = jest.mocked(useAuth0);
const mockedQrReader = jest.mocked(QrReader);

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

beforeEach(() => {
  // setting the screensize to
  mockMatchMediaQuery(true);
  mockAuthenticatedUser(mockedUseAuth0, "dev_volunteer@boxaid.org");
});

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

  // Open QROverlay
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

  // Open QROverlay
  const qrButton = await screen.findByRole("button", { name: /scan qr code/i });
  await user.click(qrButton);

  // Click a button to trigger the event of scanning a QR-Code in mockImplementationOfQrReader
  await user.click(screen.getByTestId("ReturnScannedQr"));
  expect(
    await screen.findByRole("heading", { name: "/bases/1/boxes/123" }),
  ).toBeInTheDocument();
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
    errors: [new GraphQLError("Error!", {extensions: {code:"FORBIDDEN"} })],
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

  // Open QROverlay
  const qrButton = await screen.findByRole("button", { name: /scan qr code/i });
  await user.click(qrButton);

  // Click a button to trigger the event of scanning a QR-Code in mockImplementationOfQrReader
  await user.click(screen.getByTestId("ReturnScannedQr"));

  // error message appears
  expect(await screen.findByText("You don't have access to the box assigned to this QR code")).toBeInTheDocument();
  // QrOverlay stays open
  expect(screen.getByTestId("ReturnScannedQr")).toBeInTheDocument();
});
