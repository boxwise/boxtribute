import BarChart from "../../../components/nivo-graphs/BarChart";
import { Sort, table } from "../../../utils/table";
import {
  CreatedBoxesData,
  CreatedBoxesResult,
  ProductDimensionInfo,
  QueryCreatedBoxesArgs,
} from "../../../types/generated/graphql";
import { ApolloError, useQuery, gql } from "@apollo/client";
import { Card, CardBody, CardHeader, Heading } from "@chakra-ui/react";
import { round } from "lodash";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { BoxesOrItemsCount } from "../../Dashboard/Dashboard";
import { getSelectionBackground } from "../../../utils/theme";
import VisHeader from "./VisHeader";
import useCreatedBoxes from "../../../utils/hooks/useCreatedBoxes";
import NoDataCard from "./NoDataCard";

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

export default function TopProducts(params: {
  width: string;
  height: string;
  boxesOrItems: BoxesOrItemsCount;
}) {
  const boxesOrItems = params.boxesOrItems;
  const { baseId } = useParams();
  const { data, loading, error } = useQuery<
    CreatedBoxesData,
    QueryCreatedBoxesArgs
  >(CREATED_BOXES_QUERY, { variables: { baseId: parseInt(baseId) } });
  const [selected, setSelected] = useState<boolean>(false);
  const createdBoxes = useCreatedBoxes(data);

  const getChartData = () => {
    if (data === undefined) {
      return [];
    }

    const products = table(
      data.createdBoxes.dimensions.product as ProductDimensionInfo
    );

    const productCount = createdBoxes.sumColumn(boxesOrItems);

    const top5Products = createdBoxes
      .groupBySum("productId", ["itemsCount", "boxesCount"], ["gender"])
      .orderBy(boxesOrItems, Sort.desc)
      .innerJoin(products, "productId", "id")
      .limit(5);

    return top5Products.data.map((row) => {
      let percent: number = (row[boxesOrItems] * 100) / productCount;
      percent = round(percent, 2);

      return {
        id: `${row.name} (${row.gender})`,
        value: row[boxesOrItems],
        label: `${row[boxesOrItems]} (${percent}%)`,
      };
    });
  };

  const chartData = useMemo(getChartData, [data, createdBoxes, boxesOrItems]);

  if (error instanceof ApolloError) {
    return <p>{error.message}</p>;
  }
  if (loading) {
    return <p>loading...</p>;
  }

  const topProductsHeading = boxesOrItems === "boxesCount" ? "boxes" : "items";
  const heading = "Top Products by " + topProductsHeading;

  if (chartData.length == 0) {
    return <NoDataCard header={heading} />;
  }
  return (
    <Card backgroundColor={getSelectionBackground(selected)}>
      <VisHeader
        heading={heading}
        visId="tp"
        onSelect={() => setSelected(true)}
        onDeselect={() => setSelected(false)}
      ></VisHeader>
      <CardBody>
        <BarChart
          data={chartData}
          width={params.width}
          height={params.height}
        />
      </CardBody>
    </Card>
  );
}
