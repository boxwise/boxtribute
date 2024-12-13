import { Card, CardBody, Text, chakra, Box } from "@chakra-ui/react";
import { range } from "lodash";
import { filter, sum, summarize, tidy, groupBy, map } from "@tidyjs/tidy";
import { useMemo } from "react";
import BarChartCenterAxis from "../../custom-graphs/BarChartCenterAxis";
import VisHeader from "../../VisHeader";
import getOnExport from "../../../utils/chartExport";
import NoDataCard from "../../NoDataCard";
import {
  BeneficiaryDemographics,
  BeneficiaryDemographicsResult,
} from "../../../../../graphql/types";

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
  demographics: Partial<BeneficiaryDemographics>;
  width: number;
  height: number;
}

const heading = "Beneficiary Registrations";

export default function DemographicPyramid({
  demographics,
  width,
  height,
}: IDemographicChartProps) {
  const onExport = getOnExport(BarChartCenterAxis);

  const prepareFactsForGraph = () => {
    const dataXr = tidy(
      demographics?.facts as BeneficiaryDemographicsResult[],
      filter((value) => value.gender === "Male" && value.age !== null),
      groupBy("age", [summarize({ count: sum("count") })]),
      map((value) => ({ x: value.count, y: value.age ?? 0 })),
    );

    const dataXl = tidy(
      demographics?.facts as BeneficiaryDemographicsResult[],
      filter((value) => value.gender === "Female" && value.age !== null),
      groupBy("age", [summarize({ count: sum("count") })]),
      map((value) => ({ x: value.count, y: value.age ?? 0 })),
    );

    return [dataXr, dataXl];
  };

  const prepareFactsForText = () => {
    const totalCount = tidy(
      demographics?.facts as BeneficiaryDemographicsResult[],
      summarize({ total: sum("count") }),
    )[0].total;

    const maleCount = tidy(
      demographics?.facts as BeneficiaryDemographicsResult[],
      filter((value) => value.gender === "Male"),
      summarize({ total: sum("count") }),
    )[0].total;

    const femaleCount = tidy(
      demographics?.facts as BeneficiaryDemographicsResult[],
      filter((value) => value.gender === "Male"),
      summarize({ total: sum("count") }),
    )[0].total;

    const diverseCount = tidy(
      demographics?.facts as BeneficiaryDemographicsResult[],
      filter((value) => value.gender === "Diverse"),
      summarize({ total: sum("count") }),
    )[0].total;

    const ageNullCount = tidy(
      demographics?.facts as BeneficiaryDemographicsResult[],
      filter((value) => value.age === null),
      summarize({ total: sum("count") }),
    )[0].total;

    const ageNullOrDiverseCount = tidy(
      demographics?.facts as BeneficiaryDemographicsResult[],
      filter((value) => value.age === null || value.gender === "Diverse"),
      summarize({ total: sum("count") }),
    )[0].total;

    return [totalCount, maleCount, femaleCount, diverseCount, ageNullCount, ageNullOrDiverseCount];
  };

  const [dataXr, dataXl] = useMemo(prepareFactsForGraph, [demographics?.facts]);

  const [totalCount, maleCount, femaleCount, diverseCount, ageNullCount, ageNullOrDiverseCount] =
    useMemo(prepareFactsForText, [demographics?.facts]);

  const beneficiariesRegistrationsText = (
    <Text>
      There were <chakra.span as="b">{totalCount}</chakra.span> beneficiaries registered in the
      selected time period, <chakra.span as="b">{maleCount}</chakra.span> were male and{" "}
      <chakra.span as="b">{femaleCount}</chakra.span> were female.
      {ageNullOrDiverseCount ? (
        <chakra.span>
          <br />
          <br />
          <chakra.span as="b">{ageNullOrDiverseCount}</chakra.span> of these beneficiaries are not
          shown in the graph:
          <br />
          <Box as="ul" listStylePosition="inside">
            <li>
              <chakra.span as="b">{ageNullCount}</chakra.span> people are missing a date of birth.
            </li>
            <li>
              <chakra.span as="b">{diverseCount}</chakra.span> people have an unknown gender.
            </li>
          </Box>
        </chakra.span>
      ) : (
        ""
      )}
    </Text>
  );

  if (dataXr.length === 0 && dataXl.length === 0) {
    if (totalCount === 0) {
      return <NoDataCard header={heading} />;
    }
    return beneficiariesRegistrationsText;
  }

  const maxAge: number =
    demographics?.facts!.reduce((acc: number, current: BeneficiaryDemographicsResult) => {
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
        {beneficiariesRegistrationsText}
        <BarChartCenterAxis {...chartProps} />
      </CardBody>
    </Card>
  );
}
