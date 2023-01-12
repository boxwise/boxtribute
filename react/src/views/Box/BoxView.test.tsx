/* eslint-disable */
import "@testing-library/jest-dom";
import { queryByText, screen } from "@testing-library/react";
import { render } from "tests/test-utils";
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

const updateBoxStateMutation = {
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

const boxStateSuccessfullUpdatedRefetchQuery = {
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

// Test case 3.1.1
it("3.1.1 - Initial load of Page", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/123",
    mocks: [initialQuery],
    addTypename: true,
  });

  // Test case 3.1.1.1 - Renders with an initial 'Loading...'
  const loadingInfo = screen.getByTestId("loading-indicator");
  expect(loadingInfo).toBeInTheDocument();

  // Test case 3.1.1.2 - Renders Heading with valid box identifier
  const title = await screen.findByRole("heading", { name: "Box 123" });
  expect(title).toBeInTheDocument();

  // Test case 3.1.1.3 - Renders sub heading with valid state
  const boxSubheading = screen.getByTestId("box-subheader");
  expect(boxSubheading).toHaveTextContent("Status: InStock");

  // Test case 3.1.1.3.1 - state color
  expect(screen.getByTestId("box-state")).toHaveStyle(`color: #0CA789`);

  // Test case 3.1.1.4 - If Distro Event Not Available
  const distroEventSection = screen.getByTestId("box-sections");
  expect(distroEventSection).not.toContain("Assign this Box to Distribution Event:");

  // Test case 3.1.1.5 - Tags
  const boxTags = screen.getByTestId("box-tags");
  expect(boxTags).toBeInTheDocument();
  expect(screen.getByText(/test tag/i)).toBeInTheDocument();
  expect(boxTags).toHaveTextContent("test tag");

  // Test case 3.1.1.6 - Comments
  expect(screen.getByText(/comment:/i)).toBeInTheDocument();
  const element = screen.queryByText(textContentMatcher("Good Comment"));
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

  // Test case 3.1.2.1.1 - Click on + OR - Button
  expect(screen.getByTestId("boxview-number-items")).toHaveTextContent(`31x Snow trousers`);

  const addToItemsButton = screen.getByTestId("increase-items");
  await user.click(addToItemsButton);

  expect(await screen.findByText(/add items to the Box/i)).toBeInTheDocument();

  // Test case 3.1.2.1.1	- Number of Item
  // await user.type(screen.getByRole("spinbutton"), "a");
  // expect(screen.getByRole("spinbutton")).not.toContain("a");

  // // Test case 3.1.2.1.2	- Number of Item Validation
  // await user.type(screen.getByRole("spinbutton"), "-1");
  // expect(screen.getByRole("spinbutton")).not.toContain("1");

  // Test case 3.1.2.2 - Click on Submit Button
  await user.type(screen.getByRole("spinbutton"), "1");
  await user.click(screen.getByText(/Submit/i));
  expect(await screen.findByText("32x Snow trousers")).toBeInTheDocument();

  // Test case 3.1.2.3 - Error message for Update Number of Item Mutation query
});

// Test case 3.1.3
it("3.1.3 - Change State to Scrap and Lost", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/123",
    mocks: [initialQuery, updateBoxStateMutation, boxStateSuccessfullUpdatedRefetchQuery],
    addTypename: true,
  });

  expect(await screen.findByText(/status:/i)).toBeInTheDocument();

  const boxSubheading = screen.getByTestId("box-subheader");
  expect(boxSubheading).toHaveTextContent("Status: InStock");
  // Test case 3.1.3.1 - Click on Scrap / Lost
  await user.click(screen.getByTestId("box-scrap-btn"));

  expect(await screen.findByText(/status:/i)).toBeInTheDocument();
  // Test case 3.1.3.1.1 - Change state on Scrap/Lost Toggled
  const boxSubheadingUpdated = screen.getByTestId("box-subheader");
  expect(boxSubheadingUpdated).toHaveTextContent("Status: Scrap");

  // Test case 3.1.3.1.2 - If State Lost / Scrap color changed
  expect(screen.getByTestId("box-state")).toHaveStyle(`color: #EB404A`);
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

  const boxLocationLabel = screen.queryByText(textContentMatcher("Move this box from WH Men to:"));
  expect(boxLocationLabel).toBeInTheDocument();
  // Test case 3.1.4.1- Click on the New Location
  const whWomenLocation = screen.getByTestId("location-wh_women-btn");
  await user.click(whWomenLocation);

  expect(await screen.getByText(/successfully moved the box/i)).toBeInTheDocument();
  expect(await screen.findByText(/Move this box from/i)).toBeInTheDocument();

  const boxLocationUpdatedLabel = screen.queryByText(
    textContentMatcher("Move this box from WH Women to:"),
  );
  expect(boxLocationUpdatedLabel).toBeInTheDocument();
  // Test case 3.1.4.2- Show last history entry
  expect(await screen.findByText(/history:/i)).toBeInTheDocument();
  const historyEntry = screen.getByTestId("history-30952");
  expect(historyEntry).toBeInTheDocument();

  // Test case 3.1.4.3 - Error message for Move Location Mutation query
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
  // Test case 3.1.6.1 - Show Dash If Product Gender Is Not Applicable
  const element = screen.queryByText(textContentMatcher("Gender:"));
  expect(element).not.toBeInTheDocument();
});
