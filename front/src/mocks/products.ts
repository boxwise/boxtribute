import { sizeRange1, sizeRange2 } from "./sizeRanges";

export const product1 = {
  id: "1",
  name: "Long Sleeves",
  gender: "Women",
  type: "Custom",
  category: {
    id: "1",
    name: "Tops",
    __typename: "ProductCategory",
  },
  sizeRange: sizeRange1,
  instockItemsCount: 5,
  transferItemsCount: 1,
  deletedOn: null,
  __typename: "Product",
};

export const productBasic1 = {
  id: "1",
  name: "Snow trousers",
  category: {
    id: "2",
    name: "Bottoms",
    __typename: "ProductCategory",
  },
  gender: "Boy",
  type: "Custom",
  sizeRange: sizeRange1,
  deletedOn: null,
  instockItemsCount: 5,
  transferItemsCount: 1,
  __typename: "Product",
};

export const product3 = {
  id: "3",
  name: "Long Sleeves",
  gender: "None",
  type: "Custom",
  category: {
    id: "1",
    name: "Tops",
    __typename: "ProductCategory",
  },
  sizeRange: sizeRange2,
  instockItemsCount: 5,
  transferItemsCount: 1,
  deletedOn: null,
  __typename: "Product",
};

export const products = [
  product1,
  {
    id: "2",
    name: "Winter Jackets",
    gender: "Men",
    type: "Custom",
    category: {
      id: "3",
      name: "Jackets / Outerwear",
      __typename: "ProductCategory",
    },
    sizeRange: sizeRange2,
    instockItemsCount: 5,
    transferItemsCount: 1,
    deletedOn: null,
    __typename: "Product",
  },
];
