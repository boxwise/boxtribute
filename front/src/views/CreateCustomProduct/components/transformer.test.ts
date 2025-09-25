import { describe, it, expect } from "vitest";
import { customProductRawToFormOptionsTransformer } from "./transformer";
import { CustomProductFormQueryResult } from "queries/types";

describe("customProductRawToFormOptionsTransformer", () => {
  it("should exclude size ranges with IDs 28 and 29 from sizeRangeOptions", () => {
    const mockCustomProductRawOptions: CustomProductFormQueryResult = {
      productCategories: [
        { id: "1", name: "Clothing" },
        { id: "2", name: "Shoes" },
      ],
      sizeRanges: [
        { id: "1", label: "S,M,L" },
        { id: "27", label: "Adult Clothing" },
        { id: "28", label: "Mass/Volume Range 1" }, // Should be excluded
        { id: "29", label: "Mass/Volume Range 2" }, // Should be excluded
        { id: "30", label: "Children Sizes" },
      ],
    };

    const result = customProductRawToFormOptionsTransformer(mockCustomProductRawOptions);

    expect(result.sizeRangeOptions).toHaveLength(3);
    expect(result.sizeRangeOptions).toEqual([
      { label: "S,M,L", value: "1" },
      { label: "Adult Clothing", value: "27" },
      { label: "Children Sizes", value: "30" },
    ]);

    // Verify that IDs 28 and 29 are not present
    const includedIds = result.sizeRangeOptions.map((option) => option.value);
    expect(includedIds).not.toContain("28");
    expect(includedIds).not.toContain("29");
  });

  it("should include all size ranges when IDs 28 and 29 are not present", () => {
    const mockCustomProductRawOptions: CustomProductFormQueryResult = {
      productCategories: [{ id: "1", name: "Clothing" }],
      sizeRanges: [
        { id: "1", label: "S,M,L" },
        { id: "2", label: "XS,XL" },
        { id: "30", label: "Children Sizes" },
      ],
    };

    const result = customProductRawToFormOptionsTransformer(mockCustomProductRawOptions);

    expect(result.sizeRangeOptions).toHaveLength(3);
    expect(result.sizeRangeOptions).toEqual([
      { label: "S,M,L", value: "1" },
      { label: "XS,XL", value: "2" },
      { label: "Children Sizes", value: "30" },
    ]);
  });

  it("should still transform category and gender options correctly", () => {
    const mockCustomProductRawOptions: CustomProductFormQueryResult = {
      productCategories: [
        { id: "1", name: "Clothing" },
        { id: "2", name: "Shoes" },
      ],
      sizeRanges: [
        { id: "28", label: "Mass Range" }, // Should be excluded
      ],
    };

    const result = customProductRawToFormOptionsTransformer(mockCustomProductRawOptions);

    expect(result.categoryOptions).toEqual([
      { label: "Clothing", value: "1" },
      { label: "Shoes", value: "2" },
    ]);

    expect(result.genderOptions).toBeDefined();
    expect(result.genderOptions.length).toBeGreaterThan(0);
    expect(result.sizeRangeOptions).toHaveLength(0);
  });
});
