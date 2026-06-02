import { Box, Button, Select } from "@chakra-ui/react";
import { useWalkthrough } from "./WalkthroughContext";
import { PATHS } from "./TourOverlay";

function SkipButton() {
  const { isWalkthroughActive, currentStep, closeWalkthrough, startPath } = useWalkthrough();

  // Show when tour is active but not during modals (which have their own close button)
  if (!isWalkthroughActive || currentStep !== "tour") return null;

  const allPaths = Object.values(PATHS);
  return (
    <Box position="fixed" top={4} right={4} zIndex={10001}>
      <Select size="sm" flex={1} value="" onChange={(e) => startPath(e.target.value as PathId)}>
        <option value="" disabled hidden>
          Scenarios
        </option>
        {allPaths.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title}
          </option>
        ))}
      </Select>
      <Button
        bg="black"
        color="white"
        size="sm"
        _hover={{ bg: "gray.800" }}
        onClick={closeWalkthrough}
      >
        Skip walkthrough
      </Button>
    </Box>
  );
}

export default SkipButton;
