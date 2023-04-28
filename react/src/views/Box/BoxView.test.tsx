/* eslint-disable */
import { GraphQLError } from "graphql";
import "@testing-library/jest-dom";
import { screen, render, waitFor } from "tests/test-utils";
import userEvent from "@testing-library/user-event";
import BTBox, {
  UPDATE_NUMBER_OF_ITEMS_IN_BOX_MUTATION,
  UPDATE_STATE_IN_BOX_MUTATION,
  UPDATE_BOX_MUTATION,
} from "./BoxView";
import { useErrorHandling } from "hooks/useErrorHandling";
import { useNotification } from "hooks/useNotification";
import { generateMockBox } from "mocks/boxes";
import { BoxState } from "types/generated/graphql";
import { generateMockLocationWithBase, locations } from "mocks/locations";
import { product1, product3, products } from "mocks/products";
import { BOX_BY_LABEL_IDENTIFIER_AND_ALL_PRODUCTS_WITH_BASEID_QUERY } from "views/BoxEdit/BoxEditView";
import { tags } from "mocks/tags";
import { selectOptionInSelectField, textContentMatcher } from "tests/helpers";
import BoxDetails from "./components/BoxDetails";
import { generateMockTransferAgreement } from "mocks/transferAgreements";
import { mockGraphQLError, mockNetworkError } from "mocks/functions";
import { BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY } from "queries/queries";
import { organisation1 } from "mocks/organisations";
import { generateMockShipment, shipment1 } from "mocks/shipments";

const mockedTriggerError = jest.fn();
const mockedCreateToast = jest.fn();
jest.mock("hooks/useErrorHandling");
jest.mock("hooks/useNotification");

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
          defaultBoxState: BoxState.Lost,
          defaultLocationName: "LOST",
          defaultLocationId: 1,
        }),
        state: BoxState.Lost,
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
      boxLabelIdentifier: "123",
      numberOfItems: 32,
    },
  },
  result: {
    data: {
      updateBox: generateMockBox({ numberOfItems: 32 }),
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
        state: BoxState.InStock,
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
        state: BoxState.InStock,
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
      newState: BoxState.Scrap,
    },
  },
  result: {
    data: {
      updateBox: generateMockBox({
        labelIdentifier: "123",
        state: BoxState.Scrap,
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
      updateBox: generateMockBox({ state: BoxState.Lost }),
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
    errors: [new GraphQLError("Error!")],
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

const moveLocationOfBoxNetworkFailedMutation = {
  request: {
    query: UPDATE_BOX_MUTATION,
    variables: {
      boxLabelIdentifier: "123",
      newLocationId: 10,
    },
  },
  error: new Error(),
};

beforeEach(() => {
  // we need to mock matchmedia
  // https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
  const mockedUseErrorHandling = jest.mocked(useErrorHandling);
  mockedUseErrorHandling.mockReturnValue({ triggerError: mockedTriggerError });
  const mockedUseNotification = jest.mocked(useNotification);
  mockedUseNotification.mockReturnValue({ createToast: mockedCreateToast });
});

// Test case 3.1.1
it("3.1.1 - Initial load of Page", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/123",
    mocks: [initialQuery],
    addTypename: true,
    globalPreferences: {
      dispatch: jest.fn(),
      globalPreferences: {
        selectedOrganisationId: organisation1.id,
        availableBases: organisation1.bases,
      },
    },
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
}, 10000);

// Test case 3.1.1.7
it("3.1.1.7 - Content: Display an warning note if a box is located in a legacy location", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/1/boxes/1234",
    mocks: [initialQueryForBoxInLegacyLostLocation],
    addTypename: true,
    globalPreferences: {
      dispatch: jest.fn(),
      globalPreferences: {
        selectedOrganisationId: organisation1.id,
        availableBases: organisation1.bases,
      },
    },
  });

  // Test case 3.1.1.7 - Content: Display an warning note if a box is located in a legacy location

  const title = await screen.findByRole("heading", { name: "Box 1234" });
  expect(title).toBeInTheDocument();

  expect(screen.getByRole("alert")).toBeInTheDocument();
  expect(
    screen.getByText(
      /if this box has been found, please move it to an instock location\. boxtribute no longer supports lost locations\./i,
    ),
  ).toBeInTheDocument();
}, 10000);

// Test case 3.1.2
it("3.1.2 - Change Number of Items", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/123",
    mocks: [initialQuery, updateNumberOfItemsMutation],
    addTypename: true,
    globalPreferences: {
      dispatch: jest.fn(),
      globalPreferences: {
        selectedOrganisationId: organisation1.id,
        availableBases: organisation1.bases,
      },
    },
  });

  const title = await screen.findByRole("heading", { name: "Box 123" });
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
  await user.click(screen.getByText(/Submit/i));
  await waitFor(() => expect(screen.getByRole("spinbutton")).toHaveValue("0"));

  // // // Test case 3.1.2.2 - Number of Item Validation
  await user.type(screen.getByRole("spinbutton"), "{backspace}");
  await user.type(screen.getByRole("spinbutton"), "1");
  await waitFor(() => expect(screen.getByRole("spinbutton")).toHaveValue("1"));
  await user.click(screen.getByText(/Submit/i));
  expect(screen.getByText(/32x snow trousers/i));
}, 10000);

