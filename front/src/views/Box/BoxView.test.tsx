import { vi, beforeEach, it, expect } from "vitest";
import { screen, render, waitFor } from "tests/test-utils";
import { userEvent } from "@testing-library/user-event";
import { useAuth0 } from "@auth0/auth0-react";
import { cache } from "queries/cache";
import { generateMockBox } from "mocks/boxes";
import { generateMockLocationWithBase, locations } from "mocks/locations";
import { product1, product3, products, productBasic1 } from "mocks/products";
import { BOX_BY_LABEL_IDENTIFIER_AND_ALL_PRODUCTS_WITH_BASEID_QUERY } from "views/BoxEdit/BoxEditView";
import { tags } from "mocks/tags";
import { textContentMatcher } from "tests/helpers";
import { FakeGraphQLError, FakeGraphQLNetworkError, mockMatchMediaQuery } from "mocks/functions";
import { BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY } from "queries/queries";
import { mockedCreateToast, mockedTriggerError } from "tests/setupTests";
import { mockAuthenticatedUser } from "mocks/hooks";
import { history4 } from "mocks/histories";
import BoxDetails from "./components/BoxDetails";
import BTBox, {
  UPDATE_NUMBER_OF_ITEMS_IN_BOX_MUTATION,
  UPDATE_STATE_IN_BOX_MUTATION,
  UPDATE_BOX_MUTATION,
  CREATE_QR_CODE_MUTATION,
} from "./BoxView";

vi.mock("@auth0/auth0-react");
const mockedUseAuth0 = vi.mocked(useAuth0);

beforeEach(() => {
  mockAuthenticatedUser(mockedUseAuth0, "dev_coordinator@boxaid.org", [
    "be_user",
    "view_shipments",
  ]);
});

const initialQuery = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
    variables: {
      labelIdentifier: "123",
    },
  },
  result: {
    data: {
      box: generateMockBox({}),
      shipments: null,
    },
  },
};

const initialQueryForChangeNumberOfBoxes = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
    variables: {
      labelIdentifier: "1235",
    },
  },
  result: {
    data: {
      box: generateMockBox({ labelIdentifier: "1235", numberOfItems: 31 }),
      shipments: null,
    },
  },
};

const initialQueryForBoxInLegacyLostLocation = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
    variables: {
      labelIdentifier: "1234",
    },
  },
  result: {
    data: {
      box: generateMockBox({
        labelIdentifier: "1234",
        location: generateMockLocationWithBase({
          defaultBoxState: "Lost",
          defaultLocationName: "LOST",
          defaultLocationId: 1,
        }),
        state: "Lost",
      }),
      shipments: null,
    },
  },
};

const initialQueryForBoxLostState = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
    variables: {
      labelIdentifier: "1234",
    },
  },
  result: {
    data: {
      box: generateMockBox({
        labelIdentifier: "1234",
        state: "Lost",
      }),
      shipments: null,
    },
  },
};

const initialQueryForBoxScrapState = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
    variables: {
      labelIdentifier: "1234",
    },
  },
  result: {
    data: {
      box: generateMockBox({
        labelIdentifier: "1234",
        state: "Scrap",
      }),
      shipments: null,
    },
  },
};

const initialQueryForBoxDeletedState = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
    variables: {
      labelIdentifier: "1234",
    },
  },
  result: {
    data: {
      box: generateMockBox({
        labelIdentifier: "1234",
        deletedOn: "2023-12-15T10:24:29+00:00",
      }),
      shipments: null,
    },
  },
};

const initialQueryForBoxMarkedForShipmentState = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
    variables: {
      labelIdentifier: "1234",
    },
  },
  result: {
    data: {
      box: generateMockBox({
        labelIdentifier: "1234",
        state: "MarkedForShipment",
      }),
      shipments: null,
    },
  },
};

