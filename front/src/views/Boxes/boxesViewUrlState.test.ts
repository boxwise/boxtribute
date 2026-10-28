import { describe, it, expect } from "vitest";
import {
  BOXES_VIEW_URL_PARAMS,
  BOX_SORT_FIELD_TO_SORT_BY,
  IBoxesViewState,
  PAGE_SIZE,
  SORT_BY_TO_BOX_SORT_FIELD,
  clampPage,
  getCanonicalQueryString,
  getDefaultBoxesViewState,
  getMaxPage,
  getNextSort,
  hasBoxesViewParams,
  isValidDateString,
  parseBoxesViewSearchParams,
  serializeBoxesViewState,
} from "./boxesViewUrlState";

const parse = (query: string) => parseBoxesViewSearchParams(new URLSearchParams(query));

const state = (overrides: Partial<IBoxesViewState> = {}): IBoxesViewState => ({
  filters: [],
  sortBy: undefined,
  descending: false,
  page: 1,
  ...overrides,
});

describe("parseBoxesViewSearchParams", () => {
  it("returns the empty state for empty search params", () => {
    expect(parse("")).toEqual(state());
  });

  it("parses all filters, the sort and the page", () => {
    expect(
      parse(
        "state_ids=1,5&product_ids=267,350&gender_ids=2&product_category_ids=1&size_ids=52&location_ids=16,17&tag_ids=10&no_tag_ids=12&created_from=2021-01-01&created_to=2024-01-01&sort_by=weight&descending=true&page=4",
      ),
    ).toEqual({
      filters: [
        { id: "product", value: ["267", "350"] },
        { id: "state", value: ["1", "5"] },
        { id: "gender", value: ["2"] },
        { id: "productCategory", value: ["1"] },
        { id: "size", value: ["52"] },
        { id: "location", value: ["16", "17"] },
        { id: "tags", value: ["10"] },
        { id: "no_tags", value: ["12"] },
        { id: "createdOn", value: ["2021-01-01", "2024-01-01"] },
      ],
      sortBy: "weight",
      descending: true,
      page: 4,
    });
  });

  it("ignores non-numeric and duplicate IDs", () => {
    expect(parse("product_ids=1,abc,2,,1,-3,4.5").filters).toEqual([
      { id: "product", value: ["1", "2"] },
    ]);
    expect(parse("size_ids=abc").filters).toEqual([]);
  });

  it("ignores unknown state and gender IDs", () => {
    expect(parse("state_ids=1,999").filters).toEqual([{ id: "state", value: ["1"] }]);
    expect(parse("state_ids=999").filters).toEqual([]);
    expect(parse("gender_ids=42").filters).toEqual([]);
  });

  it("ignores invalid dates and keeps valid ones", () => {
    expect(parse("created_from=01.01.2021&created_to=2024-13-45").filters).toEqual([]);
    expect(parse("created_from=2021-02-30").filters).toEqual([]);
    expect(parse("created_from=2021-01-01&created_to=nope").filters).toEqual([
      { id: "createdOn", value: ["2021-01-01", ""] },
    ]);
    expect(parse("created_to=2024-01-01").filters).toEqual([
      { id: "createdOn", value: ["", "2024-01-01"] },
    ]);
  });

  it("ignores an unknown sort_by and a descending without sort_by", () => {
    expect(parse("sort_by=foo&descending=true")).toEqual(state());
    expect(parse("sort_by=toString")).toEqual(state());
    expect(parse("descending=true")).toEqual(state());
  });

  it("treats a non-boolean descending as ascending", () => {
    expect(parse("sort_by=product&descending=yes")).toEqual(
      state({ sortBy: "product", descending: false }),
    );
    expect(parse("sort_by=product")).toEqual(state({ sortBy: "product", descending: false }));
    expect(parse("sort_by=product&descending=false")).toEqual(
      state({ sortBy: "product", descending: false }),
    );
  });

  it.each([
    ["", 1],
    ["page=abc", 1],
    ["page=0", 1],
    ["page=-3", 1],
    ["page=2.5", 1],
    ["page=7", 7],
  ])("parses %s as page %s", (query, page) => {
    expect(parse(query).page).toBe(page);
  });
});

