import { useRef } from "react";
import { Box, Button, Flex, Progress, Text } from "@chakra-ui/react";
import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { useMobileWalkthrough } from "./MobileWalkthroughContext";
import slides from "./slides";

/** Returns touch-event handlers for left/right swipe detection. */
function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const startX = useRef<number | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (startX.current === null) return;
    const diff = startX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) onSwipeLeft();
      else onSwipeRight();
    }
    startX.current = null;
  }

  return { onTouchStart, onTouchEnd };
}

/** Placeholder image with a vignette (shade at borders) when no imageSrc is provided. */
function SlidePlaceholderImage({ src }: { src?: string }) {
  return (
    <Box
      borderRadius="xl"
      overflow="hidden"
      position="relative"
      w="full"
      h={56}
      bg={src ? "transparent" : "gray.300"}
    >
      {src ? (
        <Box as="img" src={src} w="full" h="full" objectFit="cover" />
      ) : (
        // Dummy grey box — real screenshots to be supplied later
        <Box w="full" h="full" bg="gray.300" />
      )}
      {/* Vignette overlay */}
      <Box
        position="absolute"
        inset={0}
        style={{
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.18) 100%)",
          pointerEvents: "none",
        }}
      />
    </Box>
  );
}

function MobileInstructionScreen() {
  const { step, slideIndex, goToSlide, closeWalkthrough, finishTour } = useMobileWalkthrough();

  const total = slides.length;
  const slide = slides[slideIndex];
  const isFirst = slideIndex === 0;
  const isLast = slideIndex === total - 1;
  const progress = ((slideIndex + 1) / total) * 100;

  function next() {
    if (isLast) {
      finishTour();
    } else {
      goToSlide(slideIndex + 1);
    }
  }

  function prev() {
    if (!isFirst) goToSlide(slideIndex - 1);
  }

  const swipe = useSwipe(next, prev);

  if (step !== "instruction") return null;

  return (
    <Box
      position="fixed"
      inset={0}
      bg="white"
      zIndex={9999}
      display="flex"
      flexDirection="column"
      {...swipe}
    >
      {/* Skip button top-right */}
      <Flex justifyContent="flex-end" px={4} pt={4} pb={2}>
        <Button
          variant="ghost"
          size="sm"
          onClick={closeWalkthrough}
          data-testid="mobile-walkthrough-skip"
        >
          Skip
        </Button>
      </Flex>

      {/* Scrollable body */}
      <Box flex={1} overflowY="auto" px={4} pb={4}>
        <SlidePlaceholderImage src={slide.imageSrc} />

        <Text fontWeight="bold" fontSize="xl" textAlign="center" mt={6} mb={3}>
          {slide.title}
        </Text>

        <Text textAlign="center" color="gray.700" lineHeight="tall">
          {slide.text}
        </Text>

        {/* Progress bar */}
        <Progress
          value={progress}
          size="sm"
          colorScheme="green"
          borderRadius="full"
          mt={6}
          mb={2}
        />
      </Box>

      {/* Navigation buttons — always at the bottom */}
      <Flex px={4} pb={8} pt={2} justifyContent="space-between">
        <Button
          leftIcon={<ArrowBackIcon />}
          bg={isFirst ? "gray.300" : "blue.300"}
          color="white"
          _hover={{ bg: isFirst ? "gray.300" : "blue.400" }}
          onClick={prev}
          isDisabled={isFirst}
          aria-label="Previous slide"
          data-testid="mobile-walkthrough-prev"
          px={6}
        />
        <Button
          rightIcon={<ArrowForwardIcon />}
          colorScheme="blue"
          onClick={next}
          aria-label={isLast ? "Finish" : "Next slide"}
          data-testid="mobile-walkthrough-next"
          px={6}
        />
      </Flex>
    </Box>
  );
}

export default MobileInstructionScreen;
