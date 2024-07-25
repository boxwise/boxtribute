import { MockedResponse } from "@apollo/client/testing";
import { GraphQLError } from "graphql";
import { it, expect, describe } from "vitest";
import { render, screen } from "../../../../tests/testUtils";
import { STOCK_QUERY, StockDataContainer } from "./StockDataContainer";

describe("Stock Overview Visualizations", () => {
  const mockStockQuery = ({
    baseId = 1,
    networkError = false,
    graphqlError = false,
    delay = 0,
    mockData = {},
  }): MockedResponse => {
    const getResult = () => {
      if (networkError) return undefined;
      if (graphqlError)
        return {
          data: null,
          errors: [new GraphQLError("Error!")],
        };
      return {
        data: mockData,
        errors: undefined,
      };
    };
    return {
      request: {
        query: STOCK_QUERY,
        variables: { baseId },
      },
      result: getResult(),
      error: networkError ? new Error() : undefined,
      delay,
    };
  };

  it("x.x.x.x - user wants to see the stock visualizations viz, but a network error is returned", async () => {
    render(<StockDataContainer />, {
      routePath: "/bases/:baseId/statviz",
      initialUrl: "/bases/1/statviz",
      mocks: [mockStockQuery({ networkError: true })],
    });

    expect(await screen.findByText(/An unexpected error happened/i)).toBeInTheDocument();
  });

  it("x.x.x.x - user wants to see the stock visualizations viz and waits for data", async () => {
    render(<StockDataContainer />, {
      routePath: "/bases/:baseId/statviz",
      initialUrl: "/bases/1/statviz",
      mocks: [mockStockQuery({ delay: 250 })],
    });

    expect(await screen.findByText(/loading.../i)).toBeInTheDocument();
  });
});
