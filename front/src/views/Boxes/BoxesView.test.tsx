import { it, describe, expect, vi, beforeEach } from "vitest";
import { userEvent } from "@testing-library/user-event";
import { screen, render, waitFor, within } from "tests/test-utils";
import { MOVE_BOXES_TO_LOCATION } from "hooks/useMoveBoxes";
import { ErrorBoundary } from "@sentry/react";
import { AlertWithoutAction } from "components/Alerts";
import { TableSkeleton } from "components/Skeletons";
import { Suspense } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSetAtom } from "jotai";
import { cache, tableConfigsVar } from "queries/cache";
import Boxes, { BOXES_FOR_BOXESVIEW_QUERY } from "./BoxesView";
import { FakeGraphQLError, FakeGraphQLNetworkError } from "mocks/functions";
import {
  selectedBaseAtom,
  organisationAtom,
  availableBasesAtom,
} from "stores/globalPreferenceStore";
import { base1, base2 } from "mocks/bases";
import { organisation2 } from "mocks/organisations";
import { useAuth0 } from "@auth0/auth0-react";
import { mockAuthenticatedUser } from "mocks/hooks";
import {
  actionOptionsMock,
  boxRowsMock,
  firstRequestOptions,
  generateBoxRows,
  instockBoxRow1,
  instockBoxRow2,
  scrapBoxRow,
} from "mocks/boxRows";

vi.mock("@auth0/auth0-react");
// .mocked() is a nice helper function from jest for typescript support
// https://jestjs.io/docs/mock-function-api/#typescript-usage
const mockedUseAuth0 = vi.mocked(useAuth0);

beforeEach(() => {
  mockAuthenticatedUser(mockedUseAuth0, "dev_volunteer@boxcare.org");
  void cache.reset();
  tableConfigsVar(new Map());
  localStorage.clear();
});

const jotaiAtoms = [
  [selectedBaseAtom, base2],
  [organisationAtom, organisation2],
  [availableBasesAtom, organisation2.bases],
];

const storageKey = (baseId: number | string) => `boxtribute:boxes-view:${baseId}`;

const inStockOptions = firstRequestOptions({ states: ["InStock"] });

const defaultRowsMock = (options = inStockOptions, rows = [instockBoxRow1, instockBoxRow2]) =>
  boxRowsMock({ options, rows, totalNumberOfBoxes: 268, totalNumberOfItems: 56 });

const moveBoxesMutation = {
  request: {
    query: MOVE_BOXES_TO_LOCATION,
    variables: {
      labelIdentifiers: ["1481666", "8650860"],
      locationId: 17,
    },
  },
  result: {
    data: {
      moveBoxesToLocation: {
        __typename: "BoxesResult",
        updatedBoxes: [
          {
            labelIdentifier: "8650860",
            state: "InStock",
            location: {
              id: "17",
            },
            lastModifiedOn: new Date().toISOString(),
            lastModifiedBy: { id: "2", name: "coordinator" },
          },
          {
            labelIdentifier: "1481666",
            state: "InStock",
            location: {
              id: "17",
            },
            lastModifiedOn: new Date().toISOString(),
            lastModifiedBy: { id: "2", name: "coordinator" },
          },
        ],
        invalidBoxLabelIdentifiers: [],
      },
    },
  },
};

const initialQueryNetworkError = {
  request: {
    query: BOXES_FOR_BOXESVIEW_QUERY,
    variables: { baseId: 2, options: inStockOptions },
  },
  error: new FakeGraphQLNetworkError(),
};

const initialQueryGraphQLError = {
  request: {
    query: BOXES_FOR_BOXESVIEW_QUERY,
    variables: { baseId: 2, options: inStockOptions },
  },
  result: {
    data: {
      boxRows: null,
    },
    errors: [new FakeGraphQLError()],
  },
};

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
}

/** Simulates changes of the URL that do not originate from the table: manually edited URLs or the
 * base switcher. */
function TestControls({ editedUrl }: { editedUrl?: string }) {
  const navigate = useNavigate();
  const setSelectedBase = useSetAtom(selectedBaseAtom);
  return (
    <>
      <button onClick={() => navigate(-1)}>history back</button>
      {editedUrl && <button onClick={() => navigate(editedUrl)}>edit URL</button>}
      <button
        onClick={() => {
          setSelectedBase(base1 as any);
          navigate("/bases/1/boxes");
        }}
      >
        switch base
      </button>
    </>
  );
}

