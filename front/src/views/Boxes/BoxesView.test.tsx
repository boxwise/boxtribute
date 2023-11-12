import "@testing-library/jest-dom";
import { GraphQLError } from "graphql";
import userEvent from "@testing-library/user-event";
import { base2 } from "mocks/bases";
import { organisation1, organisation2 } from "mocks/organisations";
import { screen, render } from "tests/test-utils";
import { generateMoveBoxRequest } from "queries/dynamic-mutations";
import Boxes, { BOXES_LOCATIONS_TAGS_SHIPMENTS_FOR_BASE_QUERY } from "./BoxesView";

const initialQuery = {
  request: {
    query: BOXES_LOCATIONS_TAGS_SHIPMENTS_FOR_BASE_QUERY,
    variables: {
      baseId: "2",
    },
  },
  result: {
    data: {
      // TODO: the data should be placed in the mocks
      base: {
        __typename: "Base",
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
      boxes: {
        __typename: "BoxPage",
        elements: [
          {
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
              deletedOn: null,
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
          },
          {
            __typename: "Box",
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
              defaultBoxState: "Scrap",
              id: "15",
              name: "SCRAP",
            },
            numberOfItems: 23,
            product: {
              __typename: "Product",
              deletedOn: null,
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
            state: "Scrap",
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
          },
          {
            __typename: "Box",
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
              name: "WH2",
            },
            numberOfItems: 33,
            product: {
              __typename: "Product",
              deletedOn: null,
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
          },
        ],
        pageInfo: {
          __typename: "PageInfo",
          hasNextPage: false,
        },
        totalCount: 268,
      },
      shipments: [
        {
          __typename: "Shipment",
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

const gqlRequestPrep = generateMoveBoxRequest(["4495955", "1481666"], 17);

const moveBoxesMutation = {
  request: {
    query: gqlRequestPrep.gqlRequest,
    variables: gqlRequestPrep.variables,
  },
  result: {
    data: {
      // TODO: the data should be placed in the mocks
      moveBox4495955: {
        __typename: "Box",
        labelIdentifier: "4495955",
        location: {
          __typename: "ClassicLocation",
          id: "17",
        },
        state: "InStock",
      },
      moveBox1481666: {
        __typename: "Box",
        labelIdentifier: "1481666",
        location: {
          __typename: "ClassicLocation",
          id: "17",
        },
        state: "InStock",
      },
    },
  },
};

const initialQueryNetworkError = {
  request: {
    query: BOXES_LOCATIONS_TAGS_SHIPMENTS_FOR_BASE_QUERY,
    variables: {
      baseId: "2",
    },
  },
  result: {
    errors: [new GraphQLError("Error!")],
  },
};

describe("4.8.1 - Initial load of Page", () => {
  it("4.8.1.1 - Is the Loading State Shown First?", async () => {
    render(<Boxes />, {
      routePath: "/bases/:baseId/boxes",
      initialUrl: "/bases/2/boxes",
      mocks: [initialQuery],
      addTypename: true,
      globalPreferences: {
        dispatch: jest.fn(),
        globalPreferences: {
          organisation: { id: organisation2.id, name: organisation2.name },
          availableBases: organisation1.bases,
          selectedBase: { id: base2.id, name: base2.name },
        },
      },
    });
    // Test case 4.8.1.1
    expect(screen.getByTestId("TableSkeleton")).toBeInTheDocument();
  });

  it("4.8.1.2 - Failed to Fetch Initial Data", async () => {
    render(<Boxes />, {
      routePath: "/bases/:baseId/boxes",
      initialUrl: "/bases/2/boxes",
      mocks: [initialQueryNetworkError],
      addTypename: true,
      globalPreferences: {
        dispatch: jest.fn(),
        globalPreferences: {
          organisation: { id: organisation2.id, name: organisation2.name },
          availableBases: organisation1.bases,
          selectedBase: { id: base2.id, name: base2.name },
        },
      },
    });
    // Test case 4.8.1.2
    expect(
      await screen.findByText(/could not fetch boxes data! Please try reloading the page./i),
    ).toBeInTheDocument();
  });

  it("4.8.1.3 - The Boxes Table is shown", async () => {
    render(<Boxes />, {
      routePath: "/bases/:baseId/boxes",
      initialUrl: "/bases/2/boxes",
      mocks: [initialQuery],
      addTypename: true,
      globalPreferences: {
        dispatch: jest.fn(),
        globalPreferences: {
          organisation: { id: organisation2.id, name: organisation2.name },
          availableBases: organisation1.bases,
          selectedBase: { id: base2.id, name: base2.name },
        },
      },
    });

    // Test case 4.8.1.3
    expect(await screen.findByRole("gridcell", { name: /4495955/i })).toBeInTheDocument();
  });
});

describe("4.8.2 - Selecting rows and performing bulk actions", () => {
  it("4.8.2.1 - Select two checkboxes and perform bulk moves", async () => {
    const user = userEvent.setup();
    render(<Boxes />, {
      routePath: "/bases/:baseId/boxes",
      initialUrl: "/bases/2/boxes",
      mocks: [initialQuery, moveBoxesMutation],
      addTypename: true,
      globalPreferences: {
        dispatch: jest.fn(),
        globalPreferences: {
          organisation: { id: organisation2.id, name: organisation2.name },
          availableBases: organisation1.bases,
          selectedBase: { id: base2.id, name: base2.name },
        },
      },
    });

    // Test case 4.8.2.1 - Select two checkboxes and perform bulk moves

    const row1 = await screen.findByRole("row", { name: /4495955/i });
    // eslint-disable-next-line testing-library/no-node-access
    const checkbox1 = row1.querySelector('input[type="checkbox"]');

    const row2 = await screen.findByRole("row", { name: /1481666/i });
    // eslint-disable-next-line testing-library/no-node-access
    const checkbox2 = row2.querySelector('input[type="checkbox"]');

    if (checkbox1 && checkbox2) {
      expect(checkbox1).not.toBeChecked();
      await user.click(checkbox1);
      expect(checkbox1).toBeChecked();

      expect(checkbox2).not.toBeChecked();
      await user.click(checkbox2);
      expect(checkbox2).toBeChecked();

      const moveBoxesButton = screen.getByRole("button", {
        name: /move boxes/i,
      });

      await user.click(moveBoxesButton);

      expect(
        screen.getByRole("menuitem", {
          name: /wh1/i,
        }),
      ).toBeInTheDocument();

      user.click(
        screen.getByRole("menuitem", {
          name: /wh1/i,
        }),
      );

      expect(await screen.findByText(/2 Boxes were successfully moved./i)).toBeInTheDocument();
    }
  });
});
