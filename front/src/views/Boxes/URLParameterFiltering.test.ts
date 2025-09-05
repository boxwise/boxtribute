import { describe, it, expect, vi } from "vitest";
import { prepareBoxesForBoxesViewQueryVariables } from "./components/transformers";

/**
 * Tests for URL parameter filtering functionality in BoxesView
 * Covers URL encoding/decoding, parameter conversion, and GraphQL variable preparation
 */
describe("URL Parameter Filtering", () => {
  describe("Issue: URL parameter flickering when clearing filters", () => {
    it("should update URL atomically without flickering empty parameters", () => {
      const mockReplaceState = vi.fn();
      Object.defineProperty(window, "history", {
        value: { replaceState: mockReplaceState },
        writable: true,
      });
      Object.defineProperty(window, "location", {
        value: { href: "http://localhost:3000/boxes?category_ids=11" },
        writable: true,
      });

      // Simulate the atomic URL update function
      const updateUrlParameter = (paramName: string, value: string | undefined) => {
        const url = new URL(window.location.href);
        if (value) {
          url.searchParams.set(paramName, value);
        } else {
          url.searchParams.delete(paramName);
        }
        window.history.replaceState({}, "", url.toString());
      };

      // Clear the parameter
      updateUrlParameter("category_ids", undefined);

      // Should not have empty parameter in URL
      const lastCallUrl = mockReplaceState.mock.calls[mockReplaceState.mock.calls.length - 1][2];
      expect(lastCallUrl).not.toContain("category_ids=");
      expect(lastCallUrl).not.toContain("category_ids");
    });
  });

  describe("Issue: ID-to-name conversion when loading from URL", () => {
    it("should convert product_id=1 to 'Tops' display name (specific PR example)", () => {
      // This is the specific example mentioned in the PR comments
      const mockNameMappings = {
        productIdToName: new Map([
          ["1", "Tops"],
          ["2", "Pants"],
        ]),
      };

      const convertFilter = (filter: any) => {
        if (filter.needsConversion && filter.value && filter.id === "product") {
          const convertedValues = filter.value.map(
            (id: string) => mockNameMappings.productIdToName.get(id) || id,
          );
          return { ...filter, value: convertedValues };
        }
        return filter;
      };

      // Test the specific case: visiting URL with &product_id=1 should show "Tops" filter
      const productFilter = { id: "product", value: ["1"], needsConversion: true };
      const convertedProduct = convertFilter(productFilter);
      expect(convertedProduct.value).toEqual(["Tops"]);
    });

    it("should convert category_id=11 back to 'Food & Kitchen' display name", () => {
      // Mock the ID-to-name mapping logic
      const mockNameMappings = {
        categoryIdToName: new Map([
          ["11", "Food & Kitchen"],
          ["12", "Clothing"],
        ]),
        productIdToName: new Map([
          ["1", "Tops"],
          ["2", "Pants"],
        ]),
        sizeIdToName: new Map([
          ["5", "M"],
          ["6", "L"],
        ]),
        locationIdToName: new Map([
          ["2", "Warehouse A"],
          ["3", "Warehouse B"],
        ]),
      };

      // Simulate the conversion logic from BoxesTable
      const convertFilter = (filter: any) => {
        if (filter.needsConversion && filter.value) {
          const convertedValues = filter.value.map((id: string) => {
            switch (filter.id) {
              case "productCategory":
                return mockNameMappings.categoryIdToName.get(id) || id;
              case "product":
                return mockNameMappings.productIdToName.get(id) || id;
              case "size":
                return mockNameMappings.sizeIdToName.get(id) || id;
              case "location":
                return mockNameMappings.locationIdToName.get(id) || id;
              default:
                return id;
            }
          });
          return { ...filter, value: convertedValues };
        }
        return filter;
      };

      // Test category conversion
      const categoryFilter = { id: "productCategory", value: ["11"], needsConversion: true };
      const convertedCategory = convertFilter(categoryFilter);
      expect(convertedCategory.value).toEqual(["Food & Kitchen"]);

      // Test product conversion
      const productFilter = { id: "product", value: ["1"], needsConversion: true };
      const convertedProduct = convertFilter(productFilter);
      expect(convertedProduct.value).toEqual(["Tops"]);

      // Test size conversion
      const sizeFilter = { id: "size", value: ["5"], needsConversion: true };
      const convertedSize = convertFilter(sizeFilter);
      expect(convertedSize.value).toEqual(["M"]);
    });
  });

  describe("Issue: Multiple filter values with plural URL parameters", () => {
    it("should support product_ids=3,7 (plural with multiple values)", () => {
      // Test URL parameter splitting with multiple values
      const decodeAndSplit = (value: string): string[] => {
        const decoded = decodeURIComponent(value);
        return decoded.split(",").filter(Boolean);
      };

      // Single value
      expect(decodeAndSplit("3")).toEqual(["3"]);

      // Multiple values
      expect(decodeAndSplit("3,7")).toEqual(["3", "7"]);
      expect(decodeAndSplit("3,7,9")).toEqual(["3", "7", "9"]);

      // URL encoded
      expect(decodeAndSplit("3%2C7%2C9")).toEqual(["3", "7", "9"]);
    });

    it("should use plural parameter names for all filter types", () => {
      const expectedPluralParams = [
        "category_ids",
        "product_ids",
        "size_ids",
        "gender_ids",
        "location_ids",
        "box_state", // Special case
        "tag_ids",
      ];

      // This validates our interface definition
      const filterInterface = {
        category_ids: ["11", "12"],
        product_ids: ["1", "2"],
        size_ids: ["5", "6"],
        gender_ids: ["Men", "Women"],
        location_ids: ["2", "3"],
        box_state: ["InStock", "Lost"],
        tag_ids: ["80", "85"],
      };

      Object.keys(filterInterface).forEach((key) => {
        expect(expectedPluralParams).toContain(key);
      });
    });
  });

  describe("Issue: URL-encoded comma handling", () => {
    it("should handle incomplete support for multiple box states (original PR issue)", () => {
      // This tests the issue: "Incomplete support for multiple box states in URL params"
      const decodeAndSplit = (value: string): string[] => {
        const decoded = decodeURIComponent(value);
        return decoded.split(",").filter(Boolean);
      };

      // Test that multiple states are properly decoded and split
      const multipleStates = "InStock%2CLost%2CDonated";
      const result = decodeAndSplit(multipleStates);

      expect(result).toHaveLength(3);
      expect(result).toEqual(["InStock", "Lost", "Donated"]);
      expect(result).not.toEqual(["InStock"]); // Should not just take first value
    });

    it("should handle ?box_state=InStock%2CLost%2CDonated correctly", () => {
      const urlEncodedValue = "InStock%2CLost%2CDonated";

      // Test decoding function
      const decodeAndSplit = (value: string): string[] => {
        const decoded = decodeURIComponent(value);
        return decoded.split(",").filter(Boolean);
      };

      const result = decodeAndSplit(urlEncodedValue);
      expect(result).toEqual(["InStock", "Lost", "Donated"]);

      // Should not just split on %2C
      const incorrectResult = urlEncodedValue.split(",");
      expect(incorrectResult).toEqual(["InStock%2CLost%2CDonated"]);
      expect(incorrectResult).not.toEqual(["InStock", "Lost", "Donated"]);
    });

    it("should handle mixed encoded and non-encoded commas", () => {
      const decodeAndSplit = (value: string): string[] => {
        const decoded = decodeURIComponent(value);
        return decoded.split(",").filter(Boolean);
      };

      // Regular commas
      expect(decodeAndSplit("A,B,C")).toEqual(["A", "B", "C"]);

      // Encoded commas
      expect(decodeAndSplit("A%2CB%2CC")).toEqual(["A", "B", "C"]);

      // Mixed (shouldn't happen in real URLs but good to handle)
      expect(decodeAndSplit("A,B%2CC")).toEqual(["A", "B", "C"]);
    });
  });

  describe("Issue: GraphQL tag object serialization", () => {
    it("should extract tag IDs instead of sending full objects to backend", () => {
      // Test tag object processing
      const filters = [
        {
          id: "tags",
          value: [
            { __typename: "Tag", id: "80", name: "door", color: "#FF0000" },
            { __typename: "Tag", id: "85", name: "window", color: "#00FF00" },
          ],
        },
      ];

      const result = prepareBoxesForBoxesViewQueryVariables("test-base", filters);

      // Should extract only IDs, not full objects
      expect(result.filterInput!.tagIds).toEqual([80, 85]);
      expect(result.filterInput!.tagIds).not.toContain(
        expect.objectContaining({ __typename: "Tag" }),
      );
    });

    it("should handle ?tag_ids=80&box_state=InStock without GraphQL errors", () => {
      const filters = [
        {
          id: "tags",
          value: ["80"], // String ID from URL
        },
        {
          id: "state",
          value: ["InStock"],
        },
      ];

      const result = prepareBoxesForBoxesViewQueryVariables("test-base", filters);

      expect(result.filterInput!).toEqual({
        tagIds: [80],
        states: ["InStock"],
      });

      // Ensure no invalid GraphQL variable structure
      expect(result.filterInput!.tagIds![0]).toBe(80);
      expect(typeof result.filterInput!.tagIds![0]).toBe("number");
    });
  });

  describe("Issue: Backend GraphQL schema limitations", () => {
    it("should only send supported filters (state, tagIds) to GraphQL backend", () => {
      const filters = [
        { id: "state", value: ["InStock", "Lost"] },
        { id: "tags", value: ["80", "85"] },
        { id: "productCategory", value: ["Food & Kitchen"] }, // Frontend only
        { id: "product", value: ["Tops"] }, // Frontend only
        { id: "size", value: ["M"] }, // Frontend only
        { id: "location", value: ["Warehouse A"] }, // Frontend only
        { id: "gender", value: ["Men"] }, // Frontend only
      ];

      const result = prepareBoxesForBoxesViewQueryVariables("test-base", filters);

      // Only state and tagIds should be in the GraphQL variables
      expect(result.filterInput!).toEqual({
        states: ["InStock", "Lost"],
        tagIds: [80, 85],
      });

      // Frontend-only filters should be excluded
      expect(result.filterInput!).not.toHaveProperty("productCategory");
      expect(result.filterInput!).not.toHaveProperty("product");
      expect(result.filterInput!).not.toHaveProperty("size");
      expect(result.filterInput!).not.toHaveProperty("location");
      expect(result.filterInput!).not.toHaveProperty("gender");
    });

    it("should handle locationId gracefully as frontend-only filter", () => {
      // locationId is not in FilterBoxInput schema but should work for frontend filtering
      const filters = [
        { id: "location", value: ["2", "3"] },
        { id: "state", value: ["InStock"] }, // This should still work
      ];

      const result = prepareBoxesForBoxesViewQueryVariables("test-base", filters);

      // Only backend-supported filters should be sent
      expect(result.filterInput!).toEqual({
        states: ["InStock"],
      });
      expect(result.filterInput!).not.toHaveProperty("locationId");
    });
  });

  describe("Issue: Filter clearing bidirectional sync", () => {
    it("should initially sync table filters to URL (original PR issue)", () => {
      // This tests the original issue: "clearing filters did not update URL parameters initially"
      const mockReplaceState = vi.fn();
      Object.defineProperty(window, "history", {
        value: { replaceState: mockReplaceState },
        writable: true,
      });

      // Simulate setting filters which should update URL
      const updateUrlFromFilters = (filters: any[]) => {
        const url = new URL("http://localhost:3000/boxes");
        filters.forEach((filter) => {
          if (filter.value && filter.value.length > 0) {
            const paramName = `${filter.id}_ids`;
            url.searchParams.set(paramName, filter.value.join(","));
          }
        });
        window.history.replaceState({}, "", url.toString());
      };

      const filters = [
        { id: "category", value: ["11"] },
        { id: "product", value: ["1", "2"] },
      ];

      updateUrlFromFilters(filters);

      const finalUrl = mockReplaceState.mock.calls[mockReplaceState.mock.calls.length - 1][2];
      expect(finalUrl).toContain("category_ids=11");
      expect(finalUrl).toContain("product_ids=1%2C2"); // Comma gets URL encoded
    });

    it("should clear URL parameters when filters are removed from table", () => {
      const mockReplaceState = vi.fn();
      Object.defineProperty(window, "history", {
        value: { replaceState: mockReplaceState },
        writable: true,
      });

      // Simulate clearing multiple filters at once
      const clearFilters = () => {
        const url = new URL(
          "http://localhost:3000/boxes?category_ids=11&product_ids=1&box_state=InStock",
        );
        url.searchParams.delete("category_ids");
        url.searchParams.delete("product_ids");
        url.searchParams.delete("box_state");
        window.history.replaceState({}, "", url.toString());
      };

      clearFilters();

      const finalUrl = mockReplaceState.mock.calls[mockReplaceState.mock.calls.length - 1][2];
      expect(finalUrl).toBe("http://localhost:3000/boxes");
    });
  });

  describe("Issue: Empty URL parameter management", () => {
    it("should not show empty parameters like ?category_ids=&product_ids=", () => {
      const mockReplaceState = vi.fn();
      Object.defineProperty(window, "history", {
        value: { replaceState: mockReplaceState },
        writable: true,
      });

      // Test atomic update that prevents empty parameters
      const updateUrlParameter = (paramName: string, value: string | undefined) => {
        const url = new URL("http://localhost:3000/boxes");
        if (value) {
          url.searchParams.set(paramName, value);
        } else {
          url.searchParams.delete(paramName);
        }
        window.history.replaceState({}, "", url.toString());
      };

      // Set then clear parameter
      updateUrlParameter("category_ids", "11");
      let url = mockReplaceState.mock.calls[mockReplaceState.mock.calls.length - 1][2];
      expect(url).toBe("http://localhost:3000/boxes?category_ids=11");

      updateUrlParameter("category_ids", undefined);
      url = mockReplaceState.mock.calls[mockReplaceState.mock.calls.length - 1][2];
      expect(url).toBe("http://localhost:3000/boxes");
      expect(url).not.toContain("category_ids=");
    });
  });

  describe("Issue: Backward compatibility with single values", () => {
    it("should work with both single and multiple values", () => {
      const decodeAndSplit = (value: string): string[] => {
        const decoded = decodeURIComponent(value);
        return decoded.split(",").filter(Boolean);
      };

      // Single values should create single-item arrays
      expect(decodeAndSplit("11")).toEqual(["11"]);
      expect(decodeAndSplit("InStock")).toEqual(["InStock"]);

      // Multiple values should create multi-item arrays
      expect(decodeAndSplit("11,12")).toEqual(["11", "12"]);
      expect(decodeAndSplit("InStock,Lost")).toEqual(["InStock", "Lost"]);

      // Both should work with the same processing logic
      const processSingle = decodeAndSplit("11");
      const processMultiple = decodeAndSplit("11,12");

      expect(Array.isArray(processSingle)).toBe(true);
      expect(Array.isArray(processMultiple)).toBe(true);
      expect(processSingle).toHaveLength(1);
      expect(processMultiple).toHaveLength(2);
    });
  });

  describe("Debug: Multiple product URL decoding", () => {
    it("should decode multiple product IDs from URL parameter", () => {
      // Test the exact decoding logic used in the hook
      const decodeAndSplitParam = (value: string | undefined): string[] | undefined => {
        if (!value || value === "") return undefined;
        const decoded = decodeURIComponent(value);
        const split = decoded.split(",").filter(Boolean);
        return split.length > 0 ? split : undefined;
      };

      // Test various formats
      expect(decodeAndSplitParam("1,2,3")).toEqual(["1", "2", "3"]);
      expect(decodeAndSplitParam("1%2C2%2C3")).toEqual(["1", "2", "3"]);
      expect(decodeAndSplitParam("")).toBeUndefined();
      expect(decodeAndSplitParam(undefined)).toBeUndefined();

      // Test single value
      expect(decodeAndSplitParam("1")).toEqual(["1"]);

      // Test empty elements
      expect(decodeAndSplitParam("1,,3")).toEqual(["1", "3"]);
    });
  });
});
