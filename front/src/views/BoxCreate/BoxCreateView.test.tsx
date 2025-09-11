import { vi, it, describe, expect, beforeEach } from "vitest";
import { screen, render, waitFor } from "tests/test-utils";
import { userEvent } from "@testing-library/user-event";
import { selectOptionInSelectField } from "tests/helpers";
import { mockedCreateToast, mockedTriggerError } from "tests/setupTests";
import BoxCreateView, {
  ALL_PRODUCTS_AND_LOCATIONS_FOR_BASE_QUERY,
  CREATE_BOX_MUTATION,
} from "./BoxCreateView";
import { FakeGraphQLError, mockMatchMediaQuery } from "mocks/functions";
import { useAuth0 } from "@auth0/auth0-react";
import { mockAuthenticatedUser } from "mocks/hooks";
import { product1, productBasic1 } from "mocks/products";
import { location1 } from "mocks/locations";
import { tag1, tag2 } from "mocks/tags";

vi.setConfig({ testTimeout: 20_000 });

vi.mock("@auth0/auth0-react");
const mockedUseAuth0 = vi.mocked(useAuth0);

// Mock useNavigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const mockNavigate = vi.fn();

beforeEach(async () => {
  mockAuthenticatedUser(mockedUseAuth0, "dev_coordinator@boxaid.org");
  // Reset navigate mock before each test
  mockNavigate.mockClear();
  const { useNavigate } = await import("react-router-dom");
  vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  // Set default to desktop view for existing tests
  mockMatchMediaQuery(true);
});

// Create a unique product for testing to avoid conflicts
const testProduct = {
  ...productBasic1,
  id: "2", // Change ID to avoid conflict with product1
  name: "Snow trousers",
  gender: "Boy",
};

const initialQuery = {
  request: {
    query: ALL_PRODUCTS_AND_LOCATIONS_FOR_BASE_QUERY,
    variables: {
      baseId: "1",
    },
  },
  result: {
    data: {
      base: {
        id: "1",
        tags: [tag1, tag2],
        locations: [location1],
        products: [product1, testProduct],
      },
    },
  },
};

const successfulCreateBoxMutation = {
  request: {
    query: CREATE_BOX_MUTATION,
    variables: {
      locationId: 1,
      productId: 2, // Use testProduct ID
      sizeId: 1,
      numberOfItems: 5,
      comment: "",
      tagIds: [],
      qrCode: undefined,
    },
  },
  result: {
    data: {
      createBox: {
        labelIdentifier: "12345",
        id: "1",
        state: "InStock",
        product: testProduct,
        size: { id: "1", label: "S" },
        numberOfItems: 5,
        location: location1,
        comment: "",
        tags: [],
        qrCode: null,
        history: [],
        createdOn: "2023-11-09T17:24:29+00:00",
        lastModifiedOn: "2023-11-19T10:24:29+00:00",
        createdBy: null,
        lastModifiedBy: null,
        shipmentDetail: null,
        deletedOn: null,
        __typename: "Box",
      },
    },
  },
};

