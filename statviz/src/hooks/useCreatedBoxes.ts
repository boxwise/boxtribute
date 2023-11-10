import { gql, useQuery } from "@apollo/client";
import {
  CreatedBoxesData,
  CreatedBoxesResult,
  QueryCreatedBoxesArgs,
} from "../types/generated/graphql";
import { useMemo } from "react";
import { createdBoxesTable } from "../utils/table";
import { useParams } from "react-router-dom";
import useTimerange from "./useTimerange";

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
  const { data, loading, error } = useQuery<
    CreatedBoxesData,
    QueryCreatedBoxesArgs
  >(CREATED_BOXES_QUERY, { variables: { baseId: parseInt(baseId) } });

  const { timerange, interval } = useTimerange();

  return {
    createdBoxes: useMemo(() => {
      if (!data) return createdBoxesTable([]);

      const boxesFacts = createdBoxesTable(
        data.createdBoxes.facts as CreatedBoxesResult[]
      );

      try {
        const filteredByTime = boxesFacts.filterCreatedOn(interval);
        return createdBoxesTable(filteredByTime.data);
      } catch (e) {
        console.log("invalid timerange");
        return createdBoxesTable([]);
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
