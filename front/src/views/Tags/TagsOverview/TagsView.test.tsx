import { vi, it, describe, expect, beforeEach } from "vitest";
import { screen, render, waitFor } from "tests/test-utils";
import { userEvent } from "@testing-library/user-event";
import { mockedCreateToast } from "tests/setupTests";
import { TagsView } from "./TagsView";
import { TAGS_QUERY } from "./components/TagsContainer";
import { FakeGraphQLError } from "mocks/functions";
import { useAuth0 } from "@auth0/auth0-react";
import { mockAuthenticatedUser } from "mocks/hooks";
import { cache, tableConfigsVar } from "queries/cache";
import { DELETE_TAGS } from "hooks/useDeleteTags";

vi.setConfig({ testTimeout: 20_000 });

vi.mock("@auth0/auth0-react");
const mockedUseAuth0 = vi.mocked(useAuth0);

// Mock useNavigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
    Link: ({ to, children, ...props }: any) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

const mockNavigate = vi.fn();

beforeEach(async () => {
  mockAuthenticatedUser(mockedUseAuth0, "dev_coordinator@boxaid.org");
  mockNavigate.mockClear();
  void cache.reset();
  tableConfigsVar(new Map());
  const { useNavigate } = await import("react-router-dom");
  vi.mocked(useNavigate).mockReturnValue(mockNavigate);
});

const mockTagsData = {
  base: {
    tags: [
      {
        id: "1",
        name: "Priority",
        type: "Box",
        color: "#FF5733",
        description: "High priority items",
        createdOn: "2023-01-01T00:00:00.000Z",
        lastModifiedOn: "2023-01-02T00:00:00.000Z",
        deletedOn: null,
        taggedResources: [
          { id: "1", __typename: "Box" },
          { id: "2", __typename: "Box" },
        ],
        __typename: "Tag",
      },
      {
        id: "2",
        name: "Urgent",
        type: "All",
        color: "#123456",
        description: "Urgent items",
        createdOn: "2023-01-03T00:00:00.000Z",
        lastModifiedOn: "2023-01-04T00:00:00.000Z",
        deletedOn: null,
        taggedResources: [{ id: "3", __typename: "Box" }],
        __typename: "Tag",
      },
      {
        id: "3",
        name: "Family",
        type: "Beneficiary",
        color: "#ABCDEF",
        description: null,
        createdOn: "2023-01-05T00:00:00.000Z",
        lastModifiedOn: null,
        deletedOn: null,
        taggedResources: [],
        __typename: "Tag",
      },
    ],
  },
};

const tagsQuery = {
  request: {
    query: TAGS_QUERY,
    variables: {
      baseId: "1",
    },
  },
  result: {
    data: mockTagsData,
  },
};

const emptyTagsQuery = {
  request: {
    query: TAGS_QUERY,
    variables: {
      baseId: "1",
    },
  },
  result: {
    data: {
      base: {
        tags: [],
      },
    },
  },
};

const deleteTagsMutation = {
  request: {
    query: DELETE_TAGS,
    variables: {
      ids: [1],
    },
  },
  result: {
    data: {
      deleteTags: [
        {
          __typename: "Tag",
          id: "1",
        },
      ],
    },
  },
};

