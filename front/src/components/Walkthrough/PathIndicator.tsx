import { Box, Text } from "@chakra-ui/react";
import { useWalkthrough } from "./WalkthroughContext";

const PATH_LABELS: Record<string, string> = {
  path1: `Path 1 – Stock & box management`,
  path2: `Path 2 – Beneficiary & distribution management`,
  path3: `Path 3 – Coordinator overview`,
};

function PathIndicator() {
  const { isWalkthroughActive, currentStep, activePath } = useWalkthrough();

  if (!isWalkthroughActive || currentStep !== "tour" || !activePath) return null;

  return (
    <Box
      position="fixed"
      top={4}
      left={4}
      zIndex={10001}
      bg="white"
      borderWidth={1}
      borderRadius="md"
      px={3}
      py={1}
      boxShadow="md"
    >
      <Text fontSize="sm" fontWeight="semibold">
        {PATH_LABELS[activePath] ?? activePath}
      </Text>
    </Box>
  );
}

export default PathIndicator;
