import { ApolloError, useQuery, gql } from "@apollo/client";
import { Heading } from "@chakra-ui/react";
import _ from "lodash";

import {
  CreatedBoxesData,
  CreatedBoxesResult,
  QueryCreatedBoxesArgs,
} from "../../../types/generated/graphql";
import BarChart from "../../../components/nivo-graphs/BarChart";
import { table } from "../../../utils/table";
import { useMemo } from "react";

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

export default function CreatedBoxesBarChart() {
  const { data, loading, error } = useQuery<
    CreatedBoxesData,
    QueryCreatedBoxesArgs
  >(CREATED_BOXES_QUERY, { variables: { baseId: 1 } });

  const getChartData = () => {
    if (data === undefined) return [];

    const createdBoxesPerDay = table(
      data.createdBoxes.facts as CreatedBoxesResult[]
    ).groupBySum("createdOn", ["boxesCount"]);

    return createdBoxesPerDay.data;
  };

  const createdBoxesPerDay = useMemo(getChartData, [data]);

  if (error instanceof ApolloError) {
    return <p>{error.message}</p>;
  }
  if (loading) {
    return <p>loading...</p>;
  }

  return (
    <div>
      <Heading size="md">Created Boxes</Heading>
      <BarChart
        data={createdBoxesPerDay}
        indexBy="createdOn"
        keys={["boxesCount"]}
        width="900px"
        height="400px"
      />
    </div>
  );
}
