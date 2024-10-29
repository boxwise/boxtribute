import { it, expect } from "vitest";
import { render, screen } from "../../../../tests/testUtils";
import { FakeGraphQLError, FakeGraphQLNetworkError } from "../movedBoxes/MovedBoxes.test";
import { STOCK_QUERY } from "./StockDataContainer";
import StockDataFilter from "./StockDataFilter";
import { BoxState, ProductGender } from "../../../../types/generated/graphql";

const mockFailedStockQuery = ({ baseId = "1", networkError = false }) => ({
  request: {
    query: STOCK_QUERY,
    variables: { baseId },
  },
  result: networkError
    ? undefined
    : {
        data: null,
        errors: [new FakeGraphQLError()],
      },
  error: networkError ? new FakeGraphQLNetworkError() : undefined,
});

const stockDataFilterTests = [
  {
    name: "x.x.x.x - user scans wants to see stock data filter viz, but a network error is returned",
    mocks: [mockFailedStockQuery({ networkError: true })],
    alert: /An unexpected error happened/i,
  },
];

stockDataFilterTests.forEach(({ name }) => {
  it(name, async () => {
    render(
      <StockDataFilter
        stockOverview={{
          facts: [
            {
              productName: "underwear",
              categoryId: 1,
              gender: ProductGender.Women,
              boxesCount: 1,
              itemsCount: 806,
              sizeId: 52,
              tagIds: [46],
              boxState: BoxState.InStock,
              locationId: 100000036,
            },
            {
              productName: "underwear",
              categoryId: 1,
              gender: ProductGender.Men,
              boxesCount: 1,
              itemsCount: 54,
              sizeId: 68,
              tagIds: [],
              boxState: BoxState.InStock,
              locationId: 100000036,
            },
            {
              productName: "underwear",
              categoryId: 1,
              gender: ProductGender.Men,
              boxesCount: 1,
              itemsCount: 378,
              sizeId: 4,
              tagIds: [],
              boxState: BoxState.InStock,
              locationId: 100000036,
            },
          ],

          dimensions: {
            category: [
              { id: 1, name: "Underwear / Nightwear" },
              { id: 2, name: "Bottoms" },
            ],
            size: [
              { id: 1, name: "S" },
              { id: 2, name: "M" },
            ],
            tag: [
              { id: 45, name: "west", color: "#7973e2" },
              { id: 46, name: "seek", color: "#ce4869" },
            ],
            location: [
              { id: 100000036, name: "Stockroom" },
              { id: 100000037, name: "WH" },
            ],
          },
        }}
      />,
      {
        routePath: "/bases/:baseId/",
        initialUrl: "/bases/1/",
      },
    );

    expect(await screen.findByText(/Drilldown Chart of Instock Boxes/)).toBeInTheDocument();
  });
});
