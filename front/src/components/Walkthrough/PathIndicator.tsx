import { Box, Text } from "@chakra-ui/react";
import { useWalkthrough } from "./WalkthroughContext";
import path1 from "./paths/path1";
import path2 from "./paths/path2";
import path3 from "./paths/path3";

const PATH_LABELS: Record<string, string> = {
  path1: `Path 1 – ${path1.title}`,
  path2: `Path 2 – ${path2.title}`,
  path3: `Path 3 – ${path3.title}`,
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
