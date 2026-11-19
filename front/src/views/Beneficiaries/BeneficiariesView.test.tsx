import { it, describe, expect, vi, beforeEach } from "vitest";
import { userEvent } from "@testing-library/user-event";
import { screen, render, waitFor, within } from "tests/test-utils";
import { ErrorBoundary } from "@sentry/react";
import { Suspense } from "react";
import { useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { AlertWithoutAction } from "components/Alerts";
import { TableSkeleton } from "components/Skeletons";
import { cache, tableConfigsVar } from "queries/cache";
import { FakeGraphQLNetworkError } from "mocks/functions";
import {
  selectedBaseAtom,
  organisationAtom,
  availableBasesAtom,
} from "stores/globalPreferenceStore";
import { base2 } from "mocks/bases";
import { organisation2 } from "mocks/organisations";
import { mockAuthenticatedUser } from "mocks/hooks";
import {
  beneficiaryOptionsMock,
  beneficiaryRow,
  beneficiaryRowsMock,
  firstRequestOptions,
  totalsOnlyOptions,
} from "mocks/beneficiaryRows";
import Beneficiaries, { BENEFICIARIES_FOR_BENEFICIARIESVIEW_QUERY } from "./BeneficiariesView";
import { formatAge, groupByFamily } from "./components/transformers";

vi.mock("@auth0/auth0-react");
const mockedUseAuth0 = vi.mocked(useAuth0);

beforeEach(() => {
  mockAuthenticatedUser(mockedUseAuth0, "dev_volunteer@boxcare.org");
  void cache.reset();
  tableConfigsVar(new Map());
});

const jotaiAtoms = [
  [selectedBaseAtom, base2],
  [organisationAtom, organisation2],
  [availableBasesAtom, organisation2.bases],
];

const rowOf = (name: string) =>
  screen.getAllByRole("row").find((r) => within(r).queryByText(name))!;

// Chakra renders font weights as CSS variables
const BOLD = "font-weight: var(--chakra-fontWeights-bold)";

const activeFilters = { deactivated: false };
const deactivatedFilters = { deactivated: true };

const smith = beneficiaryRow({ id: "1", firstName: "Sam", lastName: "Smith", gender: "Male" });
const smithChild = beneficiaryRow({
  id: "2",
  firstName: "Alma",
  lastName: "Smith",
  familyHeadId: 1,
  familyHeadLastName: "Smith",
  gender: "Diverse",
  age: 400,
});
const smithSpouse = beneficiaryRow({
  id: "3",
  firstName: "Zoe",
  lastName: "Adams",
  familyHeadId: 1,
  familyHeadLastName: "Smith",
  age: 800,
  tagIds: ["20"],
});
const miller = beneficiaryRow({
  id: "4",
  firstName: "Mia",
  lastName: "Miller",
  signed: false,
  soonToBeDeactivated: true,
  age: null,
});
// Returned in the order of the backend: sorted by the last name of the family head
const familyPage = [miller, smithChild, smith, smithSpouse];

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
}

const renderBeneficiaries = ({ initialUrl = "/bases/2/beneficiaries", mocks }) =>
  render(
    <ErrorBoundary
      fallback={
        <AlertWithoutAction alertText="Could not fetch beneficiaries data! Please try reloading the page." />
      }
    >
      <Suspense fallback={<TableSkeleton />}>
        <Beneficiaries />
      </Suspense>
      <LocationDisplay />
    </ErrorBoundary>,
    {
      routePath: "/bases/:baseId/beneficiaries",
      initialUrl,
      mocks,
      cache,
      addTypename: true,
      jotaiAtoms,
    },
  );

const defaultMocks = (rows = familyPage) => [
  beneficiaryOptionsMock(),
  beneficiaryRowsMock({
    options: firstRequestOptions(activeFilters),
    rows,
    totalNumberOfBeneficiaries: 4,
  }),
  beneficiaryRowsMock({
    options: totalsOnlyOptions(deactivatedFilters),
    rows: [beneficiaryRow({ id: "99" })],
    totalNumberOfBeneficiaries: 7,
  }),
];

const currentUrl = () => screen.getByTestId("location").textContent;
const tableRows = () => screen.getAllByRole("row").slice(1);
const getColumnHeader = (name: RegExp) => within(screen.getAllByRole("row")[0]).getByText(name);

