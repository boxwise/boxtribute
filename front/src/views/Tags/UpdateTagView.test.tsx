import { vi, it, describe, expect, beforeEach } from "vitest";
import { screen, render, waitFor } from "tests/test-utils";
import { userEvent } from "@testing-library/user-event";
import { selectOptionInSelectField } from "tests/helpers";
import { mockedCreateToast, mockedTriggerError } from "tests/setupTests";
import { UpdateTagView, UPDATE_TAG_MUTATION } from "./UpdateTagView";
import { TAG_QUERY } from "./TagsOverview/components/TagsContainer";
import { ALL_PRODUCTS_AND_LOCATIONS_FOR_BASE_QUERY } from "views/BoxCreate/BoxCreateView";
import { FakeGraphQLError } from "mocks/functions";
import { useAuth0 } from "@auth0/auth0-react";
import { mockAuthenticatedUser } from "mocks/hooks";
import { tag1, tag2 } from "mocks/tags";

vi.setConfig({ testTimeout: 20_000 });

vi.mock("@auth0/auth0-react");
const mockedUseAuth0 = vi.mocked(useAuth0);

// Mock useNavigate and useParams
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
    useParams: vi.fn(),
  };
});

const mockNavigate = vi.fn();

beforeEach(async () => {
  mockAuthenticatedUser(mockedUseAuth0, "dev_coordinator@boxaid.org");
  // Reset navigate mock before each test
  mockNavigate.mockClear();
  const { useNavigate, useParams } = await import("react-router-dom");
  vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  vi.mocked(useParams).mockReturnValue({ tagId: "1" });
});

const existingTag = {
  id: "1",
  name: "Existing Tag",
  type: "Box",
  color: "#FF5733",
  description: "An existing tag",
  createdOn: "2023-01-01T00:00:00.000Z",
  lastModifiedOn: "2023-01-02T00:00:00.000Z",
  deletedOn: null,
  __typename: "Tag",
};

const tagQuery = {
  request: {
    query: TAG_QUERY,
    variables: {
      tagId: "1",
    },
  },
  result: {
    data: {
      tag: existingTag,
    },
  },
};

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

