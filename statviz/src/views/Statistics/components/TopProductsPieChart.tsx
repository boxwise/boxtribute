import PieChart from "../../../components/nivo-graphs/PieChart";
import { Sort, table } from "../../../utils/table";
import {
  CreatedBoxesData,
  CreatedBoxesResult,
  ProductDimensionInfo,
  QueryCreatedBoxesArgs,
} from "../../../types/generated/graphql";
import { ApolloError, useQuery, gql } from "@apollo/client";
import { Heading } from "@chakra-ui/react";
import { round } from "lodash";

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

export default function TopProductsPieChart() {
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

  let createdBoxes = table(data.createdBoxes.facts as CreatedBoxesResult[]);
  const products = table(
    data.createdBoxes.dimensions.product as ProductDimensionInfo
  );

  createdBoxes = createdBoxes
    .groupBySum("productId", ["itemsCount", "boxesCount"])
    .orderBy("itemsCount", Sort.desc)
    .innerJoin(products, "productId", "id");

  const productCount = createdBoxes.sumColumn("itemsCount");
  console.log(createdBoxes);

  createdBoxes = createdBoxes.limit(5);

  const chart = createdBoxes.data.map((row) => {
    let percent: number = (row.itemsCount * 100) / productCount;
    percent = round(percent, 2);
    return {
      id: row.name,
      value: row.itemsCount,
      label: `${row.itemsCount} (${percent}%)`,
    };
  });

  return (
    <div>
      <Heading size="md">Top Products</Heading>
      <PieChart data={chart} width="500px" height="400px" />
    </div>
  );
}
