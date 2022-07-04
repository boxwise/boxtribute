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
    .map<React.ReactNode>((state) => (
      <Text {...(state === activeState ? { as: "u" } : {})}>
        {distroEventStateHumanReadableLabels.get(state)}
      </Text>
    ))
    .reduce((prev, curr) => [prev, <Text> → </Text>, curr]);

  return (
    <Box>
      <strong>State:</strong>
      <HStack>{joinedPlanningStates}</HStack>
    </Box>
  );
};

export default DistributionStateProgressBar;
