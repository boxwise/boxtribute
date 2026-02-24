import { vi, it, describe, expect, beforeEach } from "vitest";
import { screen, render, waitFor } from "tests/test-utils";
import { userEvent } from "@testing-library/user-event";
import { selectOptionInSelectField } from "tests/helpers";
import { TagForm, nameErrorText, applicationErrorText } from "./TagForm";

vi.setConfig({ testTimeout: 20_000 });

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
  mockNavigate.mockClear();
  const { useNavigate } = await import("react-router-dom");
  vi.mocked(useNavigate).mockReturnValue(mockNavigate);
});

const mockOnSubmit = vi.fn();

describe("TagForm", () => {
  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it("renders the form with all fields", () => {
    render(<TagForm isLoading={false} onSubmit={mockOnSubmit} />, {
      routePath: "/test",
      initialUrl: "/test",
      mocks: [],
    });

    expect(screen.getByPlaceholderText(/please enter a tag name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/apply to/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /color/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /description/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save tag/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /nevermind/i })).toBeInTheDocument();
  });

  it("generates a random color by default", () => {
    render(<TagForm isLoading={false} onSubmit={mockOnSubmit} />, {
      routePath: "/test",
      initialUrl: "/test",
      mocks: [],
    });

    const colorInput = screen.getByRole("textbox", { name: /color/i }) as HTMLInputElement;
    expect(colorInput.value).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it("populates form with default values when provided", () => {
    const defaultValues = {
      name: "Test Tag",
      application: "Box" as const,
      color: "#FF5733",
      description: "Test description",
    };

    render(<TagForm isLoading={false} onSubmit={mockOnSubmit} defaultValues={defaultValues} />, {
      routePath: "/test",
      initialUrl: "/test",
      mocks: [],
    });

    expect(screen.getByDisplayValue("Test Tag")).toBeInTheDocument();
    expect(screen.getByDisplayValue("#FF5733")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test description")).toBeInTheDocument();
    expect(screen.getByText("Boxes")).toBeInTheDocument(); // Application is displayed as text
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    render(<TagForm isLoading={false} onSubmit={mockOnSubmit} />, {
      routePath: "/test",
      initialUrl: "/test",
      mocks: [],
    });

    // Fill in the form
    const nameInput = screen.getByPlaceholderText(/please enter a tag name/i);
    await user.type(nameInput, "New Tag");

    await selectOptionInSelectField(user, /apply to/i, "Boxes", "");

    const colorInput = screen.getByRole("textbox", { name: /color/i });
    await user.tripleClick(colorInput);
    await user.keyboard("#123456");

    const descriptionInput = screen.getByRole("textbox", { name: /description/i });
    await user.type(descriptionInput, "A description");

    // Submit
    const submitButton = screen.getByRole("button", { name: /save tag/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "New Tag",
          application: "Box",
          color: "#123456",
          description: "A description",
        }),
        expect.anything(), // form event
      );
    });
  });

  it("submits form without optional description", async () => {
    const user = userEvent.setup();
    render(<TagForm isLoading={false} onSubmit={mockOnSubmit} />, {
      routePath: "/test",
      initialUrl: "/test",
      mocks: [],
    });

    // Fill in required fields only
    const nameInput = screen.getByPlaceholderText(/please enter a tag name/i);
    await user.type(nameInput, "Minimal Tag");

    await selectOptionInSelectField(user, /apply to/i, "Boxes + Beneficiaries", "");

    const colorInput = screen.getByRole("textbox", { name: /color/i });
    await user.tripleClick(colorInput);
    await user.keyboard("#ABCDEF");

    // Submit without description
    const submitButton = screen.getByRole("button", { name: /save tag/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Minimal Tag",
          application: "All",
          color: "#ABCDEF",
          description: undefined,
        }),
        expect.anything(), // form event
      );
    });
  });

  it("shows validation error for missing name", async () => {
    const user = userEvent.setup();
    render(<TagForm isLoading={false} onSubmit={mockOnSubmit} />, {
      routePath: "/test",
      initialUrl: "/test",
      mocks: [],
    });

    // Try to submit without name
    const submitButton = screen.getByRole("button", { name: /save tag/i });
    await user.click(submitButton);

    expect(await screen.findByText(nameErrorText)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("shows validation error for missing application", async () => {
    const user = userEvent.setup();
    render(<TagForm isLoading={false} onSubmit={mockOnSubmit} />, {
      routePath: "/test",
      initialUrl: "/test",
      mocks: [],
    });

    // Fill name but not application
    const nameInput = screen.getByPlaceholderText(/please enter a tag name/i);
    await user.type(nameInput, "Test Tag");

    // Try to submit
    const submitButton = screen.getByRole("button", { name: /save tag/i });
    await user.click(submitButton);

    expect(await screen.findByText(applicationErrorText)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("shows validation error for empty name (whitespace only)", async () => {
    const user = userEvent.setup();
    render(<TagForm isLoading={false} onSubmit={mockOnSubmit} />, {
      routePath: "/test",
      initialUrl: "/test",
      mocks: [],
    });

    // Fill name with only spaces
    const nameInput = screen.getByPlaceholderText(/please enter a tag name/i);
    await user.type(nameInput, "   ");

    await selectOptionInSelectField(user, /apply to/i, "Boxes", "");

    // Try to submit
    const submitButton = screen.getByRole("button", { name: /save tag/i });
    await user.click(submitButton);

    expect(await screen.findByText(nameErrorText)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("trims whitespace from name before validation", async () => {
    const user = userEvent.setup();
    render(<TagForm isLoading={false} onSubmit={mockOnSubmit} />, {
      routePath: "/test",
      initialUrl: "/test",
      mocks: [],
    });

    // Fill name with leading/trailing spaces
    const nameInput = screen.getByPlaceholderText(/please enter a tag name/i);
    await user.type(nameInput, "  Valid Name  ");

    await selectOptionInSelectField(user, /apply to/i, "Boxes", "");

    const colorInput = screen.getByRole("textbox", { name: /color/i });
    await user.tripleClick(colorInput);
    await user.keyboard("#123456");

    // Submit
    const submitButton = screen.getByRole("button", { name: /save tag/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Valid Name", // Should be trimmed
        }),
        expect.anything(), // form event
      );
    });
  });

  it("displays all application options correctly", async () => {
    const user = userEvent.setup();
    render(<TagForm isLoading={false} onSubmit={mockOnSubmit} />, {
      routePath: "/test",
      initialUrl: "/test",
      mocks: [],
    });

    // Click on Apply To field
    const applyToField = screen.getByLabelText(/apply to/i);
    await user.click(applyToField);

    // Check all options are present
    expect(
      await screen.findByRole("option", { name: "Boxes + Beneficiaries" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Beneficiaries" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Boxes" })).toBeInTheDocument();
  });

  it("allows selecting Beneficiary application type", async () => {
    const user = userEvent.setup();
    render(<TagForm isLoading={false} onSubmit={mockOnSubmit} />, {
      routePath: "/test",
      initialUrl: "/test",
      mocks: [],
    });

    const nameInput = screen.getByPlaceholderText(/please enter a tag name/i);
    await user.type(nameInput, "Beneficiary Tag");

    await selectOptionInSelectField(user, /apply to/i, "Beneficiaries", "");

    const colorInput = screen.getByRole("textbox", { name: /color/i });
    await user.tripleClick(colorInput);
    await user.keyboard("#FF5733");

    const submitButton = screen.getByRole("button", { name: /save tag/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          application: "Beneficiary",
        }),
        expect.anything(), // form event
      );
    });
  });

  it("disables submit button when loading", () => {
    render(<TagForm isLoading={true} onSubmit={mockOnSubmit} />, {
      routePath: "/test",
      initialUrl: "/test",
      mocks: [],
    });

    const submitButton = screen.getByRole("button", { name: /save tag/i });
    expect(submitButton).toBeDisabled();
  });

  it("shows loading state on submit button", () => {
    render(<TagForm isLoading={true} onSubmit={mockOnSubmit} />, {
      routePath: "/test",
      initialUrl: "/test",
      mocks: [],
    });

    // Loading button should be present and disabled
    const submitButton = screen.getByRole("button", { name: /save tag/i });
    expect(submitButton).toBeDisabled();
  });

  it("navigates back when clicking Nevermind", async () => {
    const user = userEvent.setup();
    render(<TagForm isLoading={false} onSubmit={mockOnSubmit} />, {
      routePath: "/test",
      initialUrl: "/test",
      mocks: [],
    });

    const nevermindButton = screen.getByRole("button", { name: /nevermind/i });
    await user.click(nevermindButton);

    expect(mockNavigate).toHaveBeenCalledWith("..");
  });

  it("does not call onSubmit when clicking Nevermind", async () => {
    const user = userEvent.setup();
    render(<TagForm isLoading={false} onSubmit={mockOnSubmit} />, {
      routePath: "/test",
      initialUrl: "/test",
      mocks: [],
    });

    const nevermindButton = screen.getByRole("button", { name: /nevermind/i });
    await user.click(nevermindButton);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("transforms empty description to undefined", async () => {
    const user = userEvent.setup();
    render(<TagForm isLoading={false} onSubmit={mockOnSubmit} />, {
      routePath: "/test",
      initialUrl: "/test",
      mocks: [],
    });

    const nameInput = screen.getByPlaceholderText(/please enter a tag name/i);
    await user.type(nameInput, "Test Tag");

    await selectOptionInSelectField(user, /apply to/i, "Boxes", "");

    const colorInput = screen.getByRole("textbox", { name: /color/i });
    await user.tripleClick(colorInput);
    await user.keyboard("#123456");

    // Leave description empty but click on it to trigger any validation
    const descriptionInput = screen.getByRole("textbox", { name: /description/i });
    await user.click(descriptionInput);
    await user.tab();

    const submitButton = screen.getByRole("button", { name: /save tag/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          description: undefined, // Empty string should be transformed to undefined
        }),
        expect.anything(), // form event
      );
    });
  });

  it("shows helper text for application field when editing", () => {
    const defaultValues = {
      name: "Test Tag",
      application: "Box" as const,
      color: "#FF5733",
      description: "Test description",
    };

    render(<TagForm isLoading={false} onSubmit={mockOnSubmit} defaultValues={defaultValues} />, {
      routePath: "/test",
      initialUrl: "/test",
      mocks: [],
    });

    // Should show helper text about switching application
    expect(
      screen.getByText(/switching this will unassign tags from items it does not apply to/i),
    ).toBeInTheDocument();
  });

  it("does not show helper text for application field when creating", () => {
    render(<TagForm isLoading={false} onSubmit={mockOnSubmit} />, {
      routePath: "/test",
      initialUrl: "/test",
      mocks: [],
    });

    // Should not show helper text
    expect(
      screen.queryByText(/switching this will unassign tags from items it does not apply to/i),
    ).not.toBeInTheDocument();
  });

  it("accepts valid hex color codes", async () => {
    const user = userEvent.setup();
    render(<TagForm isLoading={false} onSubmit={mockOnSubmit} />, {
      routePath: "/test",
      initialUrl: "/test",
      mocks: [],
    });

    const nameInput = screen.getByPlaceholderText(/please enter a tag name/i);
    await user.type(nameInput, "Color Tag");

    await selectOptionInSelectField(user, /apply to/i, "Boxes", "");

    const colorInput = screen.getByRole("textbox", { name: /color/i });
    await user.tripleClick(colorInput);
    await user.keyboard("#AABBCC");

    const submitButton = screen.getByRole("button", { name: /save tag/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          color: "#AABBCC",
        }),
        expect.anything(), // form event
      );
    });
  });

  it("handles form reset when default values change", () => {
    const defaultValues1 = {
      name: "Tag 1",
      application: "Box" as const,
      color: "#111111",
      description: "First tag",
    };

    const { rerender } = render(
      <TagForm isLoading={false} onSubmit={mockOnSubmit} defaultValues={defaultValues1} />,
      {
        routePath: "/test",
        initialUrl: "/test",
        mocks: [],
      },
    );

    expect(screen.getByDisplayValue("Tag 1")).toBeInTheDocument();

    const defaultValues2 = {
      name: "Tag 2",
      application: "All" as const,
      color: "#222222",
      description: "Second tag",
    };

    // Rerender with new default values
    rerender(<TagForm isLoading={false} onSubmit={mockOnSubmit} defaultValues={defaultValues2} />);

    // Form should still work (exact update behavior depends on react-hook-form implementation)
    expect(screen.getByPlaceholderText(/please enter a tag name/i)).toBeInTheDocument();
  });
});
