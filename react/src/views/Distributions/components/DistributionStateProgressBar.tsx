import { Box, HStack, Text } from "@chakra-ui/react";
import React from "react";
import {
  distroEventStateHumanReadableLabels,
  distroEventStateOrder,
} from "../baseData";
import { DistributionEventState } from "../types";

const DistributionStateProgressBar = ({
  activeState,
}: {
  activeState: DistributionEventState;
}) => {
  const joinedPlanningStates = distroEventStateOrder
    .map<React.ReactNode>((state, i) => {
      const isActiveState = state === activeState;
      return <Text color={isActiveState ? "black" : "gray"} fontSize={isActiveState ? 'md' : 'sm'} {...(isActiveState ? { as: "u" } : {})}>
        {i+1}. {distroEventStateHumanReadableLabels.get(state)}
      </Text>
    })
    .reduce((prev, curr) => [prev, <Text color="gray" fontSize='md'> → </Text>, curr]);

  return (
    <Box>
      {/* <strong>State:</strong> */}
      <HStack>{joinedPlanningStates}</HStack>
    </Box>
  );
};

export default DistributionStateProgressBar;
