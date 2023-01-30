import { Progress } from "@chakra-ui/react";
import React from "react";

function APILoadingIndicator() {
  return <Progress data-testid="loading-indicator" size="md" isIndeterminate />;
}

export default APILoadingIndicator;