const productWithoutGenderQuery = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
    variables: {
      labelIdentifier: "123",
    },
  },
  result: {
    data: {
      box: generateMockBox({ product: product3 }),
      shipments: null,
    },
  },
};

const initialQueryBeforeRedirect = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
    variables: {
      labelIdentifier: "127",
    },
  },
  result: {
    data: {
      box: generateMockBox({
        labelIdentifier: "127",
      }),
      shipments: null,
    },
  },
};

const boxEditInitialQuery = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_AND_ALL_PRODUCTS_WITH_BASEID_QUERY,
    variables: {
      baseId: "1",
      labelIdentifier: "127",
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
      boxLabelIdentifier: "1235",
      numberOfItems: 32,
    },
  },
  result: {
    data: {
      updateBox: generateMockBox({ numberOfItems: 32, labelIdentifier: "1235" }),
      shipments: null,
    },
  },
};

const initialQueryMoveLocationOfBox = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
    variables: {
      labelIdentifier: "125",
    },
  },
  result: {
    data: {
      box: generateMockBox({
        labelIdentifier: "125",
        state: "InStock",
      }),
      shipments: null,
    },
  },
};

const moveLocationOfBoxMutation = {
  request: {
    query: UPDATE_BOX_MUTATION,
    variables: {
      boxLabelIdentifier: "125",
      newLocationId: 6,
    },
  },
  result: {
    data: {
      updateBox: generateMockBox({
        product: product1,
        labelIdentifier: "125",
        state: "InStock",
        location: generateMockLocationWithBase({
          defaultLocationId: 6,
          defaultLocationName: "WH Women",
        }),
      }),
      shipments: null,
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
      updateBox: generateMockBox({
        labelIdentifier: "123",
        state: "Scrap",
      }),
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
      updateBox: generateMockBox({ state: "Lost" }),
      shipments: null,
    },
  },
};

const initialFailedQuery = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
    variables: {
      labelIdentifier: "1111",
    },
  },
  result: {
    errors: [new FakeGraphQLError()],
  },
};

const initialWithoutShipmentQuery = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
    variables: {
      labelIdentifier: "129",
    },
  },
  result: {
    data: {
      box: generateMockBox({ labelIdentifier: "129" }),
      shipments: [],
    },
  },
};

const initialForFailedQuery = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
    variables: {
      labelIdentifier: "124",
    },
  },
  result: {
    data: {
      box: generateMockBox({ labelIdentifier: "124" }),
      shipments: null,
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
    errors: [new FakeGraphQLError()],
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
    errors: [new FakeGraphQLError()],
  },
};

const moveLocationOfBoxNetworkFailedMutation = {
  request: {
    query: UPDATE_BOX_MUTATION,
    variables: {
      boxLabelIdentifier: "123",
      newLocationId: 10,
    },
  },
  error: new FakeGraphQLNetworkError(),
};

beforeEach(() => {
  // setting the screensize to
  mockMatchMediaQuery(true);
});

// Test case 3.1.1
it("3.1.1 - Initial load of Page", async () => {
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/123",
    mocks: [initialQuery],
  });

  // Test case 3.1.1.1 - Is the Loading State Shown First?
  // // eslint-disable-next-line testing-library/prefer-presence-queries
  // expect(screen.getByTestId("loader")).toBeInTheDocument();

  // Test case 3.1.1.2 - Content: Heading renders correctly with valid box identifier
  const title = await screen.findByRole("heading", { name: "Box 123" });
  expect(title).toBeInTheDocument();

  // Test case 3.1.1.3 - Content: Renders sub heading with valid state for an Instock Box
  const boxSubheading = screen.getByTestId("box-subheader");
  expect(boxSubheading).toHaveTextContent("Status: InStock");

  // Test case 3.1.1.3.1 - Content: State color for Instock Box is correct
  expect(screen.getByTestId("box-state")).toHaveStyle(`color: #0CA789`);

  // Test case 3.1.1.4 - Hide Distro Event Functionality for Ineligible Orgs
  // const distroEventSection = screen.getByTestId("box-sections");
  // expect(distroEventSection).not.toContain<string>("Assign this Box to Distribution Event:");

  // Test case 3.1.1.5 - Content: Box Tags are shown correctly
  const boxTags = screen.getByTestId("box-tags");
  expect(boxTags).toBeInTheDocument();
  expect(screen.getByText(/test tag/i)).toBeInTheDocument();
  expect(boxTags).toHaveTextContent("test tag");

  // Test case 3.1.1.6 - Content: Comment section renders correctly
  expect(screen.getByText(/comment:/i)).toBeInTheDocument();
  const element = screen.queryByText(/Good Comment/i);
  expect(element).toBeInTheDocument();
}, 15000);

