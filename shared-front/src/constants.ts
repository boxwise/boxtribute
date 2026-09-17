import { gql } from "@apollo/client";

export const RESOLVE_LINK = gql(`
  query resolveLink($code: String!) {
    resolveLink(code: $code) {
      ... on ResolvedLink {
        view
        urlParameters
        baseName
        organisationName
        data {
          ... on StockOverviewData {
            facts {
              productName
              categoryId
              gender
              boxesCount
              itemsCount
              sizeId
              tagIds
              boxState
              locationId
            }
            dimensions {
              category {
                id
                name
              }
              size {
                id
                name
              }
              tag {
                id
                name
                color
              }
              location {
                id
                name
              }
            }
          }
        }
      }
    }
  }
`);
