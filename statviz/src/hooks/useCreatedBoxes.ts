import { gql, useQuery } from "@apollo/client";
import {
  CreatedBoxesData,
  CreatedBoxesResult,
} from "../types/generated/graphql";
import { useMemo } from "react";
import { createdBoxesTable } from "../utils/table";
import { useSearchParams } from "react-router-dom";

export default function useCreatedBoxes(data?: {
  createdBoxes: CreatedBoxesData;
}) {
  const [searchParams] = useSearchParams();

  return useMemo(() => {
    if (!data) return createdBoxesTable([]);

    const boxesFacts = createdBoxesTable(
      data.createdBoxes.facts as CreatedBoxesResult[]
    );

    const fromToInterval = {
      start: new Date(searchParams.get("from") as string),
      end: new Date(searchParams.get("to") as string),
    };

    try {
      const filteredByTime = boxesFacts.filterCreatedOn(fromToInterval);
      return createdBoxesTable(filteredByTime.data);
    } catch (e) {
      console.log("invalid timerange");
      return createdBoxesTable([]);
    }
  }, [data, searchParams]);
}
