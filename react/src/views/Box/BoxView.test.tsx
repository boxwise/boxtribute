/* eslint-disable */
import { GraphQLError } from "graphql";
import "@testing-library/jest-dom";
import { screen, render, waitFor } from "tests/test-utils";
import userEvent from "@testing-library/user-event";
import BTBox, {
  BOX_BY_LABEL_IDENTIFIER_QUERY,
  UPDATE_NUMBER_OF_ITEMS_IN_BOX_MUTATION,
  UPDATE_STATE_IN_BOX_MUTATION,
  UPDATE_BOX_MUTATION,
} from "./BoxView";
import { generateMockBox } from "mocks/boxes";
import { BoxState } from "types/generated/graphql";
import { generateMockLocationWithBase, locations } from "mocks/locations";
import { product1, product3, products } from "mocks/products";
import { BOX_BY_LABEL_IDENTIFIER_AND_ALL_PRODUCTS_WITH_BASEID_QUERY } from "views/BoxEdit/BoxEditView";
import { tags } from "mocks/tags";
import { textContentMatcher } from "tests/helpers";
import BoxDetails from "./components/BoxDetails";

jest.setTimeout(30000);

const initialQuery = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_QUERY,
    variables: {
      labelIdentifier: "123",
    },
  },
  result: {
    data: {
      box: generateMockBox({}),
    },
  },
};

const productWithoutGenderQuery = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_QUERY,
    variables: {
      labelIdentifier: "123",
    },
  },
  result: {
    data: {
      box: generateMockBox({ product: product3 }),
    },
  },
};

const boxEditInitialQuery = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_AND_ALL_PRODUCTS_WITH_BASEID_QUERY,
    variables: {
      baseId: "1",
      labelIdentifier: "123",
    },
  },
  result: {
    data: {
      box: generateMockBox({}),
      base: {
        products,
        locations,
        tags,
      },
    },
  },
};

const updateNumberOfItemsMutation = {
  request: {
    query: UPDATE_NUMBER_OF_ITEMS_IN_BOX_MUTATION,
    variables: {
      boxLabelIdentifier: "123",
      numberOfItems: 32,
    },
  },
  result: {
    data: {
      updateBox: {
        labelIdentifier: "123",
      },
    },
  },
};

const numberOfItemsSuccessfullUpdatedRefetchQuery = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_QUERY,
    variables: {
      labelIdentifier: "123",
    },
  },
  result: {
    data: {
      box: generateMockBox({ numberOfItems: 32 }),
    },
  },
};

const moveLocationOfBoxMutation = {
  request: {
    query: UPDATE_BOX_MUTATION,
    variables: {
      boxLabelIdentifier: "123",
      newLocationId: 6,
    },
  },
  result: {
    data: {
      updateBox: generateMockBox({
        product: product1,
        location: generateMockLocationWithBase({
          defaultLocationId: 6,
          defaultLocationName: "WH Women",
        }),
      }),
    },
  },
};

const moveLocationOfBoxRefetchQuery = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_QUERY,
    variables: {
      labelIdentifier: "123",
    },
  },
  result: {
    data: {
      box: generateMockBox({
        product: product1,
        location: generateMockLocationWithBase({
          defaultLocationId: 6,
          defaultLocationName: "WH Women",
        }),
      }),
    },
  },
};

const updateBoxStateToScrapMutation = {
  request: {
    query: UPDATE_STATE_IN_BOX_MUTATION,
    variables: {
      boxLabelIdentifier: "123",
      newState: "Scrap",
    },
  },
  result: {
    data: {
      updateBox: {
        labelIdentifier: "123",
      },
    },
  },
};

const boxStateSuccessfullUpdatedToScrapRefetchQuery = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_QUERY,
    variables: {
      labelIdentifier: "123",
    },
  },
  result: {
    data: {
      box: generateMockBox({ state: BoxState.Scrap }),
    },
  },
};

const updateBoxStateToLostMutation = {
  request: {
    query: UPDATE_STATE_IN_BOX_MUTATION,
    variables: {
      boxLabelIdentifier: "123",
      newState: "Lost",
    },
  },
  result: {
    data: {
      updateBox: {
        labelIdentifier: "123",
      },
    },
  },
};

