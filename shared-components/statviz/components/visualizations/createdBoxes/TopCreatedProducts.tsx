import { Card, CardBody } from "@chakra-ui/react";
import { useMemo } from "react";
import { arrange, desc, groupBy, innerJoin, map, sum, summarize, tidy } from "@tidyjs/tidy";
import BarChart from "../../nivo/BarChart";
import VisHeader from "../../VisHeader";
import getOnExport from "../../../utils/chartExport";
import NoDataCard from "../../NoDataCard";
import { CreatedBoxes, CreatedBoxesResult, Product } from "../../../../../graphql/types";

export default function TopCreatedProducts(props: {
  width: string;
  height: string;
  boxesOrItems: string;
  data: Partial<CreatedBoxes>;
}) {
  const onExport = getOnExport(BarChart);
  const { boxesOrItems, data } = { ...props };

  const getChartData = () =>
    tidy(
      data?.facts as CreatedBoxesResult[],
      map((row) => ({ ...row, productId: row.productId })),
      groupBy(
        ["productId", "gender"],
        [
          summarize({
            itemsCount: sum("itemsCount"),
            boxesCount: sum("boxesCount"),
          }),
        ],
      ),
      innerJoin(data?.dimensions?.product as Product[], { by: { id: "productId" } as any }),
      map((row) => ({
        id: `${row.name} (${row.gender})`,
        value: row[boxesOrItems],
        label: `${row[boxesOrItems]}`,
      })),
      arrange([desc("value")]),
    ).splice(0, 5);

  const chartData = useMemo(getChartData, [data, boxesOrItems]);

  const chartProps = {
    data: chartData,
    width: props.width,
    height: props.height,
  };

  const topProductsHeading = boxesOrItems === "boxesCount" ? "Boxes" : "Products";
  const heading = `Top Created ${topProductsHeading}`;

  if (chartData.length === 0) {
    return <NoDataCard header={heading} />;
  }

  return (
    <Card>
      <VisHeader
        maxWidthPx={props.width}
        heading={heading}
        onExport={onExport}
        defaultHeight={500}
        defaultWidth={500}
        chartProps={chartProps}
      />
      <CardBody>
        <BarChart {...chartProps} />
      </CardBody>
    </Card>
  );
}
