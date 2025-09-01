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
  const tableFilters = useMemo((): Filters<any> => {
    const result: Filters<any> = [];

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

    if (locationId) {
      result.push({ id: "location", value: [locationId] });
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

  // Helper to remove URL parameter completely
  const removeUrlParameter = (paramName: string) => {
    const url = new URL(window.location.href);
    url.searchParams.delete(paramName);
    window.history.replaceState({}, "", url.toString());
  };

  // Update a specific filter
  const updateFilter = (key: keyof BoxesViewFilters, value: string | string[] | undefined) => {
    const stringValue =
      Array.isArray(value) && value.length > 0 ? value.join(",") : (value as string);

    switch (key) {
      case "category_id":
        if (stringValue) {
          setCategoryId(stringValue);
        } else {
          setCategoryId("");
          removeUrlParameter("category_id");
        }
        break;
      case "product_id":
        if (stringValue) {
          setProductId(stringValue);
        } else {
          setProductId("");
          removeUrlParameter("product_id");
        }
        break;
      case "size_id":
        if (stringValue) {
          setSizeId(stringValue);
        } else {
          setSizeId("");
          removeUrlParameter("size_id");
        }
        break;
      case "gender_id":
        if (stringValue) {
          setGenderId(stringValue);
        } else {
          setGenderId("");
          removeUrlParameter("gender_id");
        }
        break;
      case "location_id":
        if (stringValue) {
          setLocationId(stringValue);
        } else {
          setLocationId("");
          removeUrlParameter("location_id");
        }
        break;
      case "box_state":
        if (stringValue) {
          setBoxState(stringValue);
        } else {
          setBoxState("");
          removeUrlParameter("box_state");
        }
        break;
      case "tag_ids":
        if (stringValue) {
          setTagIds(stringValue);
        } else {
          setTagIds("");
          removeUrlParameter("tag_ids");
        }
        break;
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setCategoryId("");
    setProductId("");
    setSizeId("");
    setGenderId("");
    setLocationId("");
    setBoxState("");
    setTagIds("");

    // Remove all filter parameters from URL
    removeUrlParameter("category_id");
    removeUrlParameter("product_id");
    removeUrlParameter("size_id");
    removeUrlParameter("gender_id");
    removeUrlParameter("location_id");
    removeUrlParameter("box_state");
    removeUrlParameter("tag_ids");
  };

  // Clear a specific filter
  const clearFilter = (key: keyof BoxesViewFilters) => {
    switch (key) {
      case "category_id":
        setCategoryId("");
        removeUrlParameter("category_id");
        break;
      case "product_id":
        setProductId("");
        removeUrlParameter("product_id");
        break;
      case "size_id":
        setSizeId("");
        removeUrlParameter("size_id");
        break;
      case "gender_id":
        setGenderId("");
        removeUrlParameter("gender_id");
        break;
      case "location_id":
        setLocationId("");
        removeUrlParameter("location_id");
        break;
      case "box_state":
        setBoxState("");
        removeUrlParameter("box_state");
        break;
      case "tag_ids":
        setTagIds("");
        removeUrlParameter("tag_ids");
        break;
    }
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
