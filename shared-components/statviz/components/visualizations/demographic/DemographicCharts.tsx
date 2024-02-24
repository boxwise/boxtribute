import { BeneficiaryDemographicsData } from "../../../../types/generated/graphql";
import DemographicPyramid from "./DemographicPyramid";

interface IDemographicChartProps {
  demographics: BeneficiaryDemographicsData;
}

export default function DemographicCharts({ demographics }: IDemographicChartProps) {
  return <DemographicPyramid width={800} height={800} demographics={demographics} />;
}
