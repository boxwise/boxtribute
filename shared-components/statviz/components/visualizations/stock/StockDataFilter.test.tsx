import { it, expect } from "vitest";
import { filter, tidy } from "@tidyjs/tidy";

import { userEvent } from "@testing-library/user-event";
import { render, screen } from "../../../../tests/testUtils";

import StockDataFilter from "./StockDataFilter";

it("x.x.x.x - User clicks on 'Gender' filter in drilldown chart", async () => {
  render(
    <StockDataFilter
      stockOverview={{
        facts: [
          {
            productName: "underwear",
            categoryId: 1,
            gender: "Women",
            boxesCount: 1,
            itemsCount: 806,
            sizeId: 52,
            tagIds: [46],
            boxState: "InStock",
            locationId: 100000036,
          },
          {
            productName: "underwear",
            categoryId: 1,
            gender: "Men",
            boxesCount: 1,
            itemsCount: 54,
            sizeId: 68,
            tagIds: [],
            boxState: "InStock",
            locationId: 100000036,
          },
          {
            productName: "underwear",
            categoryId: 1,
            gender: "Men",
            boxesCount: 1,
            itemsCount: 378,
            sizeId: 4,
            tagIds: [],
            boxState: "InStock",
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

  const filterDropdown = screen.getByRole("combobox");
  await userEvent.click(filterDropdown);

  const dropdownOption = screen.getByText(/gender/i);
  expect(dropdownOption).toBeInTheDocument();

  await userEvent.click(dropdownOption);

  expect(await screen.findByText(/Drilldown Chart of Instock Boxes/)).toBeInTheDocument();
});

it("should filter out only items with boxState === BoxState.InStock", () => {
  // TODO: Make the data be returned in the mocks
  const data: StockOverviewResult[] = [
    {
      __typename: "StockOverviewResult",
      boxState: "InStock",
      boxesCount: 1,
      categoryId: 1,
      gender: "UnisexAdult",
      itemsCount: 5,
      locationId: 100000036,
      productName: "underwear",
      sizeId: 42,
      tagIds: [45],
    },
    {
      __typename: "StockOverviewResult",
      boxState: "Donated",
      boxesCount: 20,
      categoryId: 2,
      gender: "UnisexAdult",
      itemsCount: 8,
      locationId: 100000036,
      productName: "underwear",
      sizeId: 38,
      tagIds: [3],
    },
    {
      __typename: "StockOverviewResult",
      boxState: "InStock",
      boxesCount: 15,
      categoryId: 1,
      gender: "UnisexAdult",
      itemsCount: 6,
      locationId: 100000036,
      productName: "underwear",
      sizeId: 40,
      tagIds: [1, 4],
    },
  ];

  const inStockFilter = filter((fact: StockOverviewResult) => fact.boxState === "InStock");
  const filteredData = tidy(data, inStockFilter) as StockOverviewResult[];

  expect(filteredData.length).toBe(2);
  expect(filteredData.every((fact) => fact.boxState === "InStock")).toBe(true);
});
