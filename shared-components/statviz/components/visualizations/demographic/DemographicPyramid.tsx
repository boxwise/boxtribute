import { Card, CardBody } from "@chakra-ui/react";
import { range } from "lodash";
import { filter, sum, summarize, tidy, groupBy, map } from "@tidyjs/tidy";
import { useMemo } from "react";
import BarChartCenterAxis from "../../custom-graphs/BarChartCenterAxis";
import {
  BeneficiaryDemographicsData,
  BeneficiaryDemographicsResult,
  HumanGender,
} from "../../../../types/generated/graphql";
import VisHeader from "../../VisHeader";
import getOnExport from "../../../utils/chartExport";
import NoDataCard from "../../NoDataCard";

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

interface IDemographicChartProps {
  demographics: BeneficiaryDemographicsData;
  width: number;
  height: number;
}

const heading = "Beneficiaries Registered";

export default function DemographicPyramid({
  demographics,
  width,
  height,
}: IDemographicChartProps) {
  const onExport = getOnExport(BarChartCenterAxis);

  const prepareFacts = () => {
    const dataXr = tidy(
      demographics.facts as BeneficiaryDemographicsResult[],
      filter((value) => value.gender === HumanGender.Male),
      groupBy("age", [summarize({ count: sum("count") })]),
      map((value) => ({ x: value.count, y: value.age ?? 0 })),
    );

    const dataXl = tidy(
      demographics.facts as BeneficiaryDemographicsResult[],
      filter((value) => value.gender === HumanGender.Female),
      groupBy("age", [summarize({ count: sum("count") })]),
      map((value) => ({ x: value.count, y: value.age ?? 0 })),
    );

    return [dataXr, dataXl];
  };

  const [dataXr, dataXl] = useMemo(prepareFacts, [demographics.facts]);

  if (dataXr.length === 0 && dataXl.length === 0) {
    return <NoDataCard header={heading} />;
  }

  const maxAge: number =
    demographics.facts!.reduce((acc: number, current: BeneficiaryDemographicsResult) => {
      if (!current!.age) return acc;
      if (current!.age > acc) return current!.age;
      return acc;
    }, 0) ?? 100;

  const chartProps = {
    labelY: "Age",
    labelXr: "Male",
    labelXl: "Female",
    dataY: range(-1, maxAge + 2),
    dataXr,
    dataXl,
    width,
    height,
    background: "#ffffff",
    colorBarLeft: "#ec5063",
    colorBarRight: "#31cab5",
    visId: "preview-demographic",
    settings: {
      hideZeroY: false,
    },
  };

  return (
    <Card>
      <VisHeader
        maxWidthPx={width}
        heading={heading}
        onExport={onExport}
        chartProps={chartProps}
        defaultHeight={800}
        defaultWidth={600}
      />
      <CardBody id="chart-container" style={{ width: "100%", height: "100%" }}>
        <BarChartCenterAxis {...chartProps} />
      </CardBody>
    </Card>
  );
}
