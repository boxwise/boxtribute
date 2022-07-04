import { Box } from "@chakra-ui/react";
import React from "react";
import { distroEventStateLabel } from "../helpers";

const DistributionStateProgressBar = () => {
    return (
      <Box>
        <strong>State:</strong>
        {DistroEventStateOrder.map((state) => {
          distroEventStateLabel.get(distroEventDetails.state);
        })}
      </Box>
    );
};

export default DistributionStateProgressBar;
