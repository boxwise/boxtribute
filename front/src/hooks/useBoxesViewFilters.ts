import { useAtom } from "jotai";
import { atomWithSearchParams } from "jotai-location";
import { useMemo } from "react";
import { Filters } from "react-table";

// Define the filter structure for frontend table filtering
// Note: Frontend filtering is client-side and independent of GraphQL FilterBoxInput
export interface BoxesViewFilters {
  category_id?: string;
  product_id?: string;
  size_id?: string;
  gender_id?: string;
  location_id?: string;
  box_state?: string[];
  tag_ids?: string[];
}

// Create atoms for individual search parameters
const categoryIdAtom = atomWithSearchParams("category_id", "");
const productIdAtom = atomWithSearchParams("product_id", "");
const sizeIdAtom = atomWithSearchParams("size_id", "");
const genderIdAtom = atomWithSearchParams("gender_id", "");
const locationIdAtom = atomWithSearchParams("location_id", "");
const boxStateAtom = atomWithSearchParams("box_state", "");
const tagIdsAtom = atomWithSearchParams("tag_ids", "");

export const useBoxesViewFilters = () => {
  const [categoryId, setCategoryId] = useAtom(categoryIdAtom);
  const [productId, setProductId] = useAtom(productIdAtom);
  const [sizeId, setSizeId] = useAtom(sizeIdAtom);
  const [genderId, setGenderId] = useAtom(genderIdAtom);
  const [locationId, setLocationId] = useAtom(locationIdAtom);
  const [boxState, setBoxState] = useAtom(boxStateAtom);
  const [tagIds, setTagIds] = useAtom(tagIdsAtom);

  // Convert URL filters to react-table Filters format
  // NOTE: These contain raw IDs that need to be converted to display names in BoxesTable
  const tableFilters = useMemo((): Filters<any> => {
    const result: Filters<any> = [];

    // These filters need ID-to-name conversion in BoxesTable
    if (categoryId) {
      result.push({ id: "productCategory", value: [categoryId], needsConversion: true });
    }

    if (productId) {
      result.push({ id: "product", value: [productId], needsConversion: true });
    }

    if (sizeId) {
      result.push({ id: "size", value: [sizeId], needsConversion: true });
    }

    if (genderId) {
      result.push({ id: "gender", value: [genderId] });
    }

    if (locationId) {
      result.push({ id: "location", value: [locationId], needsConversion: true });
    }

    if (boxState) {
      const states = boxState.split(",").filter(Boolean);
      if (states.length > 0) {
        result.push({ id: "state", value: states });
      }
    }

    if (tagIds) {
      const tags = tagIds.split(",").filter(Boolean);
      if (tags.length > 0) {
        result.push({ id: "tags", value: tags });
      }
    }

    return result;
  }, [categoryId, productId, sizeId, genderId, locationId, boxState, tagIds]);

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
      case "category_id":
        updateUrlParameter("category_id", stringValue || undefined);
        setCategoryId(stringValue || "");
        break;
      case "product_id":
        updateUrlParameter("product_id", stringValue || undefined);
        setProductId(stringValue || "");
        break;
      case "size_id":
        updateUrlParameter("size_id", stringValue || undefined);
        setSizeId(stringValue || "");
        break;
      case "gender_id":
        updateUrlParameter("gender_id", stringValue || undefined);
        setGenderId(stringValue || "");
        break;
      case "location_id":
        updateUrlParameter("location_id", stringValue || undefined);
        setLocationId(stringValue || "");
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
    url.searchParams.delete("category_id");
    url.searchParams.delete("product_id");
    url.searchParams.delete("size_id");
    url.searchParams.delete("gender_id");
    url.searchParams.delete("location_id");
    url.searchParams.delete("box_state");
    url.searchParams.delete("tag_ids");
    window.history.replaceState({}, "", url.toString());

    // Then update jotai state
    setCategoryId("");
    setProductId("");
    setSizeId("");
    setGenderId("");
    setLocationId("");
    setBoxState("");
    setTagIds("");
  };

  // Clear a specific filter atomically
  const clearFilter = (key: keyof BoxesViewFilters) => {
    updateFilter(key, undefined);
  };

  // Build the filters object for external use
  const filters: BoxesViewFilters = {
    category_id: categoryId || undefined,
    product_id: productId || undefined,
    size_id: sizeId || undefined,
    gender_id: genderId || undefined,
    location_id: locationId || undefined,
    box_state: boxState ? boxState.split(",").filter(Boolean) : undefined,
    tag_ids: tagIds ? tagIds.split(",").filter(Boolean) : undefined,
  };

  return {
    filters,
    tableFilters,
    updateFilter,
    clearFilters,
    clearFilter,
  };
};