const boxStateSuccessfullUpdatedToLostRefetchQuery = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_QUERY,
    variables: {
      labelIdentifier: "123",
    },
  },
  result: {
    data: {
      box: generateMockBox({ state: BoxState.Lost }),
    },
  },
};

const initialFailedQuery = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_QUERY,
    variables: {
      labelIdentifier: "1111",
    },
  },
  result: {
    errors: [new GraphQLError("Error!")],
  },
};

const initialForFailedQuery = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_QUERY,
    variables: {
      labelIdentifier: "124",
    },
  },
  result: {
    data: {
      box: generateMockBox({ labelIdentifier: "124" }),
    },
  },
};

const updateNumberOfItemsFailedMutation = {
  request: {
    query: UPDATE_NUMBER_OF_ITEMS_IN_BOX_MUTATION,
    variables: {
      boxLabelIdentifier: "123",
      numberOfItems: 31,
    },
  },
  result: {
    errors: [new GraphQLError("Error!")],
  },
};

const moveLocationOfBoxFailedMutation = {
  request: {
    query: UPDATE_BOX_MUTATION,
    variables: {
      boxLabelIdentifier: "123",
      newLocationId: 10,
    },
  },
  result: {
    errors: [new GraphQLError("Error!")],
  },
};

// Test case 3.1.1
it("3.1.1 - Initial load of Page", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/123",
    mocks: [initialQuery],
    addTypename: true,
  });

  // Test case 3.1.1.1 - Is the Loading State Shown First?
  const loadingInfo = screen.getByTestId("loading-indicator");
  expect(loadingInfo).toBeInTheDocument();

  // Test case 3.1.1.2 - Content: Heading renders correctly with valid box identifier
  const title = await screen.findByRole("heading", { name: "Box 123" });
  expect(title).toBeInTheDocument();

  // Test case 3.1.1.3 - Content: Renders sub heading with valid state for an Instock Box
  const boxSubheading = screen.getByTestId("box-subheader");
  expect(boxSubheading).toHaveTextContent("Status: InStock");

  // Test case 3.1.1.3.1 - Content: State color for Instock Box is correct
  expect(screen.getByTestId("box-state")).toHaveStyle(`color: #0CA789`);

  // Test case 3.1.1.4 - Hide Distro Event Functionality for Ineligible Orgs
  const distroEventSection = screen.getByTestId("box-sections");
  expect(distroEventSection).not.toContain("Assign this Box to Distribution Event:");

  // Test case 3.1.1.5 - Content: Box Tags are shown correctly
  const boxTags = screen.getByTestId("box-tags");
  expect(boxTags).toBeInTheDocument();
  expect(screen.getByText(/test tag/i)).toBeInTheDocument();
  expect(boxTags).toHaveTextContent("test tag");

  // Test case 3.1.1.6 - Content: Comment section renders correctly
  expect(screen.getByText(/comment:/i)).toBeInTheDocument();
  const element = screen.queryByText(/Good Comment/i);
  expect(element).toBeInTheDocument();
});

// Test case 3.1.2
it("3.1.2 - Change Number of Items", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/123",
    mocks: [initialQuery, updateNumberOfItemsMutation, numberOfItemsSuccessfullUpdatedRefetchQuery],
    addTypename: true,
  });

  const title = await screen.findByRole("heading", { name: "Box 123" });
  expect(title).toBeInTheDocument();

  // Test case 3.1.2.1.1 - Click on + Button
  expect(screen.getByTestId("boxview-number-items")).toHaveTextContent(`31x Snow trousers`);

  const addToItemsButton = screen.getByTestId("increase-items");
  await user.click(addToItemsButton);

  expect(await screen.findByText(/add items to the Box/i)).toBeInTheDocument();

  // Test case 3.1.2.1.1	- Alphabetical Input isn't allowed
  await user.type(screen.getByRole("spinbutton"), "a");
  await user.click(screen.getByText(/Submit/i));
  expect(await screen.findByText(/add items to the Box/i)).toBeInTheDocument();

  // // Test case 3.1.2.1.2	- Number of Item Validation
  await user.type(screen.getByRole("spinbutton"), "-1");
  await user.click(screen.getByText(/Submit/i));
  await waitFor(() => expect(screen.getByRole("spinbutton")).toHaveValue("0"));

  // Test case 3.1.2.2 - Number of Item Validation
  await user.type(screen.getByRole("spinbutton"), "1");
  await user.click(screen.getByText(/Submit/i));
  expect(await screen.findByText("32x Snow trousers")).toBeInTheDocument();
});