// Test case 3.1.1.7

it("3.1.1.7 - Content: Display an warning note if a box is located in a legacy location", async () => {
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/1/boxes/1234",
    mocks: [initialQueryForBoxInLegacyLostLocation],
  });

  // Test case 3.1.1.7 - Content: Display an warning note if a box is located in a legacy location

  const title = await screen.findByRole("heading", { name: "Box 1234" });
  expect(title).toBeInTheDocument();

  expect(screen.getByRole("alert")).toBeInTheDocument();
  expect(
    screen.getByText(
      /To edit this box, please move it to an InStock warehouse location\. Boxtribute no longer supports LOST and SCRAP locations\./i,
    ),
  ).toBeInTheDocument();
}, 10000);

// Test case 3.1.1.8
it("3.1.1.8 - Content: Display an info alert if a box status is Lost", async () => {
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/1/boxes/1234",
    mocks: [initialQueryForBoxLostState],
  });

  // Test case 3.1.1.8 - Content: Display an info alert if a box status is Lost

  const title = await screen.findByRole("heading", { name: "Box 1234" });
  expect(title).toBeInTheDocument();

  expect(screen.getByRole("alert")).toBeInTheDocument();
  expect(screen.getByText(/to edit or move this box, remove the lost status/i)).toBeInTheDocument();
}, 10000);

// Test case 3.1.1.9
it("3.1.1.9 - Content: Display an info alert if a box status is Scrap", async () => {
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/1/boxes/1234",
    mocks: [initialQueryForBoxScrapState],
  });

  // Test case 3.1.1.9 - Content: Display an info alert if a box status is Scrap

  const title = await screen.findByRole("heading", { name: "Box 1234" });
  expect(title).toBeInTheDocument();

  expect(screen.getByRole("alert")).toBeInTheDocument();
  expect(
    screen.getByText(/to edit or move this box, remove the scrap status/i),
  ).toBeInTheDocument();
}, 10000);

// Test case 3.1.1.10
it("3.1.1.10 - Content: Display a warning alert and disable actions if a box is deleted", async () => {
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/1/boxes/1234",
    mocks: [initialQueryForBoxDeletedState],
  });

  // Test case 3.1.1.10 - Content: Display a warning alert if a box is deleted

  const title = await screen.findByRole("heading", { name: "Box 1234" });
  expect(title).toBeInTheDocument();

  // Check that warning alert is displayed for deleted box
  const alerts = screen.getAllByRole("alert");
  expect(alerts.length).toBeGreaterThan(0);
  expect(screen.getByText("This box was deleted on 15 Dec 2023")).toBeInTheDocument();
  expect(
    screen.getByText(
      "Details displayed show historical information of the box prior to deletion. New actions cannot be performed on the box.",
    ),
  ).toBeInTheDocument();
  expect(screen.queryByText("Missing Label")).not.toBeInTheDocument();

  // Test case 3.1.1.10.1 - If the Box is deleted, editing should be disabled
  expect(screen.getByTestId("increase-items")).toHaveAttribute("disabled");
  expect(screen.getByTestId("decrease-items")).toHaveAttribute("disabled");
  expect(screen.getByRole("button", { name: /edit box/i })).toHaveAttribute("disabled");
}, 10000);

