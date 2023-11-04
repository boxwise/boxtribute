import BarChart from "../nivo-graphs/BarChart";
import { Sort, table } from "../../utils/table";
import {
  CreatedBoxesData,
  ProductDimensionInfo,
  QueryCreatedBoxesArgs,
} from "../../types/generated/graphql";
import { ApolloError, useQuery, gql } from "@apollo/client";
import { Box, Card, CardBody, Heading } from "@chakra-ui/react";
import { round } from "lodash";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { BoxesOrItemsCount } from "../../views/Dashboard/Dashboard";
import VisHeader from "../VisHeader";
import useCreatedBoxes from "../../hooks/useCreatedBoxes";
import NoDataCard from "../NoDataCard";
import useExport from "../../hooks/useExport";

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

const visId = "top-products";

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
  const createdBoxes = useCreatedBoxes(data);

  const {
    exportWidth,
    exportHeight,
    isExporting,
    exportHeading,
    exportTimestamp,
    onExport,
    onExportFinish,
  } = useExport();

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
    <Card>
      <VisHeader
        maxWidthPx={params.width}
        heading={heading}
        visId={visId}
        onExport={onExport}
        onExportFinished={onExportFinish}
      ></VisHeader>
      <CardBody>
        <BarChart
          visId={"visId"}
          data={chartData}
          width={params.width}
          height={params.height}
        />
      </CardBody>
      {isExporting && (
        <Box
          margin="0"
          padding="0"
          bg="white"
          position="absolute"
          top="0"
          left="-5000"
          id={visId}
        >
          {exportHeading && (
            <Heading margin="0" fontSize={exportWidth / 24}>
              {heading}
            </Heading>
          )}
          {exportTimestamp && (
            <Box fontSize={exportWidth / 32}>{new Date().toISOString()}</Box>
          )}
          <BarChart
            animate={false}
            visId="test"
            data={chartData}
            width={exportWidth + "px"}
            height={exportHeight + "px"}
          />
        </Box>
      )}
    </Card>
  );
}
