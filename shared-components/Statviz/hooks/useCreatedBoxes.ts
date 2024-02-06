import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import useTimerange from "./useTimerange";
import { gql } from "../../types/generated";

const CREATED_BOXES_QUERY = gql(`
  query createdBoxes($baseId: Int!) {
    createdBoxes(baseId: $baseId) {
      facts {
        boxesCount
        productId
        categoryId
        createdOn
        gender
        itemsCount
      }
      dimensions {
        product {
          id
          name
        }
        category {
          id
          name
        }
      }
    }
  }
`);

export default function useCreatedBoxes() {
  const { baseId } = useParams();
  const { data, loading, error } = useQuery(CREATED_BOXES_QUERY, {
    variables: { baseId: parseInt(baseId ?? "", 10) },
  });

  const { timerange, interval } = useTimerange();

  return {
    data,
    loading,
    error,
    baseId,
    timerange,
    interval,
  };
}
