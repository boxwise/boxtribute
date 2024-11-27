import { BeneficiaryDemographics } from "../../../../../graphql/types";
import DemographicPyramid from "./DemographicPyramid";

interface IDemographicChartProps {
  demographics: Partial<BeneficiaryDemographics>;
}

export default function DemographicCharts({ demographics }: IDemographicChartProps) {
  return <DemographicPyramid width={800} height={800} demographics={demographics} />;
}
