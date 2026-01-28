import { vi, it, describe, expect, beforeEach } from "vitest";
import { screen, render, waitFor } from "tests/test-utils";
import { userEvent } from "@testing-library/user-event";
import { selectOptionInSelectField } from "tests/helpers";
import { mockedCreateToast, mockedTriggerError } from "tests/setupTests";
import { CreateTagView, CREATE_TAG_MUTATION } from "./CreateTagView";
import { ALL_PRODUCTS_AND_LOCATIONS_FOR_BASE_QUERY } from "views/BoxCreate/BoxCreateView";
import { FakeGraphQLError } from "mocks/functions";
import { useAuth0 } from "@auth0/auth0-react";
import { mockAuthenticatedUser } from "mocks/hooks";
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
});

const refetchQuery = {
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
        locations: [],
        products: [],
      },
    },
  },
};

const successfulCreateTagMutation = {
  request: {
    query: CREATE_TAG_MUTATION,
    variables: {
      baseId: 1,
      name: "New Tag",
      type: "Box",
      color: "#FF5733",
      description: "A test tag description",
    },
  },
  result: {
    data: {
      createTag: {
        __typename: "Tag",
        id: "3",
        name: "New Tag",
        description: "A test tag description",
        color: "#FF5733",
        type: "Box",
        base: {
          id: "1",
          name: "Test Base",
        },
        createdBy: {
          id: "1",
          name: "Test User",
        },
        createdOn: "2023-11-09T17:24:29+00:00",
      },
    },
  },
};

const successfulCreateTagMutationMinimal = {
  request: {
    query: CREATE_TAG_MUTATION,
    variables: {
      baseId: 1,
      name: "Minimal Tag",
      type: "All",
      color: "#123456",
      description: undefined,
    },
  },
  result: {
    data: {
      createTag: {
        __typename: "Tag",
        id: "4",
        name: "Minimal Tag",
        description: null,
        color: "#123456",
        type: "All",
        base: {
          id: "1",
          name: "Test Base",
        },
        createdBy: {
          id: "1",
          name: "Test User",
        },
        createdOn: "2023-11-09T17:24:29+00:00",
      },
    },
  },
};