describe("Initial load", () => {
  it("shows the heading, a skeleton while loading, and the tab titles with totals", async () => {
    renderBeneficiaries({ mocks: defaultMocks() });
    expect(screen.getByTestId("TableSkeleton")).toBeInTheDocument();

    expect(await screen.findByText("Manage Beneficiaries")).toBeInTheDocument();
    expect(await screen.findByRole("tab", { name: "ACTIVE (4)" })).toBeInTheDocument();
    expect(await screen.findByRole("tab", { name: "DEACTIVATED (7)" })).toBeInTheDocument();
    expect(await screen.findByText("Select all 4 beneficiaries")).toBeInTheDocument();
  });

  it("shows the default columns and hides the optional ones", async () => {
    renderBeneficiaries({ mocks: defaultMocks() });
    await screen.findByText("Sam");

    ["Surname", "First name", "Gender", "Age", "Case number", "Tokens", "Tags", "Comment"].forEach(
      (name) => expect(getColumnHeader(new RegExp(`^${name}$`))).toBeInTheDocument(),
    );
    ["Last active", "Created on", "Email", "Phone"].forEach((name) =>
      expect(within(screen.getAllByRole("row")[0]).queryByText(name)).not.toBeInTheDocument(),
    );
  });

  it("offers the optional columns of the base in the column selector, but not the selection", async () => {
    const user = userEvent.setup();
    renderBeneficiaries({
      mocks: [
        beneficiaryOptionsMock("2", {
          beneficiaryEmailEnabled: true,
          beneficiaryCustomTextField1Enabled: true,
          beneficiaryCustomTextField1Name: "Nationality",
        }),
        ...defaultMocks().slice(1),
      ],
    });
    await screen.findByText("Sam");

    await user.click(screen.getByRole("button", { name: "Columns Shown" }));
    const selector = await screen.findByRole("dialog");
    expect(within(selector).getByLabelText("Last active")).not.toBeChecked();
    expect(within(selector).getByLabelText("Created on")).not.toBeChecked();
    expect(within(selector).getByLabelText("Email")).not.toBeChecked();
    expect(within(selector).getByLabelText("Nationality")).not.toBeChecked();
    expect(within(selector).queryByLabelText("Phone")).not.toBeInTheDocument();
    expect(within(selector).getAllByRole("checkbox")).toHaveLength(8 + 2 + 2);
    expect(within(selector).getByLabelText("Surname")).toBeChecked();

    await user.click(within(selector).getByLabelText("Email"));
    expect(getColumnHeader(/^Email$/)).toBeInTheDocument();
  });

  it("shows an alert if the data cannot be fetched", async () => {
    renderBeneficiaries({
      mocks: [
        beneficiaryOptionsMock(),
        {
          request: {
            query: BENEFICIARIES_FOR_BENEFICIARIESVIEW_QUERY,
            variables: { baseId: 2, options: firstRequestOptions(activeFilters) },
          },
          error: new FakeGraphQLNetworkError(),
        },
      ],
    });
    expect(
      await screen.findByText(/could not fetch beneficiaries data!/i, {}, { timeout: 10000 }),
    ).toBeInTheDocument();
  });

  it("shows a text if there are no beneficiaries", async () => {
    renderBeneficiaries({
      mocks: [
        beneficiaryOptionsMock(),
        beneficiaryRowsMock({ options: firstRequestOptions(activeFilters), rows: [] }),
        beneficiaryRowsMock({
          options: totalsOnlyOptions(deactivatedFilters),
          rows: [],
          totalNumberOfBeneficiaries: 0,
        }),
      ],
    });
    expect(await screen.findByText("No beneficiaries registered.")).toBeInTheDocument();
    expect(await screen.findByRole("tab", { name: "ACTIVE (0)" })).toBeInTheDocument();
  });
});

