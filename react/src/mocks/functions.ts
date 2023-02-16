import { GraphQLError } from "graphql";

export function mockMatchMediaQuery(returnBool: Boolean) {
  // Jest does not implement window.matchMedia() which is used in the chackra ui hook useMediaQuery().
  // To mock a result of useMediaQuery you have to define this property. The 'matches' boolean is the return value.
  // https://jestjs.io/docs/26.x/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: returnBool,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// mock an Apollo GraphQLError
export const mockGraphQLError = (query, variables = {}) => ({
  request: {
    query,
  },
  variables,
  result: {
    errors: [new GraphQLError("Error!")],
  },
});

// mock a network error when sending a graphQL request
export const mockNetworkError = (query, variables = {}) => ({
  request: {
    query,
  },
  variables,
  error: new Error(),
});
