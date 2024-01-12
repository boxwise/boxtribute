import { gql, useQuery } from "@apollo/client";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { CreatedBoxesData, QueryCreatedBoxesArgs } from "../../types/generated/graphql";
import useTimerange from "./useTimerange";
import { filterListByInterval } from "../utils/helpers";

const CREATED_BOXES_QUERY = gql`
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
`;

export default function useCreatedBoxes() {
  const { baseId } = useParams();
  const { data, loading, error } = useQuery<CreatedBoxesData, QueryCreatedBoxesArgs>(
    CREATED_BOXES_QUERY,
    { variables: { baseId: parseInt(baseId, 10) } },
  );

  const { timerange, interval } = useTimerange();

  return {
    createdBoxes: useMemo(() => {
      if (!data) return [];

      try {
        return filterListByInterval(data.facts, "createdOn", interval);
      } catch (e) {
        // TODO show toast with error message?

        return [];
      }
    }, [data, interval]),
    data,
    loading,
    error,
    baseId,
    timerange,
    interval,
  };
}
