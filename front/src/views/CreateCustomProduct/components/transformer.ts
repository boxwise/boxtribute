import { ResultOf } from "gql.tada";

import { NonNullProductGender } from "../../../../../graphql/types";
import { PRODUCTS_QUERY } from "views/Products/components/ProductsContainer";
import { EditCustomProductFormInput } from "views/EditCustomProduct/components/EditCustomProductForm";
import { CustomProductFormQueryResult } from "queries/types";

type IGendersOptions = {
  label: string;
  value: NonNullProductGender;
};

const genders: IGendersOptions[] = [
  {
    label: "-",
    value: "none",
  },
  {
    label: "Men",
    value: "Men",
  },
  {
    label: "Women",
    value: "Women",
  },
  {
    label: "Unisex Adult",
    value: "UnisexAdult",
  },
  {
    label: "Unisex Kid",
    value: "UnisexKid",
  },
  {
    label: "Unisex Baby",
    value: "UnisexBaby",
  },
  {
    label: "Girl",
    value: "Girl",
  },
  {
    label: "Boy",
    value: "Boy",
  },
  {
    label: "Teen Girl",
    value: "TeenGirl",
  },
  {
    label: "Teen Boy",
    value: "TeenBoy",
  },
  {
    label: "Baby Girl",
    value: "BabyGirl",
  },
  {
    label: "Baby Boy",
    value: "BabyBoy",
  },
];

export const customProductRawToFormOptionsTransformer = (
  customProductRawOptions: CustomProductFormQueryResult,
) => {
  return {
    categoryOptions: customProductRawOptions.productCategories.map((category) => ({
      label: category.name,
      value: category.id,
    })),
    sizeRangeOptions: customProductRawOptions.sizeRanges.map((sizeRange) => ({
      label: sizeRange.label,
      value: sizeRange.id,
    })),
    genderOptions: genders,
  };
};

export const findDefaultValues = (
  customProductData: ResultOf<typeof PRODUCTS_QUERY>,
  customProductId?: string,
) => {
  if (!customProductId) return undefined;

  const defaultValues = customProductData.products.elements.find(
    (customProduct) => customProduct.id === customProductId,
  );

  if (!defaultValues) throw new Error("Custom product not found!");

  return {
    name: defaultValues.name,
    category: { value: defaultValues.category.id, label: defaultValues.category.name },
    gender: { value: defaultValues.gender || "none", label: defaultValues.gender || "-" },
    sizeRange: { value: defaultValues.sizeRange.id, label: defaultValues.sizeRange.label },
    comment: defaultValues.comment || "",
    inShop: defaultValues.inShop,
    price: defaultValues.price || 0,
  } satisfies EditCustomProductFormInput;
};