// Test case 3.1.1.11
it("3.1.1.11 - Content: Display an info alert if a box status is mark for shipment", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/1/boxes/1234",
    mocks: [initialQueryForBoxMarkedForShipmentState],
  });

  // Test case 3.1.1.11 - Content: Display an info alert if a box status is mark for shipment

  const title = await screen.findByRole("heading", { name: "Box 1234" });
  expect(title).toBeInTheDocument();

  const moveTab = screen.getByRole("tab", { name: /move/i });
  await user.click(moveTab);

  expect(await screen.findByRole("alert")).toBeInTheDocument();
  expect(screen.getByText(/markedforshipment boxes are not movable/i)).toBeInTheDocument();
}, 10000);
// Test case 3.1.2
it("3.1.2 - Change Number of Items", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/1235",
    mocks: [initialQueryForChangeNumberOfBoxes, updateNumberOfItemsMutation],
    cache,
  });

  const title = await screen.findByRole("heading", { name: "Box 1235" });
  expect(title).toBeInTheDocument();

  expect(screen.getByRole("heading", { name: /31x snow trousers/i }));

  const addToItemsButton = screen.getByTestId("increase-items");
  await user.click(addToItemsButton);

  // Test case 3.1.2.1 - Click on + Button
  expect(await screen.findByText(/add items to the Box/i)).toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole("spinbutton")).toHaveValue("1"));

  // Test case 3.1.2.1.1	- Alphabetical Input isn't allowed
  await user.type(screen.getByRole("spinbutton"), "a");
  await waitFor(() => expect(screen.getByRole("spinbutton")).toHaveValue("1"));

  // Test case 3.1.2.1.2	- Number of Item Validation
  await user.type(screen.getByRole("spinbutton"), "{backspace}");
  await user.type(screen.getByRole("spinbutton"), "-");
  await waitFor(() => expect(screen.getByRole("spinbutton")).toHaveValue("-"));

  await user.click(
    screen.getByRole("button", {
      name: /submit/i,
    }),
  );

  await waitFor(() => expect(screen.getByRole("spinbutton")).toHaveValue("0"));

  // // // Test case 3.1.2.2 - Number of Item Validation
  await user.type(screen.getByRole("spinbutton"), "{backspace}");
  await user.type(screen.getByRole("spinbutton"), "1");
  await waitFor(() => expect(screen.getByRole("spinbutton")).toHaveValue("1"));

  await user.click(
    screen.getByRole("button", {
      name: /submit/i,
    }),
  );

  await waitFor(() =>
    expect(mockedCreateToast).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/successfully added 1 items to box/i),
      }),
    ),
  );
  expect(screen.getByTestId("boxview-number-items")).toHaveTextContent(/32x snow trousers/i);
}, 50000);

// Test case 3.1.3.1
it("3.1.3.1 - Change State to Scrap", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/123",
    mocks: [initialQuery, updateBoxStateToScrapMutation, updateBoxStateToLostMutation],
    cache,
  });

  expect(await screen.findByText(/status:/i)).toBeInTheDocument();

  const boxSubheading = screen.getByTestId("box-subheader");
  await waitFor(() => expect(boxSubheading).toHaveTextContent("Status: InStock"));
  // Test case 3.1.3.1 - Click on Scrap
  await user.click(screen.getByTestId("box-scrap-btn"));

  expect(await screen.findByText(/status:/i)).toBeInTheDocument();
  // Test case 3.1.3.1.1 - Change state on Scrap Toggled
  await waitFor(() =>
    expect(screen.getByTestId("box-subheader")).toHaveTextContent("Status: Scrap"),
  );
}, 10000);