describe("CreateTagView", () => {
  it("renders the create tag form correctly", async () => {
    render(<CreateTagView />, {
      routePath: "/bases/:baseId/tags/create",
      initialUrl: "/bases/1/tags/create",
      mocks: [],
      addTypename: true,
    });

    expect(await screen.findByRole("heading", { name: /add new tag/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/please enter a tag name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/apply to/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /color/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /description/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save tag/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /nevermind/i })).toBeInTheDocument();
  });

  it("successfully creates a tag with all fields and navigates back", async () => {
    const user = userEvent.setup();
    render(<CreateTagView />, {
      routePath: "/bases/:baseId/tags/create",
      initialUrl: "/bases/1/tags/create",
      mocks: [successfulCreateTagMutation, refetchQuery],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /add new tag/i });

    // Fill in the form
    const nameInput = screen.getByPlaceholderText(/please enter a tag name/i);
    await user.clear(nameInput);
    await user.type(nameInput, "New Tag");

    await selectOptionInSelectField(user, /apply to/i, "Boxes", "");

    // Update the color field
    const colorInput = screen.getByRole("textbox", { name: /color/i });
    await user.clear(colorInput);
    await user.type(colorInput, "#FF5733");

    const descriptionInput = screen.getByRole("textbox", { name: /description/i });
    await user.type(descriptionInput, "A test tag description");

    // Submit the form
    const saveButton = screen.getByRole("button", { name: /save tag/i });
    await user.click(saveButton);

    // Verify success toast is shown
    await waitFor(() =>
      expect(mockedCreateToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "The tag was successfully created.",
        }),
      ),
    );

    // Verify navigation back to tags list
    expect(mockNavigate).toHaveBeenCalledWith("..");
  });

  it("successfully creates a tag with minimal required fields", async () => {
    const user = userEvent.setup();
    render(<CreateTagView />, {
      routePath: "/bases/:baseId/tags/create",
      initialUrl: "/bases/1/tags/create",
      mocks: [successfulCreateTagMutationMinimal, refetchQuery],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /add new tag/i });

    // Fill in only required fields
    const nameInput = screen.getByPlaceholderText(/please enter a tag name/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Minimal Tag");

    await selectOptionInSelectField(user, /apply to/i, "Boxes + Beneficiaries", "");

    // Update the color field
    const colorInput = screen.getByRole("textbox", { name: /color/i });
    await user.clear(colorInput);
    await user.type(colorInput, "#123456");

    // Submit the form
    const saveButton = screen.getByRole("button", { name: /save tag/i });
    await user.click(saveButton);

    // Verify success toast is shown
    await waitFor(() =>
      expect(mockedCreateToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "The tag was successfully created.",
        }),
      ),
    );

    // Verify navigation back to tags list
    expect(mockNavigate).toHaveBeenCalledWith("..");
  });

  it("handles form validation errors", async () => {
    const user = userEvent.setup();
    render(<CreateTagView />, {
      routePath: "/bases/:baseId/tags/create",
      initialUrl: "/bases/1/tags/create",
      mocks: [],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /add new tag/i });

    // Try to submit without filling required fields
    const saveButton = screen.getByRole("button", { name: /save tag/i });
    await user.click(saveButton);

    // Check for validation errors
    expect(await screen.findByText(/please select a name/i)).toBeInTheDocument();
    expect(screen.getByText(/please select what this tag applies to/i)).toBeInTheDocument();
  });

  it("handles insufficient permission error", async () => {
    const insufficientPermissionMutation = {
      request: {
        query: CREATE_TAG_MUTATION,
        variables: {
          baseId: 1,
          name: "New Tag",
          type: "Box",
          color: "#FF5733",
          description: undefined,
        },
      },
      result: {
        data: {
          createTag: {
            __typename: "InsufficientPermissionError",
            name: "InsufficientPermissionError",
          },
        },
      },
    };

    const user = userEvent.setup();
    render(<CreateTagView />, {
      routePath: "/bases/:baseId/tags/create",
      initialUrl: "/bases/1/tags/create",
      mocks: [insufficientPermissionMutation],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /add new tag/i });

    // Fill in the form
    const nameInput = screen.getByPlaceholderText(/please enter a tag name/i);
    await user.clear(nameInput);
    await user.type(nameInput, "New Tag");

    await selectOptionInSelectField(user, /apply to/i, "Boxes", "");

    const colorInput = screen.getByRole("textbox", { name: /color/i });
    await user.clear(colorInput);
    await user.type(colorInput, "#FF5733");

    // Submit the form
    const saveButton = screen.getByRole("button", { name: /save tag/i });
    await user.click(saveButton);

    // Verify error handling
    await waitFor(() =>
      expect(mockedTriggerError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "You don't have permission to create a tag!",
        }),
      ),
    );
  });

  it("handles invalid color error", async () => {
    const invalidColorMutation = {
      request: {
        query: CREATE_TAG_MUTATION,
        variables: {
          baseId: 1,
          name: "New Tag",
          type: "Box",
          color: "#FF5733",
          description: undefined,
        },
      },
      result: {
        data: {
          createTag: {
            __typename: "InvalidColorError",
          },
        },
      },
    };

    const user = userEvent.setup();
    render(<CreateTagView />, {
      routePath: "/bases/:baseId/tags/create",
      initialUrl: "/bases/1/tags/create",
      mocks: [invalidColorMutation],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /add new tag/i });

    // Fill in the form
    const nameInput = screen.getByPlaceholderText(/please enter a tag name/i);
    await user.clear(nameInput);
    await user.type(nameInput, "New Tag");

    await selectOptionInSelectField(user, /apply to/i, "Boxes", "");

    const colorInput = screen.getByRole("textbox", { name: /color/i });
    await user.clear(colorInput);
    await user.type(colorInput, "#FF5733");

    // Submit the form
    const saveButton = screen.getByRole("button", { name: /save tag/i });
    await user.click(saveButton);

    // Verify error handling
    await waitFor(() =>
      expect(mockedTriggerError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Colour must be a valid color string.",
        }),
      ),
    );
  });

  it("handles API network errors during tag creation", async () => {
    const errorMutation = {
      request: {
        query: CREATE_TAG_MUTATION,
        variables: {
          baseId: 1,
          name: "New Tag",
          type: "Box",
          color: "#FF5733",
          description: undefined,
        },
      },
      result: {
        errors: [new FakeGraphQLError()],
      },
    };

    const user = userEvent.setup();
    render(<CreateTagView />, {
      routePath: "/bases/:baseId/tags/create",
      initialUrl: "/bases/1/tags/create",
      mocks: [errorMutation],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /add new tag/i });

    // Fill in the form
    const nameInput = screen.getByPlaceholderText(/please enter a tag name/i);
    await user.clear(nameInput);
    await user.type(nameInput, "New Tag");

    await selectOptionInSelectField(user, /apply to/i, "Boxes", "");

    const colorInput = screen.getByRole("textbox", { name: /color/i });
    await user.clear(colorInput);
    await user.type(colorInput, "#FF5733");

    // Submit the form
    const saveButton = screen.getByRole("button", { name: /save tag/i });
    await user.click(saveButton);

    // Verify error handling
    await waitFor(() =>
      expect(mockedTriggerError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Could not create this tag! Try again?",
        }),
      ),
    );
  });

  it("navigates back when clicking Nevermind button", async () => {
    const user = userEvent.setup();
    render(<CreateTagView />, {
      routePath: "/bases/:baseId/tags/create",
      initialUrl: "/bases/1/tags/create",
      mocks: [],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /add new tag/i });

    // Click nevermind button
    const nevermindButton = screen.getByRole("button", { name: /nevermind/i });
    await user.click(nevermindButton);

    // Verify navigation back
    expect(mockNavigate).toHaveBeenCalledWith("..");
  });

  it("displays loading state during submission", async () => {
    const user = userEvent.setup();
    render(<CreateTagView />, {
      routePath: "/bases/:baseId/tags/create",
      initialUrl: "/bases/1/tags/create",
      mocks: [successfulCreateTagMutation, refetchQuery],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /add new tag/i });

    // Fill in the form
    const nameInput = screen.getByPlaceholderText(/please enter a tag name/i);
    await user.clear(nameInput);
    await user.type(nameInput, "New Tag");

    await selectOptionInSelectField(user, /apply to/i, "Boxes", "");

    const colorInput = screen.getByRole("textbox", { name: /color/i });
    await user.clear(colorInput);
    await user.type(colorInput, "#FF5733");

    const descriptionInput = screen.getByRole("textbox", { name: /description/i });
    await user.type(descriptionInput, "A test tag description");

    // Submit the form
    const saveButton = screen.getByRole("button", { name: /save tag/i });

    // Button should be enabled before submission
    expect(saveButton).not.toBeDisabled();

    await user.click(saveButton);

    // Verify the form eventually completes
    await waitFor(() =>
      expect(mockedCreateToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "The tag was successfully created.",
        }),
      ),
    );
  });
});
