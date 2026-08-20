import { describe, it, expect, vi, beforeEach } from "vitest";
import { Accordion } from "@chakra-ui/react";
import { format, subMonths } from "date-fns";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "../../tests/testUtils";
import StockOverview from "./StockOverview";
import { STOCK_QUERY, CREATED_BOXES_QUERY } from "../queries/queries";
import type {
  IProductOption,
  ICategoryOption,
  ILocationOption,
  ITagOption,
} from "../utils/dashboardFilters";

// ---------------------------------------------------------------------------
// Mock the nivo chart primitives so we can verify data without SVG rendering
// ---------------------------------------------------------------------------

vi.mock("../components/nivo/PieChart", () => ({
  default: ({ data }: { data: { id: string; value: number }[] }) => (
    <div data-testid="pie-chart">
      {data.map((d) => (
        <div key={d.id} data-testid="pie-slice" data-id={d.id} data-value={String(d.value)}>
          {`${d.id}: ${d.value}`}
        </div>
      ))}
    </div>
  ),
}));

vi.mock("../components/nivo/BarChart", () => ({
  default: ({ data }: { data: Record<string, unknown>[] }) => (
    <div data-testid="bar-chart">
      {data.map((d, i) => (
        <div key={i} data-testid="bar-category" data-category={String(d.categoryName)}>
          {String(d.categoryName)}
        </div>
      ))}
    </div>
  ),
}));

