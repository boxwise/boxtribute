import { Box, HStack, Link, Text } from "@chakra-ui/react";
import React from "react";
import { DistributionEventState } from "types/generated/graphql";

enum SimplifiedDistributionEventState {
  Planning = "Planning",
  Packing = "Packing",
  OnDistro = "OnDistro",
  Returned = "Returned",
}

export const simplifiedDistroEventStateOrder = [
  SimplifiedDistributionEventState.Planning,
  // DistributionEventState.PlanningDone,
  SimplifiedDistributionEventState.Packing,
  // DistributionEventState.PackingDone,
  SimplifiedDistributionEventState.OnDistro,
  SimplifiedDistributionEventState.Returned,
];
const mapRealStatesToSimplifiedStates = (state: DistributionEventState) => {
  switch (state) {
    case DistributionEventState.Planning:
      return SimplifiedDistributionEventState.Planning;
    case DistributionEventState.Packing:
      return SimplifiedDistributionEventState.Packing;
    case DistributionEventState.OnDistro:
      return SimplifiedDistributionEventState.OnDistro;
    case DistributionEventState.ReturnedFromDistribution:
    case DistributionEventState.ReturnTrackingInProgress:
    case DistributionEventState.Completed:
      return SimplifiedDistributionEventState.Returned;
  }
};

export const resolveSimplifiedDistroEventStateHumanReadableLabelsAndDistroEventState = (state: SimplifiedDistributionEventState): {
  label: string;
  distributionEventState: DistributionEventState;
} =>
  {
    switch(state) {
      case SimplifiedDistributionEventState.Planning:
        return {
          label: "Planning",
          distributionEventState: DistributionEventState.Planning,
        };
      case SimplifiedDistributionEventState.Packing:
        return {
          label: "Packing",
          distributionEventState: DistributionEventState.Packing,
        }
      case SimplifiedDistributionEventState.OnDistro:
        return {
          label: "On Distribution",
          distributionEventState: DistributionEventState.OnDistro,
        }
      case SimplifiedDistributionEventState.Returned:
        return {
          label: "Returned",
          distributionEventState: DistributionEventState.ReturnedFromDistribution,
        }
    }
  }

const DistributionStateProgressBar = ({
  activeState,
  onMoveToStage,
}: {
  activeState: DistributionEventState;
  onMoveToStage: (state: DistributionEventState) => void;
}) => {
  const simplifiedActiveState = mapRealStatesToSimplifiedStates(activeState);

  const joinedPlanningStates =
    simplifiedDistroEventStateOrder.map<React.ReactNode>((state, i) => {
      const isActiveState = state === simplifiedActiveState;
      const humanReadbaleStateAndDistroEventState = resolveSimplifiedDistroEventStateHumanReadableLabelsAndDistroEventState(state);
      if (isActiveState) {
        return (
          <Text key={state} color="black" fontSize="md" as="u">
            {i + 1}. {humanReadbaleStateAndDistroEventState.label}
          </Text>
        );
      } else {
        const text = (
          <Text key={state} color="gray" fontSize="sm">
            {i + 1}. {humanReadbaleStateAndDistroEventState.label}
          </Text>
        );
        return simplifiedActiveState !== SimplifiedDistributionEventState.Returned ? (
          <Link key={state} onClick={() => onMoveToStage(humanReadbaleStateAndDistroEventState.distributionEventState)}>
            {text}
          </Link>
        ) : (
          text
        );
      }
    });
  // .reduce((prev, curr) => [prev, <Text color="gray" fontSize='xs'> → </Text>, curr]);

  return (
    <Box>
      {/* <strong>State:</strong> */}
      <HStack>{joinedPlanningStates}</HStack>
    </Box>
  );
};

export default DistributionStateProgressBar;
