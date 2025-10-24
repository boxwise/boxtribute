import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { MockedProvider } from "@apollo/client/testing/react";
import GenderProductFilter, {
  categoryFilterId,
  categoryToFilterValue,
} from "./GenderProductFilter";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider>
    <MockedProvider>
      <BrowserRouter>{children}</BrowserRouter>
    </MockedProvider>
  </ChakraProvider>
);

describe("GenderProductFilter", () => {
  it("renders the category filter dropdown", () => {
    render(
      <TestWrapper>
        <GenderProductFilter />
      </TestWrapper>,
    );

    // Check that the category filter is rendered
    expect(screen.getByLabelText("product category")).toBeInTheDocument();
  });

  it("has correct categoryFilterId", () => {
    expect(categoryFilterId).toBe("cf");
  });

  it("categoryToFilterValue converts category correctly", () => {
    const mockCategory = {
      id: 1,
      name: "Clothing",
    };

    const result = categoryToFilterValue(mockCategory);

    expect(result).toEqual({
      id: 1,
      value: "1",
      name: "Clothing",
      label: "Clothing",
      urlId: "1",
    });
  });

  it("categoryToFilterValue handles non-null fields", () => {
    const mockCategory = {
      id: 2,
      name: "Footwear",
    };

    const result = categoryToFilterValue(mockCategory);

    expect(result).toEqual({
      id: 2,
      value: "2",
      name: "Footwear",
      label: "Footwear",
      urlId: "2",
    });
  });
});
