/**
 * Mocking the return value of the useAuth0 hook. This is needed to mock the authentication of a test user
 * To mock an authenticated user you have to
 * - add a mock of the path for imports by adding `jest.mock("@auth0/auth0-react")` at the top of your test file.
 * - mock the acctual hook by adding `const mockedUseAuth0 = jest.mocked(useAuth0);` in your testfile
 * - set the return value of useAuth0 by passing mockedUseAuth0 to the function below.
 *
 * @param mockedUseAuth0 - The mocked useAuth0 hook whose return value needs to be set
 * @param email - the email of the test user you want to mock that it is authenticated
 * @returns mocked `Auth0ContextInterface<TUser>` for an authenticated user. Check https://auth0.github.io/auth0-react/functions/useAuth0.html for the definition.
 */

export function mockAuthenticatedUser(mockedUseAuth0: jest.MockedFunctionDeep<any>, email: string) {
  mockedUseAuth0.mockReturnValue({
    isAuthenticated: true,
    user: { email: email },
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
}
