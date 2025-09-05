import { describe, it, expect } from "vitest";

/**
 * Test for the multiple product filters issue:
 * "apply multiple product filters; then reload the page. Only the first product filter from the URL is applied, instead of all"
 */
describe("Multiple Product Filters Issue", () => {
  describe("ID-to-name mapping with complete product data", () => {
    it("should convert multiple product IDs when all products are available", () => {
      // Mock complete product data (like what we get from ACTION_OPTIONS_FOR_BOXESVIEW_QUERY)
      const allProducts = [
        { id: "1", name: "Tops", category: { id: "11", name: "Clothing" } },
        { id: "2", name: "Pants", category: { id: "11", name: "Clothing" } },
        { id: "3", name: "Jackets", category: { id: "12", name: "Outerwear" } },
      ];

      // Build the mapping (same logic as in BoxesTable)
      const productIdToName = new Map<string, string>();
      allProducts.forEach((product) => {
        productIdToName.set(product.id, product.name);
      });

      // Simulate URL filter: ?product_ids=1,2
      const urlFilter = {
        id: "product",
        value: ["1", "2"],
        needsConversion: true,
      };

      // Convert IDs to names
      const convertedValues = urlFilter.value.map((id: string) => {
        return productIdToName.get(id) || id;
      });

      // Should convert both IDs to names
      expect(convertedValues).toEqual(["Tops", "Pants"]);
      expect(convertedValues).not.toEqual(["Tops", "2"]); // This was the bug - only first converted
    });

    it("should handle the case when some products are not in the mapping", () => {
      // Limited product data (like what we used to get from filtered results only)
      const limitedProducts = [
        { id: "1", name: "Tops", category: { id: "11", name: "Clothing" } },
        // Missing product ID "2" - this was the problem
      ];

      // Build limited mapping
      const productIdToName = new Map<string, string>();
      limitedProducts.forEach((product) => {
        productIdToName.set(product.id, product.name);
      });

      // Simulate URL filter: ?product_ids=1,2
      const urlFilter = {
        id: "product",
        value: ["1", "2"],
        needsConversion: true,
      };

      // Convert IDs to names
      const convertedValues = urlFilter.value.map((id: string) => {
        return productIdToName.get(id) || id; // Fallback to ID if not found
      });

      // With limited data, only first product converts
      expect(convertedValues).toEqual(["Tops", "2"]); // This was the bug scenario
    });

    it("should demonstrate the fix: complete data enables full conversion", () => {
      // Complete product data from ACTION_OPTIONS_FOR_BOXESVIEW_QUERY
      const completeProducts = [
        { id: "1", name: "Tops", category: { id: "11", name: "Clothing" } },
        { id: "2", name: "Pants", category: { id: "11", name: "Clothing" } },
        { id: "3", name: "Jackets", category: { id: "12", name: "Outerwear" } },
      ];

      // Build complete mapping
      const productIdToName = new Map<string, string>();
      completeProducts.forEach((product) => {
        productIdToName.set(product.id, product.name);
      });

      // Test multiple scenarios
      const testCases = [
        { input: ["1"], expected: ["Tops"] },
        { input: ["1", "2"], expected: ["Tops", "Pants"] },
        { input: ["2", "3"], expected: ["Pants", "Jackets"] },
        { input: ["1", "2", "3"], expected: ["Tops", "Pants", "Jackets"] },
      ];

      testCases.forEach(({ input, expected }) => {
        const convertedValues = input.map((id: string) => {
          return productIdToName.get(id) || id;
        });
        expect(convertedValues).toEqual(expected);
      });
    });
  });

  describe("Category mapping works the same way", () => {
    it("should convert multiple category IDs correctly", () => {
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
      const convertedValues = ["11", "13"].map((id: string) => {
        return categoryIdToName.get(id) || id;
      });

      expect(convertedValues).toEqual(["Clothing", "Food & Kitchen"]);
    });
  });

  describe("Integration: Complete mapping prevents timing issues", () => {
    it("should work regardless of what boxes are currently visible", () => {
      // This test simulates the real scenario:
      // 1. User applies filters for products 1,2,3
      // 2. URL becomes ?product_ids=1,2,3
      // 3. On page reload, GraphQL might only return boxes with product 1 (due to other filters)
      // 4. With our fix, we still have ALL products from ACTION_OPTIONS query
      // 5. So all three product IDs convert correctly

      // Complete products (from ACTION_OPTIONS_FOR_BOXESVIEW_QUERY)
      const allProducts = [
        { id: "1", name: "Tops" },
        { id: "2", name: "Pants" },
        { id: "3", name: "Jackets" },
      ];

      // Filtered boxes result (might only contain one product type)
      const filteredBoxes = [
        { product: { id: "1", name: "Tops" } }, // Only Tops boxes visible
        // No Pants or Jackets boxes in current result
      ];

      // OLD WAY: Build mapping from filtered results only
      const oldProductIdToName = new Map<string, string>();
      filteredBoxes.forEach((box) => {
        if (box.product) {
          oldProductIdToName.set(box.product.id, box.product.name);
        }
      });

      // NEW WAY: Build mapping from complete product list
      const newProductIdToName = new Map<string, string>();
      allProducts.forEach((product) => {
        newProductIdToName.set(product.id, product.name);
      });

      // URL filter: ?product_ids=1,2,3
      const urlProductIds = ["1", "2", "3"];

      // OLD WAY results (partial conversion)
      const oldConversion = urlProductIds.map((id) => oldProductIdToName.get(id) || id);
      expect(oldConversion).toEqual(["Tops", "2", "3"]); // Only first converted

      // NEW WAY results (complete conversion)
      const newConversion = urlProductIds.map((id) => newProductIdToName.get(id) || id);
      expect(newConversion).toEqual(["Tops", "Pants", "Jackets"]); // All converted!
    });
  });
});