describe("BoxCreateView", () => {
  it("renders the create box form", async () => {
    render(<BoxCreateView />, {
      routePath: "/bases/:baseId/boxes/create",
      initialUrl: "/bases/1/boxes/create",
      mocks: [initialQuery],
      addTypename: true,
    });

    expect(await screen.findByRole("heading", { name: /create new box/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save & create another box/i })).toBeInTheDocument();
  });

  it("successfully creates a box and navigates to box details", async () => {
    const user = userEvent.setup();
    render(<BoxCreateView />, {
      routePath: "/bases/:baseId/boxes/create",
      initialUrl: "/bases/1/boxes/create",
      mocks: [initialQuery, successfulCreateBoxMutation],
      addTypename: true,
    });

    // Wait for form to load
    await screen.findByRole("heading", { name: /create new box/i });

    // Fill in the form
    await selectOptionInSelectField(user, /product/i, "Snow trousers (Boy)", "Create New Box");
    await selectOptionInSelectField(user, /size/i, "S", "Create New Box");
    await selectOptionInSelectField(user, /location/i, "Warehouse", "Create New Box");

    const numberOfItemsInput = screen.getByRole("spinbutton");
    await user.clear(numberOfItemsInput);
    await user.type(numberOfItemsInput, "5");

    // Click the "Save" button
    const createBoxButton = screen.getByRole("button", { name: /^save$/i });
    await user.click(createBoxButton);

    // Verify success toast is shown
    await waitFor(() =>
      expect(mockedCreateToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "success",
          title: "Box 12345",
          message: expect.stringMatching(/successfully created/i),
        }),
      ),
    );

    // Verify navigation to box details page
    expect(mockNavigate).toHaveBeenCalledWith("/bases/1/boxes/12345");
  });

  it("successfully creates a box and navigates to create another box", async () => {
    const user = userEvent.setup();
    render(<BoxCreateView />, {
      routePath: "/bases/:baseId/boxes/create",
      initialUrl: "/bases/1/boxes/create",
      mocks: [initialQuery, successfulCreateBoxMutation],
      addTypename: true,
    });

    // Wait for form to load
    await screen.findByRole("heading", { name: /create new box/i });

    // Fill in the form
    await selectOptionInSelectField(user, /product/i, "Snow trousers (Boy)", "Create New Box");
    await selectOptionInSelectField(user, /size/i, "S", "Create New Box");
    await selectOptionInSelectField(user, /location/i, "Warehouse", "Create New Box");

    const numberOfItemsInput = screen.getByRole("spinbutton");
    await user.clear(numberOfItemsInput);
    await user.type(numberOfItemsInput, "5");

    // Click the "Save & Create Another Box" button
    const createAnotherButton = screen.getByRole("button", {
      name: /save & create another box/i,
    });
    await user.click(createAnotherButton);

    // Verify success toast is shown
    await waitFor(() =>
      expect(mockedCreateToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "success",
          title: "Box 12345",
          message: expect.stringMatching(/successfully created/i),
        }),
      ),
    );

    // Verify navigation to create another box (same route but refreshed)
    expect(mockNavigate).toHaveBeenCalledWith("/bases/1/boxes/create");
  });

  it("handles form validation errors", async () => {
    const user = userEvent.setup();
    render(<BoxCreateView />, {
      routePath: "/bases/:baseId/boxes/create",
      initialUrl: "/bases/1/boxes/create",
      mocks: [initialQuery],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /create new box/i });

    // Try to submit without filling required fields
    const createBoxButton = screen.getByRole("button", { name: /^save$/i });
    await user.click(createBoxButton);

    // Check for validation errors
    expect(await screen.findByText(/please select a product/i)).toBeInTheDocument();
    expect(screen.getByText(/please select a size/i)).toBeInTheDocument();
    expect(screen.getByText(/please select a location/i)).toBeInTheDocument();
    expect(screen.getByText(/please enter a number of items/i)).toBeInTheDocument();
  });

  it("handles API errors during box creation", async () => {
    const errorMutation = {
      request: {
        query: CREATE_BOX_MUTATION,
        variables: {
          locationId: 1,
          productId: 2, // Use testProduct ID
          sizeId: 1,
          numberOfItems: 5,
          comment: "",
          tagIds: [],
          qrCode: undefined,
        },
      },
      result: {
        errors: [new FakeGraphQLError()],
      },
    };

    const user = userEvent.setup();
    render(<BoxCreateView />, {
      routePath: "/bases/:baseId/boxes/create",
      initialUrl: "/bases/1/boxes/create",
      mocks: [initialQuery, errorMutation],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /create new box/i });

    // Fill in the form
    await selectOptionInSelectField(user, /product/i, "Snow trousers (Boy)", "Create New Box");
    await selectOptionInSelectField(user, /size/i, "S", "Create New Box");
    await selectOptionInSelectField(user, /location/i, "Warehouse", "Create New Box");

    const numberOfItemsInput = screen.getByRole("spinbutton");
    await user.clear(numberOfItemsInput);
    await user.type(numberOfItemsInput, "5");

    // Click the save button
    const createBoxButton = screen.getByRole("button", { name: /^save$/i });
    await user.click(createBoxButton);

    // Verify error handling
    await waitFor(() =>
      expect(mockedTriggerError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Error while trying to create Box",
        }),
      ),
    );
  });

  it("hides 'Save & Create Another Box' button on mobile screens", async () => {
    render(<BoxCreateView />, {
      routePath: "/bases/:baseId/boxes/create",
      initialUrl: "/bases/1/boxes/create",
      mocks: [initialQuery],
      addTypename: true,
      mediaQueryReturnValue: false, // Mock mobile viewport (screen width < 768px)
    });

    expect(await screen.findByRole("heading", { name: /create new box/i })).toBeInTheDocument();

    // The regular "Save" button should still be present
    expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();

    // The "Save & Create Another Box" button should NOT be present on mobile
    expect(
      screen.queryByRole("button", { name: /save & create another box/i }),
    ).not.toBeInTheDocument();
  });

  it("shows 'Save & Create Another Box' button on desktop screens", async () => {
    render(<BoxCreateView />, {
      routePath: "/bases/:baseId/boxes/create",
      initialUrl: "/bases/1/boxes/create",
      mocks: [initialQuery],
      addTypename: true,
      mediaQueryReturnValue: true, // Mock desktop viewport (screen width >= 768px)
    });

    expect(await screen.findByRole("heading", { name: /create new box/i })).toBeInTheDocument();

    // Both buttons should be present on desktop
    expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save & create another box/i })).toBeInTheDocument();
  });
});
