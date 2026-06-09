import { Box, Button, Text } from "@chakra-ui/react";
import { useMobileWalkthrough } from "./MobileWalkthroughContext";

function FinalScreen() {
  const { step, closeWalkthrough, replayTour, isCoordinator } = useMobileWalkthrough();

  if (step !== "done") return null;

  return (
    /* Semi-transparent backdrop */
    <Box
      position="fixed"
      inset={0}
      bg="blackAlpha.500"
      zIndex={9999}
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={6}
    >
      {/* Green overlay card */}
      <Box bg="green.100" borderRadius="md" px={6} py={8} w="full" maxW="420px" textAlign="center">
        <Text fontWeight="bold" fontSize="xl" mb={4}>
          You are all set!
        </Text>

        <Text color="gray.700" lineHeight="tall" mb={6}>
          You&apos;ve seen the key parts of Boxtribute on mobile, and you can revisit this tour
          anytime from the <strong>Menu</strong>.{" "}
          {isCoordinator && (
            <>
              <br />
              Managing products, locations, users, and full reports is much easier on desktop, where
              tables and data have the space they need. Head there for the expanded experience!
            </>
          )}
        </Text>

        <Button
          bg="black"
          color="white"
          _hover={{ bg: "gray.800" }}
          w="full"
          mb={3}
          onClick={closeWalkthrough}
          data-testid="mobile-walkthrough-close"
        >
          Close walkthrough
        </Button>

        <Button
          variant="ghost"
          w="full"
          bg="white"
          onClick={replayTour}
          data-testid="mobile-walkthrough-replay"
        >
          Replay
        </Button>
      </Box>
    </Box>
  );
}

export default FinalScreen;
