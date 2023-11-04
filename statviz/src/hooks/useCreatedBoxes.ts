import { gql, useQuery } from "@apollo/client";
import {
  CreatedBoxesData,
  CreatedBoxesResult,
  QueryCreatedBoxesArgs,
} from "../types/generated/graphql";
import { useMemo } from "react";
import { createdBoxesTable } from "../utils/table";
import { useParams, useSearchParams } from "react-router-dom";
import { date2String } from "../utils/chart";

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

  const [searchParams] = useSearchParams();

  const fromToInterval = useMemo(
    () => ({
      start: new Date(searchParams.get("from") as string),
      end: new Date(searchParams.get("to") as string),
    }),
    [searchParams]
  );

  const fromToTimestamp = useMemo(
    () =>
      "from " +
      date2String(fromToInterval.start) +
      " to " +
      date2String(fromToInterval.end),
    [fromToInterval]
  );

  return {
    createdBoxes: useMemo(() => {
      if (!data) return createdBoxesTable([]);

      const boxesFacts = createdBoxesTable(
        data.createdBoxes.facts as CreatedBoxesResult[]
      );

      try {
        const filteredByTime = boxesFacts.filterCreatedOn(fromToInterval);
        return createdBoxesTable(filteredByTime.data);
      } catch (e) {
        console.log("invalid timerange");
        return createdBoxesTable([]);
      }
    }, [data, fromToInterval]),
    loading,
    error,
    data,
    baseId,
    fromToInterval,
    fromToTimestamp,
  };
}
