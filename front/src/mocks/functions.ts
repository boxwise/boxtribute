import { GraphQLError } from "graphql";
import { vi } from "vitest";

export function mockMatchMediaQuery(returnBool: Boolean) {
  // Jest does not implement window.matchMedia() which is used in the chackra ui hook useMediaQuery().
  // To mock a result of useMediaQuery you have to define this property. The 'matches' boolean is the return value.
  // https://jestjs.io/docs/26.x/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: returnBool,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

export class FakeGraphQLError extends GraphQLError {
  constructor(errorCode?: string, errorDescription?: string) {
    super(
      "Fake GraphQL Error",
      errorCode ? { extensions: { code: errorCode, description: errorDescription } } : undefined,
    );
  }
}

export class FakeGraphQLNetworkError extends Error {
  constructor() {
    super("Fake GraphQL Network Error");
  }
}

export const mockGraphQLError = (query, variables = {}) => ({
  request: {
    query,
    variables,
  },
  result: {
    errors: [new FakeGraphQLError()],
  },
});

// mock a network error when sending a graphQL request
export const mockNetworkError = (query, variables = {}) => ({
  request: {
    query,
    variables,
  },
  error: new FakeGraphQLNetworkError(),
});
