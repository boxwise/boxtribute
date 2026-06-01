import { Box, Button } from "@chakra-ui/react";
import { useWalkthrough } from "./WalkthroughContext";

function SkipButton() {
  const { isWalkthroughActive, currentStep, closeWalkthrough } = useWalkthrough();

  // Show when tour is active but not during modals (which have their own close button)
  if (!isWalkthroughActive || currentStep !== "tour") return null;

  return (
    <Box position="fixed" top={4} right={4} zIndex={10001}>
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
