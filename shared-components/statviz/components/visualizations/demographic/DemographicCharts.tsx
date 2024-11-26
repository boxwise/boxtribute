import { BeneficiaryDemographics } from "../../../../../front/src/types/query-types";
import DemographicPyramid from "./DemographicPyramid";

interface IDemographicChartProps {
  demographics: BeneficiaryDemographics;
}

export default function DemographicCharts({ demographics }: IDemographicChartProps) {
  return <DemographicPyramid width={800} height={800} demographics={demographics} />;
}
