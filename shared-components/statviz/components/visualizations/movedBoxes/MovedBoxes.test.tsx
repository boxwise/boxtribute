import { it, expect } from "vitest";
import MovedBoxesDataContainer, { MOVED_BOXES_QUERY } from "./MovedBoxesDataContainer";
import { render, screen } from "../../../../tests/testUtils";
import { GraphQLError } from "graphql";

export class MockedGraphQLError extends GraphQLError {
  constructor(errorCode?: string, errorDescription?: string) {
    super(
      "Mocked GraphQL Error",
      errorCode ? { extensions: { code: errorCode, description: errorDescription } } : undefined,
    );
  }
}

export class MockedGraphQLNetworkError extends Error {
  constructor() {
    super("Mocked GraphQL Network Error!");
  }
}

const mockFailedMovedBoxesQuery = ({ baseId = "1", networkError = false }) => ({
  request: {
    query: MOVED_BOXES_QUERY,
    variables: { baseId },
  },
  result: networkError
    ? undefined
    : {
        data: null,
        errors: [new MockedGraphQLError()],
      },
  error: networkError ? new MockedGraphQLNetworkError() : undefined,
});

const movedBoxesDataTests = [
  {
    name: "x.x.x.x - user scans wants to see movedBoxes viz, but a network error is returned",
    mocks: [mockFailedMovedBoxesQuery({ networkError: true })],
    alert: /An unexpected error happened/i,
  },
];

movedBoxesDataTests.forEach(({ name, mocks, alert }) => {
  it(name, async () => {
    render(<MovedBoxesDataContainer />, {
      routePath: "/bases/:baseId/",
      initialUrl: "/bases/1/",
      mocks,
    });

    expect(await screen.findByText(alert)).toBeInTheDocument();
  });
});
