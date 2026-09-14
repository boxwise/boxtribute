import { describe, it, expect, vi, beforeEach } from "vitest";
import { Accordion } from "@chakra-ui/react";
import { format, subMonths } from "date-fns";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "../../tests/testUtils";
import BeneficiaryOverview from "./BeneficiaryOverview";
import {
  BENEFICIARY_FIGURES_QUERY,
  BENEFICIARY_REACH_QUERY,
  DEMOGRAPHIC_QUERY,
} from "../queries/queries";
import type { ITagOption } from "../utils/dashboardFilters";

// ---------------------------------------------------------------------------
// Mock the nivo/visx chart primitives so we can verify data without SVG
// rendering / ResizeObserver issues in jsdom.
// ---------------------------------------------------------------------------

vi.mock("../components/nivo/BarChart", () => ({
  default: ({ data, keys }: { data: Record<string, unknown>[]; keys: string[] }) => (
    <div data-testid="reach-bar-chart">
      {data.flatMap((d) =>
        keys
          .filter((k) => Number(d[k]) > 0)
          .map((k) => (
            <div
              key={`${String(d.month)}-${k}`}
              data-testid="reach-bar-entry"
              data-month={String(d.month)}
              data-key={k}
              data-value={String(d[k])}
            >
              {`${d.month} ${k}: ${d[k]}`}
            </div>
          )),
      )}
    </div>
  ),
}));

