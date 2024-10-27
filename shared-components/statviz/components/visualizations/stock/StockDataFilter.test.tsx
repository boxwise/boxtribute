import { it, expect } from "vitest";
import StockDataFilter from "./StockDataFilter";
import { render, screen } from "../../../../tests/testUtils";

const stockDataFilterTests = [
  {
    name: "x.x.x.x - user scans wants to see stock data filter viz, but a network error is returned",
    // mocks: [mockFailedMovedBoxesQuery({ networkError: true })],
    alert: /An unexpected error happened/i,
  },
];

stockDataFilterTests.forEach(({ name, alert }) => {
  it(name, async () => {
    render(
      <StockDataFilter
        //   TODO: Get STOCK_QUERY data to use in tests
        stockOverview={{
          facts: [],
        }}
      />,
      {
        routePath: "/bases/:baseId/",
        initialUrl: "/bases/1/",
      },
    );

    expect(await screen.findByText(alert)).toBeInTheDocument();
  });
});
