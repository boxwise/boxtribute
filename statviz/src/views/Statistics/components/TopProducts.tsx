import BarChart from "../../../components/nivo-graphs/BarChart";
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

type TopProductsBy = "boxesCount" | "itemsCount";

export default function TopProducts(params: { width: string; height: string }) {
  const { baseId } = useParams();
  const { data, loading, error } = useQuery<
    CreatedBoxesData,
    QueryCreatedBoxesArgs
  >(CREATED_BOXES_QUERY, { variables: { baseId: parseInt(baseId) } });

  // TODO: move to URI parameter
  const topProductsBy: TopProductsBy = "itemsCount"; // or "itemsCount"

  const getChartData = () => {
    if (data === undefined) {
      return [];
    }
    const createdBoxes = table(data.createdBoxes.facts as CreatedBoxesResult[]);
    const products = table(
      data.createdBoxes.dimensions.product as ProductDimensionInfo
    );

    const productCount = createdBoxes.sumColumn(topProductsBy);

    const top5Products = createdBoxes
      .groupBySum("productId", ["itemsCount", "boxesCount"], ["gender"])
      .orderBy(topProductsBy, Sort.desc)
      .innerJoin(products, "productId", "id")
      .limit(5);

    return top5Products.data.map((row) => {
      let percent: number = (row[topProductsBy] * 100) / productCount;
      percent = round(percent, 2);

      return {
        id: `${row.name} (${row.gender})`,
        value: row[topProductsBy],
        label: `${row[topProductsBy]} (${percent}%)`,
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

  const topProductsHeading = topProductsBy === "boxesCount" ? "boxes" : "items";

  return (
    <div>
      <Heading size="md">Top Products by {topProductsHeading}</Heading>
      <BarChart data={chartData} width={params.width} height={params.height} />
    </div>
  );
}