describe("Row display", () => {
  it("renders names, gender, age, tags and the signature warning", async () => {
    renderBeneficiaries({ mocks: defaultMocks() });
    await screen.findByText("Sam");

    // Family heads are bold, family members not
    expect(screen.getByText("Sam")).toHaveStyle(BOLD);
    expect(screen.getByText("Alma")).not.toHaveStyle(BOLD);
    expect(screen.getByText("Mia")).toHaveStyle(BOLD);

    // Diverse is not shown; ages below 730 days are shown in months
    const almaRow = rowOf("Alma");
    expect(within(almaRow).queryByText("Diverse")).not.toBeInTheDocument();
    expect(within(almaRow).getByText("13 mo")).toBeInTheDocument();
    const zoeRow = rowOf("Zoe");
    expect(within(zoeRow).getByText("2 yrs")).toBeInTheDocument();
    expect(within(zoeRow).getByText("refugee")).toBeInTheDocument();
    expect(within(zoeRow).queryByLabelText("Not signed")).not.toBeInTheDocument();

    // No age and not signed
    const miaRow = rowOf("Mia");
    expect(within(miaRow).getByLabelText("Not signed")).toBeInTheDocument();
    expect(within(miaRow).getByText("Miller")).toBeInTheDocument();
  });

  it("reduces the opacity of beneficiaries that are soon to be deactivated in the active tab", async () => {
    renderBeneficiaries({ mocks: defaultMocks() });
    await screen.findByText("Sam");

    expect(rowOf("Mia")).toHaveStyle("opacity: 0.5");
    expect(rowOf("Sam")).not.toHaveStyle("opacity: 0.5");
  });

  it("groups the families of the page if sorted by last name", async () => {
    renderBeneficiaries({ mocks: defaultMocks() });
    await screen.findByText("Sam");

    const headers = screen.getAllByTestId("group-header");
    expect(headers).toHaveLength(1);
    expect(headers[0]).toHaveTextContent("Smith (3)");
    expect(within(headers[0]).getByText("Smith (3)")).toHaveStyle(BOLD);

    // Miller first, then the Smith family: head first, then members by last name and first name
    const firstNames = tableRows().map((row) => row.textContent);
    expect(firstNames[0]).toContain("Mia");
    expect(firstNames[1]).toBe("Smith (3)");
    expect(firstNames[2]).toContain("Sam");
    expect(firstNames[3]).toContain("Zoe");
    expect(firstNames[4]).toContain("Alma");
  });

  it("shows the rows as returned by the backend if sorted by another field", async () => {
    renderBeneficiaries({
      initialUrl: "/bases/2/beneficiaries?sort_by=firstName&descending=true",
      mocks: [
        beneficiaryOptionsMock(),
        beneficiaryRowsMock({
          options: firstRequestOptions(activeFilters, { sortBy: "FirstName", descending: true }),
          rows: [smithSpouse, miller, smith, smithChild],
          totalNumberOfBeneficiaries: 4,
        }),
        beneficiaryRowsMock({
          options: totalsOnlyOptions(deactivatedFilters, {
            sortBy: "FirstName",
            descending: true,
          }),
          rows: [],
          totalNumberOfBeneficiaries: 0,
        }),
      ],
    });
    await screen.findByText("Zoe");

    expect(screen.queryByTestId("group-header")).not.toBeInTheDocument();
    expect(tableRows().map((row) => row.textContent?.match(/Zoe|Mia|Sam|Alma/)?.[0])).toEqual([
      "Zoe",
      "Mia",
      "Sam",
      "Alma",
    ]);
    expect(within(screen.getAllByRole("row")[0]).getByLabelText("sorted descending")).toBeVisible();
  });

  it("orders groups with equal family head last names by the family head ID", () => {
    const head = (id: string, firstName: string) =>
      beneficiaryRow({ id, firstName, lastName: "Smith", familyHeadLastName: "Smith" });
    const member = (id: string, firstName: string, headId: number) =>
      beneficiaryRow({
        id,
        firstName,
        lastName: "Smith",
        familyHeadId: headId,
        familyHeadLastName: "Smith",
      });
    const rows = [
      member("21", "B2", 20),
      member("11", "B1", 10),
      head("20", "A2"),
      head("10", "A1"),
    ];
    expect(groupByFamily(rows as any, false).map((r) => r.firstName)).toEqual([
      "A1",
      "B1",
      "A2",
      "B2",
    ]);
  });

  it("uses the family head last name as group header if the head is not on the page", () => {
    const rows = [
      beneficiaryRow({
        id: "2",
        firstName: "B",
        lastName: "Z",
        familyHeadId: 1,
        familyHeadLastName: "Smith",
      }),
      beneficiaryRow({
        id: "3",
        firstName: "A",
        lastName: "Y",
        familyHeadId: 1,
        familyHeadLastName: "Smith",
      }),
    ];
    const grouped = groupByFamily(rows as any, false);
    expect(grouped.map((r) => r.firstName)).toEqual(["A", "B"]);
    expect(grouped[0].groupHeader).toEqual({ name: "Smith", count: 2 });
  });

  it("formats ages", () => {
    expect(formatAge(null)).toBe("");
    expect(formatAge(0)).toBe("0 mo");
    expect(formatAge(31)).toBe("1 mo");
    expect(formatAge(729)).toBe("23 mo");
    expect(formatAge(730)).toBe("1 yr");
    expect(formatAge(800)).toBe("2 yrs");
  });
});

