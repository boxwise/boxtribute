import { Badge, Box, Flex, Heading, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { TimeIcon } from "@chakra-ui/icons";
import { GUIDES } from "./guidesData";

function StatusDot({ status }: { status: "live" | "roadmap" }) {
  return (
    <Box
      w={2}
      h={2}
      borderRadius="full"
      bg={status === "live" ? "brandGreen" : "brandYellow.200"}
      flexShrink={0}
    />
  );
}

export default function GuidesOverviewView() {
  const { baseId } = useParams();

  return (
    <Box maxW="1100px" mx="auto" px={{ base: 4, md: 8 }} py={8}>
      <Text
        fontSize="xs"
        fontWeight="bold"
        letterSpacing="wider"
        textTransform="uppercase"
        color="brandRed.300"
        mb={1}
      >
        The How · Your requirements
      </Text>

      <Heading as="h1" fontSize={{ base: "2xl", md: "4xl" }} fontWeight="bold" mb={3}>
        Find the capability that answers your requirement.
      </Heading>

      <Text color="gray.600" fontSize="md" mb={8} maxW="600px">
        Tell us what you need to do, in your own words, and we&apos;ll show you how Boxtribute does
        it, and the feature underneath.
      </Text>

      <Flex align="center" mb={6} gap={2}>
        <Box color="brandRed.300" fontSize="lg">
          ★
        </Box>
        <Heading as="h2" fontSize="lg" fontWeight="bold" color="brandRed.300">
          Start Here
        </Heading>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {GUIDES.map((guide) => (
          <Box
            key={guide.slug}
            as={RouterLink}
            to={`/bases/${baseId}/guides/${guide.slug}`}
            bg="white"
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.200"
            p={5}
            _hover={{ textDecoration: "none", boxShadow: "md", borderColor: "gray.300" }}
            transition="box-shadow 0.15s, border-color 0.15s"
            display="flex"
            flexDirection="column"
            data-heap-event="guide-card-click"
            data-heap-guide={guide.slug}
          >
            <HStack spacing={2} mb={3} flexWrap="wrap">
              <HStack spacing={1}>
                <StatusDot status={guide.status} />
                <Badge
                  colorScheme={guide.status === "live" ? "green" : "yellow"}
                  fontSize="xs"
                  textTransform="uppercase"
                >
                  {guide.status === "live" ? "Live" : "Roadmap"}
                </Badge>
              </HStack>
              {guide.tags.map((tag) => (
                <Badge key={tag} bg="gray.700" color="white" fontSize="xs" borderRadius="sm">
                  {tag}
                </Badge>
              ))}
            </HStack>

            <Text fontWeight="bold" fontSize="md" mb={2} color="gray.800" flex={1}>
              {guide.title}
            </Text>

            <VStack align="flex-start" spacing={2} mt="auto">
              <Text fontSize="sm" color="gray.500">
                Feature:{" "}
                <Text as="span" color="gray.700">
                  {guide.feature}
                </Text>
              </Text>

              <Box
                bg="red.50"
                borderRadius="md"
                px={3}
                py={1}
                display="inline-flex"
                alignItems="center"
              >
                <Text fontSize="sm" color="brandRed.300" fontWeight="semibold">
                  Open capability →
                </Text>
              </Box>

              <HStack spacing={1} color="brandBlue.200" fontSize="xs">
                <TimeIcon boxSize={3} />
                <Text fontWeight="semibold" textTransform="uppercase" letterSpacing="wide">
                  ≈ {guide.estimatedMinutes} min to set up
                </Text>
              </HStack>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
