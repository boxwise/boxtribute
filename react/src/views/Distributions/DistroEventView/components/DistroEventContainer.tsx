import { Box, VStack, Text } from "@chakra-ui/react";
import React from "react";
import DistributionStateProgressBar from "views/Distributions/components/DistributionStateProgressBar";
import { DistributionEventState } from "views/Distributions/types";
import * as yup from "yup";
import DistroEventDetailsForPlanningStateContainer from "./State1Planning/DistroEventDetailsForPlanningStateContainer";

const distributionSpotSchema = yup.object({
  id: yup.string().required(),
  name: yup.string().required(),
});
export const distributionEventDetailsSchema = yup.object({
  id: yup.string().required(),
  name: yup.string().required(),
  plannedStartDateTime: yup.date().required(),
  state: yup
    .mixed<DistributionEventState>()
    .oneOf(Object.values(DistributionEventState))
    .required(),
  distributionSpot: distributionSpotSchema,
});

export interface DistributionEventDetails
  extends yup.InferType<typeof distributionEventDetailsSchema> {}
// export interface DistributionEventDetails {
//     id: string;
//     name?: string;
//     startDate: Date;
//     state: DistributionEventState;
//     distributionSpot: {
//         id: string;
//         name?: string;
//     }
// }

export interface DistroEventContainerProps {
  distroEventDetails: DistributionEventDetails;
}
const DistroEventContainer = ({
  distroEventDetails,
}: DistroEventContainerProps) => {
  const eventStateToComponentMapping: {
    [key in DistributionEventState]: React.FC;
  } = {
    [DistributionEventState.Planning]: () => (
      <DistroEventDetailsForPlanningStateContainer
      distributionEventDetails={distroEventDetails}
      />
    ),
    // [DistributionEventState.PlanningDone]: () => <Box>PlanningDone</Box>,
    [DistributionEventState.Packing]: () => <Box>Packing</Box>,
    // [DistributionEventState.PackingDone]: () => <Box>PackingDone</Box>,
    [DistributionEventState.OnDistro]: () => <Box>OnDistro</Box>,
    [DistributionEventState.Returned]: () => <Box>Returned</Box>,
    // [DistributionEventState.ReturnsTracked]: () => <Box>ReturnsTracked</Box>,
    [DistributionEventState.Completed]: () => <Box>Completed</Box>,
  };

  const StateSpecificComponent =
    eventStateToComponentMapping[distroEventDetails.state];
  return (
    <VStack>
      <Box>
        <Text fontSize="xl">
          {distroEventDetails.distributionSpot.name}
        </Text>
        <Text fontSize="xl" mb={2} borderBottom="1px" borderColor="gray.300">
          {distroEventDetails.plannedStartDateTime?.toDateString()}
        </Text>
        <DistributionStateProgressBar activeState={distroEventDetails.state} />
      </Box>
      <Box>
        <StateSpecificComponent />
      </Box>
    </VStack>
  );
};

export default DistroEventContainer;
