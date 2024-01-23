import { Progress } from "@chakra-ui/react";

function APILoadingIndicator() {
  return <Progress data-testid="loading-indicator" size="md" isIndeterminate />;
}

export default APILoadingIndicator;
