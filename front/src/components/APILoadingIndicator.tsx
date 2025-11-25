import { Progress } from "@chakra-ui/react";

function APILoadingIndicator() {
  return (
    <Progress.Root data-testid="loading-indicator" size="md" value={null}>
      <Progress.Track>
        <Progress.Range />
      </Progress.Track>
    </Progress.Root>
  );
}

export default APILoadingIndicator;
