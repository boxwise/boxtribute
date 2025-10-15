import { it, describe, expect, vi, beforeEach } from "vitest";
import { userEvent } from "@testing-library/user-event";
import { screen, render, waitFor, within } from "tests/test-utils";
import { MOVE_BOXES_TO_LOCATION } from "hooks/useMoveBoxes";
import { ErrorBoundary } from "@sentry/react";
import { AlertWithoutAction } from "components/Alerts";
import { TableSkeleton } from "components/Skeletons";
import { Suspense } from "react";
import { cache } from "queries/cache";
import Boxes, { ACTION_OPTIONS_FOR_BOXESVIEW_QUERY, BOXES_FOR_BOXESVIEW_QUERY } from "./BoxesView";
import { FakeGraphQLError, FakeGraphQLNetworkError } from "mocks/functions";
import {
  selectedBaseAtom,
  organisationAtom,
  availableBasesAtom,
} from "stores/globalPreferenceStore";
import { base2 } from "mocks/bases";
import { organisation2 } from "mocks/organisations";
import { useAuth0 } from "@auth0/auth0-react";
import { mockAuthenticatedUser } from "mocks/hooks";

vi.mock("@auth0/auth0-react");
// .mocked() is a nice helper function from jest for typescript support
// https://jestjs.io/docs/mock-function-api/#typescript-usage
const mockedUseAuth0 = vi.mocked(useAuth0);

beforeEach(() => {
  mockAuthenticatedUser(mockedUseAuth0, "dev_volunteer@boxcare.org");
});

const jotaiAtoms = [
  [selectedBaseAtom, base2],
  [organisationAtom, organisation2],
  [availableBasesAtom, organisation2.bases],
];

