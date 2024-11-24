import { graphql } from "../../../graphql";

export const TAG_FRAGMENT = graphql(`
  fragment TagFragment on TagDimensionInfo @_unmask {
    id
    name
    color
  }
`);

export const PRODUCT_FRAGMENT = graphql(`
  fragment ProductFragment on ProductDimensionInfo @_unmask {
    id
    name
    gender
  }
`);