// Test case 3.1.3.2
it("3.1.3.2 - Change State to Lost", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/123",
    mocks: [initialQuery, updateBoxStateToLostMutation],
    cache,
  });

  expect(await screen.findByText(/status:/i)).toBeInTheDocument();

  // Test case 3.1.3.2 - Click on Lost
  await user.click(screen.getByTestId("box-lost-btn"));

  expect(await screen.findByText(/status:/i)).toBeInTheDocument();
  // Test case 3.1.3.2.1 - Change state on Lost Toggled
  const boxSubheadingChangedToLost = screen.getByTestId("box-subheader");
  await waitFor(() => expect(boxSubheadingChangedToLost).toHaveTextContent("Status: Lost"));

  // Test case 3.1.3.2.2 - If state changes to Lost, color also changes
  expect(screen.getByTestId("box-state")).toHaveStyle(`color: #EB404A`);

  // Test case  3.1.3.3 - If the Box is in a Lost or Scrap state, editing should be disabled
  expect(screen.getByTestId("increase-items")).toHaveAttribute("disabled");
  expect(screen.getByTestId("decrease-items")).toHaveAttribute("disabled");
  expect(screen.getByRole("button", { name: /edit box/i })).toHaveAttribute("disabled");
}, 10000);

// Test case 3.1.4
it("3.1.4 - Move location", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/1/boxes/125",
    mocks: [initialQueryMoveLocationOfBox, moveLocationOfBoxMutation],
    cache,
  });

  expect(await screen.findByText(/move this box from/i)).toBeInTheDocument();

  const boxLocationLabel = screen.getByTestId("box-location-label");
  expect(boxLocationLabel).toHaveTextContent("WH Men to:");
  // Test case 3.1.4.1- Click to move box from WH Men to WH Women
  const whWomenLocation = screen.getByRole("button", { name: /wh women/i });
  await user.click(whWomenLocation);

  await waitFor(() =>
    expect(mockedCreateToast).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/successfully moved the box/i),
      }),
    ),
  );

  await screen.findByRole("button", { name: /wh men/i });
  const boxLocationUpdatedLabel = screen.getByTestId("box-location-label");
  expect(boxLocationUpdatedLabel).toHaveTextContent("Move this box from WH Women to:");

  // // Test case 3.1.4.2 - Show last history entry
  expect(await screen.findByText(/history:/i)).toBeInTheDocument();
  const historyEntry = screen.getByTestId("history-1");
  expect(historyEntry).toBeInTheDocument();

  // // Test case 3.1.4.2.1 - Show last history entry icon
  expect(screen.getByRole("presentation")).toBeInTheDocument();
}, 10000);

// Test case 3.1.5
it("3.1.5 - Redirect to Edit Box", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/1/boxes/127",
    additionalRoute: "/bases/1/boxes/127/edit",
    mocks: [initialQueryBeforeRedirect, boxEditInitialQuery],
  });

  const title = await screen.findByRole("heading", { name: "Box 127" });
  expect(title).toBeInTheDocument();

  // Test case 3.1.5.1 - Click on edit Icon
  const editButton = screen.getByRole("button", { name: /edit box/i });
  await user.click(editButton);

  expect(
    await screen.findByRole("heading", { name: "/bases/1/boxes/127/edit" }),
  ).toBeInTheDocument();
}, 10000);

// Test case 3.1.6
it("3.1.6 - Product Gender", async () => {
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/123",
    mocks: [productWithoutGenderQuery],
  });

  const title = await screen.findByRole("heading", { name: "Box 123" });
  expect(title).toBeInTheDocument();
  // Test case 3.1.6.1 - Don't Show Gender If Not Applicable
  const element = screen.queryByText(textContentMatcher("Gender:"));
  expect(element).not.toBeInTheDocument();
}, 10000);

