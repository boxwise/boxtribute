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

export default function TopProductsPieChart() {
  const { data, loading, error } = useQuery<
    CreatedBoxesData,
    QueryCreatedBoxesArgs
  >(CREATED_BOXES_QUERY, { variables: { baseId: 1 } });

  const getChartData = () => {
    if (data === undefined) {
      return [];
    }
    const createdBoxes = table(data.createdBoxes.facts as CreatedBoxesResult[]);
    const products = table(
      data.createdBoxes.dimensions.product as ProductDimensionInfo
    );

    const productCount = createdBoxes.sumColumn("itemsCount");

    const top5Products = createdBoxes
      .groupBySum("productId", ["itemsCount", "boxesCount"])
      .orderBy("itemsCount", Sort.desc)
      .innerJoin(products, "productId", "id")
      .limit(5);

    return top5Products.data.map((row) => {
      let percent: number = (row.itemsCount * 100) / productCount;
      percent = round(percent, 2);
      return {
        id: row.name,
        value: row.itemsCount,
        label: `${row.itemsCount} (${percent}%)`,
      };
    });
  };

  const chartData = useMemo(getChartData, [data]);

  if (error instanceof ApolloError) {
    return <p>{error.message}</p>;
  }
  if (loading) {
    return <p>loading...</p>;
  }

  return (
    <div>
      <Heading size="md">Top Products</Heading>
      <PieChart data={chartData} width="500px" height="400px" />
    </div>
  );
}
