import { useAtom } from "jotai";
import { atomWithSearchParams } from "jotai-location";
import { useMemo } from "react";

// Extend Filters type to include needsConversion flag
type ExtendedFilter = {
  id: string;
  value: any;
  needsConversion?: boolean;
};

// Define the filter structure for frontend table filtering
// Note: Frontend filtering is client-side and independent of GraphQL FilterBoxInput
export interface BoxesViewFilters {
  category_ids?: string[];
  product_ids?: string[];
  size_ids?: string[];
  gender_ids?: string[];
  location_ids?: string[];
  box_state?: string[];
  tag_ids?: string[];
}

// Create atoms for individual search parameters (using plural names)
const categoryIdsAtom = atomWithSearchParams("category_ids", "");
const productIdsAtom = atomWithSearchParams("product_ids", "");
const sizeIdsAtom = atomWithSearchParams("size_ids", "");
const genderIdsAtom = atomWithSearchParams("gender_ids", "");
const locationIdsAtom = atomWithSearchParams("location_ids", "");
const boxStateAtom = atomWithSearchParams("box_state", "");
const tagIdsAtom = atomWithSearchParams("tag_ids", "");

export const useBoxesViewFilters = () => {
  const [categoryIds, setCategoryIds] = useAtom(categoryIdsAtom);
  const [productIds, setProductIds] = useAtom(productIdsAtom);
  const [sizeIds, setSizeIds] = useAtom(sizeIdsAtom);
  const [genderIds, setGenderIds] = useAtom(genderIdsAtom);
  const [locationIds, setLocationIds] = useAtom(locationIdsAtom);
  const [boxState, setBoxState] = useAtom(boxStateAtom);
  const [tagIds, setTagIds] = useAtom(tagIdsAtom);

  // Convert URL filters to react-table Filters format
  // NOTE: These contain raw IDs that need to be converted to display names in BoxesTable
  const tableFilters = useMemo((): ExtendedFilter[] => {
    const result: ExtendedFilter[] = [];

    // Helper to decode and split URL parameters (handles %2C encoded commas)
    const decodeAndSplit = (value: string): string[] => {
      // First decode the URL encoding (converts %2C back to ,)
      const decoded = decodeURIComponent(value);
      return decoded.split(",").filter(Boolean);
    };

    // These filters need ID-to-name conversion in BoxesTable
    if (categoryIds) {
      const categories = decodeAndSplit(categoryIds);
      if (categories.length > 0) {
        result.push({ id: "productCategory", value: categories, needsConversion: true });
      }
    }

    if (productIds) {
      const products = decodeAndSplit(productIds);
      if (products.length > 0) {
        result.push({ id: "product", value: products, needsConversion: true });
      }
    }

    if (sizeIds) {
      const sizes = decodeAndSplit(sizeIds);
      if (sizes.length > 0) {
        result.push({ id: "size", value: sizes, needsConversion: true });
      }
    }

    if (genderIds) {
      const genders = decodeAndSplit(genderIds);
      if (genders.length > 0) {
        result.push({ id: "gender", value: genders });
      }
    }

    if (locationIds) {
      const locations = decodeAndSplit(locationIds);
      if (locations.length > 0) {
        result.push({ id: "location", value: locations, needsConversion: true });
      }
    }

    if (boxState) {
      const states = decodeAndSplit(boxState);
      if (states.length > 0) {
        result.push({ id: "state", value: states });
      }
    }

    if (tagIds) {
      const tags = decodeAndSplit(tagIds);
      if (tags.length > 0) {
        result.push({ id: "tags", value: tags });
      }
    }

    return result;
  }, [categoryIds, productIds, sizeIds, genderIds, locationIds, boxState, tagIds]);

  // Helper to update URL parameter atomically (set or remove in single operation)
  const updateUrlParameter = (paramName: string, value: string | undefined) => {
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set(paramName, value);
    } else {
      url.searchParams.delete(paramName);
    }
    window.history.replaceState({}, "", url.toString());
  };

  // Update a specific filter
  const updateFilter = (key: keyof BoxesViewFilters, value: string | string[] | undefined) => {
    const stringValue =
      Array.isArray(value) && value.length > 0 ? value.join(",") : (value as string);

    // Use atomic URL updates to avoid flickering
    switch (key) {
      case "category_ids":
        updateUrlParameter("category_ids", stringValue || undefined);
        setCategoryIds(stringValue || "");
        break;
      case "product_ids":
        updateUrlParameter("product_ids", stringValue || undefined);
        setProductIds(stringValue || "");
        break;
      case "size_ids":
        updateUrlParameter("size_ids", stringValue || undefined);
        setSizeIds(stringValue || "");
        break;
      case "gender_ids":
        updateUrlParameter("gender_ids", stringValue || undefined);
        setGenderIds(stringValue || "");
        break;
      case "location_ids":
        updateUrlParameter("location_ids", stringValue || undefined);
        setLocationIds(stringValue || "");
        break;
      case "box_state":
        updateUrlParameter("box_state", stringValue || undefined);
        setBoxState(stringValue || "");
        break;
      case "tag_ids":
        updateUrlParameter("tag_ids", stringValue || undefined);
        setTagIds(stringValue || "");
        break;
    }
  };

  // Clear all filters atomically
  const clearFilters = () => {
    // Update URL first to remove all parameters at once
    const url = new URL(window.location.href);
    url.searchParams.delete("category_ids");
    url.searchParams.delete("product_ids");
    url.searchParams.delete("size_ids");
    url.searchParams.delete("gender_ids");
    url.searchParams.delete("location_ids");
    url.searchParams.delete("box_state");
    url.searchParams.delete("tag_ids");
    window.history.replaceState({}, "", url.toString());

    // Then update jotai state
    setCategoryIds("");
    setProductIds("");
    setSizeIds("");
    setGenderIds("");
    setLocationIds("");
    setBoxState("");
    setTagIds("");
  };

  // Clear a specific filter atomically
  const clearFilter = (key: keyof BoxesViewFilters) => {
    updateFilter(key, undefined);
  };

  // Helper to decode and split URL parameters (handles %2C encoded commas)
  const decodeAndSplitParam = (value: string | undefined): string[] | undefined => {
    if (!value) return undefined;
    const decoded = decodeURIComponent(value);
    const split = decoded.split(",").filter(Boolean);
    return split.length > 0 ? split : undefined;
  };

  // Build the filters object for external use
  const filters: BoxesViewFilters = {
    category_ids: decodeAndSplitParam(categoryIds),
    product_ids: decodeAndSplitParam(productIds),
    size_ids: decodeAndSplitParam(sizeIds),
    gender_ids: decodeAndSplitParam(genderIds),
    location_ids: decodeAndSplitParam(locationIds),
    box_state: decodeAndSplitParam(boxState),
    tag_ids: decodeAndSplitParam(tagIds),
  };

  return {
    filters,
    tableFilters,
    updateFilter,
    clearFilters,
    clearFilter,
  } as {
    filters: BoxesViewFilters;
    tableFilters: ExtendedFilter[];
    updateFilter: (key: keyof BoxesViewFilters, value: string | string[] | undefined) => void;
    clearFilters: () => void;
    clearFilter: (key: keyof BoxesViewFilters) => void;
  };
};
