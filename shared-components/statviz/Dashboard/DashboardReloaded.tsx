import { Heading } from "@chakra-ui/react";
import CreatedBoxesDataContainer from "../Components/Visualizations/CreatedBoxes/CreatedBoxesDataContainer";
import MovedBoxesDataContainer from "../Components/Visualizations/MovedBoxes/MovedBoxesDataContainer";
import TimeRangeSelect from "../../Form/TimeRangeSelect";
import DemographicChart from "../Components/Visualizations/Demographic/DemographicPyramid";

export default function DashboardReloaded() {
  return (
    <div>
      <Heading>Dashboard</Heading>
      <TimeRangeSelect />

      <CreatedBoxesDataContainer />
      <MovedBoxesDataContainer />
      <DemographicChart width={600} height={600} />
    </div>
  );
}