const renderBoxes = ({
  initialUrl,
  mocks,
  editedUrl,
}: {
  initialUrl: string;
  mocks: any[];
  editedUrl?: string;
}) =>
  render(
    <ErrorBoundary
      fallback={
        <AlertWithoutAction alertText="Could not fetch boxes data! Please try reloading the page." />
      }
    >
      <Suspense fallback={<TableSkeleton />}>
        <Boxes />
      </Suspense>
      <LocationDisplay />
      <TestControls editedUrl={editedUrl} />
    </ErrorBoundary>,
    {
      routePath: "/bases/:baseId/boxes",
      initialUrl,
      mocks,
      cache,
      addTypename: true,
      jotaiAtoms,
    },
  );

const currentUrl = () => screen.getByTestId("location").textContent;

const getColumnHeader = (name: RegExp) => within(screen.getAllByRole("row")[0]).getByText(name);

describe("4.8.1 - Initial load of Page", () => {
  it("4.8.1.1 - Is the Loading State Shown First?", async () => {
    renderBoxes({
      initialUrl: "/bases/2/boxes?state_ids=1",
      mocks: [defaultRowsMock(), actionOptionsMock()],
    });
    // Test case 4.8.1.1
    expect(screen.getByTestId("TableSkeleton")).toBeInTheDocument();
  });

  const failedInitialFetching = [
    { name: "4.8.1.2.2 - Failed to Fetch Initial Data", mock: initialQueryGraphQLError },
    { name: "4.8.1.2.6 - Failed to Fetch Initial Data", mock: initialQueryNetworkError },
  ];

  failedInitialFetching.forEach(({ name, mock }) => {
    it(
      name,
      async () => {
        renderBoxes({
          initialUrl: "/bases/2/boxes?state_ids=1",
          mocks: [mock, actionOptionsMock()],
        });

        expect(
          await screen.findByText(
            /could not fetch boxes data! Please try reloading the page./i,
            {},
            { timeout: 5000 },
          ),
        ).toBeInTheDocument();
      },
      15000,
    );
  });

  it("4.8.1.3 - The Boxes Table is shown with the totals of all filtered boxes", async () => {
    renderBoxes({
      initialUrl: "/bases/2/boxes?state_ids=1",
      mocks: [defaultRowsMock(), actionOptionsMock()],
    });

    // Test case 4.8.1.3
    expect(await screen.findByText(/8650860/i, {}, { timeout: 10000 })).toBeInTheDocument();
    expect(screen.getByText(/1481666/i)).toBeInTheDocument();
    // The totals cover all boxes, not only the page
    const totals = await screen.findByTestId("boxes-count");
    expect(totals).toHaveTextContent("268 boxes");
    expect(totals).toHaveTextContent("56 items");
    expect(screen.getByText("Sweatpants")).toBeInTheDocument();
    expect(within(screen.getAllByRole("row")[1]).getByText("Stockroom")).toBeInTheDocument();
  });

  it("4.8.1.4 - Shows skeletons while the boxes are loading", async () => {
    renderBoxes({
      initialUrl: "/bases/2/boxes?state_ids=1",
      mocks: [
        boxRowsMock({
          options: inStockOptions,
          rows: [instockBoxRow1],
          delay: 300,
        }),
        actionOptionsMock(),
      ],
    });

    // The table is rendered, but the boxes are still loading
    await screen.findByRole("table");
    expect(screen.getByTestId("total-summary")).not.toHaveTextContent(/boxes/);
    expect(screen.queryByText("1481666")).not.toBeInTheDocument();
    expect(await screen.findByText("1481666")).toBeInTheDocument();
    expect(screen.getByTestId("total-summary")).toHaveTextContent(/1 box/);
  });

  it("4.8.1.5 - The global filter is not offered", async () => {
    renderBoxes({
      initialUrl: "/bases/2/boxes?state_ids=1",
      mocks: [defaultRowsMock(), actionOptionsMock()],
    });
    await screen.findByText(/8650860/i);
    expect(screen.queryByPlaceholderText(/search/i)).not.toBeInTheDocument();
  });
});