describe("Sorting", () => {
  it("sorts by a column on click and cycles through ascending and descending order", async () => {
    const user = userEvent.setup();
    renderBeneficiaries({
      mocks: [
        ...defaultMocks(),
        beneficiaryRowsMock({
          options: firstRequestOptions(activeFilters, { sortBy: "FirstName" }),
          rows: [smithChild, miller],
          totalNumberOfBeneficiaries: 4,
        }),
        beneficiaryRowsMock({
          options: totalsOnlyOptions(deactivatedFilters, { sortBy: "FirstName" }),
          rows: [],
          totalNumberOfBeneficiaries: 7,
        }),
        beneficiaryRowsMock({
          options: firstRequestOptions(activeFilters, { sortBy: "FirstName", descending: true }),
          rows: [miller, smithChild],
          totalNumberOfBeneficiaries: 4,
        }),
        beneficiaryRowsMock({
          options: totalsOnlyOptions(deactivatedFilters, { sortBy: "FirstName", descending: true }),
          rows: [],
          totalNumberOfBeneficiaries: 7,
        }),
      ],
    });
    await screen.findByText("Sam");

    await user.click(getColumnHeader(/^First name$/));
    await waitFor(() =>
      expect(currentUrl()).toBe("/bases/2/beneficiaries?sort_by=firstName&descending=false"),
    );
    await screen.findByText("Alma");
    expect(screen.queryByText("Sam")).not.toBeInTheDocument();

    await user.click(getColumnHeader(/^First name$/));
    await waitFor(() =>
      expect(currentUrl()).toBe("/bases/2/beneficiaries?sort_by=firstName&descending=true"),
    );
    await screen.findByLabelText("sorted descending");
  });

  it("does not sort by tags and comment", async () => {
    const user = userEvent.setup();
    renderBeneficiaries({ mocks: defaultMocks() });
    await screen.findByText("Sam");

    await user.click(getColumnHeader(/^Tags$/));
    await user.click(getColumnHeader(/^Comment$/));
    expect(currentUrl()).toBe("/bases/2/beneficiaries");
  });
});