// Test case 3.1.3.1
it("3.1.3.1 - Change State to Scrap", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/123",
    mocks: [initialQuery, updateBoxStateToScrapMutation, updateBoxStateToLostMutation],
    addTypename: true,
    globalPreferences: {
      dispatch: jest.fn(),
      globalPreferences: {
        selectedOrganisationId: organisation1.id,
        availableBases: organisation1.bases,
      },
    },
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
    addTypename: true,
    globalPreferences: {
      dispatch: jest.fn(),
      globalPreferences: {
        selectedOrganisationId: organisation1.id,
        availableBases: organisation1.bases,
      },
    },
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
    addTypename: true,
    globalPreferences: {
      dispatch: jest.fn(),
      globalPreferences: {
        selectedOrganisationId: organisation1.id,
        availableBases: organisation1.bases,
      },
    },
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

  await waitFor(() => expect(screen.getByRole("button", { name: /wh men/i })).toBeInTheDocument());
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
    addTypename: true,
    globalPreferences: {
      dispatch: jest.fn(),
      globalPreferences: {
        selectedOrganisationId: organisation1.id,
        availableBases: organisation1.bases,
      },
    },
  });

  const title = await screen.findByRole("heading", { name: "Box 127" });
  expect(title).toBeInTheDocument();

  // Test case 3.1.5.1 - Click on edit Icon
  const editLink = screen.getByRole("link");
  await user.click(editLink);

  expect(
    await screen.findByRole("heading", { name: "/bases/1/boxes/127/edit" }),
  ).toBeInTheDocument();
}, 10000);

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
}, 10000);

// Test case 3.1.7
it("3.1.7 - Error Shows Correctly When Trying to Remove (-) Items", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/124",
    mocks: [initialForFailedQuery, updateNumberOfItemsFailedMutation],
    addTypename: true,
    globalPreferences: {
      dispatch: jest.fn(),
      globalPreferences: {
        selectedOrganisationId: organisation1.id,
        availableBases: organisation1.bases,
      },
    },
  });

  const title = await screen.findByRole("heading", { name: "Box 124" });
  expect(title).toBeInTheDocument();

  // Test case 3.1.7.1 - Correct input is entered, but there is a processing error (item mutation query returns and error message)
  const takeItemsButton = screen.getByTestId("decrease-items");
  await user.click(takeItemsButton);
  expect(await screen.findByText(/take items from the box/i)).toBeInTheDocument();

  await user.type(screen.getByRole("spinbutton"), "1");
  await user.click(screen.getByText(/Submit/i));

  await waitFor(() =>
    expect(mockedTriggerError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/could not remove items from the box./i),
      }),
    ),
  );
}, 10000);

// Test case 3.1.7.2
it("3.1.7.2 - Form data was valid, but the mutation failed", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/124",
    mocks: [initialForFailedQuery, moveLocationOfBoxFailedMutation],
    addTypename: true,
    globalPreferences: {
      dispatch: jest.fn(),
      globalPreferences: {
        selectedOrganisationId: organisation1.id,
        availableBases: organisation1.bases,
      },
    },
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
    addTypename: true,
    globalPreferences: {
      dispatch: jest.fn(),
      globalPreferences: {
        selectedOrganisationId: organisation1.id,
        availableBases: organisation1.bases,
      },
    },
  });
  await waitFor(async () => {
    expect(await screen.getByTestId("box-header")).toBeInTheDocument();
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
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/1111",
    mocks: [initialFailedQuery],
    addTypename: true,
    globalPreferences: {
      dispatch: jest.fn(),
      globalPreferences: {
        selectedOrganisationId: organisation1.id,
        availableBases: organisation1.bases,
      },
    },
  });

  await waitFor(() =>
    expect(
      screen.getByText(/could not fetch box data! please try reloading the page./i),
    ).toBeInTheDocument(),
  );
}, 10000);

// Test case 3.1.10
it("3.1.10 - No Data or Null Data Fetched for a given Box Label Identifier", async () => {
  const user = userEvent.setup();
  const mockFunction = jest.fn();
  render(
    <BoxDetails
      boxData={undefined}
      boxInTransit={false}
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
      addTypename: true,
      globalPreferences: {
        dispatch: jest.fn(),
        globalPreferences: {
          selectedOrganisationId: organisation1.id,
          availableBases: organisation1.bases,
        },
      },
    },
  );

  await waitFor(() =>
    expect(screen.getByText(/no data found for a box with this id/i)).toBeInTheDocument(),
  );
}, 10000);

// Test case 4.6.1.3
it("4.6.1.3 - Box is InStock and query for shipments returns no shipments in preparing state", async () => {
  const user = userEvent.setup();
  render(<BTBox />, {
    routePath: "/bases/:baseId/boxes/:labelIdentifier",
    initialUrl: "/bases/2/boxes/129",
    mocks: [initialWithoutShipmentQuery],
    addTypename: true,
    globalPreferences: {
      dispatch: jest.fn(),
      globalPreferences: {
        selectedOrganisationId: organisation1.id,
        availableBases: organisation1.bases,
      },
    },
  });

  await waitFor(async () => {
    expect(await screen.getByRole("heading", { name: /box 129/i })).toBeInTheDocument();
  });

  expect(screen.getByRole("tab", { name: /move/i, selected: true })).toHaveTextContent("Move");

  const transferTab = screen.getByRole("tab", { name: /transfer/i });
  await user.click(transferTab);

  expect(screen.getByRole("tab", { name: /transfer/i, selected: true })).toHaveTextContent(
    "Transfer",
  );

  await waitFor(() =>
    expect(
      screen.getByText(/no shipments are being prepared from your base!/i),
    ).toBeInTheDocument(),
  );
}, 10000);
