import { Box, HStack, Link, Text } from "@chakra-ui/react";
import React from "react";
import {
  distroEventStateHumanReadableLabels,
  distroEventStateOrder,
} from "../baseData";
import { DistributionEventState } from "../types";

const DistributionStateProgressBar = ({
  activeState,
  onMoveToStage
}: {
  activeState: DistributionEventState;
  onMoveToStage: (state: DistributionEventState) => void
}) => {
  const joinedPlanningStates = distroEventStateOrder.map<React.ReactNode>(
    (state, i) => {
      const isActiveState = state === activeState;
      if (isActiveState) {
        return (
          <Text key={state} color="black" fontSize="md" as="u">
            {i + 1}. {distroEventStateHumanReadableLabels.get(state)}
          </Text>
        );
      } else {
        const text = <Text key={state} color="gray" fontSize="sm">
        {i + 1}. {distroEventStateHumanReadableLabels.get(state)}
      </Text>;
        return (
          activeState !== DistributionEventState.Completed ? <Link onClick={() => onMoveToStage(state)}>{text}</Link> : text
        );
      }
    }
  );
  // .reduce((prev, curr) => [prev, <Text color="gray" fontSize='xs'> → </Text>, curr]);

  return (
    <Box>
      {/* <strong>State:</strong> */}
      <HStack>{joinedPlanningStates}</HStack>
    </Box>
  );
};

export default DistributionStateProgressBar;