describe("4.8.2 - Selecting rows and performing bulk actions", () => {
  it("4.8.2.1 - Select two checkboxes and perform bulk moves, then the current page is refetched", async () => {
    const user = userEvent.setup();
    const updatedRow = { ...instockBoxRow2, numberOfItems: 77 };
    renderBoxes({
      initialUrl: "/bases/2/boxes?state_ids=1",
      mocks: [
        defaultRowsMock(),
        actionOptionsMock(),
        moveBoxesMutation,
        // refetch of the current view
        defaultRowsMock(inStockOptions, [instockBoxRow1, updatedRow]),
      ],
    });

    await waitFor(
      () => {
        expect(screen.getByTestId("boxes-count")).toBeInTheDocument();
      },
      { timeout: 15000 },
    );

    const row1 = await screen.findByRole("row", { name: /8650860/i }, { timeout: 10000 });
    const checkbox1 = within(row1).getByRole("checkbox", {
      name: /toggle row selected/i,
    });
    const row2 = await screen.findByRole("row", { name: /1481666/i }, { timeout: 10000 });
    const checkbox2 = within(row2).getByRole("checkbox", {
      name: /toggle row selected/i,
    });

    await user.click(checkbox1);
    await waitFor(() => expect(checkbox1).toBeChecked(), { timeout: 10000 });
    await user.click(checkbox2);
    await waitFor(() => expect(checkbox2).toBeChecked(), { timeout: 10000 });

    const moveBoxesButton = await screen.findByRole(
      "button",
      { name: /move/i },
      { timeout: 10000 },
    );
    await user.click(moveBoxesButton);

    const wh1MenuItems = await screen.findAllByRole(
      "menuitem",
      { name: /wh1/i },
      { timeout: 10000 },
    );
    expect(wh1MenuItems.length).toBeGreaterThan(0);
    await user.click(wh1MenuItems[0]);

    // The refetched page contains the updated row
    expect(await screen.findByRole("cell", { name: "77" }, { timeout: 10000 })).toBeInTheDocument();
    expect(screen.getByText(/1481666/i)).toBeInTheDocument();
  }, 30000);

  it("4.8.2.2 - Shows selected boxes counter when boxes are selected", async () => {
    const user = userEvent.setup();
    renderBoxes({
      initialUrl: "/bases/2/boxes?state_ids=1",
      mocks: [defaultRowsMock(), actionOptionsMock()],
    });

    const row1 = await screen.findByRole("row", { name: /8650860/i }, { timeout: 5000 });
    const checkbox1 = within(row1).getByRole("checkbox", {
      name: /toggle row selected/i,
    });
    const row2 = await screen.findByRole("row", { name: /1481666/i });
    const checkbox2 = within(row2).getByRole("checkbox", {
      name: /toggle row selected/i,
    });

    // Initially, counter is hidden. Selecting all boxes of the view is not supported.
    expect(screen.getByTestId("selected-boxes-counter")).toBeEmptyDOMElement();
    expect(screen.queryByText(/select all/i)).not.toBeInTheDocument();

    await user.click(checkbox1);
    await waitFor(() => expect(checkbox1).toBeChecked());
    await waitFor(() =>
      expect(screen.getByTestId("selected-boxes-counter")).toHaveTextContent("1 Box selected"),
    );

    await user.click(checkbox2);
    await waitFor(() => expect(checkbox2).toBeChecked());
    await waitFor(() =>
      expect(screen.getByTestId("selected-boxes-counter")).toHaveTextContent("2 Boxes selected"),
    );

    await user.click(checkbox1);
    await waitFor(() => expect(checkbox1).not.toBeChecked());
    await waitFor(() =>
      expect(screen.getByTestId("selected-boxes-counter")).toHaveTextContent("1 Box selected"),
    );

    await user.click(screen.getByText("Clear all"));
    await waitFor(() => expect(checkbox2).not.toBeChecked());
    await waitFor(() => expect(screen.getByTestId("selected-boxes-counter")).toBeEmptyDOMElement());
  }, 15000);

  it("4.8.2.3 - The selection is cleared when the page changes", async () => {
    const user = userEvent.setup();
    renderBoxes({
      initialUrl: "/bases/2/boxes?state_ids=1",
      mocks: [
        defaultRowsMock(inStockOptions, generateBoxRows(60)),
        boxRowsMock({
          options: { page: 3, pageSize: 50, filters: { states: ["InStock"] } },
          rows: [scrapBoxRow],
          totalNumberOfBoxes: 268,
        }),
        actionOptionsMock(),
      ],
    });

    const row = await screen.findByRole("row", { name: /L0001/i }, { timeout: 10000 });
    await user.click(within(row).getByRole("checkbox", { name: /toggle row selected/i }));
    await waitFor(() =>
      expect(screen.getByTestId("selected-boxes-counter")).toHaveTextContent("1 Box selected"),
    );

    await user.click(screen.getByRole("button", { name: /next page/i }));
    await screen.findByText("L0051");
    expect(screen.getByTestId("selected-boxes-counter")).toBeEmptyDOMElement();
  });
});

