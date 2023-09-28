import { ApolloError, useQuery, gql } from "@apollo/client";
import { Heading } from "@chakra-ui/react";
import _ from "lodash";

import {
  CreatedBoxesData,
  CreatedBoxesResult,
  QueryCreatedBoxesArgs,
} from "../../../types/generated/graphql";
import BarChart from "../../../components/nivo-graphs/BarChart";
import { Sort, table } from "../../../utils/table";

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

  if (error instanceof ApolloError) {
    return <p>{error.message}</p>;
  }
  if (loading) {
    return <p>loading...</p>;
  }

  let f = table(data.createdBoxes.facts as CreatedBoxesResult[]);

  f = f.groupBySum("createdOn", ["boxesCount"]);

  return (
    <div>
      <Heading size="md">Created Boxes</Heading>
      <BarChart
        data={f.data}
        indexBy="createdOn"
        keys={["boxesCount"]}
        width="900px"
        height="400px"
      />
    </div>
  );
}