const boxesQuery = ({
  state = "InStock",
  paginationInput = 100000,
  state2 = undefined,
}: {
  state?: string;
  paginationInput?: number;
  state2?: string;
}) => ({
  request: {
    query: BOXES_FOR_BOXESVIEW_QUERY,
    variables: {
      baseId: "2",
      filterInput: { states: state2 ? [state, state2] : [state] },
      paginationInput,
    },
  },
  result: {
    data: {
      // TODO: the data should be placed in the mocks
      boxes: {
        __typename: "BoxPage",
        elements:
          state === "InStock"
            ? [
                {
                  __typename: "Box",
                  id: "2",
                  comment: null,
                  history: [],
                  labelIdentifier: "1481666",
                  location: {
                    __typename: "ClassicLocation",
                    base: {
                      __typename: "Base",
                      id: "2",
                      name: "Thessaloniki",
                    },
                    defaultBoxState: "InStock",
                    id: "16",
                    name: "Stockroom",
                  },
                  numberOfItems: 23,
                  product: {
                    __typename: "Product",
                    type: "Custom",
                    deletedOn: null,
                    category: {
                      id: "1",
                      name: "Bottoms",
                      __typename: "ProductCategory",
                    },
                    gender: "Men",
                    id: "267",
                    name: "Sweatpants",
                  },
                  shipmentDetail: null,
                  size: {
                    __typename: "Size",
                    id: "52",
                    label: "Mixed",
                  },
                  state: "InStock",
                  tags: [
                    {
                      __typename: "Tag",
                      color: "#d89016",
                      description: "",
                      id: "11",
                      name: "new",
                      type: "All",
                    },
                  ],
                  createdOn: "2021-10-29T15:02:40+00:00",
                  createdBy: {
                    __typename: "User",
                    id: "123",
                    name: "Some User",
                  },
                  lastModifiedBy: {
                    __typename: "User",
                    id: "1234",
                    name: "Another User",
                  },
                  lastModifiedOn: new Date().toISOString(),
                  deletedOn: null,
                  qrCode: {
                    __typename: "QrCode",
                    code: "12345",
                  },
                },
                {
                  __typename: "Box",
                  id: "3",
                  comment: null,
                  history: [
                    {
                      __typename: "HistoryEntry",
                      changeDate: "2023-10-29T15:02:58+00:00",
                      changes: "changed box state from Scrap to InStock",
                      id: "30946",
                      user: {
                        __typename: "User",
                        id: "17",
                        name: "Dev Coordinator",
                      },
                    },
                    {
                      __typename: "HistoryEntry",
                      changeDate: "2023-10-29T15:02:51+00:00",
                      changes: "changed box state from InStock to Scrap",
                      id: "30945",
                      user: {
                        __typename: "User",
                        id: "17",
                        name: "Dev Coordinator",
                      },
                    },
                    {
                      __typename: "HistoryEntry",
                      changeDate: "2023-10-29T15:02:40+00:00",
                      changes: "changed box state from Scrap to InStock",
                      id: "30944",
                      user: {
                        __typename: "User",
                        id: "17",
                        name: "Dev Coordinator",
                      },
                    },
                    {
                      __typename: "HistoryEntry",
                      changeDate: "2023-10-29T15:02:40+00:00",
                      changes: "changed box location from SCRAP to WH2",
                      id: "30943",
                      user: {
                        __typename: "User",
                        id: "17",
                        name: "Dev Coordinator",
                      },
                    },
                  ],
                  labelIdentifier: "8650860",
                  location: {
                    __typename: "ClassicLocation",
                    base: {
                      __typename: "Base",
                      id: "2",
                      name: "Thessaloniki",
                    },
                    defaultBoxState: "InStock",
                    id: "18",
                    name: "WH1",
                  },
                  numberOfItems: 33,
                  product: {
                    __typename: "Product",
                    deletedOn: null,
                    type: "Custom",
                    category: {
                      id: "1",
                      name: "Bottoms",
                      __typename: "ProductCategory",
                    },
                    gender: "UnisexKid",
                    id: "350",
                    name: "Robes",
                  },
                  shipmentDetail: null,
                  size: {
                    __typename: "Size",
                    id: "52",
                    label: "Mixed",
                  },
                  state: "InStock",
                  tags: [
                    {
                      __typename: "Tag",
                      color: "#f37167",
                      description: "Donation from company x",
                      id: "10",
                      name: "company X",
                      type: "Box",
                    },
                    {
                      __typename: "Tag",
                      color: "#d89016",
                      description: "",
                      id: "11",
                      name: "new",
                      type: "All",
                    },
                    {
                      __typename: "Tag",
                      color: "#0097ff",
                      description: "Hold back for emergencies",
                      id: "12",
                      name: "emergency",
                      type: "Box",
                    },
                  ],
                  createdOn: "2021-10-29T15:02:40+00:00",
                  createdBy: {
                    __typename: "User",
                    id: "123",
                    name: "Some User",
                  },
                  lastModifiedBy: {
                    __typename: "User",
                    id: "1234",
                    name: "Another User",
                  },
                  lastModifiedOn: new Date().toISOString(),
                  deletedOn: null,
                  qrCode: null,
                },
              ]
            : state === "Scrap"
              ? [
                  {
                    id: "1",
                    __typename: "Box",
                    comment: null,
                    history: [],
                    labelIdentifier: "4495955",
                    location: {
                      __typename: "ClassicLocation",
                      base: {
                        __typename: "Base",
                        id: "2",
                        name: "Thessaloniki",
                      },
                      defaultBoxState: "Scrap",
                      id: "15",
                      name: "SCRAP",
                    },
                    numberOfItems: 99,
                    product: {
                      __typename: "Product",
                      type: "Custom",
                      deletedOn: null,
                      category: {
                        id: "1",
                        name: "Bottoms",
                        __typename: "ProductCategory",
                      },
                      gender: "none",
                      id: "233",
                      name: "Toothbrush",
                    },
                    shipmentDetail: null,
                    size: {
                      __typename: "Size",
                      id: "68",
                      label: "One size",
                    },
                    state: "Scrap",
                    tags: [],
                    createdOn: "2021-10-29T15:02:40+00:00",
                    createdBy: {
                      __typename: "User",
                      id: "123",
                      name: "Some User",
                    },
                    lastModifiedBy: {
                      __typename: "User",
                      id: "1234",
                      name: "Another User",
                    },
                    lastModifiedOn: new Date().toISOString(),
                    deletedOn: null,
                    qrCode: {
                      __typename: "QrCode",
                      code: "67890",
                    },
                  },
                ]
              : state === "Donated"
                ? []
                : [],
        pageInfo: {
          __typename: "PageInfo",
          hasNextPage: false,
        },
        totalCount: 268,
      },
    },
  },
});