// Test case 3.1.3
it("3.1.3 - Change State to Scrap and Lost", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/123",
    mocks: [
      initialQuery,
      updateBoxStateToScrapMutation,
      boxStateSuccessfullUpdatedToScrapRefetchQuery,
      updateBoxStateToLostMutation,
      boxStateSuccessfullUpdatedToLostRefetchQuery,
    ],
    addTypename: true,
  });

  expect(await screen.findByText(/status:/i)).toBeInTheDocument();

  const boxSubheading = screen.getByTestId("box-subheader");
  expect(boxSubheading).toHaveTextContent("Status: InStock");
  // Test case 3.1.3.1 - Click on Scrap
  await user.click(screen.getByTestId("box-scrap-btn"));

  expect(await screen.findByText(/status:/i)).toBeInTheDocument();
  // Test case 3.1.3.1.1 - Change state on Scrap Toggled
  const boxSubheadingChangedToScrap = screen.getByTestId("box-subheader");
  expect(boxSubheadingChangedToScrap).toHaveTextContent("Status: Scrap");

  // Test case 3.1.3.1.2 - If state changes to Scrap, color also changes
  expect(screen.getByTestId("box-state")).toHaveStyle(`color: #EB404A`);

  // Test case 3.1.3.2 - Click on Lost
  await user.click(screen.getByTestId("box-lost-btn"));

  expect(await screen.findByText(/status:/i)).toBeInTheDocument();
  // Test case 3.1.3.2.1 - Change state on Lost Toggled
  const boxSubheadingChangedToLost = screen.getByTestId("box-subheader");
  expect(boxSubheadingChangedToLost).toHaveTextContent("Status: Lost");

  // Test case 3.1.3.2.2 - If state changes to Lost, color also changes
  expect(screen.getByTestId("box-state")).toHaveStyle(`color: #EB404A`);

  // Test case  3.1.3.3 - If the Box is in a Lost or Scrap state, editing should be disabled
  expect(screen.getByTestId("increase-items")).toHaveAttribute("disabled");
  expect(screen.getByTestId("decrease-items")).toHaveAttribute("disabled");
  expect(screen.getByRole("button", { name: /edit box/i })).toHaveAttribute("disabled");
});

// Test case 3.1.4
it("3.1.4 - Move location", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/123",
    mocks: [initialQuery, moveLocationOfBoxMutation, moveLocationOfBoxRefetchQuery],
    addTypename: true,
  });

  expect(await screen.findByText(/Move this box from/i)).toBeInTheDocument();

  const boxLocationLabel = screen.getByTestId("box-location-label");
  expect(boxLocationLabel).toHaveTextContent("Move this box from WH Men to:");
  // Test case 3.1.4.1- Click to move box from WH Men to WH Women
  const whWomenLocation = screen.getByRole("button", { name: /wh women/i });
  await user.click(whWomenLocation);

  expect(screen.getByText(/successfully moved the box/i)).toBeInTheDocument();
  expect(await screen.findByText(/Move this box from/i)).toBeInTheDocument();

  await waitFor(() => expect(screen.getByRole("button", { name: /wh men/i })).toBeInTheDocument());
  const boxLocationUpdatedLabel = screen.getByTestId("box-location-label");
  expect(boxLocationUpdatedLabel).toHaveTextContent("Move this box from WH Women to:");

  // Test case 3.1.4.2 - Show last history entry
  expect(await screen.findByText(/history:/i)).toBeInTheDocument();
  const historyEntry = screen.getByTestId("history-1");
  expect(historyEntry).toBeInTheDocument();

  // Test case 3.1.4.2.1 - Show last history entry icon
  expect(screen.getByRole("presentation")).toBeInTheDocument();
});