vi.mock("../components/custom-graphs/BarChartCenterAxis", () => ({
  default: ({
    dataXr,
    dataXl,
  }: {
    dataXr: { x: number; y: number }[];
    dataXl: { x: number; y: number }[];
  }) => (
    <div data-testid="demographic-pyramid">
      {dataXr.map((d) => (
        <div
          key={`male-${d.y}`}
          data-testid="pyramid-bar"
          data-gender="Male"
          data-age={d.y}
          data-count={d.x}
        >
          {`Male age ${d.y}: ${d.x}`}
        </div>
      ))}
      {dataXl.map((d) => (
        <div
          key={`female-${d.y}`}
          data-testid="pyramid-bar"
          data-gender="Female"
          data-age={d.y}
          data-count={d.x}
        >
          {`Female age ${d.y}: ${d.x}`}
        </div>
      ))}
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Shared test data
// ---------------------------------------------------------------------------

const tags: ITagOption[] = [
  {
    id: 1,
    name: "Tag A",
    color: "#ff0000",
    type: "Beneficiary",
    value: "1",
    label: "Tag A",
    urlId: "1",
  },
  {
    id: 2,
    name: "Tag B",
    color: "#00ff00",
    type: "Beneficiary",
    value: "2",
    label: "Tag B",
    urlId: "2",
  },
  {
    id: 3,
    name: "Tag C",
    color: "#0000ff",
    type: "Beneficiary",
    value: "3",
    label: "Tag C",
    urlId: "3",
  },
];

// Dates used in DEMOGRAPHIC_QUERY / BENEFICIARY_REACH_QUERY facts (all within the
// default 1-year reach window)
const oneMonthAgo = format(subMonths(new Date(), 1), "yyyy-MM-dd");
const threeMonthsAgo = format(subMonths(new Date(), 3), "yyyy-MM-dd");
const fiveMonthsAgo = format(subMonths(new Date(), 5), "yyyy-MM-dd");
const sevenMonthsAgo = format(subMonths(new Date(), 7), "yyyy-MM-dd");

// BENEFICIARY_FIGURES_QUERY mock
const figuresMock = {
  request: {
    query: BENEFICIARY_FIGURES_QUERY,
    variables: { baseId: "1" },
  },
  result: {
    data: {
      beneficiaryFigures: {
        majorFamilyHeadGender: "Female",
        majorFamilyHeadGenderPercentage: 0.625,
        averageFamilySize: 4.3,
        averageItemsPerVisitPerBeneficiary: 2.7,
        averageTotalItemsPerBeneficiary: 15.2,
        newRegistrationsLast30Days: 12,
        percentageWithoutFreeshopVisitLast90Days: 0.183,
      },
    },
  },
};

// DEMOGRAPHIC_QUERY mock: 4 facts with different gender, age, createdOn, tags
// - fact1: Male, age 5 (range 0-7), tag 1
// - fact2: Female, age 30 (range 26-40), tag 2
// - fact3: Diverse, age 70 (range 66+), tag 3 -> excluded from pyramid graph
// - fact4: Male, age null, no tags -> excluded from pyramid graph
const demographicMock = {
  request: {
    query: DEMOGRAPHIC_QUERY,
    variables: { baseId: 1 },
  },
  result: {
    data: {
      beneficiaryDemographics: {
        facts: [
          { count: 3, createdOn: oneMonthAgo, age: 5, gender: "Male", tagIds: [1] },
          { count: 2, createdOn: threeMonthsAgo, age: 30, gender: "Female", tagIds: [2] },
          { count: 1, createdOn: fiveMonthsAgo, age: 70, gender: "Diverse", tagIds: [3] },
          { count: 4, createdOn: sevenMonthsAgo, age: null, gender: "Male", tagIds: [] },
        ],
        dimensions: {
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

// BENEFICIARY_REACH_QUERY mock: 4 facts referencing 4 beneficiaries with
// different gender, age, reachedOn and tags
const reachMock = {
  request: {
    query: BENEFICIARY_REACH_QUERY,
    variables: { baseId: 1 },
  },
  result: {
    data: {
      beneficiaryReach: {
        facts: [
          { reachedOn: oneMonthAgo, beneficiaryId: 1, reachType: "FREESHOP", count: 2 },
          { reachedOn: threeMonthsAgo, beneficiaryId: 2, reachType: "FREESHOP", count: 3 },
          { reachedOn: fiveMonthsAgo, beneficiaryId: 3, reachType: "FREESHOP", count: 1 },
          { reachedOn: sevenMonthsAgo, beneficiaryId: 4, reachType: "FREESHOP", count: 5 },
        ],
        dimensions: {
          beneficiary: [
            { id: 1, age: 5, gender: "Male", tagIds: [1] },
            { id: 2, age: 30, gender: "Female", tagIds: [2] },
            { id: 3, age: 70, gender: "Diverse", tagIds: [3] },
            { id: 4, age: null, gender: "Male", tagIds: [] },
          ],
        },
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Render helper
// ---------------------------------------------------------------------------

function renderBeneficiaryOverview(urlSuffix = "") {
  return render(
    <Accordion defaultIndex={[0]}>
      <BeneficiaryOverview isActive={true} tags={tags} />
    </Accordion>,
    {
      routePath: "/bases/:baseId/",
      initialUrl: `/bases/1/${urlSuffix}`,
      mocks: [figuresMock, demographicMock, reachMock],
    },
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("BeneficiaryOverview", () => {
  beforeEach(() => {
    // Suppress console.error noise from Apollo MockedProvider exhausted mocks
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  // -------------------------------------------------------------------------
  // BeneficiaryFiguresCards
  // -------------------------------------------------------------------------

  describe("BeneficiaryFiguresCards", () => {
    it("displays the correct figures from BENEFICIARY_FIGURES_QUERY", async () => {
      renderBeneficiaryOverview();

      expect(await screen.findByText("Beneficiary Insights")).toBeInTheDocument();
      expect(screen.getByText("62.5% Female")).toBeInTheDocument();
      expect(screen.getByText("4.3")).toBeInTheDocument();
      expect(screen.getByText("2.7")).toBeInTheDocument();
      expect(screen.getByText("15.2")).toBeInTheDocument();
      expect(screen.getByText("12")).toBeInTheDocument();
      expect(screen.getByText("18.3%")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // No-filter baseline
  // -------------------------------------------------------------------------

  describe("without filters", () => {
    it("shows the correct demographic pyramid bars and summary text", async () => {
      renderBeneficiaryOverview();

      expect(await screen.findByText("Male age 5: 3")).toBeInTheDocument();
      expect(screen.getByText("Female age 30: 2")).toBeInTheDocument();
      // Diverse and age=null facts are not shown as bars
      expect(screen.getAllByTestId("pyramid-bar")).toHaveLength(2);

      // Summary text
      expect(screen.getByText("10", { exact: false })).toBeInTheDocument();
      const summary = screen.getByText(/beneficiaries registered in total/);
      expect(summary).toHaveTextContent(
        "There were 10 beneficiaries registered in total, 7 were male and 2 were female.",
      );
      expect(screen.getByText("5", { exact: false, selector: "b" })).toBeInTheDocument();
      expect(
        screen.getByText(
          (_, element) => element?.textContent === "4 people are missing a date of birth.",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          (_, element) => element?.textContent === "1 person has an unknown gender.",
        ),
      ).toBeInTheDocument();
    });

    it("shows all beneficiaries-reached bars for all four facts (age breakdown by default)", async () => {
      renderBeneficiaryOverview();

      await screen.findByTestId("reach-bar-chart");
      const entries = screen.getAllByTestId("reach-bar-entry");
      expect(entries).toHaveLength(4);
      expect(screen.getByText(`${oneMonthAgo.slice(0, 7)} 0-7: 1`)).toBeInTheDocument();
      expect(screen.getByText(`${threeMonthsAgo.slice(0, 7)} 26-40: 1`)).toBeInTheDocument();
      expect(screen.getByText(`${fiveMonthsAgo.slice(0, 7)} 66+: 1`)).toBeInTheDocument();
      expect(screen.getByText(`${sevenMonthsAgo.slice(0, 7)} Unknown: 1`)).toBeInTheDocument();
    });

    it("shows no filter chips when no filters are applied", async () => {
      renderBeneficiaryOverview();

      await screen.findByText("Male age 5: 3");
      expect(screen.queryByTestId("beneficiary-clear-all-filters-button")).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Age filter
  // -------------------------------------------------------------------------

  describe("age filter", () => {
    it("filters demographic pyramid, summary text and reach chart to matching age range", async () => {
      // ba=0-7 -> only fact1 (age 5, Male, count 3) matches
      renderBeneficiaryOverview("?ba=0-7");

      expect(await screen.findByText("Male age 5: 3")).toBeInTheDocument();
      expect(screen.getAllByTestId("pyramid-bar")).toHaveLength(1);
      expect(screen.queryByText(/Female age/)).not.toBeInTheDocument();

      const summary = screen.getByText(/beneficiaries registered in total/);
      expect(summary).toHaveTextContent(
        "There were 3 beneficiaries registered in total, 3 were male and 0 were female.",
      );

      // Reach chart: only beneficiary 1 (age 5) matches the age-range filter
      await waitFor(() => {
        expect(screen.getAllByTestId("reach-bar-entry")).toHaveLength(1);
      });
      expect(screen.getByText(`${oneMonthAgo.slice(0, 7)} 0-7: 1`)).toBeInTheDocument();

      // Filter chip
      expect(screen.getByTestId("beneficiary-filter-chip-close-age-range-0-7")).toBeInTheDocument();
      expect(screen.getByTestId("beneficiary-clear-all-filters-button")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Gender filter
  // -------------------------------------------------------------------------

  describe("gender filter", () => {
    it("filters demographic pyramid, summary text and reach chart to matching gender", async () => {
      // bg=Female -> only fact2 (age 30, Female, count 2) matches
      renderBeneficiaryOverview("?bg=Female");

      expect(await screen.findByText("Female age 30: 2")).toBeInTheDocument();
      expect(screen.getAllByTestId("pyramid-bar")).toHaveLength(1);
      expect(screen.queryByText(/Male age/)).not.toBeInTheDocument();

      const summary = screen.getByText(/beneficiaries registered in total/);
      expect(summary).toHaveTextContent(
        "There were 2 beneficiaries registered in total, 0 were male and 2 were female.",
      );

      // Reach chart: only beneficiary 2 (Female) matches the gender filter
      await waitFor(() => {
        expect(screen.getAllByTestId("reach-bar-entry")).toHaveLength(1);
      });
      expect(screen.getByText(`${threeMonthsAgo.slice(0, 7)} 26-40: 1`)).toBeInTheDocument();

      // Filter chip
      expect(screen.getByTestId("beneficiary-filter-chip-close-gender-Female")).toBeInTheDocument();
      expect(screen.getByTestId("beneficiary-clear-all-filters-button")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Tag filter
  // -------------------------------------------------------------------------

  describe("tag filter", () => {
    it("filters demographic pyramid, summary text and reach chart to the included tag", async () => {
      // bt=1 -> include tag id 1 -> only fact1 (Tag A) matches
      renderBeneficiaryOverview("?bt=1");

      expect(await screen.findByText("Male age 5: 3")).toBeInTheDocument();
      expect(screen.getAllByTestId("pyramid-bar")).toHaveLength(1);
      expect(screen.queryByText(/Female age/)).not.toBeInTheDocument();

      const summary = screen.getByText(/beneficiaries registered in total/);
      expect(summary).toHaveTextContent(
        "There were 3 beneficiaries registered in total, 3 were male and 0 were female.",
      );

      // Reach chart: only beneficiary 1 (tag 1) matches the include-tag filter
      await waitFor(() => {
        expect(screen.getAllByTestId("reach-bar-entry")).toHaveLength(1);
      });
      expect(screen.getByText(`${oneMonthAgo.slice(0, 7)} 0-7: 1`)).toBeInTheDocument();

      // Filter chip shows tag label
      expect(
        screen.getByTestId("beneficiary-filter-chip-close-included-tag-1"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("beneficiary-clear-all-filters-button")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Age / Gender breakdown toggle on the beneficiaries-reached chart
  // -------------------------------------------------------------------------

  describe("age/gender breakdown toggle", () => {
    it("switches the reach chart breakdown from age ranges to gender", async () => {
      const user = userEvent.setup();
      renderBeneficiaryOverview();

      await screen.findByTestId("reach-bar-chart");
      expect(screen.getByText(`${oneMonthAgo.slice(0, 7)} 0-7: 1`)).toBeInTheDocument();
      expect(screen.getByText(`${sevenMonthsAgo.slice(0, 7)} Unknown: 1`)).toBeInTheDocument();

      const select = screen.getByDisplayValue("Age");
      await user.selectOptions(select, "gender");

      await waitFor(() => {
        expect(screen.getByText(`${oneMonthAgo.slice(0, 7)} Male: 1`)).toBeInTheDocument();
      });
      expect(screen.getByText(`${threeMonthsAgo.slice(0, 7)} Female: 1`)).toBeInTheDocument();
      expect(screen.getByText(`${fiveMonthsAgo.slice(0, 7)} Diverse: 1`)).toBeInTheDocument();
      expect(screen.getByText(`${sevenMonthsAgo.slice(0, 7)} Male: 1`)).toBeInTheDocument();
      // No "Unknown" key anymore since all beneficiaries have a gender
      expect(screen.queryByText(/Unknown/)).not.toBeInTheDocument();
      expect(screen.getAllByTestId("reach-bar-entry")).toHaveLength(4);
    });
  });
});