describe("Filtering", () => {
  it("applies the filters of the URL to both tabs and shows them as chips", async () => {
    const filters = {
      genders: ["Female"],
      tagIds: [20],
      excludedTagIds: [21],
      createdFrom: "2023-01-01",
      createdUntil: "2023-12-31",
      signed: false,
      registered: false,
      isVolunteer: true,
      pattern: "mia",
    };
    renderBeneficiaries({
      initialUrl:
        "/bases/2/beneficiaries?genders=Female&tag_ids=20&no_tag_ids=21&created_from=2023-01-01&created_to=2023-12-31&quick_filters=noSignature,notRegistered,volunteers&q=mia",
      mocks: [
        beneficiaryOptionsMock(),
        beneficiaryRowsMock({
          options: firstRequestOptions({ ...filters, deactivated: false }),
          rows: [miller],
          totalNumberOfBeneficiaries: 1,
        }),
        beneficiaryRowsMock({
          options: totalsOnlyOptions({ ...filters, deactivated: true }),
          rows: [],
          totalNumberOfBeneficiaries: 0,
        }),
      ],
    });

    expect(await screen.findByText("Mia")).toBeInTheDocument();
    const chips = screen.getByTestId("filter-chips");
    [
      "Female",
      "refugee",
      "newcomer",
      "From 2023-01-01",
      "To 2023-12-31",
      "No signature",
      "Not registered",
      "Volunteers",
    ].forEach((label) => expect(within(chips).getByText(label)).toBeInTheDocument());
    expect(within(chips).getByText("newcomer")).toHaveStyle("text-decoration: line-through");
    // The global filter is not shown as chip
    expect(within(chips).queryByText("mia")).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search")).toHaveValue("mia");
  });

  it("removes a filter when its chip is closed", async () => {
    const user = userEvent.setup();
    renderBeneficiaries({
      initialUrl: "/bases/2/beneficiaries?quick_filters=volunteers&page=1",
      mocks: [
        beneficiaryOptionsMock(),
        beneficiaryRowsMock({
          options: firstRequestOptions({ ...activeFilters, isVolunteer: true }),
          rows: [miller],
          totalNumberOfBeneficiaries: 1,
        }),
        beneficiaryRowsMock({
          options: totalsOnlyOptions({ ...deactivatedFilters, isVolunteer: true }),
          rows: [],
          totalNumberOfBeneficiaries: 0,
        }),
        ...defaultMocks(),
      ],
    });
    await screen.findByText("Mia");

    await user.click(screen.getByTestId("filter-chip-quickFilters-volunteers-close"));
    await waitFor(() => expect(currentUrl()).toBe("/bases/2/beneficiaries"));
    expect(await screen.findByText("Sam")).toBeInTheDocument();
    expect(screen.queryByTestId("filter-chips")).not.toBeInTheDocument();
  });

  it("applies filters selected in the filter panel", async () => {
    const user = userEvent.setup();
    renderBeneficiaries({
      mocks: [
        ...defaultMocks(),
        beneficiaryRowsMock({
          options: firstRequestOptions({ ...activeFilters, createdFrom: "2023-02-01" }),
          rows: [miller],
          totalNumberOfBeneficiaries: 1,
        }),
        beneficiaryRowsMock({
          options: totalsOnlyOptions({ ...deactivatedFilters, createdFrom: "2023-02-01" }),
          rows: [],
          totalNumberOfBeneficiaries: 0,
        }),
      ],
    });
    await screen.findByText("Sam");

    await user.click(screen.getByRole("button", { name: /open filters/i }));
    const panel = await screen.findByRole("dialog");
    await user.type(within(panel).getByLabelText("Created from"), "2023-02-01");
    await user.click(within(panel).getByTestId("beneficiaries-filter-apply"));

    await waitFor(() =>
      expect(currentUrl()).toBe("/bases/2/beneficiaries?created_from=2023-02-01"),
    );
    expect(await screen.findByText("Mia")).toBeInTheDocument();
    expect(screen.queryByText("Sam")).not.toBeInTheDocument();
    expect(screen.getByTestId("filter-chip-createdFrom")).toBeInTheDocument();
  });
});