describe("4.8.3 - URL Parameter Sync for Filters", () => {
  it("4.8.3.1 - Component should parse URL parameters correctly", async () => {
    renderBoxes({
      initialUrl: "/bases/2/boxes?state_ids=1",
      mocks: [defaultRowsMock(), actionOptionsMock()],
    });

    await screen.findByText(/8650860/i, {}, { timeout: 10000 });
    expect(screen.getByText(/1481666/i)).toBeInTheDocument();
    expect(screen.getByTestId("filters-drawer-button")).toBeInTheDocument();
    expect(screen.getByTestId("filter-chip-state-1")).toBeInTheDocument();
  });

  it("4.8.3.2 - Component should ignore invalid state_ids parameter", async () => {
    renderBoxes({
      initialUrl: "/bases/2/boxes?state_ids=999&product_ids=abc",
      mocks: [
        defaultRowsMock(firstRequestOptions({}), [instockBoxRow1, instockBoxRow2, scrapBoxRow]),
        actionOptionsMock(),
      ],
    });

    await screen.findByText(/8650860/i, {}, { timeout: 10000 });
    expect(screen.getByText(/4495955/i)).toBeInTheDocument();
    expect(screen.queryByTestId("filter-chips")).not.toBeInTheDocument();
  });

  it("4.8.3.3 - Component should handle product_ids parameter", async () => {
    renderBoxes({
      initialUrl: "/bases/2/boxes?product_ids=267&state_ids=1",
      mocks: [
        defaultRowsMock(firstRequestOptions({ productIds: [267], states: ["InStock"] }), [
          instockBoxRow1,
        ]),
        actionOptionsMock(),
      ],
    });

    await screen.findByText(/1481666/i, {}, { timeout: 10000 });
    expect(screen.queryByText(/8650860/i)).not.toBeInTheDocument();
    // Chip and table cell of the product
    expect(screen.getAllByText(/Sweatpants/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId("filter-chip-product-267")).toBeInTheDocument();
  });

  it("4.8.3.4 - Component should handle multiple comma-separated IDs and all filter kinds", async () => {
    renderBoxes({
      initialUrl:
        "/bases/2/boxes?product_ids=267,350&state_ids=1,5&gender_ids=2,6&product_category_ids=1&size_ids=52&location_ids=16,17&tag_ids=10&no_tag_ids=12",
      mocks: [
        defaultRowsMock(
          firstRequestOptions({
            states: ["InStock", "Donated"],
            productGenders: ["Men", "UnisexKid"],
            productCategoryIds: [1],
            productIds: [267, 350],
            sizeIds: [52],
            tagIds: [10],
            excludedTagIds: [12],
            locationIds: [16, 17],
          }),
        ),
        actionOptionsMock(),
      ],
    });

    await screen.findByText(/8650860/i, {}, { timeout: 10000 });
    expect(screen.getByText(/1481666/i)).toBeInTheDocument();
  });
});

describe("4.8.4 - URL Parameter Sync for Created Date Range Filters", () => {
  const dateRangeRows = [instockBoxRow1, instockBoxRow2];

  it("4.8.4.1 - Component should parse both created_from and created_to URL parameters", async () => {
    renderBoxes({
      initialUrl: "/bases/2/boxes?created_from=2021-01-01&created_to=2024-01-01",
      mocks: [
        defaultRowsMock(
          firstRequestOptions({ createdFrom: "2021-01-01", createdUntil: "2024-01-01" }),
          dateRangeRows,
        ),
        actionOptionsMock(),
      ],
    });

    await screen.findByText(/8650860/i, {}, { timeout: 10000 });

    expect(screen.getByTestId("filter-chip-createdOn-from")).toBeInTheDocument();
    expect(screen.getByTestId("filter-chip-createdOn-to")).toBeInTheDocument();
    expect(screen.getByText("From 2021-01-01")).toBeInTheDocument();
    expect(screen.getByText("To 2024-01-01")).toBeInTheDocument();
  });

  it("4.8.4.2 - Component should parse only created_from URL parameter", async () => {
    renderBoxes({
      initialUrl: "/bases/2/boxes?created_from=2021-01-01",
      mocks: [
        defaultRowsMock(firstRequestOptions({ createdFrom: "2021-01-01" }), dateRangeRows),
        actionOptionsMock(),
      ],
    });

    await screen.findByText(/8650860/i, {}, { timeout: 10000 });

    expect(screen.getByTestId("filter-chip-createdOn-from")).toBeInTheDocument();
    expect(screen.getByText("From 2021-01-01")).toBeInTheDocument();
    expect(screen.queryByTestId("filter-chip-createdOn-to")).not.toBeInTheDocument();
  });

  it("4.8.4.3 - Component should parse only created_to URL parameter", async () => {
    renderBoxes({
      initialUrl: "/bases/2/boxes?created_to=2024-01-01",
      mocks: [
        defaultRowsMock(firstRequestOptions({ createdUntil: "2024-01-01" }), dateRangeRows),
        actionOptionsMock(),
      ],
    });

    await screen.findByText(/8650860/i, {}, { timeout: 10000 });

    expect(screen.queryByTestId("filter-chip-createdOn-from")).not.toBeInTheDocument();
    expect(screen.getByTestId("filter-chip-createdOn-to")).toBeInTheDocument();
    expect(screen.getByText("To 2024-01-01")).toBeInTheDocument();
  });

  it("4.8.4.4 - Invalid dates are ignored", async () => {
    renderBoxes({
      initialUrl: "/bases/2/boxes?created_from=01.01.2021&created_to=2024-13-45&state_ids=1",
      mocks: [defaultRowsMock(), actionOptionsMock()],
    });

    await screen.findByText(/8650860/i, {}, { timeout: 10000 });
    expect(screen.queryByTestId("filter-chip-createdOn-from")).not.toBeInTheDocument();
    expect(screen.queryByTestId("filter-chip-createdOn-to")).not.toBeInTheDocument();
  });

  it("4.8.4.5 - Removing created_from chip should remove only that URL parameter", async () => {
    const user = userEvent.setup();
    renderBoxes({
      initialUrl: "/bases/2/boxes?created_from=2021-01-01&created_to=2024-01-01",
      mocks: [
        defaultRowsMock(
          firstRequestOptions({ createdFrom: "2021-01-01", createdUntil: "2024-01-01" }),
          dateRangeRows,
        ),
        defaultRowsMock(firstRequestOptions({ createdUntil: "2024-01-01" }), [instockBoxRow1]),
        actionOptionsMock(),
      ],
    });

    await screen.findByText(/8650860/i, {}, { timeout: 10000 });
    await user.click(screen.getByTestId("filter-chip-close-createdOn-from"));

    await waitFor(() => {
      expect(screen.queryByTestId("filter-chip-createdOn-from")).not.toBeInTheDocument();
      expect(screen.getByTestId("filter-chip-createdOn-to")).toBeInTheDocument();
    });
    expect(currentUrl()).toBe("/bases/2/boxes?created_to=2024-01-01");
    await waitFor(() => expect(screen.queryByText(/8650860/i)).not.toBeInTheDocument());
  });
});

describe("4.8.5 - The URL is the single source of truth", () => {
  it("4.8.5.1 - Applies the defaults on the first visit and writes them to the URL", async () => {
    renderBoxes({
      initialUrl: "/bases/2/boxes",
      mocks: [defaultRowsMock(), actionOptionsMock()],
    });

    await screen.findByText(/8650860/i, {}, { timeout: 10000 });
    await waitFor(() => expect(currentUrl()).toBe("/bases/2/boxes?state_ids=1"));
    expect(screen.getByTestId("filter-chip-state-1")).toBeInTheDocument();
    await waitFor(() => expect(localStorage.getItem(storageKey(2))).toBe("state_ids=1"));
  });

  it("4.8.5.2 - Restores the last view of the base from localStorage", async () => {
    localStorage.setItem(storageKey(2), "location_ids=16&sort_by=product&descending=true&page=3");
    renderBoxes({
      initialUrl: "/bases/2/boxes",
      mocks: [
        boxRowsMock({
          options: {
            page: 3,
            pageSize: 50,
            filters: { locationIds: [16] },
            sortBy: "ProductName",
            descending: true,
          },
          rows: [instockBoxRow1],
          totalNumberOfBoxes: 130,
        }),
        actionOptionsMock(),
      ],
    });

    await screen.findByText(/1481666/i, {}, { timeout: 10000 });
    await waitFor(() =>
      expect(currentUrl()).toBe(
        "/bases/2/boxes?location_ids=16&sort_by=product&descending=true&page=3",
      ),
    );
    expect(screen.getByTestId("page-indicator")).toHaveTextContent("Page 3 of 3");
  });

  it("4.8.5.3 - A stored empty query string keeps the filters cleared", async () => {
    localStorage.setItem(storageKey(2), "");
    renderBoxes({
      initialUrl: "/bases/2/boxes",
      mocks: [
        defaultRowsMock(firstRequestOptions({}), [instockBoxRow1, instockBoxRow2, scrapBoxRow]),
        actionOptionsMock(),
      ],
    });

    await screen.findByText(/4495955/i, {}, { timeout: 10000 });
    expect(currentUrl()).toBe("/bases/2/boxes");
    expect(screen.queryByTestId("filter-chips")).not.toBeInTheDocument();
  });

  it("4.8.5.4 - Parameters of the URL win over the stored view", async () => {
    localStorage.setItem(storageKey(2), "state_ids=6");
    renderBoxes({
      initialUrl: "/bases/2/boxes?state_ids=1",
      mocks: [defaultRowsMock(), actionOptionsMock()],
    });

    await screen.findByText(/8650860/i, {}, { timeout: 10000 });
    expect(currentUrl()).toBe("/bases/2/boxes?state_ids=1");
    await waitFor(() => expect(localStorage.getItem(storageKey(2))).toBe("state_ids=1"));
  });

  it("4.8.5.5 - Works if localStorage is not available", async () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    renderBoxes({
      initialUrl: "/bases/2/boxes",
      mocks: [defaultRowsMock(), actionOptionsMock()],
    });

    await screen.findByText(/8650860/i, {}, { timeout: 10000 });
    expect(currentUrl()).toBe("/bases/2/boxes?state_ids=1");
    getItem.mockRestore();
    setItem.mockRestore();
  });

  it("4.8.5.6 - A manually edited URL updates the table", async () => {
    const user = userEvent.setup();
    renderBoxes({
      initialUrl: "/bases/2/boxes?state_ids=1",
      editedUrl: "/bases/2/boxes?state_ids=6&sort_by=location&descending=false",
      mocks: [
        defaultRowsMock(),
        boxRowsMock({
          options: firstRequestOptions(
            { states: ["Scrap"] },
            { sortBy: "LocationName", descending: false },
          ),
          rows: [scrapBoxRow],
        }),
        actionOptionsMock(),
      ],
    });

    await screen.findByText(/8650860/i, {}, { timeout: 10000 });
    await user.click(screen.getByText("edit URL"));

    await screen.findByText(/4495955/i, {}, { timeout: 10000 });
    expect(screen.queryByText(/8650860/i)).not.toBeInTheDocument();
    expect(screen.getByTestId("filter-chip-state-6")).toBeInTheDocument();
    expect(screen.queryByTestId("filter-chip-state-1")).not.toBeInTheDocument();
    expect(screen.getByLabelText("sorted ascending")).toBeInTheDocument();
  });

  it("4.8.5.7 - Clearing the state filter does not bring back the InStock default", async () => {
    const user = userEvent.setup();
    renderBoxes({
      initialUrl: "/bases/2/boxes?state_ids=1",
      mocks: [
        defaultRowsMock(),
        defaultRowsMock(firstRequestOptions({}), [instockBoxRow1, instockBoxRow2, scrapBoxRow]),
        actionOptionsMock(),
      ],
    });

    await screen.findByText(/8650860/i, {}, { timeout: 10000 });
    await user.click(screen.getByTestId("filter-chip-close-state-1"));

    await screen.findByText(/4495955/i, {}, { timeout: 10000 });
    expect(currentUrl()).toBe("/bases/2/boxes");
    await waitFor(() => expect(localStorage.getItem(storageKey(2))).toBe(""));
  });
});

