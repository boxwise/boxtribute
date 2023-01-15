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
import { GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE } from "utils/queries";

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
      qrCode: "testhash",
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
  mockMatchMediaQuery("(max-width: 1070px)", true);
  mockAuthenticatedUser(mockedUseAuth0, "dev_volunteer@boxaid.org");
  mockImplementationOfQrReader(mockedQrReader);
});

it("3.4.2.1 - Mobile: User scans QR code of same org without previously associated box", async () => {
  const user = userEvent.setup();
  render(<HeaderMenuContainer />, {
    routePath: "/bases/:baseId",
    initialUrl: "/bases/1",
    mocks: [queryNoBoxAssociatedWithQrCode],
    additionalRoute: "/bases/1/boxes/create/testhash",
  });

  const qrButton = await screen.findByRole("button", { name: /scan qr code/i });
  await user.click(qrButton);

  await user.click(screen.getByTestId("ReturnScannedQr"));
  expect(
    await screen.findByRole("heading", { name: "/bases/1/boxes/create/testhash" }),
  ).toBeInTheDocument();
  expect(screen.getByText(/Scanned QR code is not assigned to a box yet/i)).toBeInTheDocument();
});