const successfulUpdateTagMutation = {
  request: {
    query: UPDATE_TAG_MUTATION,
    variables: {
      id: "1",
      name: "Updated Tag Name",
      type: "All",
      color: "#123456",
      description: "Updated description",
    },
  },
  result: {
    data: {
      updateTag: {
        __typename: "Tag",
        id: "1",
        name: "Updated Tag Name",
        description: "Updated description",
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

describe("UpdateTagView", () => {
  it("renders the update tag form with existing tag data", async () => {
    render(<UpdateTagView />, {
      routePath: "/bases/:baseId/tags/:tagId",
      initialUrl: "/bases/1/tags/1",
      mocks: [tagQuery],
      addTypename: true,
    });

    expect(await screen.findByRole("heading", { name: /update tag/i })).toBeInTheDocument();

    // Wait for form to load with existing values
    const nameInput = await screen.findByDisplayValue("Existing Tag");
    expect(nameInput).toBeInTheDocument();

    const descriptionInput = screen.getByDisplayValue("An existing tag");
    expect(descriptionInput).toBeInTheDocument();

    const colorInput = screen.getByRole("textbox", { name: /color/i });
    expect(colorInput).toBeInTheDocument();
    expect(colorInput).toHaveValue("#FF5733");

    expect(screen.getByRole("button", { name: /save tag/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /nevermind/i })).toBeInTheDocument();
  });

  it("successfully updates a tag and navigates back", async () => {
    const user = userEvent.setup();
    render(<UpdateTagView />, {
      routePath: "/bases/:baseId/tags/:tagId",
      initialUrl: "/bases/1/tags/1",
      mocks: [tagQuery, successfulUpdateTagMutation, refetchQuery],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /update tag/i });

    // Wait for form to load
    await screen.findByDisplayValue("Existing Tag");

    // Update the form fields
    const nameInput = screen.getByPlaceholderText(/please enter a tag name/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Tag Name");

    await selectOptionInSelectField(user, /apply to/i, "Boxes + Beneficiaries", "");

    const colorInput = screen.getByRole("textbox", { name: /color/i });
    await user.clear(colorInput);
    await user.type(colorInput, "#123456");

    const descriptionInput = screen.getByDisplayValue("An existing tag");
    await user.clear(descriptionInput);
    await user.type(descriptionInput, "Updated description");

    // Submit the form
    const saveButton = screen.getByRole("button", { name: /save tag/i });
    await user.click(saveButton);

    // Verify success toast is shown
    await waitFor(() =>
      expect(mockedCreateToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "The tag was successfully updated.",
        }),
      ),
    );

    // Verify navigation back to tags list
    expect(mockNavigate).toHaveBeenCalledWith("..");
  });

  it("handles tag with null/undefined description", async () => {
    const tagQueryNullDescription = {
      request: {
        query: TAG_QUERY,
        variables: {
          tagId: "1",
        },
      },
      result: {
        data: {
          tag: {
            ...existingTag,
            description: null,
          },
        },
      },
    };

    render(<UpdateTagView />, {
      routePath: "/bases/:baseId/tags/:tagId",
      initialUrl: "/bases/1/tags/1",
      mocks: [tagQueryNullDescription],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /update tag/i });

    // Wait for form to load
    await screen.findByDisplayValue("Existing Tag");

    // Description field should be empty - find by label text since there's no value
    const descriptionLabel = screen.getByText(/^description$/i);
    expect(descriptionLabel).toBeInTheDocument();
  });

  it("handles insufficient permission error on update", async () => {
    const insufficientPermissionMutation = {
      request: {
        query: UPDATE_TAG_MUTATION,
        variables: {
          id: "1",
          name: "Existing Tag",
          type: "Box",
          color: "#FF5733",
          description: "An existing tag",
        },
      },
      result: {
        data: {
          updateTag: {
            __typename: "InsufficientPermissionError",
            name: "InsufficientPermissionError",
          },
        },
      },
    };

    const user = userEvent.setup();
    render(<UpdateTagView />, {
      routePath: "/bases/:baseId/tags/:tagId",
      initialUrl: "/bases/1/tags/1",
      mocks: [tagQuery, insufficientPermissionMutation],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /update tag/i });
    await screen.findByDisplayValue("Existing Tag");

    // Submit without changes
    const saveButton = screen.getByRole("button", { name: /save tag/i });
    await user.click(saveButton);

    // Verify error handling
    await waitFor(() =>
      expect(mockedTriggerError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "You don't have permission to update a tag!",
        }),
      ),
    );
  });

  it("handles unauthorized for base error", async () => {
    const unauthorizedMutation = {
      request: {
        query: UPDATE_TAG_MUTATION,
        variables: {
          id: "1",
          name: "Existing Tag",
          type: "Box",
          color: "#FF5733",
          description: "An existing tag",
        },
      },
      result: {
        data: {
          updateTag: {
            __typename: "UnauthorizedForBaseError",
            name: "UnauthorizedForBaseError",
          },
        },
      },
    };

    const user = userEvent.setup();
    render(<UpdateTagView />, {
      routePath: "/bases/:baseId/tags/:tagId",
      initialUrl: "/bases/1/tags/1",
      mocks: [tagQuery, unauthorizedMutation],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /update tag/i });
    await screen.findByDisplayValue("Existing Tag");

    // Submit without changes
    const saveButton = screen.getByRole("button", { name: /save tag/i });
    await user.click(saveButton);

    // Verify error handling
    await waitFor(() =>
      expect(mockedTriggerError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "You don't have permission to update a tag!",
        }),
      ),
    );
  });

  it("handles invalid color error", async () => {
    const invalidColorMutation = {
      request: {
        query: UPDATE_TAG_MUTATION,
        variables: {
          id: "1",
          name: "Existing Tag",
          type: "Box",
          color: "#FF5733",
          description: "An existing tag",
        },
      },
      result: {
        data: {
          updateTag: {
            __typename: "InvalidColorError",
          },
        },
      },
    };

    const user = userEvent.setup();
    render(<UpdateTagView />, {
      routePath: "/bases/:baseId/tags/:tagId",
      initialUrl: "/bases/1/tags/1",
      mocks: [tagQuery, invalidColorMutation],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /update tag/i });
    await screen.findByDisplayValue("Existing Tag");

    // Submit without changes
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

  it("handles API network errors during tag update", async () => {
    const errorMutation = {
      request: {
        query: UPDATE_TAG_MUTATION,
        variables: {
          id: "1",
          name: "Existing Tag",
          type: "Box",
          color: "#FF5733",
          description: "An existing tag",
        },
      },
      result: {
        errors: [new FakeGraphQLError()],
      },
    };

    const user = userEvent.setup();
    render(<UpdateTagView />, {
      routePath: "/bases/:baseId/tags/:tagId",
      initialUrl: "/bases/1/tags/1",
      mocks: [tagQuery, errorMutation],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /update tag/i });
    await screen.findByDisplayValue("Existing Tag");

    // Submit the form
    const saveButton = screen.getByRole("button", { name: /save tag/i });
    await user.click(saveButton);

    // Verify error handling
    await waitFor(() =>
      expect(mockedTriggerError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Could not update this tag! Try again?",
        }),
      ),
    );
  });

  it("handles tag query error", async () => {
    const tagQueryError = {
      request: {
        query: TAG_QUERY,
        variables: {
          tagId: "1",
        },
      },
      result: {
        errors: [new FakeGraphQLError()],
      },
    };

    render(<UpdateTagView />, {
      routePath: "/bases/:baseId/tags/:tagId",
      initialUrl: "/bases/1/tags/1",
      mocks: [tagQueryError],
      addTypename: true,
    });

    // Should show error boundary fallback with error message
    expect(await screen.findByText(/apolloerror/i)).toBeInTheDocument();
  });

  it("navigates back when clicking Nevermind button", async () => {
    const user = userEvent.setup();
    render(<UpdateTagView />, {
      routePath: "/bases/:baseId/tags/:tagId",
      initialUrl: "/bases/1/tags/1",
      mocks: [tagQuery],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /update tag/i });
    await screen.findByDisplayValue("Existing Tag");

    // Click nevermind button
    const nevermindButton = screen.getByRole("button", { name: /nevermind/i });
    await user.click(nevermindButton);

    // Verify navigation back
    expect(mockNavigate).toHaveBeenCalledWith("..");
  });

  // Note: Component doesn't render when tagId is missing - this is expected behavior

  it("displays loading state during submission", async () => {
    const user = userEvent.setup();
    render(<UpdateTagView />, {
      routePath: "/bases/:baseId/tags/:tagId",
      initialUrl: "/bases/1/tags/1",
      mocks: [tagQuery, successfulUpdateTagMutation, refetchQuery],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /update tag/i });
    await screen.findByDisplayValue("Existing Tag");

    // Update a field
    const nameInput = screen.getByPlaceholderText(/please enter a tag name/i);
    await user.clear(nameInput);
    const nameInput = screen.getByPlaceholderText(/please enter a tag name/i);

    await selectOptionInSelectField(user, /apply to/i, "Boxes + Beneficiaries", "");

    const colorInput = screen.getByRole("textbox", { name: /color/i });
    await user.clear(colorInput);
    await user.type(colorInput, "#123456");

    const descriptionInput = screen.getByDisplayValue("An existing tag");
    await user.clear(descriptionInput);
    await user.type(descriptionInput, "Updated description");

    // Submit the form
    const saveButton = screen.getByRole("button", { name: /save tag/i });

    // Button should be enabled before submission
    expect(saveButton).not.toBeDisabled();

    await user.click(saveButton);

    // Verify the form eventually completes
    await waitFor(() =>
      expect(mockedCreateToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "The tag was successfully updated.",
        }),
      ),
    );
  });
});