describe("4.8.6 - Sorting", () => {
  it("4.8.6.1 - Clicking a header cycles through ascending, descending and the default order", async () => {
    const user = userEvent.setup();
    renderBoxes({
      initialUrl: "/bases/2/boxes?state_ids=1",
      mocks: [
        defaultRowsMock(),
        boxRowsMock({
          options: firstRequestOptions(
            { states: ["InStock"] },
            { sortBy: "LocationName", descending: false },
          ),
          rows: [instockBoxRow1, instockBoxRow2],
          totalNumberOfBoxes: 2,
        }),
        boxRowsMock({
          options: firstRequestOptions(
            { states: ["InStock"] },
            { sortBy: "LocationName", descending: true },
          ),
          rows: [instockBoxRow2, instockBoxRow1],
          totalNumberOfBoxes: 2,
        }),
        defaultRowsMock(),
        actionOptionsMock(),
      ],
    });

    await screen.findByText(/8650860/i, {}, { timeout: 10000 });

    await user.click(getColumnHeader(/^Location$/));
    await waitFor(() =>
      expect(currentUrl()).toBe("/bases/2/boxes?state_ids=1&sort_by=location&descending=false"),
    );
    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      expect(rows).toHaveLength(3);
      expect(rows[1]).toHaveTextContent("Stockroom");
      expect(rows[2]).toHaveTextContent("WH1");
    });
    expect(screen.getByLabelText("sorted ascending")).toBeInTheDocument();

    await user.click(getColumnHeader(/^Location$/));
    await waitFor(() =>
      expect(currentUrl()).toBe("/bases/2/boxes?state_ids=1&sort_by=location&descending=true"),
    );
    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      expect(rows).toHaveLength(3);
      expect(rows[1]).toHaveTextContent("WH1");
      expect(rows[2]).toHaveTextContent("Stockroom");
    });
    expect(screen.getByLabelText("sorted descending")).toBeInTheDocument();

    await user.click(getColumnHeader(/^Location$/));
    await waitFor(() => expect(currentUrl()).toBe("/bases/2/boxes?state_ids=1"));
    await waitFor(() => {
      expect(screen.queryByLabelText("sorted descending")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("sorted ascending")).not.toBeInTheDocument();
    });
  }, 30000);

  it("4.8.6.2 - Sorting resets the page and keeps the filters", async () => {
    const user = userEvent.setup();
    renderBoxes({
      initialUrl: "/bases/2/boxes?state_ids=1&page=3",
      mocks: [
        boxRowsMock({
          options: { page: 3, pageSize: 50, filters: { states: ["InStock"] } },
          rows: [scrapBoxRow],
          totalNumberOfBoxes: 268,
        }),
        // prefetch of the next page
        boxRowsMock({
          options: { page: 4, pageSize: 50, filters: { states: ["InStock"] } },
          rows: [],
          totalNumberOfBoxes: 268,
        }),
        boxRowsMock({
          options: firstRequestOptions(
            { states: ["InStock"] },
            { sortBy: "LabelIdentifier", descending: false },
          ),
          rows: [instockBoxRow1],
          totalNumberOfBoxes: 268,
        }),
        actionOptionsMock(),
      ],
    });

    await screen.findByText(/4495955/i, {}, { timeout: 10000 });
    expect(currentUrl()).toBe("/bases/2/boxes?state_ids=1&page=3");

    await user.click(getColumnHeader(/^Box #$/));
    await screen.findByText(/1481666/i, {}, { timeout: 10000 });
    expect(currentUrl()).toBe(
      "/bases/2/boxes?state_ids=1&sort_by=labelIdentifier&descending=false",
    );
  });

  it("4.8.6.3 - Columns that cannot be sorted by the server are not clickable", async () => {
    const user = userEvent.setup();
    renderBoxes({
      initialUrl: "/bases/2/boxes?state_ids=1",
      mocks: [defaultRowsMock(), actionOptionsMock()],
    });

    await screen.findByText(/8650860/i, {}, { timeout: 10000 });
    await user.click(getColumnHeader(/^Status$/));
    await user.click(getColumnHeader(/^Tags$/));
    expect(currentUrl()).toBe("/bases/2/boxes?state_ids=1");
    expect(screen.queryByLabelText("sorted ascending")).not.toBeInTheDocument();
  });
});

