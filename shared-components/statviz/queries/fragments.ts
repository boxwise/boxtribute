import { graphql } from "../../../graphql/graphql";

export const TAG_FRAGMENT = graphql(`
  fragment TagFragment on TagDimensionInfo @_unmask {
    id
    name
    color
  }
`);

export const TARGET_DIMENSION_INFO_FRAGMENT = graphql(`
  fragment TargetDimensionInfo on TargetDimensionInfo @_unmask {
    id
    name
    type
  }
`);

export const TAG_DIMENSION_INFO_FRAGMENT = graphql(`
  fragment TagDimensionInfo on TagDimensionInfo @_unmask {
    id
    name
    color
  }
`);