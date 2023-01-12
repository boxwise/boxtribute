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
  name: "Snow trousers",
  gender: ProductGender.Boy,
  __typename: "Product",
};

export const product3 = {
  id: "3",
  name: "Long Sleeves",
  gender: ProductGender.None,
  category: {
    name: "Tops",
    __typename: "ProductCategory",
  },
  sizeRange: sizeRange2,
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
