import { describe, it, expect } from "vitest";
import { prepareBoxesForBoxesViewQueryVariables, filterIdToGraphQLVariable } from "./transformers";

describe("transformers", () => {
  describe("filterIdToGraphQLVariable", () => {
    it("should map 'state' filter to 'states' GraphQL field", () => {
      expect(filterIdToGraphQLVariable("state")).toBe("states");
    });

    it("should map 'tags' filter to 'tagIds' GraphQL field", () => {
      expect(filterIdToGraphQLVariable("tags")).toBe("tagIds");
    });

    it("should return empty string for unsupported filters", () => {
      expect(filterIdToGraphQLVariable("productCategory")).toBe("");
      expect(filterIdToGraphQLVariable("product")).toBe("");
      expect(filterIdToGraphQLVariable("size")).toBe("");
      expect(filterIdToGraphQLVariable("location")).toBe("");
      expect(filterIdToGraphQLVariable("gender")).toBe("");
      expect(filterIdToGraphQLVariable("unknownFilter")).toBe("");
    });
  });

  describe("prepareBoxesForBoxesViewQueryVariables", () => {
    const baseId = "test-base-id";

    it("should handle empty filters", () => {
      const result = prepareBoxesForBoxesViewQueryVariables(baseId, []);

      expect(result).toEqual({
        baseId,
        filterInput: {},
        paginationInput: 100000,
      });
    });

    it("should handle custom pagination input", () => {
      const result = prepareBoxesForBoxesViewQueryVariables(baseId, [], 50);

      expect(result.paginationInput).toBe(50);
    });

    describe("State filters", () => {
      it("should handle single state filter", () => {
        const filters = [{ id: "state", value: ["InStock"] }];
        const result = prepareBoxesForBoxesViewQueryVariables(baseId, filters);

        expect(result.filterInput!.states).toEqual(["InStock"]);
      });

      it("should handle multiple state filters", () => {
        const filters = [{ id: "state", value: ["InStock", "Lost", "Donated"] }];
        const result = prepareBoxesForBoxesViewQueryVariables(baseId, filters);

        expect(result.filterInput!.states).toEqual(["InStock", "Lost", "Donated"]);
      });

      it("should handle state filter with non-array value", () => {
        const filters = [{ id: "state", value: "InStock" }];
        const result = prepareBoxesForBoxesViewQueryVariables(baseId, filters);

        expect(result.filterInput!.states).toEqual(["InStock"]);
      });
    });

    describe("Tag filters", () => {
      it("should handle tag filters with string IDs", () => {
        const filters = [{ id: "tags", value: ["80", "85", "90"] }];
        const result = prepareBoxesForBoxesViewQueryVariables(baseId, filters);

        expect(result.filterInput!.tagIds).toEqual([80, 85, 90]);
      });

      it("should extract IDs from tag objects", () => {
        const filters = [
          {
            id: "tags",
            value: [
              { __typename: "Tag", id: "80", name: "door" },
              { __typename: "Tag", id: "85", name: "window" },
              { id: "90", value: "roof" },
            ],
          },
        ];
        const result = prepareBoxesForBoxesViewQueryVariables(baseId, filters);

        expect(result.filterInput!.tagIds).toEqual([80, 85, 90]);
      });

      it("should handle mixed tag objects and strings", () => {
        const filters = [
          {
            id: "tags",
            value: [{ __typename: "Tag", id: "80", name: "door" }, "85", { id: "90" }],
          },
        ];
        const result = prepareBoxesForBoxesViewQueryVariables(baseId, filters);

        expect(result.filterInput!.tagIds).toEqual([80, 85, 90]);
      });

      it("should handle single tag object", () => {
        const filters = [
          {
            id: "tags",
            value: { __typename: "Tag", id: "80", name: "door" },
          },
        ];
        const result = prepareBoxesForBoxesViewQueryVariables(baseId, filters);

        expect(result.filterInput!.tagIds).toEqual([80]);
      });

      it("should filter out empty/invalid tag values", () => {
        const filters = [
          {
            id: "tags",
            value: ["80", "", null, undefined, "85", {}],
          },
        ];
        const result = prepareBoxesForBoxesViewQueryVariables(baseId, filters);

        // String conversion happens first, then filter(Boolean) removes only empty strings
        // null becomes "null", undefined becomes "undefined" - both are truthy strings
        expect(result.filterInput!.tagIds).toEqual([80, 85]);
      });
    });

    describe("Unsupported filters", () => {
      it("should ignore frontend-only filters", () => {
        const filters = [
          { id: "productCategory", value: ["Food & Kitchen"] },
          { id: "product", value: ["Tops"] },
          { id: "size", value: ["M"] },
          { id: "location", value: ["Warehouse A"] },
          { id: "gender", value: ["Men"] },
        ];
        const result = prepareBoxesForBoxesViewQueryVariables(baseId, filters);

        expect(result.filterInput).toEqual({});
      });
    });

    describe("Mixed filters", () => {
      it("should handle both supported and unsupported filters", () => {
        const filters = [
          { id: "state", value: ["InStock", "Lost"] },
          { id: "tags", value: [{ id: "80" }, { id: "85" }] },
          { id: "productCategory", value: ["Food & Kitchen"] }, // Should be ignored
          { id: "product", value: ["Tops"] }, // Should be ignored
        ];
        const result = prepareBoxesForBoxesViewQueryVariables(baseId, filters);

        expect(result.filterInput).toEqual({
          states: ["InStock", "Lost"],
          tagIds: [80, 85],
        });
      });
    });

    describe("Edge cases", () => {
      it("should handle filters with undefined values", () => {
        const filters = [
          { id: "state", value: undefined },
          { id: "tags", value: undefined },
        ];
        const result = prepareBoxesForBoxesViewQueryVariables(baseId, filters);

        expect(result.filterInput!.states).toEqual(["undefined"]);
        expect(result.filterInput!.tagIds).toEqual([]);
      });

      it("should handle filters with null values", () => {
        const filters = [
          { id: "state", value: [null] },
          { id: "tags", value: [null] },
        ];
        const result = prepareBoxesForBoxesViewQueryVariables(baseId, filters);

        expect(result.filterInput!.states).toEqual(["null"]);
        expect(result.filterInput!.tagIds).toEqual([]);
      });
    });
  });
});
