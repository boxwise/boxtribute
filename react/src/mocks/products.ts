import { ProductGender } from "types/generated/graphql";
import { sizeRange1, sizeRange2 } from "./sizeRanges";

export const product1 = {
  id: "1",
  name: "Long Sleeves",
  gender: ProductGender.Women,
  category: {
    name: "Tops",
    __typename: "ProductCategory",
  },
  sizeRange: sizeRange1,
  __typename: "Product",
};

export const productBasic1 = {
  id: "1",
  gender: "Boy",
  name: "Snow trousers",
  __typename: "Product",
};

export const products = [
  product1,
  {
    id: "2",
    name: "Winter Jackets",
    gender: ProductGender.Men,
    category: {
      name: "Jackets / Outerwear",
      __typename: "ProductCategory",
    },
    sizeRange: sizeRange2,
    __typename: "Product",
  },
];
