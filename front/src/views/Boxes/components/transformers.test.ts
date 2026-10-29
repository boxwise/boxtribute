import { describe, it, expect } from "vitest";
import {
  boxesRawDataToTableDataTransformer,
  filtersToFilterBoxInput,
  getServerPagination,
  prepareQueryVariables,
} from "./transformers";

const noSort = { sortBy: undefined, descending: false };

describe("filtersToFilterBoxInput", () => {
  it("returns an empty object without filters", () => {
    expect(filtersToFilterBoxInput([])).toEqual({});
  });

  it("maps the filters to the FilterBoxInput", () => {
    expect(
      filtersToFilterBoxInput([
        { id: "state", value: ["1", "5"] },
        { id: "gender", value: ["2", "6"] },
        { id: "product", value: ["267", "350"] },
        { id: "productCategory", value: ["1"] },
        { id: "size", value: ["52"] },
        { id: "location", value: ["16", "17"] },
        { id: "tags", value: ["10"] },
        { id: "no_tags", value: ["12"] },
        { id: "createdOn", value: ["2021-01-01", "2024-01-01"] },
      ]),
    ).toEqual({
      states: ["InStock", "Donated"],
      productGenders: ["Men", "UnisexKid"],
      productIds: [267, 350],
      productCategoryIds: [1],
      sizeIds: [52],
      locationIds: [16, 17],
      tagIds: [10],
      excludedTagIds: [12],
      createdFrom: "2021-01-01",
      createdUntil: "2024-01-01",
    });
  });

  it("drops unknown IDs and empty or invalid filter values", () => {
    expect(
      filtersToFilterBoxInput([
        { id: "state", value: ["999"] },
        { id: "gender", value: ["999"] },
        { id: "product", value: [] },
        { id: "size", value: ["abc"] },
        { id: "createdOn", value: ["", ""] },
        { id: "unknown", value: ["1"] },
      ]),
    ).toEqual({});
    expect(filtersToFilterBoxInput([{ id: "state", value: ["1", "999"] }])).toEqual({
      states: ["InStock"],
    });
  });

  it("sets only the defined end of the date range", () => {
    expect(filtersToFilterBoxInput([{ id: "createdOn", value: ["2021-01-01", ""] }])).toEqual({
      createdFrom: "2021-01-01",
    });
    expect(filtersToFilterBoxInput([{ id: "createdOn", value: ["", "2024-01-01"] }])).toEqual({
      createdUntil: "2024-01-01",
    });
    expect(filtersToFilterBoxInput([{ id: "createdOn", value: ["2021-13-01", "x"] }])).toEqual({});
  });
});

describe("filtersToFilterBoxInput search", () => {
  it("maps the search string to the pattern", () => {
    expect(filtersToFilterBoxInput([], "blue")).toEqual({ pattern: "blue" });
  });

  it("omits the pattern for an empty or whitespace-only search string", () => {
    expect(filtersToFilterBoxInput([], "")).toEqual({});
    expect(filtersToFilterBoxInput([], "   ")).toEqual({});
    expect(filtersToFilterBoxInput([])).toEqual({});
  });
});

describe("getServerPagination", () => {
  it("fetches the UI pages 1 and 2 with the first request", () => {
    expect(getServerPagination(1)).toEqual({ page: 1, pageSize: 100 });
    expect(getServerPagination(2)).toEqual({ page: 1, pageSize: 100 });
  });

  it("fetches the UI pages 3 and following one by one", () => {
    expect(getServerPagination(3)).toEqual({ page: 3, pageSize: 50 });
    expect(getServerPagination(10)).toEqual({ page: 10, pageSize: 50 });
  });
});

