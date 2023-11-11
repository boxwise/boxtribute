import { gql, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import {
  MovedBoxesData,
  QueryMovedBoxesArgs,
} from "../types/generated/graphql";
import { movedBoxesTable } from "../utils/table";
import { useMemo } from "react";
import useTimerange from "./useTimerange";

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
  const { data, loading, error } = useQuery<any, QueryMovedBoxesArgs>(
    MOVED_BOXES_QUERY,
    {
      variables: { baseId: parseInt(baseId) },
    }
  );

  const { timerange, interval } = useTimerange();

  return {
    movedBoxes: useMemo(() => {
      if (!data) return;

      const movedBoxesFacts = movedBoxesTable(data.movedBoxes.facts);

      try {
        return movedBoxesFacts.filterCreatedOn(interval);
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
