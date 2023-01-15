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
