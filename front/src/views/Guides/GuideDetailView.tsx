import {
  Badge,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Circle,
  Divider,
  Flex,
  HStack,
  Text,
  useMediaQuery,
  VStack,
} from "@chakra-ui/react";
import { CheckIcon, ChevronRightIcon, TimeIcon } from "@chakra-ui/icons";
import { useEffect, useRef, useState } from "react";
import { Link as RouterLink, Navigate, useParams } from "react-router-dom";
import { GUIDES } from "./guidesData";
import {
  trackGuideAbandoned,
  trackGuideCompleted,
  trackGuideStarted,
  trackGuideStepViewed,
} from "./guideAnalytics";
import { DESKTOP_OR_TABLET_SCREEN_MEDIA_QUERY } from "components/HeaderMenu/consts";

function StepScreenMock({
  title,
  description,
  fields,
  note,
  tags,
}: {
  title: string;
  description: string;
  fields?: { label: string; value?: string; highlight?: boolean }[];
  note?: string;
  tags?: string[];
}) {
  return (
    <Box
      bg="brandBlue.300"
      borderRadius="md"
      p={4}
      color="white"
      fontSize="sm"
      minH="220px"
      w="full"
    >
      <Flex justify="space-between" align="center" mb={3}>
        <Text fontWeight="bold" fontSize="xs" textTransform="uppercase" letterSpacing="wide">
          {title}
        </Text>
        <Box w={3} h={3} borderRadius="full" bg="whiteAlpha.400" />
      </Flex>

      <Box bg="whiteAlpha.100" borderRadius="sm" p={3} mb={3}>
        <Text fontSize="xs" color="whiteAlpha.700" mb={2}>
          {description}
        </Text>
        {fields?.map((f) => (
          <Box key={f.label} mb={2}>
            <Text fontSize="xs" color="whiteAlpha.600" mb={0.5}>
              {f.label.toUpperCase()}
            </Text>
            <Box
              bg={f.highlight ? "brandYellow.200" : "whiteAlpha.200"}
              color={f.highlight ? "brandBlue.300" : "white"}
              borderRadius="sm"
              px={2}
              py={0.5}
              display="inline-block"
              fontSize="xs"
              fontWeight={f.highlight ? "bold" : "normal"}
            >
              {f.value}
            </Box>
          </Box>
        ))}
        {tags && (
          <HStack flexWrap="wrap" spacing={1} mt={1}>
            {tags.map((t) => (
              <Badge key={t} bg="brandRed.300" color="white" fontSize="xs" borderRadius="sm">
                {t}
              </Badge>
            ))}
          </HStack>
        )}
      </Box>

      {note && (
        <Box bg="brandBlue.200" borderRadius="sm" p={2}>
          <Text fontSize="xs" color="white">
            • {note}
          </Text>
        </Box>
      )}
    </Box>
  );
}