describe("serializeBoxesViewState", () => {
  it("omits empty and default values", () => {
    expect(serializeBoxesViewState(state()).toString()).toBe("");
    expect(
      serializeBoxesViewState(
        state({ filters: [{ id: "product", value: [] }], descending: true }),
      ).toString(),
    ).toBe("");
  });

  it("serializes the complete state", () => {
    expect(
      serializeBoxesViewState(
        state({
          filters: [
            { id: "state", value: ["1"] },
            { id: "gender", value: ["2", "6"] },
            { id: "no_tags", value: ["12"] },
            { id: "createdOn", value: ["2021-01-01", ""] },
          ],
          sortBy: "location",
          descending: false,
          page: 3,
        }),
      ).toString(),
    ).toBe(
      "state_ids=1&gender_ids=2%2C6&no_tag_ids=12&created_from=2021-01-01&sort_by=location&descending=false&page=3",
    );
  });

  it("builds on the existing params instead of dropping them", () => {
    const base = new URLSearchParams("page=4&sort_by=product&descending=true&other=1&state_ids=1");
    const params = serializeBoxesViewState(
      state({ filters: [{ id: "location", value: ["16"] }], sortBy: "product", descending: true }),
      base,
    );
    expect(params.get("location_ids")).toBe("16");
    expect(params.get("sort_by")).toBe("product");
    expect(params.get("descending")).toBe("true");
    // state of the view is replaced completely
    expect(params.has("state_ids")).toBe(false);
    expect(params.has("page")).toBe(false);
    // unrelated params are preserved
    expect(params.get("other")).toBe("1");
  });

  it("does not modify the passed params", () => {
    const base = new URLSearchParams("page=4");
    serializeBoxesViewState(state(), base);
    expect(base.toString()).toBe("page=4");
  });

  it("round-trips through the parser", () => {
    const original = state({
      filters: [
        { id: "product", value: ["267", "350"] },
        { id: "state", value: ["1"] },
        { id: "createdOn", value: ["2021-01-01", "2024-01-01"] },
      ],
      sortBy: "numberOfItems",
      descending: true,
      page: 2,
    });
    expect(parseBoxesViewSearchParams(serializeBoxesViewState(original))).toEqual(original);
  });
});

describe("getCanonicalQueryString", () => {
  it("is independent of the order of the URL params", () => {
    expect(getCanonicalQueryString(parse("page=2&state_ids=1&product_ids=3"))).toBe(
      getCanonicalQueryString(parse("product_ids=3&state_ids=1&page=2")),
    );
    expect(getCanonicalQueryString(parse("state_ids=1&product_ids=3&page=2"))).toBe(
      "product_ids=3&state_ids=1&page=2",
    );
  });

  it("ignores invalid values", () => {
    expect(getCanonicalQueryString(parse("state_ids=abc&sort_by=foo&page=-1"))).toBe("");
  });
});

describe("defaults and helpers", () => {
  it("defaults to InStock boxes, no sort and the first page", () => {
    expect(getDefaultBoxesViewState()).toEqual(state({ filters: [{ id: "state", value: ["1"] }] }));
  });

  it("detects whether the URL has params of the view", () => {
    expect(hasBoxesViewParams(new URLSearchParams(""))).toBe(false);
    expect(hasBoxesViewParams(new URLSearchParams("other=1"))).toBe(false);
    expect(hasBoxesViewParams(new URLSearchParams("page=2"))).toBe(true);
    expect(hasBoxesViewParams(new URLSearchParams("sort_by=product"))).toBe(true);
    expect(hasBoxesViewParams(new URLSearchParams("no_tag_ids="))).toBe(true);
    expect(BOXES_VIEW_URL_PARAMS).toContain("created_to");
  });

  it("cycles through ascending, descending and the default order", () => {
    const ascending = getNextSort({ sortBy: undefined, descending: false }, "product");
    expect(ascending).toEqual({ sortBy: "product", descending: false });
    const descending = getNextSort(ascending, "product");
    expect(descending).toEqual({ sortBy: "product", descending: true });
    expect(getNextSort(descending, "product")).toEqual({ sortBy: undefined, descending: false });
  });

  it("starts with ascending when another column is clicked", () => {
    expect(getNextSort({ sortBy: "product", descending: true }, "weight")).toEqual({
      sortBy: "weight",
      descending: false,
    });
  });

  it("maps sort_by names and BoxSortField in both directions", () => {
    Object.entries(SORT_BY_TO_BOX_SORT_FIELD).forEach(([sortBy, field]) => {
      expect(BOX_SORT_FIELD_TO_SORT_BY[field]).toBe(sortBy);
    });
    expect(Object.keys(SORT_BY_TO_BOX_SORT_FIELD)).toHaveLength(10);
  });

  it("computes and clamps the pages", () => {
    expect(getMaxPage(0)).toBe(1);
    expect(getMaxPage(null)).toBe(1);
    expect(getMaxPage(PAGE_SIZE)).toBe(1);
    expect(getMaxPage(PAGE_SIZE + 1)).toBe(2);
    expect(getMaxPage(268)).toBe(6);
    expect(clampPage(99, 268)).toBe(6);
    expect(clampPage(0, 268)).toBe(1);
    expect(clampPage(3, 268)).toBe(3);
    expect(clampPage(5, 0)).toBe(1);
  });

  it("validates dates", () => {
    expect(isValidDateString("2024-02-29")).toBe(true);
    expect(isValidDateString("2023-02-29")).toBe(false);
    expect(isValidDateString("2024-1-1")).toBe(false);
    expect(isValidDateString("2024-01-01T00:00:00Z")).toBe(false);
    expect(isValidDateString("")).toBe(false);
    expect(isValidDateString(null)).toBe(false);
  });
});
