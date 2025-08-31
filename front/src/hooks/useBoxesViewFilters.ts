import { useAtom } from "jotai";
import { atomWithSearchParams } from "jotai-location";
import { useMemo } from "react";
import { Filters } from "react-table";

// Define the filter structure based on the GraphQL FilterBoxInput
export interface BoxesViewFilters {
  location_id?: string;
  category_id?: string;
  product_id?: string;
  size_id?: string;
  gender_id?: string;
  box_state?: string[];
  tag_ids?: string[];
}

// Create atoms for individual search parameters
const locationIdAtom = atomWithSearchParams("location_id", "");
const categoryIdAtom = atomWithSearchParams("category_id", "");
const productIdAtom = atomWithSearchParams("product_id", "");
const sizeIdAtom = atomWithSearchParams("size_id", "");
const genderIdAtom = atomWithSearchParams("gender_id", "");
const boxStateAtom = atomWithSearchParams("box_state", "");
const tagIdsAtom = atomWithSearchParams("tag_ids", "");

export const useBoxesViewFilters = () => {
  const [locationId, setLocationId] = useAtom(locationIdAtom);
  const [categoryId, setCategoryId] = useAtom(categoryIdAtom);
  const [productId, setProductId] = useAtom(productIdAtom);
  const [sizeId, setSizeId] = useAtom(sizeIdAtom);
  const [genderId, setGenderId] = useAtom(genderIdAtom);
  const [boxState, setBoxState] = useAtom(boxStateAtom);
  const [tagIds, setTagIds] = useAtom(tagIdsAtom);

  // Convert URL filters to react-table Filters format
  const tableFilters = useMemo((): Filters<any> => {
    const result: Filters<any> = [];

    if (locationId) {
      result.push({ id: "location", value: [locationId] });
    }

    if (categoryId) {
      result.push({ id: "productCategory", value: [categoryId] });
    }

    if (productId) {
      result.push({ id: "product", value: [productId] });
    }

    if (sizeId) {
      result.push({ id: "size", value: [sizeId] });
    }

    if (genderId) {
      result.push({ id: "gender", value: [genderId] });
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
  }, [locationId, categoryId, productId, sizeId, genderId, boxState, tagIds]);

  // Update a specific filter
  const updateFilter = (key: keyof BoxesViewFilters, value: string | string[] | undefined) => {
    switch (key) {
      case "location_id":
        setLocationId((value as string) || "");
        break;
      case "category_id":
        setCategoryId((value as string) || "");
        break;
      case "product_id":
        setProductId((value as string) || "");
        break;
      case "size_id":
        setSizeId((value as string) || "");
        break;
      case "gender_id":
        setGenderId((value as string) || "");
        break;
      case "box_state":
        setBoxState(Array.isArray(value) ? value.join(",") : (value as string) || "");
        break;
      case "tag_ids":
        setTagIds(Array.isArray(value) ? value.join(",") : (value as string) || "");
        break;
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setLocationId("");
    setCategoryId("");
    setProductId("");
    setSizeId("");
    setGenderId("");
    setBoxState("");
    setTagIds("");
  };

  // Clear a specific filter
  const clearFilter = (key: keyof BoxesViewFilters) => {
    switch (key) {
      case "location_id":
        setLocationId("");
        break;
      case "category_id":
        setCategoryId("");
        break;
      case "product_id":
        setProductId("");
        break;
      case "size_id":
        setSizeId("");
        break;
      case "gender_id":
        setGenderId("");
        break;
      case "box_state":
        setBoxState("");
        break;
      case "tag_ids":
        setTagIds("");
        break;
    }
  };

  // Build the filters object for external use
  const filters: BoxesViewFilters = {
    location_id: locationId || undefined,
    category_id: categoryId || undefined,
    product_id: productId || undefined,
    size_id: sizeId || undefined,
    gender_id: genderId || undefined,
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