describe("4.8.7 - Filters and pagination", () => {
  it("4.8.7.1 - Changing the filters resets the page", async () => {
    const user = userEvent.setup();
    renderBoxes({
      initialUrl: "/bases/2/boxes?created_from=2021-01-01&state_ids=1&page=3",
      mocks: [
        boxRowsMock({
          options: {
            page: 3,
            pageSize: 50,
            filters: { createdFrom: "2021-01-01", states: ["InStock"] },
          },
          rows: [scrapBoxRow],
          totalNumberOfBoxes: 268,
        }),
        boxRowsMock({
          options: {
            page: 4,
            pageSize: 50,
            filters: { createdFrom: "2021-01-01", states: ["InStock"] },
          },
          rows: [],
          totalNumberOfBoxes: 268,
        }),
        defaultRowsMock(firstRequestOptions({ states: ["InStock"] })),
        actionOptionsMock(),
      ],
    });

    await screen.findByText(/4495955/i, {}, { timeout: 10000 });
    await user.click(screen.getByTestId("filter-chip-close-createdOn-from"));

    await screen.findByText(/8650860/i, {}, { timeout: 10000 });
    expect(currentUrl()).toBe("/bases/2/boxes?state_ids=1");
  });

  it("4.8.7.2 - Pages are 50 boxes, the first request covers two pages and later pages are prefetched", async () => {
    const user = userEvent.setup();
    renderBoxes({
      initialUrl: "/bases/2/boxes?state_ids=1",
      mocks: [
        defaultRowsMock(inStockOptions, generateBoxRows(60)),
        boxRowsMock({
          options: { page: 3, pageSize: 50, filters: { states: ["InStock"] } },
          rows: [scrapBoxRow],
          totalNumberOfBoxes: 268,
          delay: 200,
        }),
        boxRowsMock({
          options: { page: 4, pageSize: 50, filters: { states: ["InStock"] } },
          rows: [],
          totalNumberOfBoxes: 268,
        }),
        actionOptionsMock(),
      ],
    });

    await screen.findByText("L0001", {}, { timeout: 10000 });
    expect(screen.getByText("L0050")).toBeInTheDocument();
    expect(screen.queryByText("L0051")).not.toBeInTheDocument();
    expect(screen.getByTestId("page-indicator")).toHaveTextContent("Page 1 of 6");
    expect(screen.getByRole("button", { name: /previous page/i })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /next page/i }));
    await screen.findByText("L0051");
    expect(screen.queryByText("L0001")).not.toBeInTheDocument();
    expect(currentUrl()).toBe("/bases/2/boxes?state_ids=1&page=2");

    // Page 3 is being prefetched; no skeleton, but the next page button is disabled meanwhile
    expect(screen.getByRole("button", { name: /next page/i })).toBeDisabled();
    await waitFor(() => expect(screen.getByRole("button", { name: /next page/i })).toBeEnabled());

    await user.click(screen.getByRole("button", { name: /next page/i }));
    await screen.findByText("4495955");
    expect(currentUrl()).toBe("/bases/2/boxes?state_ids=1&page=3");

    // Page changes are pushed to the history
    await user.click(screen.getByText("history back"));
    await screen.findByText("L0051");
    expect(currentUrl()).toBe("/bases/2/boxes?state_ids=1&page=2");

    await user.click(screen.getByRole("button", { name: /previous page/i }));
    await screen.findByText("L0001");
    expect(currentUrl()).toBe("/bases/2/boxes?state_ids=1");
  }, 30000);

  it("4.8.7.3 - A page beyond the last page is corrected", async () => {
    renderBoxes({
      initialUrl: "/bases/2/boxes?state_ids=1&page=99",
      mocks: [
        boxRowsMock({
          options: { page: 99, pageSize: 50, filters: { states: ["InStock"] } },
          rows: [],
          totalNumberOfBoxes: 268,
        }),
        boxRowsMock({
          options: { page: 6, pageSize: 50, filters: { states: ["InStock"] } },
          rows: [scrapBoxRow],
          totalNumberOfBoxes: 268,
        }),
        actionOptionsMock(),
      ],
    });

    await screen.findByText(/4495955/i, {}, { timeout: 10000 });
    expect(currentUrl()).toBe("/bases/2/boxes?state_ids=1&page=6");
    expect(screen.getByRole("button", { name: /next page/i })).toBeDisabled();
  });

  it("4.8.7.4 - Invalid page values fall back to the first page", async () => {
    renderBoxes({
      initialUrl: "/bases/2/boxes?state_ids=1&page=-4",
      mocks: [defaultRowsMock(), actionOptionsMock()],
    });

    await screen.findByText(/8650860/i, {}, { timeout: 10000 });
    expect(screen.getByRole("button", { name: /previous page/i })).toBeDisabled();
  });
});