// Test case 3.1.7
it("3.1.7 - Error Shows Correctly When Trying to Remove (-) Items", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/124",
    mocks: [initialForFailedQuery, updateNumberOfItemsFailedMutation],
  });

  const title = await screen.findByRole("heading", { name: "Box 124" });
  expect(title).toBeInTheDocument();

  // Test case 3.1.7.1 - Correct input is entered, but there is a processing error (item mutation query returns and error message)
  const takeItemsButton = screen.getByTestId("decrease-items");
  await user.click(takeItemsButton);
  expect(await screen.findByText(/take items from the box/i)).toBeInTheDocument();

  await user.type(screen.getByRole("spinbutton"), "1");
  await user.click(screen.getByText(/Submit/i));

  await waitFor(
    () =>
      expect(mockedTriggerError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/could not remove items from the box./i),
        }),
      ),
    { timeout: 5000 },
  );
}, 20000);

// Test case 3.1.7.2
it("3.1.7.2 - Form data was valid, but the mutation failed", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/124",
    mocks: [initialForFailedQuery, moveLocationOfBoxFailedMutation],
  });

  const title = await screen.findByRole("heading", { name: "Box 124" });
  expect(title).toBeInTheDocument();

  const boxLocationLabel = screen.getByTestId("box-location-label");
  expect(boxLocationLabel).toHaveTextContent("Move this box from WH Men to:");

  const whWomenLocation = screen.getByRole("button", { name: /wh shoes/i });
  await user.click(whWomenLocation);

  await waitFor(() =>
    expect(mockedTriggerError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/box could not be moved!/i),
      }),
    ),
  );
}, 10000);

// Test case 3.1.8
it("3.1.8 - Error When Move Locations", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/124",
    mocks: [initialForFailedQuery, moveLocationOfBoxNetworkFailedMutation],
  });
  await waitFor(() => {
    expect(screen.getByTestId("box-header")).toBeInTheDocument();
  });

  // Test case 3.1.8.1 - Move Location has a processing error (box move mutation query returns error)
  const boxLocationLabel = screen.getByText(/move this box from/i);
  expect(boxLocationLabel).toHaveTextContent("Move this box from WH Men to:");

  const whWomenLocation = screen.getByRole("button", { name: /wh shoes/i });
  await user.click(whWomenLocation);

  await waitFor(() =>
    expect(mockedTriggerError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/box could not be moved!/i),
      }),
    ),
  );
}, 10000);

// Test case 3.1.9
it("3.1.9 - Given Invalid Box Label Identifier in the URL/Link", async () => {
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/1111",
    mocks: [initialFailedQuery],
  });

  await screen.findByText(/could not fetch box data! please try reloading the page./i);
}, 10000);

// Test case 3.1.10
it("3.1.10 - No Data or Null Data Fetched for a given Box Label Identifier", async () => {
  const mockFunction = vi.fn();
  render(
    <BoxDetails
      boxData={undefined}
      boxInTransit={false}
      onHistoryOpen={mockFunction}
      onMoveToLocationClick={mockFunction}
      onPlusOpen={mockFunction}
      onMinusOpen={mockFunction}
      onStateChange={mockFunction}
      onAssignBoxToDistributionEventClick={mockFunction}
      onUnassignBoxFromDistributionEventClick={mockFunction}
      onAssignBoxesToShipment={mockFunction}
      onUnassignBoxesToShipment={mockFunction}
      shipmentOptions={[]}
      isLoading={false}
    />,
    {
      routePath: "/bases/:baseId/boxes/:labelIdentifier",
      initialUrl: "/bases/2/boxes/1111",
      mocks: [initialFailedQuery],
    },
  );

  await screen.findByText(/no data found for a box with this id/i);
}, 10000);

// Test case 4.6.1.3

