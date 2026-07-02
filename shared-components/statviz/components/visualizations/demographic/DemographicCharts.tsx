import { BeneficiaryDemographics } from "../../../../../graphql/types";
import DemographicPyramid from "./DemographicPyramid";

interface IDemographicChartProps {
  demographics: Partial<BeneficiaryDemographics>;
}

export default function DemographicCharts({ demographics }: IDemographicChartProps) {
  return <DemographicPyramid width="100%" height="500" demographics={demographics} />;
}
