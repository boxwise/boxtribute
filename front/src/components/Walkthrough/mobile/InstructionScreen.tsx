import { useRef } from "react";
import { Box, Button, Flex, Image, Progress, Text } from "@chakra-ui/react";
import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { useMobileWalkthrough } from "./MobileWalkthroughContext";
import { useVisibleSlides } from "./useVisibleSlides";

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

function InstructionScreen() {
  const { step, slideIndex, goToSlide, closeWalkthrough, finishTour } = useMobileWalkthrough();

  const slides = useVisibleSlides();
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
          id="mobile-walkthrough-skip"
          variant="ghost"
          size="md"
          onClick={closeWalkthrough}
          data-testid="mobile-walkthrough-skip"
        >
          Skip
        </Button>
      </Flex>

      {/* Scrollable body */}
      <Box flex={1} overflowY="auto" px={4} pb={4}>
        <Image boxShadow="base" border="1px solid #F4F4F4" src={slide.imageSrc} alt={slide.title} />

        <Text fontWeight="bold" fontSize="xl" textAlign="center" mt={6} mb={3}>
          {slide.title}
        </Text>

        <Text textAlign="center" color="gray.700" lineHeight="tall">
          {slide.text}
        </Text>
      </Box>

      <Progress
        value={progress}
        size="md"
        colorScheme="green"
        borderRadius="0"
        mx={4}
        mt={4}
        mb={2}
      />

      <Flex px={4} pb={8} pt={2} justifyContent="space-between">
        <Button
          id={`mobile-walkthrough-prev-on-${slideIndex}`}
          leftIcon={<ArrowBackIcon boxSize={6} />}
          colorScheme="blue"
          onClick={prev}
          isDisabled={isFirst}
          aria-label="Previous slide"
          data-testid="mobile-walkthrough-prev"
          px={6}
        />
        <Button
          id={`mobile-walkthrough-next-on-${slideIndex}`}
          rightIcon={<ArrowForwardIcon boxSize={6} />}
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

export default InstructionScreen;