describe("prepareQueryVariables", () => {
  it("converts the base ID to a number", () => {
    expect(prepareQueryVariables("2", { filters: [], search: "", ...noSort, page: 1 }).baseId).toBe(
      2,
    );
    expect(prepareQueryVariables(7, { filters: [], search: "", ...noSort, page: 1 }).baseId).toBe(
      7,
    );
  });

  it("omits sortBy and descending for the default sort", () => {
    expect(
      prepareQueryVariables("2", {
        filters: [{ id: "state", value: ["1"] }],
        search: "",
        ...noSort,
        descending: true,
        page: 1,
      }),
    ).toEqual({
      baseId: 2,
      options: { page: 1, pageSize: 100, filters: { states: ["InStock"] } },
    });
  });

  it("includes the search string as pattern", () => {
    expect(
      prepareQueryVariables("2", {
        filters: [{ id: "state", value: ["1"] }],
        search: "red shirt",
        ...noSort,
        page: 1,
      }).options,
    ).toEqual({
      page: 1,
      pageSize: 100,
      filters: { states: ["InStock"], pattern: "red shirt" },
    });
  });

  it("includes sortBy and descending for a sorted view", () => {
    expect(
      prepareQueryVariables("2", {
        filters: [],
        search: "",
        sortBy: "product",
        descending: false,
        page: 1,
      }).options,
    ).toEqual({ page: 1, pageSize: 100, filters: {}, sortBy: "ProductName", descending: false });
    expect(
      prepareQueryVariables("2", {
        filters: [],
        search: "",
        sortBy: "monetaryValue",
        descending: true,
        page: 5,
      }).options,
    ).toEqual({ page: 5, pageSize: 50, filters: {}, sortBy: "MonetaryValue", descending: true });
  });

  it("requests the UI page directly if it is beyond the first request", () => {
    expect(prepareQueryVariables("1", { filters: [], search: "", ...noSort, page: 4 })).toEqual({
      baseId: 1,
      options: { page: 4, pageSize: 50, filters: {} },
    });
  });
});

describe("boxesRawDataToTableDataTransformer", () => {
  const row = {
    __typename: "BoxRow",
    id: "2",
    labelIdentifier: "1481666",
    numberOfItems: 23,
    comment: "a comment",
    weight: 4.5,
    monetaryValue: 12.5,
    weightUnitSymbol: "kg",
    createdOn: "2021-10-29T15:02:40+00:00",
    lastModifiedOn: "2023-01-09T17:24:29+00:00",
    createdByName: "Some User",
    lastModifiedByName: "Another User",
    state: "InStock",
    productName: "Sweatpants",
    productGender: "Men",
    containsStandardProduct: true,
    productCategoryName: "Bottoms",
    sizeName: "Mixed",
    locationName: "Stockroom",
    shipmentId: null,
    hasQrCode: true,
    tagIds: ["11", "999", "10"],
  } as any;

  const actionOptionsData = {
    base: {
      monetaryCurrencyCode: "EUR",
      tags: [
        { id: "10", name: "company X", color: "#f37167" },
        { id: "11", name: "new", color: "#d89016" },
      ],
    },
  } as any;

  it("maps the flat rows and resolves the tags and the currency from the action options", () => {
    const [box] = boxesRawDataToTableDataTransformer({ page: [row] }, actionOptionsData);
    expect(box).toMatchObject({
      id: "2",
      labelIdentifier: "1481666",
      productName: "Sweatpants",
      productCategoryName: "Bottoms",
      productGender: "Men",
      containsStandardProduct: true,
      sizeName: "Mixed",
      locationName: "Stockroom",
      state: "InStock",
      numberOfItems: 23,
      weight: 4.5,
      weightUnitSymbol: "kg",
      monetaryValue: 12.5,
      currency: "EUR",
      hasQrCode: true,
      comment: "a comment",
      createdBy: "Some User",
      lastModifiedBy: "Another User",
      shipmentId: null,
    });
    // in the order of tagIds; unknown tags are skipped
    expect(box.tags.map(({ name }) => name)).toEqual(["new", "company X"]);
    expect(box.createdOn).toEqual(new Date("2021-10-29T15:02:40+00:00"));
    expect(box.lastModified).toEqual(new Date("2023-01-09T17:24:29+00:00"));
    expect(box.age).toBeGreaterThan(0);
  });

  it("handles missing values", () => {
    const [box] = boxesRawDataToTableDataTransformer(
      {
        page: [
          {
            ...row,
            comment: null,
            weight: null,
            monetaryValue: null,
            weightUnitSymbol: null,
            hasQrCode: false,
            tagIds: [],
            createdOn: null,
            shipmentId: "3",
          },
        ],
      },
      { base: null } as any,
    );
    expect(box.comment).toBeNull();
    expect(box.weight).toBeNull();
    expect(box.currency).toBeNull();
    expect(box.hasQrCode).toBe(false);
    expect(box.tags).toEqual([]);
    expect(box.createdOn).toBeNull();
    expect(box.shipmentId).toBe("3");
  });

  it("returns an empty list for an empty page", () => {
    expect(boxesRawDataToTableDataTransformer({ page: [] }, actionOptionsData)).toEqual([]);
  });
});