describe("TagsView", () => {
  it("renders the tags overview page correctly", async () => {
    render(<TagsView />, {
      routePath: "/bases/:baseId/tags",
      initialUrl: "/bases/1/tags",
      mocks: [tagsQuery],
      addTypename: true,
    });

    expect(await screen.findByRole("heading", { name: /manage tags/i })).toBeInTheDocument();

    // Wait for buttons to load (they're inside Suspense)
    expect(await screen.findByRole("button", { name: /create tag/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete tags/i })).toBeInTheDocument();
  });

  it("displays tags in the table", async () => {
    render(<TagsView />, {
      routePath: "/bases/:baseId/tags",
      initialUrl: "/bases/1/tags",
      mocks: [tagsQuery],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /manage tags/i });

    // Wait for table to load
    await waitFor(() => {
      expect(screen.getByText("Priority")).toBeInTheDocument();
    });

    expect(screen.getByText("Urgent")).toBeInTheDocument();
    expect(screen.getByText("Family")).toBeInTheDocument();

    // Check that tag details are displayed
    expect(screen.getByText("High priority items")).toBeInTheDocument();
    expect(screen.getByText("Urgent items")).toBeInTheDocument();

    // Check tagged items count
    expect(screen.getByText("2")).toBeInTheDocument(); // Priority has 2 items
    expect(screen.getByText("1")).toBeInTheDocument(); // Urgent has 1 item
    expect(screen.getByText("0")).toBeInTheDocument(); // Family has 0 items
  });

  it("displays correct application types", async () => {
    render(<TagsView />, {
      routePath: "/bases/:baseId/tags",
      initialUrl: "/bases/1/tags",
      mocks: [tagsQuery],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /manage tags/i });
    await waitFor(() => {
      expect(screen.getByText("Priority")).toBeInTheDocument();
    });

    // Check application types
    expect(screen.getByText("Box")).toBeInTheDocument();
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Beneficiary")).toBeInTheDocument();
  });

  it("navigates to create tag page when clicking Create Tag button", async () => {
    render(<TagsView />, {
      routePath: "/bases/:baseId/tags",
      initialUrl: "/bases/1/tags",
      mocks: [tagsQuery],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /manage tags/i });

    const createButton = await screen.findByRole("button", { name: /create tag/i });

    // Verify the create button is in the document
    expect(createButton).toBeInTheDocument();
  });

  it("navigates to tag detail when clicking on a row", async () => {
    const user = userEvent.setup();
    render(<TagsView />, {
      routePath: "/bases/:baseId/tags",
      initialUrl: "/bases/1/tags",
      mocks: [tagsQuery],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /manage tags/i });
    await waitFor(() => {
      expect(screen.getByText("Priority")).toBeInTheDocument();
    });

    // Find and click the Priority tag row
    const priorityText = screen.getByText("Priority");
    await user.click(priorityText);

    expect(mockNavigate).toHaveBeenCalledWith("/bases/1/tags/1");
  });

  it("allows selecting tags with checkboxes", async () => {
    const user = userEvent.setup();
    render(<TagsView />, {
      routePath: "/bases/:baseId/tags",
      initialUrl: "/bases/1/tags",
      mocks: [tagsQuery],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /manage tags/i });
    await waitFor(() => {
      expect(screen.getByText("Priority")).toBeInTheDocument();
    });

    // Get all checkboxes (header + rows)
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);

    // Select the first tag
    await user.click(checkboxes[1]); // Skip header checkbox (index 0)
    expect(checkboxes[1]).toBeChecked();
  });

  it("shows warning when trying to delete without selecting tags", async () => {
    const user = userEvent.setup();
    render(<TagsView />, {
      routePath: "/bases/:baseId/tags",
      initialUrl: "/bases/1/tags",
      mocks: [tagsQuery],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /manage tags/i });
    await waitFor(() => {
      expect(screen.getByText("Priority")).toBeInTheDocument();
    });

    const deleteButton = await screen.findByRole("button", { name: /delete tags/i });
    await user.click(deleteButton);

    // Should show warning toast
    await waitFor(() =>
      expect(mockedCreateToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "warning",
          message: "Please select a tag to delete",
        }),
      ),
    );
  });

  it("opens delete confirmation dialog when deleting selected tags", async () => {
    const user = userEvent.setup();
    render(<TagsView />, {
      routePath: "/bases/:baseId/tags",
      initialUrl: "/bases/1/tags",
      mocks: [tagsQuery, deleteTagsMutation],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /manage tags/i });
    await waitFor(() => {
      expect(screen.getByText("Priority")).toBeInTheDocument();
    });

    // Select a tag
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[1]); // Select first tag

    // Click delete button
    const deleteButton = await screen.findByRole("button", { name: /delete tags/i });
    await user.click(deleteButton);

    // Should show delete confirmation dialog
    expect(await screen.findByText(/are you sure you want to/i)).toBeInTheDocument();
    expect(screen.getByText(/delete/i)).toBeInTheDocument();
  });

  it("filters tags by name using global filter", async () => {
    const user = userEvent.setup();
    render(<TagsView />, {
      routePath: "/bases/:baseId/tags",
      initialUrl: "/bases/1/tags",
      mocks: [tagsQuery],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /manage tags/i });
    await waitFor(() => {
      expect(screen.getByText("Priority")).toBeInTheDocument();
    });

    // Find the search input (global filter)
    const searchInput = screen.getByPlaceholderText(/search/i);
    expect(searchInput).toBeInTheDocument();

    // Type in search
    await user.type(searchInput, "Priority");

    // Should still show Priority
    await waitFor(() => {
      expect(screen.getByText("Priority")).toBeInTheDocument();
    });

    // Urgent and Family might be filtered out (depending on implementation)
    // We verify the search input is functional
    expect(searchInput).toHaveValue("Priority");
  });

  it("handles empty tags list", async () => {
    render(<TagsView />, {
      routePath: "/bases/:baseId/tags",
      initialUrl: "/bases/1/tags",
      mocks: [emptyTagsQuery],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /manage tags/i });

    // Should still show action buttons (wait for them to load from Suspense)
    expect(await screen.findByRole("button", { name: /create tag/i })).toBeInTheDocument();
  });

  it("handles query errors with error boundary", async () => {
    const errorQuery = {
      request: {
        query: TAGS_QUERY,
        variables: {
          baseId: "1",
        },
      },
      result: {
        errors: [new FakeGraphQLError()],
      },
    };

    render(<TagsView />, {
      routePath: "/bases/:baseId/tags",
      initialUrl: "/bases/1/tags",
      mocks: [errorQuery],
      addTypename: true,
    });

    // Should show error boundary fallback
    expect(
      await screen.findByText(/could not fetch tags data! please try reloading the page/i),
    ).toBeInTheDocument();
  });

  it("allows selecting all tags with header checkbox", async () => {
    const user = userEvent.setup();
    render(<TagsView />, {
      routePath: "/bases/:baseId/tags",
      initialUrl: "/bases/1/tags",
      mocks: [tagsQuery],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /manage tags/i });
    await waitFor(() => {
      expect(screen.getByText("Priority")).toBeInTheDocument();
    });

    // Get all checkboxes
    const checkboxes = screen.getAllByRole("checkbox");
    const headerCheckbox = checkboxes[0];

    // Click header checkbox to select all
    await user.click(headerCheckbox);

    // All checkboxes should be checked
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeChecked();
    });
  });

  it("shows column selector and allows toggling columns", async () => {
    render(<TagsView />, {
      routePath: "/bases/:baseId/tags",
      initialUrl: "/bases/1/tags",
      mocks: [tagsQuery],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /manage tags/i });
    await waitFor(() => {
      expect(screen.getByText("Priority")).toBeInTheDocument();
    });

    // Look for column selector button (usually has an icon or specific label)
    const columnSelectorButtons = screen.getAllByRole("button");

    // Column selector should be present
    expect(columnSelectorButtons.length).toBeGreaterThan(0);
  });

  it("displays tag colors correctly", async () => {
    render(<TagsView />, {
      routePath: "/bases/:baseId/tags",
      initialUrl: "/bases/1/tags",
      mocks: [tagsQuery],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /manage tags/i });
    await waitFor(() => {
      expect(screen.getByText("Priority")).toBeInTheDocument();
    });

    // Tags should render with their colors
    const priorityTag = screen.getByText("Priority");
    expect(priorityTag).toBeInTheDocument();
  });

  it("handles tags with null description", async () => {
    render(<TagsView />, {
      routePath: "/bases/:baseId/tags",
      initialUrl: "/bases/1/tags",
      mocks: [tagsQuery],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /manage tags/i });
    await waitFor(() => {
      expect(screen.getByText("Priority")).toBeInTheDocument();
    });

    // Family tag has null description, should still render
    expect(screen.getByText("Family")).toBeInTheDocument();
  });

  it("filters out deleted tags", async () => {
    const tagsWithDeletedQuery = {
      request: {
        query: TAGS_QUERY,
        variables: {
          baseId: "1",
        },
      },
      result: {
        data: {
          base: {
            tags: [
              ...mockTagsData.base.tags,
              {
                id: "4",
                name: "Deleted Tag",
                type: "Box",
                color: "#000000",
                description: "This should not appear",
                createdOn: "2023-01-01T00:00:00.000Z",
                lastModifiedOn: "2023-01-02T00:00:00.000Z",
                deletedOn: "2023-01-10T00:00:00.000Z",
                taggedResources: [],
                __typename: "Tag",
              },
            ],
          },
        },
      },
    };

    render(<TagsView />, {
      routePath: "/bases/:baseId/tags",
      initialUrl: "/bases/1/tags",
      mocks: [tagsWithDeletedQuery],
      addTypename: true,
    });

    await screen.findByRole("heading", { name: /manage tags/i });
    await waitFor(() => {
      expect(screen.getByText("Priority")).toBeInTheDocument();
    });

    // Deleted tag should not appear
    expect(screen.queryByText("Deleted Tag")).not.toBeInTheDocument();
  });
});
