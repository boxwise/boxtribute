import { ApolloError, useQuery, gql } from "@apollo/client";
import { Heading } from "@chakra-ui/react";
import _ from "lodash";

import {
  CreatedBoxesData,
  CreatedBoxesResult,
  QueryCreatedBoxesArgs,
} from "../../../types/generated/graphql";
import BarChart from "../../../components/nivo-graphs/BarChart";
import { CreatedBoxRow, createdBoxesTable, table } from "../../../utils/table";
import { useMemo } from "react";
import useCreatedBoxes from "../../../utils/hooks/useCreatedBoxes";
import { useParams } from "react-router-dom";

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

export default function CreatedBoxes(params: {
  width: string;
  height: string;
}) {
  const { baseId } = useParams();
  const { data, loading, error } = useQuery<
    CreatedBoxesData,
    QueryCreatedBoxesArgs
  >(CREATED_BOXES_QUERY, { variables: { baseId: parseInt(baseId) } });
  const createdBoxes = useCreatedBoxes(data);

  const getChartData = () => {
    if (data === undefined) return [];

    const createdBoxesPerDay = createdBoxes
      .removeMissingCreatedOn()
      .groupByCreatedOn()
      .fillMissingDays();

    return createdBoxesPerDay.data;
  };

  const createdBoxesPerDay = useMemo(getChartData, [createdBoxes]);

  if (error instanceof ApolloError) {
    return <p>{error.message}</p>;
  }
  if (loading) {
    return <p>loading...</p>;
  }
  if (createdBoxesPerDay.length < 1) {
    return <p>No data for the selected time range</p>;
  }

  return (
    <div>
      <Heading size="md">Created Boxes</Heading>
      <BarChart
        data={createdBoxesPerDay}
        indexBy="createdOn"
        keys={["boxesCount"]}
        width={params.width}
        height={params.height}
      />
    </div>
  );
}