const actionsQuery = {
  request: {
    query: ACTION_OPTIONS_FOR_BOXESVIEW_QUERY,
    variables: {
      baseId: "2",
    },
  },
  result: {
    data: {
      base: {
        __typename: "Base",
        id: "2",
        locations: [
          {
            __typename: "ClassicLocation",
            defaultBoxState: "Lost",
            id: "14",
            name: "LOST",
            seq: 14,
          },
          {
            __typename: "ClassicLocation",
            defaultBoxState: "Scrap",
            id: "15",
            name: "SCRAP",
            seq: 15,
          },
          {
            __typename: "ClassicLocation",
            defaultBoxState: "InStock",
            id: "16",
            name: "Stockroom",
            seq: 16,
          },
          {
            __typename: "ClassicLocation",
            defaultBoxState: "InStock",
            id: "17",
            name: "WH1",
            seq: 17,
          },
          {
            __typename: "ClassicLocation",
            defaultBoxState: "InStock",
            id: "18",
            name: "WH2",
            seq: 18,
          },
        ],
        tags: [
          {
            __typename: "Tag",
            color: "#f37167",
            description: "Donation from company x",
            id: "10",
            name: "company X",
            type: "Box",
          },
          {
            __typename: "Tag",
            color: "#d89016",
            description: "",
            id: "11",
            name: "new",
            type: "All",
          },
          {
            __typename: "Tag",
            color: "#0097ff",
            description: "Hold back for emergencies",
            id: "12",
            name: "emergency",
            type: "Box",
          },
        ],
      },
      shipments: [
        {
          __typename: "Shipment",
          labelIdentifier: "S001-231111-LExTH",
          id: "1",
          sourceBase: {
            __typename: "Base",
            id: "1",
            name: "Lesvos",
            organisation: {
              __typename: "Organisation",
              id: "1",
              name: "BoxAid",
            },
          },
          state: "Preparing",
          targetBase: {
            __typename: "Base",
            id: "2",
            name: "Thessaloniki",
            organisation: {
              __typename: "Organisation",
              id: "2",
              name: "BoxCare",
            },
          },
        },
        {
          __typename: "Shipment",
          labelIdentifier: "S002-231111-LExTH",
          id: "2",
          sourceBase: {
            __typename: "Base",
            id: "1",
            name: "Lesvos",
            organisation: {
              __typename: "Organisation",
              id: "1",
              name: "BoxAid",
            },
          },
          state: "Canceled",
          targetBase: {
            __typename: "Base",
            id: "3",
            name: "Samos",
            organisation: {
              __typename: "Organisation",
              id: "2",
              name: "BoxCare",
            },
          },
        },
      ],
    },
  },
};

const moveBoxesMutation = {
  request: {
    query: MOVE_BOXES_TO_LOCATION,
    variables: {
      labelIdentifiers: ["8650860", "1481666"],
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
          },
          {
            labelIdentifier: "1481666",
            state: "InStock",
            location: {
              id: "17",
            },
            lastModifiedOn: new Date().toISOString(),
          },
        ],
        invalidBoxLabelIdentifiers: [],
      },
    },
  },
};

const initialQueryNetworkError = ({ state = "InStock", paginationInput = 100000 }) => ({
  request: {
    query: BOXES_FOR_BOXESVIEW_QUERY,
    variables: {
      baseId: "2",
      filterInput: { states: [state] },
      paginationInput,
    },
  },

  error: new FakeGraphQLNetworkError(),
});

const initialQueryGraphQLError = ({ state = "InStock", paginationInput = 100000 }) => ({
  request: {
    query: BOXES_FOR_BOXESVIEW_QUERY,
    variables: {
      baseId: "2",
      filterInput: { states: [state] },
      paginationInput,
    },
  },
  result: {
    data: {
      boxes: null,
    },
    errors: [new FakeGraphQLError()],
  },
});

