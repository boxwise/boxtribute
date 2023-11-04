import { Box, Card, CardBody, CardHeader, Heading } from "@chakra-ui/react";
import BarChartCenterAxis from "../custom-graphs/BarChartCenterAxis";
import { range } from "lodash";
import { HumanGender } from "../../types/generated/graphql";
import VisHeader from "../VisHeader";
import { table } from "../../utils/table";
import useExport from "../../hooks/useExport";
import { date2String } from "../../utils/chart";
import useDemographics from "../../hooks/useDemographics";
import { ApolloError } from "@apollo/client";

export interface IDemographicFact {
  createdOn: Date;
  age: number;
  count: number;
  gender: string;
}

export interface ITag {
  id: string;
  name: string;
}

export interface IDemographicCube {
  facts: IDemographicFact[];
  dimensions: {
    tag: ITag[];
  };
}

const visId = "demographic-pyramid";
const heading = "Demographic";

export default function DemographicChart(params: {
  width: number;
  height: number;
}) {
  const { demographics, error, timerange, loading } = useDemographics();
  const {
    exportWidth,
    exportHeight,
    isExporting,
    exportHeading,
    exportTimestamp,
    exportTimerange,
    onExport,
    onExportFinish,
  } = useExport();

  if (error instanceof ApolloError) {
    return <p>{error.message}</p>;
  }
  if (loading || typeof demographics === "undefined") {
    return <p>loading...</p>;
  }
  if (demographics.data.length === 0) {
    return (
      <Card w={params.width}>
        <CardHeader>
          <Heading size="md">{heading}</Heading>
        </CardHeader>
        <CardBody>
          <p>
            No demographic data available for your base. Either you are a
            sending base which is not registering people or the birth date is
            not registered.
          </p>
        </CardBody>
      </Card>
    );
  }

  const prepareFacts = () => {
    const dataXr = table(
      demographics
        .filter((value) => value.gender === HumanGender.Male)
        .data.map((e) => ({ x: e.count, y: e.age }))
    ).groupBySum("y", ["x"]).data;

    const dataXl = table(
      demographics
        .filter((value) => value.gender === HumanGender.Female)
        .data.map((e) => ({ x: e.count, y: e.age }))
    ).groupBySum("y", ["x"]).data;

    return [dataXr, dataXl];
  };

  const [dataXr, dataXl] = prepareFacts();

  const maxAge: number = demographics.data.reduce((acc: number, current) => {
    if (current.age > acc) return current.age;
    return acc;
  }, 0);

  return (
    <Card>
      <VisHeader
        maxWidthPx={params.width}
        heading={heading}
        visId={visId}
        onExport={onExport}
        onExportFinished={onExportFinish}
        custom={true}
      ></VisHeader>
      <CardBody id="chart-container" style={{ width: "100%", height: "100%" }}>
        <BarChartCenterAxis
          labelY="Age"
          labelXr="Male"
          labelXl="Female"
          dataY={range(-1, maxAge + 2)}
          dataXr={dataXr}
          dataXl={dataXl}
          width={params.width}
          height={params.height}
          background="#ffffff"
          colorBarLeft="#ec5063"
          colorBarRight="#31cab5"
          visId={visId}
          settings={{
            hideZeroY: false,
          }}
        />
      </CardBody>
      {isExporting && (
        <Box position="absolute" top="0" left="-5000">
          <BarChartCenterAxis
            visId={visId}
            indexBy="createdOn"
            heading={exportHeading && heading}
            timestamp={exportTimestamp && date2String(new Date())}
            timeRange={exportTimerange && fromToTimestamp}
            width={exportWidth + "px"}
            height={exportHeight + "px"}
          />
        </Box>
      )}
    </Card>
  );
}
