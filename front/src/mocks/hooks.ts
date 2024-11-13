import { JWT_ROLE, JWT_ABP, JWT_BETA } from "utils/constants";
import { vi } from "vitest";
/**
 * Mocking the return value of the useAuth0 hook. This is needed to mock the authentication of a test user
 * To mock an authenticated user you have to
 * - add a mock of the path for imports by adding `vi.mock("@auth0/auth0-react")` at the top of your test file.
 * - mock the acctual hook by adding `const mockedUseAuth0 = vi.mocked(useAuth0);` in your testfile
 * - set the return value of useAuth0 by passing mockedUseAuth0 to the function below.
 *
 * @param mockedUseAuth0 - The mocked useAuth0 hook whose return value needs to be set
 * @param email - the email of the test user you want to mock that it is authenticated
 * @returns mocked `Auth0ContextInterface<TUser>` for an authenticated user. Check https://auth0.github.io/auth0-react/functions/useAuth0.html for the definition.
 */

export function mockAuthenticatedUser(mockedUseAuth0: any, email: string, actions = ["be_user"], betaUser = "0", roles = "administrator") {
  mockedUseAuth0.mockReturnValue({
    isAuthenticated: true,
    user: {
      email,
      JWT_ABP: actions,
      JWT_BETA: betaUser,
      JWT_ROLE: roles,
    },
    logout: vi.fn(),
    loginWithRedirect: vi.fn(),
    getAccessTokenWithPopup: vi.fn(),
    getAccessTokenSilently: vi.fn(),
    getIdTokenClaims: vi.fn(),
    loginWithPopup: vi.fn(),
    isLoading: false,
    buildAuthorizeUrl: vi.fn(),
    buildLogoutUrl: vi.fn(),
    handleRedirectCallback: vi.fn(),
  });
}