describe("4.8.1 - Initial load of Page", () => {
  it("4.8.1.1 - Is the Loading State Shown First?", async () => {
    render(
      <ErrorBoundary
        fallback={
          <AlertWithoutAction alertText="Could not fetch boxes data! Please try reloading the page." />
        }
      >
        <Suspense fallback={<TableSkeleton />}>
          <Boxes hasExecutedInitialFetchOfBoxes={{ current: false }} />
        </Suspense>
      </ErrorBoundary>,
      {
        routePath: "/bases/:baseId/boxes",
        initialUrl: "/bases/2/boxes",
        mocks: [
          boxesQuery({ state: "Scrap", paginationInput: 20 }),
          boxesQuery({ state: "Donated", paginationInput: 20 }),
          boxesQuery({ state: "InStock", paginationInput: 20 }),
          boxesQuery({ state: "InStock" }),
          actionsQuery,
        ],
        cache,
        addTypename: true,
        jotaiAtoms,
      },
    );
    // Test case 4.8.1.1
    expect(screen.getByTestId("TableSkeleton")).toBeInTheDocument();
  });

  const failedInitialFetching = [
    {
      name: "4.8.1.2.2 - Failed to Fetch Initial Data",
      mocks: [
        boxesQuery({ state: "Scrap", paginationInput: 20 }),
        boxesQuery({ state: "Donated", paginationInput: 20 }),
        initialQueryGraphQLError({ paginationInput: 20 }),
        boxesQuery({}),
        actionsQuery,
      ],
    },
    {
      name: "4.8.1.2.6 - Failed to Fetch Initial Data",
      mocks: [
        boxesQuery({ state: "Scrap", paginationInput: 20 }),
        boxesQuery({ state: "Donated", paginationInput: 20 }),
        initialQueryNetworkError({ paginationInput: 20 }),
        boxesQuery({}),
        actionsQuery,
      ],
    },
  ];

  failedInitialFetching.forEach(({ name, mocks }) => {
    it(
      name,
      async () => {
        render(
          <ErrorBoundary
            fallback={
              <AlertWithoutAction alertText="Could not fetch boxes data! Please try reloading the page." />
            }
          >
            <Suspense fallback={<TableSkeleton />}>
              <Boxes hasExecutedInitialFetchOfBoxes={{ current: false }} />
            </Suspense>
          </ErrorBoundary>,
          {
            routePath: "/bases/:baseId/boxes",
            initialUrl: "/bases/2/boxes",
            mocks,
            cache,
            addTypename: true,
            jotaiAtoms,
          },
        );

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

  it("4.8.1.3 - The Boxes Table is shown", async () => {
    render(
      <ErrorBoundary
        fallback={
          <AlertWithoutAction alertText="Could not fetch boxes data! Please try reloading the page." />
        }
      >
        <Suspense fallback={<TableSkeleton />}>
          <Boxes hasExecutedInitialFetchOfBoxes={{ current: false }} />
        </Suspense>
      </ErrorBoundary>,
      {
        routePath: "/bases/:baseId/boxes",
        initialUrl: "/bases/2/boxes",
        mocks: [
          boxesQuery({ state: "Scrap", paginationInput: 20 }),
          boxesQuery({ state: "Donated", paginationInput: 20 }),
          boxesQuery({ paginationInput: 20 }),
          boxesQuery({}),
          actionsQuery,
        ],
        cache,
        addTypename: true,
        jotaiAtoms,
      },
    );

    // Test case 4.8.1.3
    expect(await screen.findByText(/8650860/i, {}, { timeout: 10000 })).toBeInTheDocument();
  });
});

describe("4.8.2 - Selecting rows and performing bulk actions", () => {
  it("4.8.2.1 - Select two checkboxes and perform bulk moves", async () => {
    const user = userEvent.setup();
    render(
      <ErrorBoundary
        fallback={
          <AlertWithoutAction alertText="Could not fetch boxes data! Please try reloading the page." />
        }
      >
        <Suspense fallback={<TableSkeleton />}>
          <Boxes hasExecutedInitialFetchOfBoxes={{ current: false }} />
        </Suspense>
      </ErrorBoundary>,
      {
        routePath: "/bases/:baseId/boxes",
        initialUrl: "/bases/2/boxes",
        mocks: [
          boxesQuery({ state: "Scrap", paginationInput: 20 }),
          boxesQuery({ state: "Donated", paginationInput: 20 }),
          boxesQuery({ paginationInput: 20 }),
          boxesQuery({}),
          actionsQuery,
          moveBoxesMutation,
        ],
        cache,
        addTypename: true,
        jotaiAtoms,
      },
    );

    // Test case 4.8.2.1 - Select two checkboxes and perform bulk moves
    const row1 = await screen.findByRole("row", { name: /8650860/i }, { timeout: 10000 });
    const checkbox1 = within(row1).getByRole("checkbox", {
      name: /toggle row selected/i,
    });

    const row2 = await screen.findByRole("row", { name: /1481666/i }, { timeout: 10000 });
    const checkbox2 = within(row2).getByRole("checkbox", {
      name: /toggle row selected/i,
    });

    if (checkbox1 && checkbox2) {
      expect(checkbox1).not.toBeChecked();
      await user.click(checkbox1);
      await waitFor(() => expect(checkbox1).toBeChecked(), { timeout: 10000 });

      expect(checkbox2).not.toBeChecked();
      await user.click(checkbox2);
      await waitFor(() => expect(checkbox2).toBeChecked(), { timeout: 10000 });

      // Add a delay to ensure state propagation in CI environments
      await new Promise((resolve) => setTimeout(resolve, 200));

      const moveBoxesButton = await screen.findByRole(
        "button",
        {
          name: /move/i,
        },
        { timeout: 10000 },
      );

      await user.click(moveBoxesButton);

      expect(
        await screen.findByRole(
          "menuitem",
          {
            name: /wh1/i,
          },
          { timeout: 10000 },
        ),
      ).toBeInTheDocument();

      await user.click(
        screen.getByRole("menuitem", {
          name: /wh1/i,
        }),
      );

      // Wait for the UI to update after the action
      await waitFor(
        () => {
          expect(within(row1).getByText(/8650860/i)).toBeInTheDocument();
        },
        { timeout: 10000 },
      );
      expect(within(row2).getByText(/1481666/i)).toBeInTheDocument();
    }
  }, 25000);

  it("4.8.2.2 - Shows selected boxes counter when boxes are selected", async () => {
    const user = userEvent.setup();
    render(
      <ErrorBoundary
        fallback={
          <AlertWithoutAction alertText="Could not fetch boxes data! Please try reloading the page." />
        }
      >
        <Suspense fallback={<TableSkeleton />}>
          <Boxes hasExecutedInitialFetchOfBoxes={{ current: false }} />
        </Suspense>
      </ErrorBoundary>,
      {
        routePath: "/bases/:baseId/boxes",
        initialUrl: "/bases/2/boxes",
        mocks: [
          boxesQuery({ state: "Scrap", paginationInput: 20 }),
          boxesQuery({ state: "Donated", paginationInput: 20 }),
          boxesQuery({ paginationInput: 20 }),
          boxesQuery({}),
          actionsQuery,
        ],
        cache,
        addTypename: true,
        jotaiAtoms,
      },
    );

    // Wait for the table to load
    const row1 = await screen.findByRole("row", { name: /8650860/i }, { timeout: 5000 });
    const checkbox1 = within(row1).getByRole("checkbox", {
      name: /toggle row selected/i,
    });

    const row2 = await screen.findByRole("row", { name: /1481666/i });
    const checkbox2 = within(row2).getByRole("checkbox", {
      name: /toggle row selected/i,
    });

    // Initially, no counter should be visible
    expect(screen.queryByTestId("floating-selected-counter")).not.toBeInTheDocument();

    // Select one box
    await user.click(checkbox1);
    await waitFor(() => expect(checkbox1).toBeChecked());

    // Counter should show "one box selected"
    expect(await screen.findByTestId("floating-selected-counter")).toBeInTheDocument();
    expect(screen.getByText("one box selected")).toBeInTheDocument();

    // Select second box
    await user.click(checkbox2);
    await waitFor(() => expect(checkbox2).toBeChecked());

    // Counter should show "2 boxes selected"
    expect(screen.getByText("2 boxes selected")).toBeInTheDocument();

    // Unselect one box
    await user.click(checkbox1);
    await waitFor(() => expect(checkbox1).not.toBeChecked());

    // Counter should show "one box selected" again
    expect(screen.getByText("one box selected")).toBeInTheDocument();

    // Unselect the last box
    await user.click(checkbox2);
    await waitFor(() => expect(checkbox2).not.toBeChecked());

    // Counter should disappear
    expect(screen.queryByTestId("floating-selected-counter")).not.toBeInTheDocument();
  }, 15000);
});

describe("4.8.3 - URL Parameter Sync for Filters", () => {
  it("4.8.3.1 - Component should parse URL parameters correctly", async () => {
    render(
      <ErrorBoundary
        fallback={
          <AlertWithoutAction alertText="Could not fetch boxes data! Please try reloading the page." />
        }
      >
        <Suspense fallback={<TableSkeleton />}>
          <Boxes hasExecutedInitialFetchOfBoxes={{ current: false }} />
        </Suspense>
      </ErrorBoundary>,
      {
        routePath: "/bases/:baseId/boxes",
        initialUrl: "/bases/2/boxes?state_ids=1",
        mocks: [
          boxesQuery({ state: "Scrap", paginationInput: 20 }),
          boxesQuery({ state: "Donated", paginationInput: 20 }),
          boxesQuery({ paginationInput: 20 }),
          boxesQuery({}),
          actionsQuery,
        ],
        cache,
        addTypename: true,
        jotaiAtoms,
      },
    );

    // Wait for the table to load - this validates that URL parameters are parsed correctly
    await screen.findByText(/8650860/i, {}, { timeout: 10000 });

    // Verify that the state filter is applied (showing InStock boxes)
    expect(screen.getByText(/8650860/i)).toBeInTheDocument();

    // Check that the state filter button indicates it has a filter applied
    const stateFilterButton = screen.getByTestId("filter-state");
    expect(stateFilterButton).toBeInTheDocument();
  });

  it("4.8.3.2 - Component should handle invalid state_ids parameter", async () => {
    render(
      <ErrorBoundary
        fallback={
          <AlertWithoutAction alertText="Could not fetch boxes data! Please try reloading the page." />
        }
      >
        <Suspense fallback={<TableSkeleton />}>
          <Boxes hasExecutedInitialFetchOfBoxes={{ current: false }} />
        </Suspense>
      </ErrorBoundary>,
      {
        routePath: "/bases/:baseId/boxes",
        initialUrl: "/bases/2/boxes?state_ids=999", // Invalid state ID
        mocks: [
          boxesQuery({ state: "Scrap", paginationInput: 20 }),
          boxesQuery({ state: "Donated", paginationInput: 20 }),
          boxesQuery({ paginationInput: 20 }),
          boxesQuery({}),
          actionsQuery,
        ],
        cache,
        addTypename: true,
        jotaiAtoms,
      },
    );

    // Should still render properly by ignoring invalid parameters
    await screen.findByText(/8650860/i, {}, { timeout: 10000 });
    expect(screen.getByText(/8650860/i)).toBeInTheDocument();
  });

  it("4.8.3.3 - Component should handle product_ids parameter", async () => {
    render(
      <ErrorBoundary
        fallback={
          <AlertWithoutAction alertText="Could not fetch boxes data! Please try reloading the page." />
        }
      >
        <Suspense fallback={<TableSkeleton />}>
          <Boxes hasExecutedInitialFetchOfBoxes={{ current: false }} />
        </Suspense>
      </ErrorBoundary>,
      {
        routePath: "/bases/:baseId/boxes",
        initialUrl: "/bases/2/boxes?product_ids=267&state_ids=1",
        mocks: [
          boxesQuery({ state: "Scrap", paginationInput: 20 }),
          boxesQuery({ state: "Donated", paginationInput: 20 }),
          boxesQuery({ paginationInput: 20 }),
          boxesQuery({}),
          actionsQuery,
        ],
        cache,
        addTypename: true,
        jotaiAtoms,
      },
    );

    // Should render properly with both parameters
    await screen.findByText(/1481666/i, {}, { timeout: 10000 });
    expect(screen.getByText(/1481666/i)).toBeInTheDocument();
    expect(screen.queryByText(/8650860/i)).not.toBeInTheDocument();

    // Verify that the product filter is applied (showing Sweatpants)
    expect(screen.getByText(/Sweatpants/i)).toBeInTheDocument();

    // Check that the product filter button indicates it has a filter applied
    const productFilterButton = screen.getByTestId("filter-product");
    expect(productFilterButton).toBeInTheDocument();
  });

  it("4.8.3.4 - Component should handle multiple comma-separated IDs", async () => {
    render(
      <ErrorBoundary
        fallback={
          <AlertWithoutAction alertText="Could not fetch boxes data! Please try reloading the page." />
        }
      >
        <Suspense fallback={<TableSkeleton />}>
          <Boxes hasExecutedInitialFetchOfBoxes={{ current: false }} />
        </Suspense>
      </ErrorBoundary>,
      {
        routePath: "/bases/:baseId/boxes",
        initialUrl: "/bases/2/boxes?product_ids=267,350&state_ids=1,5",
        mocks: [
          boxesQuery({ state: "Scrap", paginationInput: 20 }),
          boxesQuery({ state: "Donated", paginationInput: 20 }),
          boxesQuery({ paginationInput: 20 }),
          boxesQuery({ state: "InStock", state2: "Donated" }),
          actionsQuery,
        ],
        cache,
        addTypename: true,
        jotaiAtoms,
      },
    );

    // Should render properly with comma-separated values
    await screen.findByText(/8650860/i, {}, { timeout: 10000 });
    expect(screen.getByText(/8650860/i)).toBeInTheDocument();
  });
});
