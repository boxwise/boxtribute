import { gql, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { useMemo } from "react";
import {
  MovedBoxesData,
  MovedBoxesResult,
  QueryMovedBoxesArgs,
} from "../types/generated/graphql";
import { movedBoxesTable } from "../utils/table";
import useTimerange from "./useTimerange";
import { filterListByInterval } from "../utils/helpers";

const MOVED_BOXES_QUERY = gql`
  query movedBoxes($baseId: Int!) {
    movedBoxes(baseId: $baseId) {
      facts {
        movedOn
        targetId
        categoryId
        boxesCount
      }
      dimensions {
        category {
          id
          name
        }
        target {
          id
          name
          type
        }
      }
    }
  }
`;

export default function useMovedBoxes() {
  const { baseId } = useParams();
  const { data, loading, error } = useQuery<
    { movedBoxes: MovedBoxesData },
    QueryMovedBoxesArgs
  >(MOVED_BOXES_QUERY, {
    variables: { baseId: parseInt(baseId) },
  });

  const { timerange, interval } = useTimerange();

  return {
    movedBoxesFacts: useMemo(() => {
      if (!data) return;

      try {
        return filterListByInterval(
          data.movedBoxes.facts as MovedBoxesResult[],
          "movedOn",
          interval
        ) as MovedBoxesResult[];
      } catch (error) {
        console.log("invalid timerange in use boxes");
      }
    }, [data, interval]),
    data,
    loading,
    error,
    timerange,
  };
}