describe("Tabs", () => {
  it("fetches the deactivated beneficiaries when the tab is selected and persists it in the URL", async () => {
    const user = userEvent.setup();
    renderBeneficiaries({
      mocks: [
        ...defaultMocks(),
        beneficiaryRowsMock({
          options: firstRequestOptions(deactivatedFilters),
          rows: [
            beneficiaryRow({
              id: "50",
              firstName: "Dora",
              lastName: "Dormant",
              soonToBeDeactivated: true,
            }),
          ],
          totalNumberOfBeneficiaries: 7,
        }),
      ],
    });
    await screen.findByText("Sam");
    await screen.findByRole("tab", { name: "DEACTIVATED (7)" });

    await user.click(screen.getByRole("tab", { name: "DEACTIVATED (7)" }));
    expect(await screen.findByText("Dora")).toBeInTheDocument();
    expect(currentUrl()).toBe("/bases/2/beneficiaries?tab=deactivated");
    expect(screen.queryByText("Sam")).not.toBeInTheDocument();
    expect(screen.getByText("Select all 7 beneficiaries")).toBeInTheDocument();
    // No reduced opacity in the deactivated tab
    expect(rowOf("Dora")).not.toHaveStyle("opacity: 0.5");

    await user.click(screen.getByRole("tab", { name: "ACTIVE (4)" }));
    expect(await screen.findByText("Sam")).toBeInTheDocument();
  });

  it("opens the tab of the URL", async () => {
    renderBeneficiaries({
      initialUrl: "/bases/2/beneficiaries?tab=deactivated",
      mocks: [
        beneficiaryOptionsMock(),
        beneficiaryRowsMock({
          options: firstRequestOptions(deactivatedFilters),
          rows: [beneficiaryRow({ id: "50", firstName: "Dora", lastName: "Dormant" })],
          totalNumberOfBeneficiaries: 1,
        }),
        beneficiaryRowsMock({
          options: totalsOnlyOptions(activeFilters),
          rows: [],
          totalNumberOfBeneficiaries: 12,
        }),
      ],
    });
    expect(await screen.findByText("Dora")).toBeInTheDocument();
    expect(await screen.findByRole("tab", { name: "ACTIVE (12)" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "DEACTIVATED (1)" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});

describe("Selection", () => {
  it("toggles between select-all and the number of selected beneficiaries", async () => {
    const user = userEvent.setup();
    renderBeneficiaries({ mocks: defaultMocks() });
    await screen.findByText("Sam");

    await user.click(screen.getByText("Select all 4 beneficiaries"));
    const counter = screen.getByTestId("selected-beneficiaries-counter");
    expect(counter).toHaveTextContent("4 beneficiaries selected");
    expect(screen.queryByText("Select all 4 beneficiaries")).not.toBeInTheDocument();
    screen.getAllByRole("checkbox").forEach((checkbox) => expect(checkbox).toBeChecked());

    await user.click(within(counter).getByText("clear all"));
    expect(screen.getByText("Select all 4 beneficiaries")).toBeInTheDocument();
    screen.getAllByRole("checkbox").forEach((checkbox) => expect(checkbox).not.toBeChecked());
  });

  it("does not offer a checkbox for the group headers", async () => {
    renderBeneficiaries({ mocks: defaultMocks() });
    await screen.findByText("Sam");

    const header = screen.getByTestId("group-header");
    expect(within(header).queryByRole("checkbox")).not.toBeInTheDocument();
    // Header checkbox + one checkbox per beneficiary
    expect(screen.getAllByRole("checkbox")).toHaveLength(1 + 4);
  });
});

describe("Pagination", () => {
  const generateRows = (count: number) =>
    Array.from({ length: count }, (_, i) => {
      const n = String(i + 1).padStart(3, "0");
      return beneficiaryRow({ id: String(1000 + i), firstName: `First${n}`, lastName: `Last${n}` });
    });

  it("shows 50 rows per page, fetches the third page when reaching the second one", async () => {
    const user = userEvent.setup();
    const rows = generateRows(130);
    renderBeneficiaries({
      mocks: [
        beneficiaryOptionsMock(),
        beneficiaryRowsMock({
          options: firstRequestOptions(activeFilters),
          rows: rows.slice(0, 100),
          totalNumberOfBeneficiaries: 130,
        }),
        beneficiaryRowsMock({
          options: totalsOnlyOptions(deactivatedFilters),
          rows: [],
          totalNumberOfBeneficiaries: 0,
        }),
        beneficiaryRowsMock({
          options: {
            page: 3,
            pageSize: 50,
            filters: activeFilters,
            sortBy: "LastName",
            descending: false,
          },
          rows: rows.slice(100),
          totalNumberOfBeneficiaries: 130,
        }),
      ],
    });

    await screen.findByText("First001");
    expect(tableRows()).toHaveLength(50);
    expect(screen.getByTestId("page-indicator")).toHaveTextContent("Page 1 of 3");
    expect(screen.getByRole("button", { name: "Previous Page" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Next Page" }));
    expect(await screen.findByText("First051")).toBeInTheDocument();
    expect(currentUrl()).toBe("/bases/2/beneficiaries?page=2");

    // The third page was prefetched when the second page was reached
    await waitFor(() => expect(screen.getByRole("button", { name: "Next Page" })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "Next Page" }));
    expect(await screen.findByText("First101")).toBeInTheDocument();
    expect(tableRows()).toHaveLength(30);
    expect(screen.getByRole("button", { name: "Next Page" })).toBeDisabled();
    expect(currentUrl()).toBe("/bases/2/beneficiaries?page=3");
  });
});
