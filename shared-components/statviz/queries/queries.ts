import { graphql } from "../../../graphql/graphql";
import { TAG_FRAGMENT } from "./fragments";

export const STOCK_QUERY = graphql(
  `
    query stockOverview($baseId: Int!) {
      stockOverview(baseId: $baseId) {
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
            ...TagFragment
          }
          location {
            id
            name
          }
        }
      }
    }
  `,
  [TAG_FRAGMENT],
);
