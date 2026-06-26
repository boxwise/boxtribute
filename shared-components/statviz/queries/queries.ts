import { graphql } from "../../../graphql/graphql";
import { TAG_FRAGMENT } from "./fragments";

export const CREATED_BOXES_QUERY = graphql(`
  query createdBoxes($baseId: Int!) {
    createdBoxes(baseId: $baseId) {
      facts {
        boxesCount
        productId
        categoryId
        createdOn
        tagIds
        gender
        itemsCount
      }
      dimensions {
        product {
          id
          name
          gender
        }
        category {
          id
          name
        }
        tag {
          id
          name
          color
        }
      }
    }
  }
`);

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
