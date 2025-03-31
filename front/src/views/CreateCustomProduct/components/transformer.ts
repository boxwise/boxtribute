import { ICustomProductFormQueryResult } from "../CreateCustomProductView";

type IGendersOptions = {
  label: string;
  value:
    | "Men"
    | "Women"
    | "UnisexAdult"
    | "UnisexKid"
    | "UnisexBaby"
    | "TeenGirl"
    | "TeenBoy"
    | "Girl"
    | "Boy"
    | "none";
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
];

export const customProductRawToFormOptionsTransformer = (
  customProductRawOptions: ICustomProductFormQueryResult,
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