it("4.6.1.3 - Box is InStock and query for shipments returns no shipments in preparing state", async () => {
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/129",
    mocks: [initialWithoutShipmentQuery],
  });

  await waitFor(() => {
    expect(screen.getByRole("heading", { name: /box 129/i })).toBeInTheDocument();
  });

  expect(screen.getByRole("tab", { name: /move/i, selected: true })).toHaveTextContent("Move");

  // The following code is commented out as a temporary workaround (refer to Trello card at https://trello.com/c/4lxf6jY3).

  // const transferTab = screen.getByRole("tab", { name: /transfer/i });
  // await user.click(transferTab);

  // expect(screen.getByRole("tab", { name: /transfer/i, selected: true })).toHaveTextContent(
  //   "Transfer",
  // );

  // await waitFor(() =>
  //   expect(
  //     screen.getByText(/no shipments are being prepared from your base!/i),
  //   ).toBeInTheDocument(),
  // );
}, 10000);

// Test case 4.6.1.3b
it('4.6.1.3b - When there are no shipments, the "Transfer" tab should not be visible', async () => {
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/129",
    mocks: [initialWithoutShipmentQuery],
  });

  await waitFor(() => {
    expect(screen.getByRole("heading", { name: /box 129/i })).toBeInTheDocument();
  });

  expect(screen.getByRole("tab", { name: /move/i, selected: true })).toHaveTextContent("Move");

  expect(screen.queryByRole("tab", { name: /transfer/i, selected: true })).not.toBeInTheDocument();
}, 10000);

// QR Code Tests
const initialQueryForBoxWithoutQrCode = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
    variables: {
      labelIdentifier: "noqr123",
    },
  },
  result: {
    data: {
      box: generateMockBox({
        labelIdentifier: "noqr123",
        qrCode: null as any,
      }),
      shipments: null,
    },
  },
};

const initialQueryForBoxWithQrCode = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
    variables: {
      labelIdentifier: "withqr123",
    },
  },
  result: {
    data: {
      box: generateMockBox({
        labelIdentifier: "withqr123",
        qrCode: { id: "1", code: "qr1" },
      }),
      shipments: null,
    },
  },
};

const initialQueryForBoxWithDeletedProduct = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
    variables: {
      labelIdentifier: "deletedprod123",
    },
  },
  result: {
    data: {
      box: generateMockBox({
        labelIdentifier: "deletedprod123",
        qrCode: null as any,
        product: { ...productBasic1, deletedOn: "2023-01-01T00:00:00Z" as any },
      }),
      shipments: null,
    },
  },
};

const createQrCodeMutation = {
  request: {
    query: CREATE_QR_CODE_MUTATION,
    variables: {
      boxLabelIdentifier: "noqr123",
    },
  },
  result: {
    data: {
      createQrCode: {
        code: "abc123def456",
        box: {
          __typename: "Box",
          id: "1",
          labelIdentifier: "noqr123",
          qrCode: {
            __typename: "QrCode",
            id: "abc123def456",
            code: "abc123def456",
          },
          history: [history4],
        },
      },
    },
  },
};

const createQrCodeMutationError = {
  request: {
    query: CREATE_QR_CODE_MUTATION,
    variables: {
      boxLabelIdentifier: "errorbox123",
    },
  },
  error: new FakeGraphQLError("Cannot create QR code for deleted product"),
};

const initialQueryForBoxWithErrorScenario = {
  request: {
    query: BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
    variables: {
      labelIdentifier: "errorbox123",
    },
  },
  result: {
    data: {
      box: generateMockBox({
        labelIdentifier: "errorbox123",
        qrCode: null as any,
        product: productBasic1, // Not deleted, but mutation will fail
      }),
      shipments: null,
    },
  },
};

