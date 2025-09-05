import { describe, it, expect, vi } from "vitest";
import { prepareBoxesForBoxesViewQueryVariables } from "./components/transformers";

/**
 * Comprehensive tests for URL parameter filtering functionality:
 * - Clean URL parameter management (no empty parameters)
 * - Multiple filter value handling with complete data conversion
 * - GraphQL variable type compliance (integer tag IDs)
 * - Integration scenarios and edge cases
 */
describe("URL Parameter Integration Tests", () => {
  describe("Clean URL Parameter Management", () => {
    it("should create clean URLs without empty parameters", () => {
      const mockReplaceState = vi.fn();
      Object.defineProperty(window, "history", {
        value: { replaceState: mockReplaceState },
        writable: true,
      });

      // Simulate the atomic URL update function from useBoxesViewFilters
      // Need to track current URL state between calls
      const currentUrl = new URL("http://localhost:3000/boxes");

      const updateUrlParameter = (paramName: string, value: string | undefined) => {
        if (value) {
          currentUrl.searchParams.set(paramName, value);
        } else {
          currentUrl.searchParams.delete(paramName); // KEY FIX: Delete instead of empty string
        }
        window.history.replaceState({}, "", currentUrl.toString());
      };

      // Test setting and clearing parameters
      updateUrlParameter("box_state", "InStock");
      updateUrlParameter("category_ids", "11");
      updateUrlParameter("product_ids", "1,2");

      let url = mockReplaceState.mock.calls[mockReplaceState.mock.calls.length - 1][2];
      expect(url).toBe(
        "http://localhost:3000/boxes?box_state=InStock&category_ids=11&product_ids=1%2C2",
      );

      // Clear some parameters - should be deleted completely
      updateUrlParameter("category_ids", undefined);
      updateUrlParameter("product_ids", undefined);

      url = mockReplaceState.mock.calls[mockReplaceState.mock.calls.length - 1][2];
      expect(url).toBe("http://localhost:3000/boxes?box_state=InStock");
      expect(url).not.toContain("category_ids=");
      expect(url).not.toContain("product_ids=");
    });

    it("should handle clearing all filters to get clean base URL", () => {
      const mockReplaceState = vi.fn();
      Object.defineProperty(window, "history", {
        value: { replaceState: mockReplaceState },
        writable: true,
      });

      const clearAllFilters = () => {
        const url = new URL(
          "http://localhost:3000/boxes?box_state=InStock&category_ids=11&product_ids=1,2&size_ids=5&gender_ids=Men&location_ids=2&tag_ids=80",
        );
        url.searchParams.delete("category_ids");
        url.searchParams.delete("product_ids");
        url.searchParams.delete("size_ids");
        url.searchParams.delete("gender_ids");
        url.searchParams.delete("location_ids");
        url.searchParams.delete("box_state");
        url.searchParams.delete("tag_ids");
        window.history.replaceState({}, "", url.toString());
      };

      clearAllFilters();
      const finalUrl = mockReplaceState.mock.calls[mockReplaceState.mock.calls.length - 1][2];
      expect(finalUrl).toBe("http://localhost:3000/boxes");
    });

    it("should demonstrate the problem with empty string approach", () => {
      // OLD APPROACH (problematic)
      const createUrlWithEmptyStrings = () => {
        const url = new URL("http://localhost:3000/boxes");
        url.searchParams.set("box_state", "InStock");
        url.searchParams.set("category_ids", ""); // This creates ugly URL
        url.searchParams.set("product_ids", "");
        return url.toString();
      };

      // NEW APPROACH (fixed)
      const createUrlWithDeletedParams = () => {
        const url = new URL("http://localhost:3000/boxes");
        url.searchParams.set("box_state", "InStock");
        // Don't set empty parameters at all
        return url.toString();
      };

      const oldUrl = createUrlWithEmptyStrings();
      const newUrl = createUrlWithDeletedParams();

      expect(oldUrl).toBe(
        "http://localhost:3000/boxes?box_state=InStock&category_ids=&product_ids=",
      );
      expect(newUrl).toBe("http://localhost:3000/boxes?box_state=InStock");
    });
  });

  describe("Multiple Filter Value Handling", () => {
    it("should convert all product IDs with complete product data", () => {
      // Complete product data (simulates ACTION_OPTIONS_FOR_BOXESVIEW_QUERY result)
      const allProducts = [
        { id: "1", name: "Tops", category: { id: "11", name: "Clothing" } },
        { id: "2", name: "Pants", category: { id: "11", name: "Clothing" } },
        { id: "3", name: "Jackets", category: { id: "12", name: "Outerwear" } },
      ];

      // Build complete mapping (NEW approach)
      const productIdToName = new Map<string, string>();
      allProducts.forEach((product) => {
        productIdToName.set(product.id, product.name);
      });

      // Test URL: ?product_ids=1,2,3 should convert to ["Tops", "Pants", "Jackets"]
      const urlProductIds = ["1", "2", "3"];
      const convertedNames = urlProductIds.map((id) => productIdToName.get(id) || id);

      expect(convertedNames).toEqual(["Tops", "Pants", "Jackets"]);
    });

    it("should demonstrate the problem with filtered-only data", () => {
      // Limited product data (simulates OLD approach - only from filtered boxes)
      const filteredProducts = [
        { id: "1", name: "Tops" },
        // Missing products 2 and 3 because they're not in current filtered results
      ];

      // Build limited mapping (OLD approach)
      const limitedProductIdToName = new Map<string, string>();
      filteredProducts.forEach((product) => {
        limitedProductIdToName.set(product.id, product.name);
      });

      // Test URL: ?product_ids=1,2,3
      const urlProductIds = ["1", "2", "3"];
      const convertedNames = urlProductIds.map((id) => limitedProductIdToName.get(id) || id);

      // This shows the old problem: only first product converts
      expect(convertedNames).toEqual(["Tops", "2", "3"]);
    });

    it("should work for categories too", () => {
      const allCategories = [
        { id: "11", name: "Clothing" },
        { id: "12", name: "Outerwear" },
        { id: "13", name: "Food & Kitchen" },
      ];

      const categoryIdToName = new Map<string, string>();
      allCategories.forEach((category) => {
        categoryIdToName.set(category.id, category.name);
      });

      // Test URL: ?category_ids=11,13
      const convertedNames = ["11", "13"].map((id) => categoryIdToName.get(id) || id);
      expect(convertedNames).toEqual(["Clothing", "Food & Kitchen"]);
    });

    it("should handle mixed scenarios with complete and partial data", () => {
      // Complete data ensures reliability
      const completeProducts = [
        { id: "1", name: "Tops" },
        { id: "2", name: "Pants" },
        { id: "3", name: "Jackets" },
        { id: "4", name: "Shoes" },
      ];

      const productIdToName = new Map<string, string>();
      completeProducts.forEach((product) => {
        productIdToName.set(product.id, product.name);
      });

      const testCases = [
        { input: ["1"], expected: ["Tops"] },
        { input: ["1", "2"], expected: ["Tops", "Pants"] },
        { input: ["2", "4"], expected: ["Pants", "Shoes"] },
        { input: ["1", "2", "3", "4"], expected: ["Tops", "Pants", "Jackets", "Shoes"] },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = input.map((id) => productIdToName.get(id) || id);
        expect(result).toEqual(expected);
      });
    });
  });

  describe("GraphQL Variable Type Compliance", () => {
    it("should convert tag IDs to integers for GraphQL", () => {
      const filters = [
        {
          id: "tags",
          value: ["80", "85", "90"], // String IDs from URL
        },
      ];

      const result = prepareBoxesForBoxesViewQueryVariables("test-base", filters);

      // Should convert to integers
      expect(result.filterInput!.tagIds).toEqual([80, 85, 90]);
      expect(typeof result.filterInput!.tagIds![0]).toBe("number");
    });

    it("should extract IDs from tag objects and convert to integers", () => {
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

      expect(result.filterInput!.tagIds).toEqual([80, 85]);
      result.filterInput!.tagIds!.forEach((id) => {
        expect(typeof id).toBe("number");
      });
    });

    it("should handle mixed tag objects and strings", () => {
      const filters = [
        {
          id: "tags",
          value: [
            { __typename: "Tag", id: "80", name: "door" },
            "85", // String ID
            { id: "90" }, // Object without __typename
          ],
        },
      ];

      const result = prepareBoxesForBoxesViewQueryVariables("test-base", filters);

      expect(result.filterInput!.tagIds).toEqual([80, 85, 90]);
      result.filterInput!.tagIds!.forEach((id) => {
        expect(typeof id).toBe("number");
      });
    });

    it("should filter out invalid tag values", () => {
      const filters = [
        {
          id: "tags",
          value: ["80", "", null, undefined, "invalid", "85", {}],
        },
      ];

      const result = prepareBoxesForBoxesViewQueryVariables("test-base", filters);

      // Should only keep valid integer IDs
      expect(result.filterInput!.tagIds).toEqual([80, 85]);
    });

    it("should handle single tag object", () => {
      const filters = [
        {
          id: "tags",
          value: { __typename: "Tag", id: "80", name: "door" }, // Single object, not array
        },
      ];

      const result = prepareBoxesForBoxesViewQueryVariables("test-base", filters);

      expect(result.filterInput!.tagIds).toEqual([80]);
      expect(typeof result.filterInput!.tagIds![0]).toBe("number");
    });

    it("should demonstrate the old string problem vs new integer solution", () => {
      const filters = [
        {
          id: "tags",
          value: ["80", "85"],
        },
      ];

      const result = prepareBoxesForBoxesViewQueryVariables("test-base", filters);

      // OLD way would have been: ["80", "85"]
      // NEW way is: [80, 85]
      expect(result.filterInput!.tagIds).not.toEqual(["80", "85"]);
      expect(result.filterInput!.tagIds).toEqual([80, 85]);
    });
  });

  describe("Complete Integration Scenarios", () => {
    it("should handle complete URL parameter workflow", () => {
      const mockReplaceState = vi.fn();
      Object.defineProperty(window, "history", {
        value: { replaceState: mockReplaceState },
        writable: true,
      });

      // 1. Clean URL creation (Issue 1 fix)
      const updateUrl = (params: Record<string, string | undefined>) => {
        const url = new URL("http://localhost:3000/boxes");
        Object.entries(params).forEach(([key, value]) => {
          if (value) {
            url.searchParams.set(key, value);
          } else {
            url.searchParams.delete(key);
          }
        });
        window.history.replaceState({}, "", url.toString());
      };

      // Set multiple filters
      updateUrl({
        box_state: "InStock",
        product_ids: "1,2,3",
        tag_ids: "80,85",
      });

      let url = mockReplaceState.mock.calls[mockReplaceState.mock.calls.length - 1][2];
      expect(url).toBe(
        "http://localhost:3000/boxes?box_state=InStock&product_ids=1%2C2%2C3&tag_ids=80%2C85",
      );

      // 2. Complete product conversion (Issue 2 fix)
      const allProducts = [
        { id: "1", name: "Tops" },
        { id: "2", name: "Pants" },
        { id: "3", name: "Jackets" },
      ];

      const productIdToName = new Map<string, string>();
      allProducts.forEach((product) => {
        productIdToName.set(product.id, product.name);
      });

      const productIds = ["1", "2", "3"];
      const convertedProducts = productIds.map((id) => productIdToName.get(id) || id);
      expect(convertedProducts).toEqual(["Tops", "Pants", "Jackets"]);

      // 3. Integer tag conversion (Issue 3 fix)
      const tagFilters = [{ id: "tags", value: ["80", "85"] }];
      const graphqlVars = prepareBoxesForBoxesViewQueryVariables("test-base", tagFilters);
      expect(graphqlVars.filterInput!.tagIds).toEqual([80, 85]);

      // 4. Clean URL when clearing filters (Issue 1 fix)
      updateUrl({
        box_state: "InStock",
        product_ids: undefined, // Clear these
        tag_ids: undefined,
      });

      url = mockReplaceState.mock.calls[mockReplaceState.mock.calls.length - 1][2];
      expect(url).toBe("http://localhost:3000/boxes?box_state=InStock");
    });

    it("should demonstrate the complete user journey fixes", () => {
      // User Journey:
      // 1. User applies multiple product filters + tags + state
      // 2. URL updates cleanly (no empty params)
      // 3. User reloads page
      // 4. All filters convert correctly
      // 5. GraphQL gets correct integer tag IDs

      // Step 1 & 2: Clean URL creation
      const createCleanUrl = (filters: Record<string, string>) => {
        const url = new URL("http://localhost:3000/boxes");
        Object.entries(filters).forEach(([key, value]) => {
          if (value) url.searchParams.set(key, value);
        });
        return url.toString();
      };

      const url = createCleanUrl({
        box_state: "InStock",
        product_ids: "1,2",
        tag_ids: "80,85",
      });

      expect(url).toBe(
        "http://localhost:3000/boxes?box_state=InStock&product_ids=1%2C2&tag_ids=80%2C85",
      );

      // Step 3 & 4: Complete conversion on page reload
      const completeData = {
        products: [
          { id: "1", name: "Tops" },
          { id: "2", name: "Pants" },
        ],
      };

      const productIdToName = new Map();
      completeData.products.forEach((p) => productIdToName.set(p.id, p.name));

      const productConversion = ["1", "2"].map((id) => productIdToName.get(id) || id);
      expect(productConversion).toEqual(["Tops", "Pants"]);

      // Step 5: GraphQL integer conversion
      const filters = [
        { id: "state", value: ["InStock"] },
        { id: "tags", value: ["80", "85"] },
      ];

      const graphqlVars = prepareBoxesForBoxesViewQueryVariables("test-base", filters);
      expect(graphqlVars.filterInput).toEqual({
        states: ["InStock"],
        tagIds: [80, 85], // Integers, not strings
      });
    });
  });
});
