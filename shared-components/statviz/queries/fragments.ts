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

export const STOCK_OVERVIEW_FRAGMENT = graphql(`
  fragment StockOverviewFragment on StockOverviewResult @_unmask {
    categoryId
    boxesCount
    productName
    gender
    sizeId
    dimensionId
    absoluteMeasureValue
    tagIds
    locationId
    boxState
    itemsCount
  }
`);

export const MOVED_BOXES_FRAGMENT = graphql(`
  fragment MoveBoxesFragment on MovedBoxesResult @_unmask {
    movedOn
    targetId
    categoryId
    boxesCount
    itemsCount
    gender
    productName
    tagIds
    organisationName
  }
`);

export const BENEFICIARY_DEMOGRAPHICS_FRAGMENT = graphql(`
  fragment MoveBoxesFragment on BeneficiaryDemographicsResult @_unmask {
    count
    createdOn
    age
    gender
    tagIds
  }
`);

export const TARGET_DIMENSION_INFO_FRAGMENT = graphql(`
  fragment TargetDimensionInfo on TargetDimensionInfo @_unmask {
    id
    name
    type
  }
`);