vi.mock("../components/nivo/CalendarChart", () => ({
  default: ({ data }: { data: { day: string; value: number }[] }) => (
    <div data-testid="calendar-chart">
      {data.map((d) => (
        <div key={d.day} data-testid="calendar-day" data-day={d.day}>
          {`${d.day}: ${d.value}`}
        </div>
      ))}
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Shared test data
// ---------------------------------------------------------------------------

const products: IProductOption[] = [
  { id: 1, name: "Shoes", gender: "Male" },
  { id: 2, name: "Shirts", gender: "Female" },
  { id: 3, name: "Pants", gender: null },
];

const categories: ICategoryOption[] = [
  { id: 1, name: "Footwear" },
  { id: 2, name: "Clothes" },
  { id: 3, name: "Accessories" },
];

const locations: ILocationOption[] = [
  { id: 1, name: "Warehouse A" },
  { id: 2, name: "Warehouse B" },
  { id: 3, name: "Warehouse C" },
];

const tags: ITagOption[] = [
  { id: 1, name: "Tag A", color: "#ff0000", type: "Box", value: "1", label: "Tag A", urlId: "1" },
  { id: 2, name: "Tag B", color: "#00ff00", type: "Box", value: "2", label: "Tag B", urlId: "2" },
  { id: 3, name: "Tag C", color: "#0000ff", type: "Box", value: "3", label: "Tag C", urlId: "3" },
];

// Dates used in CREATED_BOXES_QUERY facts
const oneMonthAgo = format(subMonths(new Date(), 1), "yyyy-MM-dd");
const fiveMonthsAgo = format(subMonths(new Date(), 5), "yyyy-MM-dd");
const tenMonthsAgo = format(subMonths(new Date(), 10), "yyyy-MM-dd");
const fifteenMonthsAgo = format(subMonths(new Date(), 15), "yyyy-MM-dd"); // outside 1-year window

// STOCK_QUERY mock: 3 InStock facts (Shoes/Male, Shirts/Female, Pants/null) + Donated + Lost
// NOTE: dimension ids are Int (not ID string) per the GraphQL schema's BasicDimensionInfo type
const stockMock = {
  request: {
    query: STOCK_QUERY,
    variables: { baseId: 1 },
  },
  result: {
    data: {
      stockOverview: {
        facts: [
          {
            // productName is lowercase to match the backend convention (used with p.name.toLowerCase() in the filter)
            productName: "shoes",
            categoryId: 1,
            gender: "Male",
            boxesCount: 5,
            itemsCount: 10,
            sizeId: 1,
            tagIds: [1],
            boxState: "InStock",
            locationId: 1,
          },
          {
            productName: "shirts",
            categoryId: 2,
            gender: "Female",
            boxesCount: 3,
            itemsCount: 6,
            sizeId: 1,
            tagIds: [2],
            boxState: "InStock",
            locationId: 2,
          },
          {
            productName: "pants",
            categoryId: 3,
            gender: null,
            boxesCount: 7,
            itemsCount: 14,
            sizeId: 1,
            tagIds: [3],
            boxState: "InStock",
            locationId: 3,
          },
          // Donated – must be excluded from ring/bar charts
          {
            productName: "shoes",
            categoryId: 1,
            gender: "Male",
            boxesCount: 2,
            itemsCount: 4,
            sizeId: 1,
            tagIds: [],
            boxState: "Donated",
            locationId: 1,
          },
          // Lost – must be excluded from ring/bar charts
          {
            productName: "shirts",
            categoryId: 2,
            gender: "Female",
            boxesCount: 1,
            itemsCount: 2,
            sizeId: 1,
            tagIds: [],
            boxState: "Lost",
            locationId: 2,
          },
        ],
        dimensions: {
          // id is Int per BasicDimensionInfo in the schema
          category: [
            { id: 1, name: "Footwear" },
            { id: 2, name: "Clothes" },
            { id: 3, name: "Accessories" },
          ],
          size: [{ id: 1, name: "Medium" }],
          tag: [
            { id: 1, name: "Tag A", color: "#ff0000" },
            { id: 2, name: "Tag B", color: "#00ff00" },
            { id: 3, name: "Tag C", color: "#0000ff" },
          ],
          location: [
            { id: 1, name: "Warehouse A" },
            { id: 2, name: "Warehouse B" },
            { id: 3, name: "Warehouse C" },
          ],
        },
      },
    },
  },
};

// CREATED_BOXES_QUERY mock: 4 facts – 3 within the last year, 1 from 15 months ago
const createdBoxesMock = {
  request: {
    query: CREATED_BOXES_QUERY,
    variables: { baseId: 1 },
  },
  result: {
    data: {
      createdBoxes: {
        facts: [
          // 1 month ago – within 1-year window
          {
            boxesCount: 5,
            productId: 1,
            categoryId: 1,
            createdOn: oneMonthAgo,
            tagIds: [1],
            gender: "Male",
            itemsCount: 10,
          },
          // 5 months ago – within 1-year window
          {
            boxesCount: 3,
            productId: 2,
            categoryId: 2,
            createdOn: fiveMonthsAgo,
            tagIds: [2],
            gender: "Female",
            itemsCount: 6,
          },
          // 10 months ago – within 1-year window
          {
            boxesCount: 7,
            productId: 1,
            categoryId: 1,
            createdOn: tenMonthsAgo,
            tagIds: [1],
            gender: "Male",
            itemsCount: 14,
          },
          // 15 months ago – OUTSIDE the default 1-year window, should be filtered out
          {
            boxesCount: 2,
            productId: 3,
            categoryId: 3,
            createdOn: fifteenMonthsAgo,
            tagIds: [3],
            gender: null,
            itemsCount: 4,
          },
        ],
        dimensions: {
          product: [
            { id: 1, name: "Shoes", gender: "Male" },
            { id: 2, name: "Shirts", gender: "Female" },
            { id: 3, name: "Pants", gender: null },
          ],
          category: [
            { id: 1, name: "Footwear" },
            { id: 2, name: "Clothes" },
            { id: 3, name: "Accessories" },
          ],
          tag: [
            { id: 1, name: "Tag A", color: "#ff0000" },
            { id: 2, name: "Tag B", color: "#00ff00" },
            { id: 3, name: "Tag C", color: "#0000ff" },
          ],
        },
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Render helper
// ---------------------------------------------------------------------------

function renderStockOverview(urlSuffix = "") {
  return render(
    <Accordion defaultIndex={[0]}>
      <StockOverview
        isActive={true}
        products={products}
        categories={categories}
        locations={locations}
        tags={tags}
      />
    </Accordion>,
    {
      routePath: "/bases/:baseId/",
      initialUrl: `/bases/1/${urlSuffix}`,
      mocks: [stockMock, createdBoxesMock],
    },
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("StockOverview", () => {
  beforeEach(() => {
    // Suppress console.error noise from Apollo MockedProvider exhausted mocks
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  // -------------------------------------------------------------------------
  // No-filter baseline
  // -------------------------------------------------------------------------

  describe("without filters", () => {
    it("ring chart shows only InStock data (Donated and Lost facts are excluded)", async () => {
      renderStockOverview();

      // InStock: Shoes/Footwear=5, Shirts/Clothes=3, Pants/Accessories=7
      // If Donated (Shoes+2) or Lost (Shirts+1) were included the values would differ
      expect(await screen.findByText("Footwear: 5")).toBeInTheDocument();
      expect(screen.getByText("Clothes: 3")).toBeInTheDocument();
      expect(screen.getByText("Accessories: 7")).toBeInTheDocument();
      // Exactly 3 slices – proves non-InStock data is not rendered as extra slices
      expect(screen.getAllByTestId("pie-slice")).toHaveLength(3);
    });

    it("bar chart shows only InStock categories (3 categories, Donated/Lost excluded)", async () => {
      renderStockOverview();

      // Wait for data to load – bar chart heading appears when data is present
      expect(await screen.findByText("Product Categories by Gender")).toBeInTheDocument();
      expect(screen.getAllByTestId("bar-category")).toHaveLength(3);
    });

    it("calendar chart shows only the 3 facts within the last year (15-month fact excluded)", async () => {
      renderStockOverview();

      // Wait for data to load – calendar heading appears when data is present
      expect(await screen.findByText("Box Creation over Time")).toBeInTheDocument();
      // 3 calendar day entries: 1 month, 5 months, 10 months ago
      expect(screen.getAllByTestId("calendar-day")).toHaveLength(3);
    });

    it("shows no filter chips when no filters are applied", async () => {
      renderStockOverview();

      // Wait until charts are visible so the component has fully rendered
      await screen.findByText("Footwear: 5");
      expect(screen.queryByTestId("stock-clear-all-filters-button")).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Product filter
  // -------------------------------------------------------------------------

  describe("product filter", () => {
    it("shows only the matching product in ring, bar, and calendar; displays filter chip", async () => {
      // sp=1 → product id 1 (Shoes, Male)
      renderStockOverview("?sp=1");

      // Ring chart: only InStock Shoes fact (cat=Footwear, boxesCount=5)
      expect(await screen.findByText("Footwear: 5")).toBeInTheDocument();
      expect(screen.getAllByTestId("pie-slice")).toHaveLength(1);

      // Bar chart: only Footwear category
      expect(screen.getAllByTestId("bar-category")).toHaveLength(1);
      expect(screen.getByText("Footwear")).toBeInTheDocument();

      // Calendar: 2 facts match productId=1 (1 month + 10 months ago)
      expect(screen.getAllByTestId("calendar-day")).toHaveLength(2);

      // Filter chip shows "Shoes (Male)"
      expect(screen.getByText("Shoes (Male)")).toBeInTheDocument();
      expect(screen.getByTestId("stock-clear-all-filters-button")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Gender filter
  // -------------------------------------------------------------------------

  describe("gender filter", () => {
    it("shows only the matching gender in ring, bar, and calendar; displays filter chip", async () => {
      // sg=Male
      renderStockOverview("?sg=Male");

      // Ring chart: only Male InStock (Shoes, Footwear, boxesCount=5)
      expect(await screen.findByText("Footwear: 5")).toBeInTheDocument();
      expect(screen.getAllByTestId("pie-slice")).toHaveLength(1);

      // Bar chart: only Footwear
      expect(screen.getAllByTestId("bar-category")).toHaveLength(1);

      // Calendar: 2 facts have gender=Male (1 month + 10 months ago)
      expect(screen.getAllByTestId("calendar-day")).toHaveLength(2);

      // Filter chip
      expect(screen.getByText("Male")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Category filter
  // -------------------------------------------------------------------------

  describe("category filter", () => {
    it("shows only the matching category in ring, bar, and calendar; displays filter chip", async () => {
      // sc=1 → category id 1 (Footwear)
      renderStockOverview("?sc=1");

      // Ring chart: only Footwear InStock (boxesCount=5)
      expect(await screen.findByText("Footwear: 5")).toBeInTheDocument();
      expect(screen.getAllByTestId("pie-slice")).toHaveLength(1);

      // Bar chart: only Footwear
      expect(screen.getAllByTestId("bar-category")).toHaveLength(1);

      // Calendar: 2 facts have categoryId=1 (1 month + 10 months ago)
      expect(screen.getAllByTestId("calendar-day")).toHaveLength(2);

      // Filter chip for category "Footwear" is shown (identified by its close button testid)
      expect(screen.getByTestId("stock-filter-chip-close-category-1")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Location filter
  // -------------------------------------------------------------------------

  describe("location filter", () => {
    it("filters ring and bar by location; calendar is NOT affected by location filter", async () => {
      // sl=2 → location id 2 (Warehouse B)
      renderStockOverview("?sl=2");

      // Ring chart: only InStock Shirts (locationId=2, Clothes, boxesCount=3)
      expect(await screen.findByText("Clothes: 3")).toBeInTheDocument();
      expect(screen.getAllByTestId("pie-slice")).toHaveLength(1);

      // Bar chart: only Clothes
      expect(screen.getAllByTestId("bar-category")).toHaveLength(1);

      // Calendar is NOT filtered by location – still shows all 3 within-range facts
      expect(screen.getAllByTestId("calendar-day")).toHaveLength(3);

      // Filter chip shows location name
      expect(screen.getByText("Warehouse B")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Included-tag filter
  // -------------------------------------------------------------------------

  describe("included tag filter", () => {
    it("shows only data with the included tag; displays filter chip without strikethrough", async () => {
      // st=1 → include tag id 1 (Tag A)
      renderStockOverview("?st=1");

      // Ring: only InStock fact with tagIds=[1] (Shoes/Footwear, boxesCount=5)
      expect(await screen.findByText("Footwear: 5")).toBeInTheDocument();
      expect(screen.getAllByTestId("pie-slice")).toHaveLength(1);

      // Bar: only Footwear
      expect(screen.getAllByTestId("bar-category")).toHaveLength(1);

      // Calendar: 2 facts have tagIds=[1] within the 1-year window (1m + 10m ago)
      expect(screen.getAllByTestId("calendar-day")).toHaveLength(2);

      // Filter chip shows tag label (no strikethrough for include)
      const chip = screen.getByText("Tag A");
      expect(chip).toBeInTheDocument();
      expect(chip).not.toHaveStyle({ textDecoration: "line-through" });
    });
  });

  // -------------------------------------------------------------------------
  // Excluded-tag filter
  // -------------------------------------------------------------------------

  describe("excluded tag filter", () => {
    it("hides data with the excluded tag; displays filter chip with strikethrough", async () => {
      // snt=1 → exclude tag id 1 (Tag A)
      renderStockOverview("?snt=1");

      // Ring: 2 InStock facts without tag1 – Shirts/Clothes(3) and Pants/Accessories(7)
      expect(await screen.findByText("Clothes: 3")).toBeInTheDocument();
      expect(screen.getByText("Accessories: 7")).toBeInTheDocument();
      expect(screen.getAllByTestId("pie-slice")).toHaveLength(2);

      // Bar: 2 categories
      expect(screen.getAllByTestId("bar-category")).toHaveLength(2);

      // Calendar: 1 within-range fact without tag1 (5 months ago, tagIds=[2])
      expect(screen.getAllByTestId("calendar-day")).toHaveLength(1);

      // Filter chip shows "Tag A" with strikethrough styling
      const chip = screen.getByText("Tag A");
      expect(chip).toBeInTheDocument();
      expect(chip).toHaveStyle({ textDecoration: "line-through" });
    });
  });

  // -------------------------------------------------------------------------
  // Excluded-tag filter AND category filter
  // -------------------------------------------------------------------------

  describe("category and excluded tag filter", () => {
    it("filters by category and hides data with the excluded tag", async () => {
      // snt=1 → exclude tag id 1 (Tag A)
      // sc=2 → category id 2 (Clothes)
      renderStockOverview("?snt=1&sc=2");

      // Ring: 1 InStock fact without tag1 – Shirts/Clothes(3)
      expect(await screen.findByText("Clothes: 3")).toBeInTheDocument();
      expect(screen.getAllByTestId("pie-slice")).toHaveLength(1);

      // Bar: 2 categories
      expect(screen.getAllByTestId("bar-category")).toHaveLength(1);

      // Calendar: 1 within-range fact without tag1 and with category 2
      expect(screen.getAllByTestId("calendar-day")).toHaveLength(1);

      // Filter chip shows "Tag A" with strikethrough styling
      const chip = screen.getByText("Tag A");
      expect(chip).toBeInTheDocument();
      expect(chip).toHaveStyle({ textDecoration: "line-through" });

      // Filter chip for category "Clothes" is shown (identified by its close button testid)
      expect(screen.getByTestId("stock-filter-chip-close-category-2")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Clear filters
  // -------------------------------------------------------------------------

  describe("clear filters", () => {
    it("removes a specific filter when the chip close button is clicked", async () => {
      const user = userEvent.setup();
      renderStockOverview("?sp=1");

      // Wait for filtered state – only Footwear visible
      await screen.findByText("Footwear: 5");
      expect(screen.getAllByTestId("pie-slice")).toHaveLength(1);

      // Click the close button on the "Shoes (Male)" chip
      const closeBtn = screen.getByTestId("stock-filter-chip-close-product-1");
      await user.click(closeBtn);

      // After clearing the product filter, all 3 InStock categories should appear again
      await waitFor(() => {
        expect(screen.getAllByTestId("pie-slice")).toHaveLength(3);
      });
      expect(screen.queryByTestId("stock-clear-all-filters-button")).not.toBeInTheDocument();
    });

    it("clears all filters via the 'Clear filters (N)' button next to the chips", async () => {
      const user = userEvent.setup();
      renderStockOverview("?sp=1");

      await screen.findByText("Footwear: 5");
      expect(screen.getAllByTestId("pie-slice")).toHaveLength(1);

      // Click the "Clear filters (1)" button
      const clearAllBtn = screen.getByTestId("stock-clear-all-filters-button");
      expect(clearAllBtn).toHaveTextContent("Clear filters (1)");
      await user.click(clearAllBtn);

      // All 3 InStock categories visible again
      await waitFor(() => {
        expect(screen.getAllByTestId("pie-slice")).toHaveLength(3);
      });
      expect(screen.queryByTestId("stock-clear-all-filters-button")).not.toBeInTheDocument();
    });

    it("clears filters via the 'Clear filters' button inside the filter panel followed by Apply", async () => {
      const user = userEvent.setup();
      renderStockOverview("?sp=1");

      await screen.findByText("Footwear: 5");

      // Open the filter panel drawer
      const openBtn = screen.getByTestId("stockfilters-drawer-button");
      await user.click(openBtn);

      // The drawer should appear – wait for the Clear-filters button inside
      const clearInPanelBtn = await screen.findByTestId("stock-filter-clear");
      await user.click(clearInPanelBtn);

      // Click Apply to commit the cleared state
      const applyBtn = screen.getByTestId("stock-filter-apply");
      await user.click(applyBtn);

      // All 3 InStock categories visible again, no chips
      await waitFor(() => {
        expect(screen.getAllByTestId("pie-slice")).toHaveLength(3);
      });
      expect(screen.queryByTestId("stock-clear-all-filters-button")).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Boxes / items count switch
  // -------------------------------------------------------------------------

  describe("boxes / items count switch", () => {
    it("defaults to boxes count and switches to items count when the select is changed", async () => {
      const user = userEvent.setup();
      renderStockOverview();

      // Default: boxes count – ring shows boxesCount values (5, 3, 7)
      expect(await screen.findByText("Footwear: 5")).toBeInTheDocument();
      expect(screen.getByText("Clothes: 3")).toBeInTheDocument();
      expect(screen.getByText("Accessories: 7")).toBeInTheDocument();
      expect(screen.getByText("Instock Boxes")).toBeInTheDocument();
      // Calendar heading also reflects boxes count
      expect(screen.getByText("Box Creation over Time")).toBeInTheDocument();

      // Switch to items count via the boxes/items native select (identified by its current display value)
      const select = screen.getByDisplayValue("Boxes");
      await user.selectOptions(select, "itemsCount");

      // Ring now shows itemsCount values (10, 6, 14) and updated heading
      await waitFor(() => {
        expect(screen.getByText("Footwear: 10")).toBeInTheDocument();
        expect(screen.getByText("Clothes: 6")).toBeInTheDocument();
        expect(screen.getByText("Accessories: 14")).toBeInTheDocument();
      });
      expect(screen.getByText("Instock Items")).toBeInTheDocument();
      expect(screen.getByText("Item Creation over Time")).toBeInTheDocument();
    });
  });
});
