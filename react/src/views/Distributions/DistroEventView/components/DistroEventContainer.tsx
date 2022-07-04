import { Box, VStack } from "@chakra-ui/react";
import React from "react";
import { DistributionEventState } from "views/Distributions/types";
import * as yup from 'yup';

const distributionSpotSchema = yup.object({
  id: yup.string().required(),
  name: yup.string().required(),
});
export const distributionEventDetailsSchema = yup.object({
  id: yup.string().required(),
  name: yup.string().required(),
  startDate: yup.date().required(),
  state: yup.mixed<DistributionEventState>().oneOf(Object.values(DistributionEventState)).required(),
  distributionSpot: distributionSpotSchema
});

export interface DistributionEventDetails extends yup.InferType<typeof distributionEventDetailsSchema> {}
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

const DistroEventContainer = ({ distroEventDetails }: DistroEventContainerProps) => {
  return (
    <VStack>
      <Box>State: {distroEventDetails.state}</Box>
      <Box>{JSON.stringify(distroEventDetails)}</Box>
    </VStack>
  );
};

export default DistroEventContainer;
