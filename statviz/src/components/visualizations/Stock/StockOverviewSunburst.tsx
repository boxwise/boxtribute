import { Card, CardBody } from "@chakra-ui/react";
import VisHeader from "../../VisHeader";
import Sunburst from "../../nivo-graphs/Sunburst";
import { StockOverviewData } from "../../../types/generated/graphql";
import {
  filter,
  groupBy,
  innerJoin,
  map,
  sum,
  summarize,
  tidy,
} from "@tidyjs/tidy";

const heading = "Stock Overview";

export default function StockOverviewSunburst(props: {
  width: string;
  height: string;
  stockOverview: StockOverviewData;
}) {
  const { width, height, stockOverview } = { ...props };

  const sizeDim = stockOverview.dimensions.size.map((size) => ({
    sizeId: parseInt(size.id),
    sizeName: size.name,
  }));
  const categoryDim = stockOverview.dimensions.category.map((category) => ({
    categoryId: parseInt(category.id),
    categoryName: category.name,
  }));

  const preparedStockData = tidy(
    stockOverview.facts,
    innerJoin(categoryDim, "categoryId"),
    innerJoin(sizeDim, "sizeId")
  );
  let idCounter = 0;

  const grouped = tidy(
    preparedStockData,
    groupBy(
      ["categoryName", "productName", "sizeName", "gender"],
      [
        summarize({
          boxesCount: sum("boxesCount"),
          itemsCount: sum("itemsCount"),
        }),
      ],
      groupBy.levels({
        levels: ["entries-object"],
        single: true,
        flat: false,
        mapEntry: (entry, level) => {
          idCounter++;
          if (level == 3) {
            return {
              name: entry[1].gender,
              id: idCounter,
              value: entry[1].itemsCount,
            };
          }
          return {
            name: entry[0],
            id: idCounter,
            children: entry[1],
          };
        },
      })
    )
  );

  const test2 = {
    name: "el",
    children: grouped,
  };

  return (
    <Card>
      <VisHeader
        onExport={() => {}}
        defaultHeight={800}
        defaultWidth={800}
        heading={heading}
        chartProps={{}}
        maxWidthPx={1000}
        visId="sb"
      />
      <CardBody>
        <Sunburst chartData={test2} width="600px" height="600px" />
      </CardBody>
    </Card>
  );
}