// Test case QR.1 - Display warning alert for box without QR code
it("QR.1 - Display warning alert for box without QR code and create button", async () => {
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/1/boxes/noqr123",
    mocks: [initialQueryForBoxWithoutQrCode],
  });

  expect(await screen.findByRole("heading", { name: /box noqr123/i })).toBeInTheDocument();

  // Test that warning alert is displayed
  const alert = screen.getByTestId("no-qr-code-alert");
  expect(alert).toBeInTheDocument();
  expect(screen.getByText(/missing label/i)).toBeInTheDocument();
  expect(
    screen.getByText(/this box does not yet have a qr code label associated with it/i),
  ).toBeInTheDocument();

  // Test that create label button is present
  expect(screen.getByTestId("create-label-button")).toBeInTheDocument();
}, 10000);

// Test case QR.2 - No warning alert for box with QR code
it("QR.2 - No warning alert for box with QR code", async () => {
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/1/boxes/withqr123",
    mocks: [initialQueryForBoxWithQrCode],
  });

  expect(await screen.findByRole("heading", { name: /box withqr123/i })).toBeInTheDocument();

  // Test that warning alert is NOT displayed
  expect(screen.queryByTestId("no-qr-code-alert")).not.toBeInTheDocument();
  expect(screen.queryByTestId("create-label-button")).not.toBeInTheDocument();
  expect(screen.queryByTestId("ErrorAlert")).not.toBeInTheDocument();

  // Verify no alerts with "Missing Label" title
  expect(screen.queryByText("Missing Label")).not.toBeInTheDocument();
}, 10000);

// Test case QR.3 - Successful QR code creation
it("QR.3 - Successful QR code creation", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/1/boxes/noqr123",
    mocks: [initialQueryForBoxWithoutQrCode, createQrCodeMutation],
    cache,
  });

  expect(await screen.findByRole("heading", { name: /box noqr123/i })).toBeInTheDocument();

  // Click the create label button
  const createButton = screen.getByTestId("create-label-button");
  await user.click(createButton);

  // Test that success toast is triggered
  await waitFor(() =>
    expect(mockedCreateToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Box noqr123",
        type: "success",
        message:
          "A QR code label was successfully created. To show a printable PDF, please click the QR code icon next to the box number.",
      }),
    ),
  );

  // Test that warning alert is NOT displayed
  expect(screen.queryByTestId("no-qr-code-alert")).not.toBeInTheDocument();
  expect(screen.queryByTestId("create-label-button")).not.toBeInTheDocument();
  expect(screen.queryByTestId("ErrorAlert")).not.toBeInTheDocument();

  // Verify no alerts with "Missing Label" title
  expect(screen.queryByText("Missing Label")).not.toBeInTheDocument();

  // Verify that box history shows QR creation message
  const historyEntry = screen.getByTestId("history-4");
  expect(historyEntry).toBeInTheDocument();
  expect(historyEntry).toHaveTextContent("created QR code label for box");
}, 10000);

// Test case QR.4 - Failed QR code creation for box with deleted product
it("QR.4 - Failed QR code creation for box with deleted product", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/1/boxes/deletedprod123",
    mocks: [initialQueryForBoxWithDeletedProduct],
  });

  expect(await screen.findByRole("heading", { name: /box deletedprod123/i })).toBeInTheDocument();

  // Click the create label button
  const createButton = screen.getByTestId("create-label-button");
  await user.click(createButton);

  // Test that error toast is triggered
  await waitFor(() =>
    expect(mockedTriggerError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Cannot create QR code: Box product is deleted",
      }),
    ),
  );
}, 10000);

// Test case QR.5 - Failed QR code creation with GraphQL error
it("QR.5 - Failed QR code creation with GraphQL error", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/1/boxes/errorbox123",
    mocks: [initialQueryForBoxWithErrorScenario, createQrCodeMutationError],
  });

  expect(await screen.findByRole("heading", { name: /box errorbox123/i })).toBeInTheDocument();

  // Click the create label button
  const createButton = screen.getByTestId("create-label-button");
  await user.click(createButton);

  // Test that error toast is triggered for GraphQL error
  await waitFor(() =>
    expect(mockedTriggerError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Could not create QR code",
      }),
    ),
  );
}, 10000);
