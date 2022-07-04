import { Box, HStack } from "@chakra-ui/react";
import React from "react";
import { distroEventStateHumanReadableLabels, distroEventStateOrder } from "../baseData";

const DistributionStateProgressBar = () => {
  return (
    <Box>
      <strong>State:</strong>
      <HStack>
        {distroEventStateOrder.map((state) =>
          distroEventStateHumanReadableLabels.get(state)
        )}
      </HStack>
    </Box>
  );
};

export default DistributionStateProgressBar;
