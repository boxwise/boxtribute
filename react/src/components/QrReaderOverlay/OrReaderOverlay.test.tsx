import { GraphQLError } from "graphql";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { screen, render, fireEvent } from "tests/test-utils";
import HeaderMenuContainer from "components/HeaderMenu/HeaderMenuContainer";
import { useAuth0 } from "@auth0/auth0-react";
import { useMediaQuery } from "@chakra-ui/react";
import { QrReader } from "components/QrReader/QrReader";
import { Result } from "@zxing/library";

jest.mock("@auth0/auth0-react");
jest.mock("components/QrReader/QrReader");

// .mocked() is a nice helper function from jest for typescript support
// https://jestjs.io/docs/mock-function-api/#typescript-usage
const mockedUseAuth0 = jest.mocked(useAuth0);
const mockedQrReader = jest.mocked(QrReader);

it("3.2.1 - Initial load of Page", async () => {
  // Jest does not implement window.matchMedia() which is used in the chackra ui hook useMediaQuery().
  // To mock a result of useMediaQuery you have to define this property. The 'matches' boolean is the return value.
  // https://jestjs.io/docs/26.x/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  mockedUseAuth0.mockReturnValue({
    isAuthenticated: true,
    user: { email: "dev_volunteer@boxaid.org" },
    logout: jest.fn(),
    loginWithRedirect: jest.fn(),
    getAccessTokenWithPopup: jest.fn(),
    getAccessTokenSilently: jest.fn(),
    getIdTokenClaims: jest.fn(),
    loginWithPopup: jest.fn(),
    isLoading: false,
    buildAuthorizeUrl: jest.fn(),
    buildLogoutUrl: jest.fn(),
    handleRedirectCallback: jest.fn(),
  });

  mockedQrReader.mockImplementation((props) => (
    <button
      type="button"
      data-testid="ReturnScannedQr"
      onClick={() => props.onResult(new Result("barcode=testhash", new Uint8Array([0]), 0, [], 11))}
    />
  ));
  const user = userEvent.setup();
  render(<HeaderMenuContainer />, {
    routePath: "/bases/:baseId",
    initialUrl: "/bases/1",
  });

  const qrButton = await screen.findByRole("button", { name: /scan qr code/i });
  await user.click(qrButton);

  await user.click(screen.getByTestId("ReturnScannedQr"));
});
