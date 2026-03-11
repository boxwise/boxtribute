import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import TabbedTagDropdown from "./TabbedTagDropdown";
import { ITagFilterValue } from "../../state/filter";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider>
    <BrowserRouter>{children}</BrowserRouter>
  </ChakraProvider>
);

// Dark color → colorIsBright returns false → white text on chip
const darkTag: ITagFilterValue = {
  id: 1,
  value: "1",
  label: "Dark Tag",
  color: "#000000",
  urlId: "1",
};
// Bright color → colorIsBright returns true → black text on chip
const brightTag: ITagFilterValue = {
  id: 2,
  value: "2",
  label: "Bright Tag",
  color: "#ffffff",
  urlId: "2",
};
const thirdTag: ITagFilterValue = {
  id: 3,
  value: "3",
  label: "Third Tag",
  color: "#123456",
  urlId: "3",
};

const allTags = [darkTag, brightTag, thirdTag];

describe("TabbedTagDropdown", () => {
  it("renders with placeholder text", () => {
    render(
      <TestWrapper>
        <TabbedTagDropdown
          availableTags={allTags}
          includedTags={[]}
          excludedTags={[]}
          onIncludedChange={vi.fn()}
          onExcludedChange={vi.fn()}
        />
      </TestWrapper>,
    );

    expect(screen.getByText("Filter by tags")).toBeInTheDocument();
  });

  it("renders with a custom placeholder", () => {
    render(
      <TestWrapper>
        <TabbedTagDropdown
          availableTags={allTags}
          includedTags={[]}
          excludedTags={[]}
          onIncludedChange={vi.fn()}
          onExcludedChange={vi.fn()}
          placeholder="Search tags…"
        />
      </TestWrapper>,
    );

    expect(screen.getByText("Search tags…")).toBeInTheDocument();
  });

  it("shows included and excluded tags as multi-value chips", () => {
    render(
      <TestWrapper>
        <TabbedTagDropdown
          availableTags={allTags}
          includedTags={[darkTag]}
          excludedTags={[brightTag]}
          onIncludedChange={vi.fn()}
          onExcludedChange={vi.fn()}
        />
      </TestWrapper>,
    );

    expect(screen.getByText("Dark Tag")).toBeInTheDocument();
    expect(screen.getByText("Bright Tag")).toBeInTheDocument();
  });

  it("shows Include and Exclude tabs when the menu is open", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <TabbedTagDropdown
          availableTags={allTags}
          includedTags={[]}
          excludedTags={[]}
          onIncludedChange={vi.fn()}
          onExcludedChange={vi.fn()}
        />
      </TestWrapper>,
    );

    // Open the dropdown
    await user.click(screen.getByText("Filter by tags"));

    expect(screen.getByText("Include")).toBeInTheDocument();
    expect(screen.getByText("Exclude")).toBeInTheDocument();
  });

  it("calls onIncludedChange when a tag is selected on the Include tab", async () => {
    const user = userEvent.setup();
    const onIncludedChange = vi.fn();
    const onExcludedChange = vi.fn();

    render(
      <TestWrapper>
        <TabbedTagDropdown
          availableTags={allTags}
          includedTags={[]}
          excludedTags={[]}
          onIncludedChange={onIncludedChange}
          onExcludedChange={onExcludedChange}
        />
      </TestWrapper>,
    );

    // Open the dropdown (Include tab is active by default)
    await user.click(screen.getByText("Filter by tags"));
    // Select the first option
    await user.click(screen.getByText("Dark Tag"));

    expect(onIncludedChange).toHaveBeenCalledWith([darkTag]);
    expect(onExcludedChange).not.toHaveBeenCalled();
  });

  it("calls onExcludedChange when a tag is selected on the Exclude tab", async () => {
    const user = userEvent.setup();
    const onIncludedChange = vi.fn();
    const onExcludedChange = vi.fn();

    render(
      <TestWrapper>
        <TabbedTagDropdown
          availableTags={allTags}
          includedTags={[]}
          excludedTags={[]}
          onIncludedChange={onIncludedChange}
          onExcludedChange={onExcludedChange}
        />
      </TestWrapper>,
    );

    // Open the dropdown and switch to Exclude tab
    await user.click(screen.getByText("Filter by tags"));
    await user.click(screen.getByText("Exclude"));
    // Select the first option
    await user.click(screen.getByText("Dark Tag"));

    expect(onExcludedChange).toHaveBeenCalledWith([darkTag]);
    expect(onIncludedChange).not.toHaveBeenCalled();
  });

  it("calls onIncludedChange when a new tag is added on Include tab while other tags exist in excluded list", async () => {
    const user = userEvent.setup();
    const onIncludedChange = vi.fn();
    const onExcludedChange = vi.fn();

    render(
      <TestWrapper>
        <TabbedTagDropdown
          availableTags={allTags}
          includedTags={[]}
          excludedTags={[brightTag]}
          onIncludedChange={onIncludedChange}
          onExcludedChange={onExcludedChange}
        />
      </TestWrapper>,
    );

    // When tags are already selected the placeholder is hidden; open via the combobox input.
    // Include tab is active by default (tabIndexRef starts at 0).
    // Select thirdTag (not in any list yet) on the Include tab.
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: /third tag/i }));

    expect(onIncludedChange).toHaveBeenCalledWith([thirdTag]);
    expect(onExcludedChange).not.toHaveBeenCalled();
  });

  it("calls onExcludedChange when a new tag is added on Exclude tab while other tags exist in included list", async () => {
    const user = userEvent.setup();
    const onIncludedChange = vi.fn();
    const onExcludedChange = vi.fn();

    render(
      <TestWrapper>
        <TabbedTagDropdown
          availableTags={allTags}
          includedTags={[brightTag]}
          excludedTags={[]}
          onIncludedChange={onIncludedChange}
          onExcludedChange={onExcludedChange}
        />
      </TestWrapper>,
    );

    // Open dropdown, switch to Exclude tab, select thirdTag (not in any list yet).
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByText("Exclude"));
    await user.click(screen.getByRole("option", { name: /third tag/i }));

    expect(onExcludedChange).toHaveBeenCalledWith([thirdTag]);
    expect(onIncludedChange).not.toHaveBeenCalled();
  });

  it("calls onIncludedChange without the removed tag when an included tag chip is removed", async () => {
    const user = userEvent.setup();
    const onIncludedChange = vi.fn();
    const onExcludedChange = vi.fn();

    render(
      <TestWrapper>
        <TabbedTagDropdown
          availableTags={allTags}
          includedTags={[darkTag, brightTag]}
          excludedTags={[]}
          onIncludedChange={onIncludedChange}
          onExcludedChange={onExcludedChange}
        />
      </TestWrapper>,
    );

    // Click the remove (×) button on the Dark Tag chip
    const removeButton = screen.getByRole("button", { name: /remove dark tag/i });
    await user.click(removeButton);

    expect(onIncludedChange).toHaveBeenCalledWith([brightTag]);
    expect(onExcludedChange).not.toHaveBeenCalled();
  });

  it("calls onExcludedChange without the removed tag when an excluded tag chip is removed", async () => {
    const user = userEvent.setup();
    const onIncludedChange = vi.fn();
    const onExcludedChange = vi.fn();

    render(
      <TestWrapper>
        <TabbedTagDropdown
          availableTags={allTags}
          includedTags={[]}
          excludedTags={[darkTag, brightTag]}
          onIncludedChange={onIncludedChange}
          onExcludedChange={onExcludedChange}
        />
      </TestWrapper>,
    );

    // Click the remove (×) button on the Dark Tag chip
    const removeButton = screen.getByRole("button", { name: /remove dark tag/i });
    await user.click(removeButton);

    expect(onExcludedChange).toHaveBeenCalledWith([brightTag]);
    expect(onIncludedChange).not.toHaveBeenCalled();
  });

  it("shows all available tags as options even when some are already selected (hideSelectedOptions=false)", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <TabbedTagDropdown
          availableTags={allTags}
          includedTags={[darkTag]}
          excludedTags={[brightTag]}
          onIncludedChange={vi.fn()}
          onExcludedChange={vi.fn()}
        />
      </TestWrapper>,
    );

    // Open the menu; all 3 tags should appear as options despite 2 already being selected
    await user.click(screen.getByRole("combobox"));

    expect(screen.getByRole("option", { name: /dark tag/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /bright tag/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /third tag/i })).toBeInTheDocument();
  });

  it("filters visible options when the user types in the search input", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <TabbedTagDropdown
          availableTags={allTags}
          includedTags={[]}
          excludedTags={[]}
          onIncludedChange={vi.fn()}
          onExcludedChange={vi.fn()}
        />
      </TestWrapper>,
    );

    // Type "Third" to filter options
    await user.click(screen.getByText("Filter by tags"));
    await user.type(screen.getByRole("combobox"), "Third");

    // Only "Third Tag" should appear; others should not be present as options
    expect(screen.getByRole("option", { name: /third tag/i })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /dark tag/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /bright tag/i })).not.toBeInTheDocument();
  });
});
