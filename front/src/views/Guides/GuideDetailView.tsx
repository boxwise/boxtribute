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
import { StatusDot } from "./components/StatusDot";

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
      <VStack
        spacing={0}
        w="full"
        borderRadius="md"
        overflow="hidden"
        border="1px solid"
        borderColor="gray.200"
      >
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
          <Box
            bg="brandBlue.300"
            w="full"
            px={4}
            py={3}
            color="white"
            fontSize="xs"
            borderBottomRadius="md"
          >
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

function ReferenceSection({ reference }: { reference: GuideReference }) {
  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="lg"
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
        }}
      >
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{reference.markdown}</ReactMarkdown>
      </Box>
    </Box>
  );
}

export default function GuideDetailView() {
  const { baseId, guideSlug } = useParams<{ baseId: string; guideSlug: string }>();
  const [isDesktop] = useMediaQuery(DESKTOP_OR_TABLET_SCREEN_MEDIA_QUERY);

  const guide = GUIDES.find((g) => g.slug === guideSlug);

  const [currentStep, setCurrentStep] = useState(0);

  if (!guide) {
    return <Navigate to={`/bases/${baseId}/guides`} replace />;
  }

  const step = guide.steps[currentStep];
  const isLastStep = currentStep === guide.steps.length - 1;

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
    const link = document.createElement("a");
    link.href = "/guides/placeholder-guide.pdf";
    link.download = `${guide.slug}-guide.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                as={RouterLink}
                to={guidesPath}
                color="gray.500"
                data-heap-event="guide-abandon"
                data-heap-guide={guide.slug}
                data-heap-step={currentStep + 1}
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
            display={{ base: "none", md: "flex" }}
            size="sm"
            variant="outline"
            onClick={handleDownloadPDF}
            data-heap-event="guide-export-pdf"
            data-heap-guide={guide.slug}
            className="no-print"
          >
            Export PDF
          </Button>
        </Flex>

        <HStack spacing={3} mb={4} flexWrap="wrap">
          <HStack spacing={1}>
            <StatusDot status={guide.status} />
            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wide">
              {guide.status === "live" ? "Live" : "Roadmap"}
            </Text>
          </HStack>
          <Text
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
            letterSpacing="wide"
            color="gray.500"
          >
            {guide.feature}
          </Text>
          <Tag variant="subtle" colorScheme={"brandBlue"} fontSize="xs">
            <TagLeftIcon boxSize={3} as={TimeIcon} />
            <TagLabel fontWeight="bold" textTransform="uppercase" letterSpacing="wide">
              ≈ {guide.estimatedMinutes} min to set up
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
          <Text fontSize="sm" color="gray.700" mr={2} fontStyle="italic">
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
          <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="lg" p={4} mb={6}>
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
            size="sm"
            variant="outline"
            onClick={handleDownloadPDF}
            w="full"
            data-heap-event="guide-export-pdf"
            data-heap-guide={guide.slug}
          >
            Export PDF
          </Button>
        </Box>

        <Flex justify="space-between" align="center" mb={2} className="no-print">
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

          <Button
            onClick={handleNext}
            isDisabled={isLastStep}
            bg="brandBlue.300"
            color="white"
            size="sm"
            _hover={{ bg: "brandBlue.200" }}
            _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
            data-heap-event="guide-next-step"
            data-heap-guide={guide.slug}
            data-heap-step={currentStep + 1}
          >
            Next →
          </Button>
        </Flex>

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

        {guide.reference && <ReferenceSection reference={guide.reference} />}

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
              <Badge
                as={RouterLink}
                to={guide.featureUnderneathLink}
                key={guide.feature}
                bg="gray.100"
                color="gray.700"
                px={2}
                py={0.5}
                borderRadius="sm"
              >
                {guide.feature}
              </Badge>
            </HStack>
            <Text fontSize="sm" color="gray.600" mb={2}>
              {guide.featureUnderneathDescription}
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
              More Guides
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
