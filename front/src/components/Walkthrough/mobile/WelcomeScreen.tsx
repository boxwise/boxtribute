import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import BoxtributeLogo from "components/HeaderMenu/BoxtributeLogo";
import { organisationAtom } from "stores/globalPreferenceStore";
import { useMobileWalkthrough } from "./MobileWalkthroughContext";

function WelcomeScreen() {
  const { step, startTour, closeWalkthrough } = useMobileWalkthrough();
  const organisation = useAtomValue(organisationAtom);
  const orgName = organisation?.name ?? "your organisation";

  if (step !== "welcome") return null;

  return (
    <Box
      position="fixed"
      inset={0}
      bg="white"
      zIndex={9999}
      display="flex"
      flexDirection="column"
      alignItems="center"
      px={8}
      pt={16}
      pb={10}
    >
      {/* Logo */}
      <BoxtributeLogo maxH="5rem" mb={12} />

      {/* Title */}
      <Text fontSize="2xl" fontWeight="bold" textAlign="center" mb={4}>
        Welcome to Boxtribute!
      </Text>

      {/* Body */}
      <Text textAlign="center" color="gray.700" lineHeight="tall">
        You&apos;re now part of {orgName}&apos;s workspace. Let&apos;s take a quick tour so you know
        where everything is. It takes less than a minute!
      </Text>

      {/* Spacer */}
      <Flex flex={1} />

      {/* Actions */}
      <Button
        w="full"
        colorScheme="blue"
        size="lg"
        onClick={startTour}
        mb={4}
        data-testid="mobile-walkthrough-start"
      >
        Start
      </Button>
      <Button
        w="full"
        variant="ghost"
        size="lg"
        bg="gray.200"
        onClick={closeWalkthrough}
        data-testid="mobile-walkthrough-skip-welcome"
      >
        Skip walkthrough
      </Button>
    </Box>
  );
}

export default WelcomeScreen;
