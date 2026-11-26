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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Tag,
  TagLabel,
  TagLeftIcon,
  Text,
  useDisclosure,
  useMediaQuery,
  VStack,
} from "@chakra-ui/react";
import { CheckIcon, ChevronRightIcon, TimeIcon } from "@chakra-ui/icons";
import { useState } from "react";
import ReactMarkdownBase from "react-markdown";
import rehypeRaw from "rehype-raw";
import { Link as RouterLink, Navigate, useParams } from "react-router-dom";
import { GUIDES } from "./guidesData";
import type { GuideReference } from "./guidesData";
import { DESKTOP_OR_TABLET_SCREEN_MEDIA_QUERY } from "components/HeaderMenu/consts";

// Type cast needed due to peer @types/react version mismatch with react-markdown
const ReactMarkdown = ReactMarkdownBase as unknown as React.FC<{
  children: string;
  rehypePlugins?: unknown[];
}>;

function StepContent({
  picture,
  alt,
  markdown,
  note,
}: {
  picture?: string;
  alt?: string;
  markdown?: string;
  note?: string;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <VStack spacing={0} w="full" overflow="hidden" border="1px solid" borderColor="gray.200">
        {picture && (
          <Box
            as="img"
            src={picture}
            alt={alt ?? ""}
            w="full"
            display="block"
            cursor="zoom-in"
            role="button"
            tabIndex={0}
            aria-label="Enlarge image"
            onClick={onOpen}
            title="Click to enlarge"
          />
        )}

        {markdown && (
          <Box
            w="full"
            bg="white"
            px={4}
            py={3}
            fontSize="sm"
            color="gray.700"
            overflowX="auto"
            sx={{
              p: { marginBottom: "0.5rem" },
              "ul, ol": { paddingLeft: "1.25rem", marginBottom: "0.5rem" },
              li: { marginBottom: "0.25rem" },
              table: { width: "100%", borderCollapse: "collapse" },
              "th, td": {
                border: "1px solid",
                borderColor: "var(--chakra-colors-gray-200)",
                px: 3,
                py: 2,
                textAlign: "left",
              },
              th: {
                bg: "var(--chakra-colors-gray-50)",
                fontWeight: "semibold",
                fontSize: "xs",
                color: "var(--chakra-colors-gray-600)",
              },
              mark: {
                backgroundColor: "var(--chakra-colors-brandYellow-100)",
                color: "var(--chakra-colors-brandBlue-300)",
                borderRadius: "2px",
                padding: "0 3px",
              },
            }}
          >
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>{markdown}</ReactMarkdown>
          </Box>
        )}

        {note && (
          <Box bg="brandBlue.300" w="full" px={4} py={3} color="white" fontSize="xs">
            <Text>{note}</Text>
          </Box>
        )}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered>
        <ModalOverlay bg="blackAlpha.900" />
        <ModalContent bg="transparent" boxShadow="none" onClick={onClose}>
          <ModalCloseButton
            color="white"
            size="lg"
            zIndex={10}
            onClick={(e) => e.stopPropagation()}
          />
          <ModalBody
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={4}
            overflow="auto"
          >
            <Box
              as="img"
              src={picture}
              alt={alt ?? ""}
              maxW="100%"
              maxH="90vh"
              objectFit="contain"
              borderRadius="md"
              onClick={onClose}
              sx={{
                touchAction: "pinch-zoom",
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

function ReferenceSection({
  isDesktop,
  reference,
}: {
  isDesktop: boolean;
  reference: GuideReference;
}) {
  const content = isDesktop
    ? reference.markdown
    : reference.mobileContent !== undefined
      ? reference.mobileContent
      : reference.markdown;
  return (
    <Box
      bg="white"
      boxShadow="md"
      border="1px solid"
      borderColor="gray.200"
      p={6}
      mb={6}
      overflowX="auto"
    >
      <Text
        fontSize="xs"
        fontWeight="bold"
        textTransform="uppercase"
        letterSpacing="wide"
        color="gray.500"
        mb={2}
      >
        Reference
      </Text>
      <Text fontWeight="bold" fontSize="md" mb={4}>
        {reference.title}
      </Text>
      <Box
        fontSize="sm"
        color="gray.700"
        overflowX="auto"
        sx={{
          table: { width: "100%", borderCollapse: "collapse" },
          "th, td": {
            border: "1px solid",
            borderColor: "var(--chakra-colors-gray-200)",
            px: 3,
            py: 2,
            textAlign: "left",
          },
          th: {
            bg: "var(--chakra-colors-gray-50)",
            fontWeight: "semibold",
            fontSize: "xs",
            color: "var(--chakra-colors-gray-600)",
          },
          "td:not(:first-of-type)": { textAlign: "center" },
          "tr:hover td": { bg: "var(--chakra-colors-gray-50)" },
          "details.role-accordion": {
            border: "1px solid",
            borderColor: "var(--chakra-colors-gray-200)",
            mb: 2,
            overflow: "hidden",
          },
          "details.role-accordion > summary.role-accordion__summary": {
            listStyle: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 4,
            py: 3,
            cursor: "pointer",
            userSelect: "none",
            _hover: { bg: "var(--chakra-colors-gray-50)" },
          },
          // Remove default marker in all browsers
          "details.role-accordion > summary::-webkit-details-marker": { display: "none" },
          // Chevron via pseudo-element — down when closed, up when open
          "details.role-accordion > summary.role-accordion__summary::after": {
            content: '"\\203A"', // ›
            display: "inline-block",
            transform: "rotate(90deg)",
            transition: "transform 0.2s",
            fontSize: "lg",
            color: "var(--chakra-colors-gray-500)",
            flexShrink: 0,
          },
          "details.role-accordion[open] > summary.role-accordion__summary::after": {
            transform: "rotate(-90deg)",
          },
          ".role-accordion__header": {
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          },
          ".role-accordion__header strong": {
            fontSize: "sm",
            fontWeight: "bold",
            color: "var(--chakra-colors-gray-800)",
          },
          ".role-accordion__subtitle": {
            fontSize: "xs",
            color: "var(--chakra-colors-gray-500)",
          },
          "ul.role-accordion__list": {
            listStyle: "none",
            px: 4,
            py: 3,
            borderTop: "1px solid",
            borderColor: "var(--chakra-colors-gray-100)",
            m: 0,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          },
          "ul.role-accordion__list li": {
            fontSize: "sm",
            display: "flex",
            alignItems: "center",
            gap: 2,
          },
          "ul.role-accordion__list li.role-yes::before": {
            content: '"✓"',
            color: "var(--chakra-colors-green-500)",
            fontWeight: "bold",
            flexShrink: 0,
          },
          "ul.role-accordion__list li.role-no::before": {
            content: '"✗"',
            color: "var(--chakra-colors-red-400)",
            flexShrink: 0,
          },
        }}
      >
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
      </Box>
    </Box>
  );
}

export default function GuideDetailView() {
  const { baseId, guideSlug } = useParams<{ baseId: string; guideSlug: string }>();
  const [isDesktop] = useMediaQuery(DESKTOP_OR_TABLET_SCREEN_MEDIA_QUERY);

  const [prevGuideSlug, setPrevGuideSlug] = useState(guideSlug);
  const guide = GUIDES.find((g) => g.slug === guideSlug);

  const [currentStep, setCurrentStep] = useState(0);

  // Synchronously reset step when guideSlug changes during rendering
  if (prevGuideSlug !== guideSlug) {
    setPrevGuideSlug(guideSlug);
    setCurrentStep(0);
  }

  if (!guide) {
    return <Navigate to={`/bases/${baseId}/guides`} replace />;
  }

  // Guard against the above useEffect not having fired yet
  const safeCurrentStep = currentStep < guide.steps.length ? currentStep : 0;
  const step = guide.steps[safeCurrentStep];
  const isLastStep = safeCurrentStep === guide.steps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleDownloadPDF = () => {
    window.open(
      `https://boxtribute.org/uploads/guide-${guide.slug}.pdf`,
      "_blank",
      "noopener,noreferrer",
    );
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
              <BreadcrumbLink
                id={`guide-abandon-${guide.slug}-step${currentStep + 1}`}
                as={RouterLink}
                to={guidesPath}
                color="gray.500"
              >
                Guide
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink color="gray.700" fontWeight="semibold">
                {guide.title}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <Button
            id={`guide-export-pdf-${guide.slug}-desktop`}
            display={{ base: "none", md: "flex" }}
            size="sm"
            variant="outline"
            onClick={handleDownloadPDF}
            className="no-print"
          >
            Export PDF
          </Button>
        </Flex>

        <HStack spacing={3} mb={4} flexWrap="wrap">
          {guide.features.map((feature) => (
            <Text
              key={feature}
              fontSize="xs"
              fontWeight="bold"
              textTransform="uppercase"
              letterSpacing="wide"
              color="gray.500"
            >
              {feature}
            </Text>
          ))}
          <Tag variant="subtle" colorScheme={"brandBlue"} fontSize="xs">
            <TagLeftIcon boxSize={3} as={TimeIcon} />
            <TagLabel fontWeight="bold" textTransform="uppercase" letterSpacing="wide">
              {guide.estimatedMinutes} min to set up
            </TagLabel>
          </Tag>
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

        <Box borderLeft="3px solid" borderColor="brandRed.300" pl={4} py={2} mb={6} bg="red.50">
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
          <Text fontSize="sm" color="gray.700" mr={2} fontStyle="italic">
            {guide.requirement}
          </Text>
        </Box>

        {/* Mobile-only progress circles below nav */}
        {!isDesktop && (
          <Flex justify="center" mb={6} className="no-print">
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
          </Flex>
        )}

        {isDesktop ? (
          <Box bg="white" boxShadow="md" border="1px solid" borderColor="gray.200" p={6} mb={6}>
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
                      id={`guide-step-click-${guide.slug}-step${i + 1}`}
                      spacing={3}
                      p={3}
                      cursor="pointer"
                      bg={i === currentStep ? "gray.50" : "transparent"}
                      _hover={{ bg: "gray.50" }}
                      onClick={() => setCurrentStep(i)}
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
                        <HStack spacing={2}>
                          <Text fontWeight={i === currentStep ? "bold" : "medium"} fontSize="sm">
                            {s.title}
                          </Text>
                          {s.optional && (
                            <Badge fontSize="xs" colorScheme="gray" variant="subtle">
                              Optional
                            </Badge>
                          )}
                        </HStack>
                        {i === currentStep && (
                          <Text fontSize="xs" color="gray.500" mt={0.5}>
                            {s.description}
                          </Text>
                        )}
                      </Box>
                    </HStack>
                    {i < guide.steps.length - 1 && (
                      <Box ml={6} pl={1} borderLeft="2px solid" borderColor="gray.100" h={3} />
                    )}
                  </Box>
                ))}
              </VStack>

              <Box flex="2" minW="0">
                <StepContent
                  picture={step.picture}
                  alt={step.alt}
                  markdown={step.markdown}
                  note={step.note}
                />
              </Box>
            </Flex>
          </Box>
        ) : (
          <Box bg="white" border="1px solid" borderColor="gray.200" p={4} mb={6}>
            <Text fontWeight="bold" fontSize="md" mb={3}>
              How you do it in Boxtribute
            </Text>

            <HStack spacing={2} mb={step.description ? 1 : 4}>
              <Circle
                size={7}
                bg="brandBlue.300"
                color="white"
                fontSize="xs"
                fontWeight="bold"
                flexShrink={0}
              >
                {currentStep + 1}
              </Circle>
              <Text fontWeight="bold" fontSize="sm">
                {step.title}
              </Text>
              {step.optional && (
                <Badge fontSize="xs" colorScheme="gray" variant="subtle">
                  Optional
                </Badge>
              )}
            </HStack>
            {step.description && (
              <Text fontSize="sm" color="gray.600" mb={4}>
                {step.description}
              </Text>
            )}

            <StepContent
              picture={step.picture}
              alt={step.alt}
              markdown={step.markdown}
              note={step.note}
            />
          </Box>
        )}

        {/* Mobile-only Export PDF button */}
        <Box display={{ base: "block", md: "none" }} mb={4} className="no-print">
          <Button
            id={`guide-export-pdf-${guide.slug}-mobile`}
            size="sm"
            variant="outline"
            onClick={handleDownloadPDF}
            w="full"
          >
            Export PDF
          </Button>
        </Box>

        <Flex justify="space-between" align="center" mb={2} className="no-print">
          <Button
            id={`guide-prev-step-${guide.slug}-step${currentStep + 1}`}
            onClick={handlePrev}
            isDisabled={currentStep === 0}
            variant="outline"
            size="sm"
          >
            ← Prev
          </Button>

          <Button
            id={`guide-next-step-${guide.slug}-step${currentStep + 1}`}
            onClick={handleNext}
            isDisabled={isLastStep}
            bg="brandBlue.300"
            color="white"
            size="sm"
            _hover={{ bg: "brandBlue.200" }}
            _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
          >
            Next →
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

        {guide.reference && <ReferenceSection isDesktop={isDesktop} reference={guide.reference} />}

        <Flex gap={6} flexDir={{ base: "column", md: "row" }}>
          <Box flex={1} bg="white" border="1px solid" borderColor="gray.200" p={4}>
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
              {guide.features.map((feature) => (
                <Badge
                  key={feature}
                  bg="gray.100"
                  color="gray.700"
                  px={2}
                  py={0.5}
                  borderRadius="sm"
                >
                  {feature}
                </Badge>
              ))}
            </HStack>
            <Text fontSize="sm" color="gray.600" mb={2}>
              {guide.featureUnderneathDescription}
            </Text>
          </Box>

          <Box flex={1} bg="white" border="1px solid" borderColor="gray.200" p={4}>
            <Text
              fontSize="xs"
              fontWeight="bold"
              textTransform="uppercase"
              letterSpacing="wide"
              color="gray.500"
              mb={3}
            >
              More Guides
            </Text>
            <VStack align="stretch" spacing={3} divider={<Divider />}>
              {otherGuides.map((og) => (
                <Flex
                  id={`guide-related-click-${og.slug}`}
                  key={og.slug}
                  as={RouterLink}
                  to={`/bases/${baseId}/guides/${og.slug}`}
                  justify="space-between"
                  align="center"
                  _hover={{ textDecoration: "none" }}
                >
                  <Text fontSize="sm" color="gray.700" flex={1}>
                    {og.title}
                  </Text>
                  <VStack spacing={2} flexShrink={0} ml={2}>
                    {og.features.map((feature) => (
                      <Text key={feature} fontSize="xs" color="gray.400">
                        {feature}
                      </Text>
                    ))}
                  </VStack>
                </Flex>
              ))}
            </VStack>
          </Box>
        </Flex>

        <Text
          display={{ base: "none", md: "block" }}
          textAlign="center"
          fontSize="xs"
          color="gray.400"
          mt={8}
          mb={4}
        >
          Boxtribute · Guide · Step {currentStep + 1} of {guide.steps.length}
        </Text>
      </Box>
    </>
  );
}