// Test case 3.1.5
it("3.1.5 - Redirect to Edit Box", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/123",
    additionalRoute: "/bases/2/boxes/123/edit",
    mocks: [initialQuery, boxEditInitialQuery],
    addTypename: true,
  });

  const title = await screen.findByRole("heading", { name: "Box 123" });
  expect(title).toBeInTheDocument();

  // Test case 3.1.5.1 - Click on edit Icon
  const editLink = screen.getByRole("link");
  await user.click(editLink);

  expect(
    await screen.findByRole("heading", { name: "/bases/2/boxes/123/edit" }),
  ).toBeInTheDocument();
});

// Test case 3.1.6
it("3.1.6 - Product Gender", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/123",
    mocks: [productWithoutGenderQuery],
    addTypename: true,
  });

  const title = await screen.findByRole("heading", { name: "Box 123" });
  expect(title).toBeInTheDocument();
  // Test case 3.1.6.1 - Don't Show Gender If Not Applicable
  const element = screen.queryByText(textContentMatcher("Gender:"));
  expect(element).not.toBeInTheDocument();
});

// Test case 3.1.7
it("3.1.7 - Error Shows Correctly When Trying to Remove (-) Items", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/124",
    mocks: [initialForFailedQuery, updateNumberOfItemsFailedMutation],
    addTypename: true,
  });

  const title = await screen.findByRole("heading", { name: "Box 124" });
  expect(title).toBeInTheDocument();

  // Test case 3.1.7.1 - Correct input is entered, but there is a processing error (item mutation query returns and error message)
  const takeItemsButton = screen.getByTestId("decrease-items");
  await user.click(takeItemsButton);
  expect(await screen.findByText(/take items from the box/i)).toBeInTheDocument();

  await user.type(screen.getByRole("spinbutton"), "1");
  await user.click(screen.getByText(/Submit/i));
  expect(await screen.findByText(/could not remove items from the box./i)).toBeInTheDocument();
});

// Test case 3.1.8
it("3.1.8 - Error When Move Locations", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/124",
    mocks: [initialForFailedQuery, moveLocationOfBoxFailedMutation],
    addTypename: true,
  });

  const title = await screen.findByRole("heading", { name: "Box 124" });
  expect(title).toBeInTheDocument();

  // Test case 3.1.8.1 - Move Location has a processing error (box move mutation query returns error)
  const boxLocationLabel = screen.getByTestId("box-location-label");
  expect(boxLocationLabel).toHaveTextContent("Move this box from WH Men to:");

  const whWomenLocation = screen.getByRole("button", { name: /wh shoes/i });
  await user.click(whWomenLocation);

  expect(screen.getByText(/box could not be moved!/i)).toBeInTheDocument();
});

// Test case 3.1.9
it("3.1.9 - Given Invalid Box Label Identifier in the URL/Link", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/1111",
    mocks: [initialFailedQuery],
    addTypename: true,
  });

  await waitFor(() => expect(screen.getByText(/could not fetch box data!/i)).toBeInTheDocument());
});

// Test case 3.1.10
it("3.1.10 - No Data or Null Data Fetched for a given Box Label Identifier", async () => {
  const user = userEvent.setup();
  const mockFunction = jest.fn();
  render(
    <BoxDetails
      boxData={undefined}
      onMoveToLocationClick={mockFunction}
      onPlusOpen={mockFunction}
      onMinusOpen={mockFunction}
      onStateChange={mockFunction}
      onAssignBoxToDistributionEventClick={mockFunction}
      onUnassignBoxFromDistributionEventClick={mockFunction}
    />,
    {
      routePath: "/bases/:baseId/boxes/:labelIdentifier",
      initialUrl: "/bases/2/boxes/1111",
      mocks: [initialFailedQuery],
      addTypename: true,
    },
  );

  await waitFor(() =>
    expect(screen.getByText(/no data found for a box with this id/i)).toBeInTheDocument(),
  );
});
