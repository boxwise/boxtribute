import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { MockedProvider } from "@apollo/client/testing";
import DashboardTagFilter, {
  tagFilterIncludedId,
  tagFilterExcludedId,
  tagToFilterValue,
} from "./DashboardTagFilter";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider>
    <MockedProvider>
      <BrowserRouter>{children}</BrowserRouter>
    </MockedProvider>
  </ChakraProvider>
);

describe("DashboardTagFilter", () => {
  it("renders the tag filter component", () => {
    render(
      <TestWrapper>
        <DashboardTagFilter />
      </TestWrapper>,
    );

    // Check that the tags label is rendered
    expect(screen.getByText("tags")).toBeInTheDocument();
  });

  it("has correct filter IDs", () => {
    expect(tagFilterIncludedId).toBe("tags");
    expect(tagFilterExcludedId).toBe("notags");
  });

  it("tagToFilterValue converts tag correctly", () => {
    const mockTag = {
      id: 1,
      name: "Urgent",
      color: "#ff0000",
    };

    const result = tagToFilterValue(mockTag);

    expect(result).toEqual({
      id: 1,
      value: "1",
      label: "Urgent",
      color: "#ff0000",
      urlId: "1",
    });
  });

  it("tagToFilterValue handles different tag data", () => {
    const mockTag = {
      id: 42,
      name: "Priority",
      color: "#00ff00",
    };

    const result = tagToFilterValue(mockTag);

    expect(result).toEqual({
      id: 42,
      value: "42",
      label: "Priority",
      color: "#00ff00",
      urlId: "42",
    });
  });
});
