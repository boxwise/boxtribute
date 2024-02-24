import { gql } from "../../types/generated";

export const TAG_FRAGMENT = gql(`
  fragment TagFragment on TagDimensionInfo {
    id
    name
    color
  }
`);

export const PRODUCT_FRAGMENT = gql(`
  fragment ProductFragment on ProductDimensionInfo {
    id
    name
    gender
  }
`);
