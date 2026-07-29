import { Box, Link, Text } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";
import { useWalkthrough } from "./WalkthroughContext";
import { PATHS } from "./TourOverlay";

const PATH_LABELS: Record<string, string> = {
  path1: `Path 1 – Stock management`,
  path2: `Path 2 – Beneficiary & distribution management`,
  path3: `Path 3 – Coordinator overview`,
};

// In-tour fixed top-left path indicator + guidance link.
function PathIndicator() {
  const { isWalkthroughActive, currentStep, activePath } = useWalkthrough();
  const baseId = useAtomValue(selectedBaseIdAtom);

  if (!isWalkthroughActive || currentStep !== "tour" || !activePath) return null;

  const dest = `/bases/${baseId}/guides/${PATHS[activePath].guidanceUrl}`;

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
      <Text fontSize="md" fontWeight="semibold">
        {PATH_LABELS[activePath] ?? activePath}
      </Text>
      {PATHS[activePath].guidanceUrl && (
        <Link href={dest} fontSize="xs" color="blue.500">
          Get more guidance on this topic &rsaquo;
        </Link>
      )}
    </Box>
  );
}

export default PathIndicator;