export default function GuideDetailView() {
  const { baseId, guideSlug } = useParams<{ baseId: string; guideSlug: string }>();
  const [isDesktop] = useMediaQuery(DESKTOP_OR_TABLET_SCREEN_MEDIA_QUERY);
  const device = isDesktop ? "desktop" : "mobile";

  const guide = GUIDES.find((g) => g.slug === guideSlug);

  const [currentStep, setCurrentStep] = useState(0);
  const hasTrackedStart = useRef(false);
  const hasTrackedStep = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!guide) return;
    if (!hasTrackedStart.current) {
      hasTrackedStart.current = true;
      trackGuideStarted(guide.slug, device);
    }
  }, [guide, device]);

  useEffect(() => {
    if (!guide) return;
    if (!hasTrackedStep.current.has(currentStep)) {
      hasTrackedStep.current.add(currentStep);
      trackGuideStepViewed(guide.slug, currentStep + 1, guide.steps.length, device);
    }
  }, [currentStep, guide, device]);

  useEffect(() => {
    if (!guide) return;
    const handleBeforeUnload = () => {
      if (currentStep < guide.steps.length - 1) {
        trackGuideAbandoned(guide.slug, currentStep + 1, guide.steps.length, device);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [guide, currentStep, device]);

  if (!guide) {
    return <Navigate to={`/bases/${baseId}/guides`} replace />;
  }

  const step = guide.steps[currentStep];
  const isLastStep = currentStep === guide.steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      trackGuideCompleted(guide.slug, device);
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const guidesPath = `/bases/${baseId}/guides`;
  const otherGuides = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 3);

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
        }
      `}</style>

      <Box maxW="1100px" mx="auto" px={{ base: 4, md: 8 }} py={4}>
        <Flex justify="space-between" align="center" mb={4} className="no-print">
          <Breadcrumb separator={<ChevronRightIcon color="gray.400" />} fontSize="sm">
            <BreadcrumbItem>
              <BreadcrumbLink as={RouterLink} to={guidesPath} color="gray.500">
                Guide
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink color="gray.500">{guide.category}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink color="gray.700" fontWeight="semibold">
                {guide.title}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportPDF}
            data-heap-event="guide-export-pdf"
            data-heap-guide={guide.slug}
            className="no-print"
          >
            Export PDF
          </Button>
        </Flex>

        <HStack spacing={3} mb={4} flexWrap="wrap">
          <HStack spacing={1}>
            <Box w={2} h={2} borderRadius="full" bg="brandGreen" />
            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wide">
              Live Feature
            </Text>
          </HStack>
          <Text
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
            letterSpacing="wide"
            color="gray.500"
          >
            {guide.category}
          </Text>
          <HStack spacing={1} color="brandBlue.200" fontSize="xs">
            <TimeIcon boxSize={3} />
            <Text fontWeight="bold" textTransform="uppercase" letterSpacing="wide">
              ≈ {guide.estimatedMinutes} min to set up
            </Text>
          </HStack>
        </HStack>

        <Text
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight="bold"
          color="brandBlue.300"
          mb={4}
          lineHeight="short"
        >
          {guide.subtitle}
        </Text>

        <Box
          borderLeft="3px solid"
          borderColor="brandRed.300"
          pl={4}
          py={2}
          mb={6}
          bg="red.50"
          borderRadius="0 4px 4px 0"
        >
          <Text
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
            letterSpacing="wide"
            color="brandRed.300"
            mb={1}
          >
            The requirement — in your words
          </Text>
          <Text fontSize="sm" color="gray.700" fontStyle="italic">
            {guide.requirement}
          </Text>
        </Box>

        {isDesktop ? (
          <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="lg" p={6} mb={6}>
            <Flex justify="space-between" align="center" mb={4}>
              <Text fontWeight="bold" fontSize="md">
                How you do it in Boxtribute
              </Text>
              <Text fontSize="xs" color="gray.400">
                Tap a step to see the screen
              </Text>
            </Flex>

            <Flex gap={6}>
              <VStack align="flex-start" spacing={0} flex="1" minW="0">
                {guide.steps.map((s, i) => (
                  <Box key={i} w="full">
                    <HStack
                      spacing={3}
                      p={3}
                      borderRadius="md"
                      cursor="pointer"
                      bg={i === currentStep ? "gray.50" : "transparent"}
                      _hover={{ bg: "gray.50" }}
                      onClick={() => setCurrentStep(i)}
                      data-heap-event="guide-step-click"
                      data-heap-guide={guide.slug}
                      data-heap-step={i + 1}
                    >
                      <Circle
                        size={7}
                        bg={
                          i < currentStep
                            ? "brandGreen"
                            : i === currentStep
                              ? "brandBlue.300"
                              : "gray.200"
                        }
                        color={i <= currentStep ? "white" : "gray.600"}
                        fontSize="xs"
                        fontWeight="bold"
                        flexShrink={0}
                      >
                        {i < currentStep ? <CheckIcon boxSize={3} /> : i + 1}
                      </Circle>
                      <Box flex={1} minW={0}>
                        <Text fontWeight={i === currentStep ? "bold" : "medium"} fontSize="sm">
                          {s.title}
                        </Text>
                        {i === currentStep && (
                          <Text fontSize="xs" color="gray.500" mt={0.5}>
                            {s.description}
                          </Text>
                        )}
                        {s.optional && (
                          <Badge fontSize="xs" colorScheme="gray" mt={0.5}>
                            Optional
                          </Badge>
                        )}
                      </Box>
                    </HStack>
                    {i < guide.steps.length - 1 && (
                      <Box ml={6} pl={1} borderLeft="2px solid" borderColor="gray.100" h={3} />
                    )}
                  </Box>
                ))}
              </VStack>

              <Box flex="1" minW="0">
                <StepScreenMock
                  title={step.screenTitle}
                  description={step.screenDescription}
                  fields={step.screenFields}
                  note={step.screenNote}
                  tags={step.tags}
                />
              </Box>
            </Flex>
          </Box>
        ) : (
          <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="lg" p={4} mb={6}>
            <Text fontWeight="bold" fontSize="md" mb={3}>
              How you do it in Boxtribute
            </Text>

            <StepScreenMock
              title={step.screenTitle}
              description={step.screenDescription}
              fields={step.screenFields}
              note={step.screenNote}
              tags={step.tags}
            />

            <Text fontWeight="bold" fontSize="sm" mt={4} mb={1}>
              {currentStep + 1}. {step.title}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {step.description}
            </Text>
            {step.optional && (
              <Badge fontSize="xs" colorScheme="gray" mt={1}>
                Optional
              </Badge>
            )}
          </Box>
        )}

        <Flex justify="space-between" align="center" mb={6} className="no-print">
          <Button
            onClick={handlePrev}
            isDisabled={currentStep === 0}
            variant="outline"
            size="sm"
            data-heap-event="guide-prev-step"
            data-heap-guide={guide.slug}
            data-heap-step={currentStep + 1}
          >
            ← Prev
          </Button>

          {!isDesktop && (
            <HStack spacing={2}>
              {guide.steps.map((_, i) => (
                <Circle
                  key={i}
                  size={6}
                  bg={
                    i < currentStep
                      ? "brandGreen"
                      : i === currentStep
                        ? "brandBlue.300"
                        : "gray.200"
                  }
                  color={i <= currentStep ? "white" : "gray.600"}
                  fontSize="xs"
                  fontWeight="bold"
                  cursor="pointer"
                  onClick={() => setCurrentStep(i)}
                >
                  {i < currentStep ? <CheckIcon boxSize={2.5} /> : i + 1}
                </Circle>
              ))}
            </HStack>
          )}

          <Button
            onClick={handleNext}
            bg="brandBlue.300"
            color="white"
            size="sm"
            _hover={{ bg: "brandBlue.200" }}
            data-heap-event={isLastStep ? "guide-finish" : "guide-next-step"}
            data-heap-guide={guide.slug}
            data-heap-step={currentStep + 1}
          >
            {isLastStep ? "Finish ✓" : "Next →"}
          </Button>
        </Flex>

        {isLastStep && (
          <Flex
            align="center"
            justify="flex-end"
            gap={3}
            mb={6}
            p={3}
            bg="green.50"
            borderRadius="md"
            className="no-print"
          >
            <Divider flex={1} borderColor="green.300" />
            <Text fontSize="sm" color="green.700" fontWeight="semibold">
              You have reached the end of this Guide
            </Text>
            <Circle size={6} bg="brandGreen" color="white">
              <CheckIcon boxSize={3} />
            </Circle>
          </Flex>
        )}

        <Flex gap={6} flexDir={{ base: "column", md: "row" }}>
          <Box
            flex={1}
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="lg"
            p={4}
          >
            <Text
              fontSize="xs"
              fontWeight="bold"
              textTransform="uppercase"
              letterSpacing="wide"
              color="gray.500"
              mb={3}
            >
              The Feature Underneath
            </Text>
            <HStack flexWrap="wrap" spacing={2} mb={3}>
              {guide.featureUnderneathTags.map((tag) => (
                <Badge key={tag} bg="gray.100" color="gray.700" px={2} py={0.5} borderRadius="sm">
                  {tag}
                </Badge>
              ))}
              {guide.featureUnderneathTags.length > 1 && (
                <Text color="gray.400" fontWeight="bold">
                  +
                </Text>
              )}
            </HStack>
            <Text fontSize="sm" color="gray.600" mb={2}>
              {guide.featureUnderneathDescription}
            </Text>
            <Text fontSize="sm" color="brandRed.300" fontWeight="semibold">
              {guide.featureUnderneathLink}
            </Text>
          </Box>

          <Box
            flex={1}
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="lg"
            p={4}
          >
            <Text
              fontSize="xs"
              fontWeight="bold"
              textTransform="uppercase"
              letterSpacing="wide"
              color="gray.500"
              mb={3}
            >
              More in {guide.category}
            </Text>
            <VStack align="stretch" spacing={3} divider={<Divider />}>
              {otherGuides.map((og) => (
                <Flex
                  key={og.slug}
                  as={RouterLink}
                  to={`/bases/${baseId}/guides/${og.slug}`}
                  justify="space-between"
                  align="center"
                  _hover={{ textDecoration: "none" }}
                  data-heap-event="guide-related-click"
                  data-heap-guide={og.slug}
                >
                  <Text fontSize="sm" color="gray.700" flex={1}>
                    {og.title}
                  </Text>
                  <HStack spacing={2} flexShrink={0} ml={2}>
                    <Badge
                      colorScheme={og.status === "live" ? "green" : "yellow"}
                      fontSize="xs"
                      textTransform="uppercase"
                    >
                      {og.status}
                    </Badge>
                    <Text fontSize="xs" color="gray.400">
                      {og.feature}
                    </Text>
                  </HStack>
                </Flex>
              ))}
            </VStack>
          </Box>
        </Flex>

        <Text textAlign="center" fontSize="xs" color="gray.400" mt={8} mb={4}>
          Boxtribute · Guide · Step {currentStep + 1} of {guide.steps.length}
        </Text>
      </Box>
    </>
  );
}
