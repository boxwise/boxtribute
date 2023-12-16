import { ApolloError } from "@apollo/client";
import { Card, CardBody } from "@chakra-ui/react";
import BarChart from "../../nivo-graphs/BarChart";
import { useMemo } from "react";
import { BoxesOrItemsCount } from "../../../views/Dashboard/Dashboard";
import VisHeader from "../../VisHeader";
import NoDataCard from "../../NoDataCard";
import getOnExport from "../../../utils/chartExport";
import {
  filter,
  sum,
  summarize,
  tidy,
  groupBy,
  complete,
  fullSeqDateISOString,
  map,
} from "@tidyjs/tidy";
import { CreatedBoxesData } from "../../../types/generated/graphql";
import { format, getISOWeek, getYear } from "date-fns";

const visId = "created-boxes";

export default function CreatedBoxes(props: {
  width: string;
  height: string;
  data: CreatedBoxesData;
  boxesOrItems: BoxesOrItemsCount;
}) {
  const onExport = getOnExport(BarChart);
  const getChartData = () => {
    const createdBoxes = tidy(
      props.data.facts,
      filter((row) => row.createdOn !== null),
      groupBy("createdOn", [
        summarize({
          itemsCount: sum("itemsCount"),
          boxesCount: sum("boxesCount"),
        }),
      ]),
      map((row) => ({
        ...row,
        createdOn: new Date(row.createdOn).toISOString(),
      })),
      complete(
        // fill days without new boxes
        {
          createdOn: fullSeqDateISOString("createdOn", "day", 1),
        },
        { boxesCount: 0, itemsCount: 0 }
      ),
      map((row) => ({
        ...row,
        createdOn: new Date(row.createdOn),
      }))
    );

    const LIMIT_GROUP_BY_DAYS = 29;
    const LIMIT_GROUP_BY_WEEK = 197;
    const LIMIT_GROUP_BY_MONTH = 10960;
    if (createdBoxes.length < LIMIT_GROUP_BY_DAYS) {
      return tidy(
        createdBoxes,
        map((row) => ({
          ...row,
          createdOn: format(new Date(row.createdOn), "dd LLL yyyy"),
        }))
      );
    }
    if (createdBoxes.length < LIMIT_GROUP_BY_WEEK) {
      // group by week
      return tidy(
        createdBoxes,
        map((row) => ({
          ...row,
          createdOn: `week ${getISOWeek(row.createdOn)} in ${getYear(
            row.createdOn
          )} `,
        })),
        groupBy("createdOn", [
          summarize({
            itemsCount: sum("itemsCount"),
            boxesCount: sum("boxesCount"),
          }),
        ])
      );
    }
    if (createdBoxes.length < LIMIT_GROUP_BY_MONTH) {
      // group by month
      return tidy(
        createdBoxes,
        map((row) => ({
          ...row,
          createdOn: `${row.createdOn.toLocaleString("default", {
            month: "short",
          })} ${getYear(row.createdOn)}`,
        })),
        groupBy("createdOn", [
          summarize({
            itemsCount: sum("itemsCount"),
            boxesCount: sum("boxesCount"),
          }),
        ])
      );
    }
    // group by year
    return tidy(
      createdBoxes,
      map((row) => ({
        ...row,
        createdOn: `${getYear(row.createdOn)}`,
      })),
      groupBy("createdOn", [
        summarize({
          itemsCount: sum("itemsCount"),
          boxesCount: sum("boxesCount"),
        }),
      ])
    );
  };

  const createdBoxesPerDay = useMemo(getChartData, [props.data]);

  const heading =
    props.boxesOrItems === "itemsCount" ? "New Items" : "Created Boxes";

  if (createdBoxesPerDay.length === 0) {
    return <NoDataCard header={heading} />;
  }

  const chartProps = {
    visId: "preview-created-boxes",
    data: createdBoxesPerDay,
    indexBy: "createdOn",
    keys: [props.boxesOrItems],
    width: props.width,
    height: props.height,
  };

  return (
    <Card>
      <VisHeader
        maxWidthPx={props.width}
        heading={heading}
        visId={visId}
        onExport={onExport}
        defaultHeight={500}
        defaultWidth={1000}
        chartProps={chartProps}
      ></VisHeader>
      <CardBody>
        <BarChart {...chartProps} />
      </CardBody>
    </Card>
  );
}