describe("4.8.8 - Switching the base", () => {
  it("4.8.8.1 - Does not reuse the parameters of the previous base", async () => {
    const user = userEvent.setup();
    localStorage.setItem(storageKey(1), "location_ids=5");
    renderBoxes({
      initialUrl: "/bases/2/boxes?state_ids=1&sort_by=product&descending=true&product_ids=267",
      mocks: [
        defaultRowsMock(
          firstRequestOptions(
            { productIds: [267], states: ["InStock"] },
            { sortBy: "ProductName", descending: true },
          ),
        ),
        boxRowsMock({
          baseId: 1,
          options: firstRequestOptions({ locationIds: [5] }),
          rows: [scrapBoxRow],
        }),
        actionOptionsMock("2"),
        actionOptionsMock("1"),
      ],
    });

    await screen.findByText(/8650860/i, {}, { timeout: 10000 });
    await user.click(screen.getByText("switch base"));

    await screen.findByText(/4495955/i, {}, { timeout: 10000 });
    await waitFor(() => expect(currentUrl()).toBe("/bases/1/boxes?location_ids=5"));
    expect(screen.queryByTestId("filter-chip-product-267")).not.toBeInTheDocument();
    // The view of each base is remembered separately
    expect(localStorage.getItem(storageKey(1))).toBe("location_ids=5");
    expect(localStorage.getItem(storageKey(2))).toBe(
      "product_ids=267&state_ids=1&sort_by=product&descending=true",
    );
  });

  it("4.8.8.2 - Applies the defaults for a base without a stored view", async () => {
    const user = userEvent.setup();
    renderBoxes({
      initialUrl: "/bases/2/boxes?location_ids=16&page=1",
      mocks: [
        defaultRowsMock(firstRequestOptions({ locationIds: [16] })),
        boxRowsMock({ baseId: 1, options: inStockOptions, rows: [scrapBoxRow] }),
        actionOptionsMock("2"),
        actionOptionsMock("1"),
      ],
    });

    await screen.findByText(/8650860/i, {}, { timeout: 10000 });
    await user.click(screen.getByText("switch base"));

    await screen.findByText(/4495955/i, {}, { timeout: 10000 });
    await waitFor(() => expect(currentUrl()).toBe("/bases/1/boxes?state_ids=1"));
  });
});
