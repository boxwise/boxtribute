import { describe, it, expect } from "vitest";
import { filterByTags } from "./filterByTags";
import { ITagFilterValue } from "../state/tagFilterDashboard";

describe("filterByTags", () => {
  const mockData = [
    { id: 1, name: "Item 1", tagIds: [1, 2] },
    { id: 2, name: "Item 2", tagIds: [2, 3] },
    { id: 3, name: "Item 3", tagIds: [3, 4] },
    { id: 4, name: "Item 4", tagIds: [1] },
    { id: 5, name: "Item 5", tagIds: [] },
    { id: 6, name: "Item 6", tagIds: null },
  ];

  const tag1: ITagFilterValue = {
    id: 1,
    label: "Tag 1",
    value: "1",
    urlId: "1",
    color: "#ff0000",
  };

  const tag2: ITagFilterValue = {
    id: 2,
    label: "Tag 2",
    value: "2",
    urlId: "2",
    color: "#00ff00",
  };

  const tag3: ITagFilterValue = {
    id: 3,
    label: "Tag 3",
    value: "3",
    urlId: "3",
    color: "#0000ff",
  };

  it("returns all data when no filters are applied", () => {
    const result = filterByTags(mockData, [], [], (item) => item.tagIds);
    expect(result).toEqual(mockData);
  });

  it("filters by included tags", () => {
    const result = filterByTags(mockData, [tag1], [], (item) => item.tagIds);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual([1, 4]);
  });

  it("filters by multiple included tags (OR logic)", () => {
    const result = filterByTags(mockData, [tag1, tag2], [], (item) => item.tagIds);
    expect(result).toHaveLength(3);
    expect(result.map((r) => r.id)).toEqual([1, 2, 4]);
  });

  it("filters by excluded tags", () => {
    const result = filterByTags(mockData, [], [tag1], (item) => item.tagIds);
    expect(result).toHaveLength(4);
    expect(result.map((r) => r.id)).toEqual([2, 3, 5, 6]);
  });

  it("filters by multiple excluded tags", () => {
    const result = filterByTags(mockData, [], [tag1, tag3], (item) => item.tagIds);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual([5, 6]);
  });

  it("filters by both included and excluded tags", () => {
    // Include items with tag2, but exclude items with tag3
    const result = filterByTags(mockData, [tag2], [tag3], (item) => item.tagIds);
    expect(result).toHaveLength(1);
    expect(result.map((r) => r.id)).toEqual([1]);
  });

  it("handles null tagIds", () => {
    const result = filterByTags(mockData, [tag1], [], (item) => item.tagIds);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual([1, 4]);
  });

  it("handles undefined tagIds", () => {
    const dataWithUndefined = [{ id: 1, name: "Item", tagIds: undefined }];
    const result = filterByTags(dataWithUndefined, [tag1], [], (item) => item.tagIds);
    expect(result).toHaveLength(0);
  });

  it("handles empty tagIds array", () => {
    const result = filterByTags(mockData, [tag1], [], (item) => item.tagIds);
    // Items with empty tagIds should not match any included filter
    const emptyTagItems = result.filter((r) => r.tagIds?.length === 0);
    expect(emptyTagItems).toHaveLength(0);
  });
});
